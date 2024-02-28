const fs = require('fs').promises;
const fs2 = require('fs');
const path = require('path');
const snarkjs = require('snarkjs'); 
const { exec } = require("child_process");

class ZKAuth {
  constructor() {
    const dirPath = path.join("zkauthaccounts");
    try{
      fs.mkdir(dirPath, { recursive: true });
    }
    catch(error){
      console.log("Error:"+error)
    }
  }

  async setPassword(newEmail, newPassword) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    var emailRegex = /\S+@\S+\.\S+/;
    if (newPassword === '' || newEmail === '') {
      return { status:400, message: "Email and password cannot be empty" };
    }
    if (!emailRegex.test(newEmail)) {
      return { status:400, message: "Invalid Email Format" };
    }
    if (newPassword.length > 20) {
      return { status:400, message: "Password must be less than 20 characters" };
    }
    if (!passwordRegex.test(newPassword)) {
      return { status:400, message: "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol" };
    }
    const newDirPath = path.join("zkauthaccounts/"+newEmail);
    if (fs2.existsSync(newDirPath)) {
      return { status:400, message: "Email already taken" };
    }

      const passwordToNum = BigInt(stringToAsciiConcatenated(newPassword));
      await fs.mkdir(newDirPath, { recursive: true });
      const filesToCopy = ['setup.sh', 'pot14_final.ptau', 'circuit_final.zkey'];
      for (const file of filesToCopy) {
        await fs.copyFile(`node_modules/zkauth/${file}`, path.join(newDirPath, file));
      }
      let setupFileContents = await fs.readFile(path.join(newDirPath, "setup.sh"), 'utf8');
      setupFileContents = setupFileContents.replace(/var password = \d+;/, `var password = ${passwordToNum};`);
      await fs.writeFile(path.join(newDirPath, "setup.sh"), setupFileContents, 'utf8');
      const execPromise = (cmd, options) => new Promise((resolve, reject) => {
        exec(cmd, options, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            reject({ status: 500, message: "Error executing script" });
          } else {
            console.log(`stdout: ${stdout}`);
            resolve({ status: 200, message: "Password setup successfully" });
          }
        });
      });
  
      // Use the execPromise
      try {
        const result = await execPromise(`./setup.sh`, { cwd: newDirPath });
        return result;
      } catch (error) {
        return error;
      }

    
  }

  async checkPassword(emailAttempt, passwordAttempt) {
    try {
      if (emailAttempt === '' || passwordAttempt === '') {
        return { status:400, message: "Email and Password cannot be empty" };
      }
      const newDirPath = path.join("zkauthaccounts/"+emailAttempt);
      if (!fs2.existsSync(newDirPath)) {
        return { status:400, message: "Invalid Email Address" };
      }

      const message = await run(emailAttempt, passwordAttempt);
      return { status: 200, message: message }; 

    } catch (error) {
      console.error(error);
      return { status:500, message: "An error occured" };
    }
  }

  async changePassword(email,password){
    if (email === '' || password=== '') {
      return { status:400, message: "Email and Password cannot be empty" };
    }
    console.log
    const newDirPath = path.join("zkauthaccounts/"+email);
      if (!fs2.existsSync(newDirPath)) {
        return { status:400, message: "Invalid Email Address" };
    }
    try{
      await fs.rm(newDirPath, { recursive: true }, (err) => {
        if (err) {
          console.error('An error occurred:', err);
          return;
        }
        console.log('Directory removed');
      });
      const setPasswordResponse = await this.setPassword(email,password);
      return setPasswordResponse;
    }
    catch (error){
      console.error(error);
      return { status:500, message: "An error occured" };
    }
  
  }
}


async function run(emailAttempt, passwordAttempt) {
  const passwordNum = stringToAsciiConcatenated(passwordAttempt);
  let message = "";

  const { publicSignals } = await snarkjs.plonk.fullProve({ attempt: passwordNum }, `./zkauthaccounts/${emailAttempt}/circuit.wasm`, `./zkauthaccounts/${emailAttempt}/circuit_final.zkey`);
  const result = publicSignals[0] === '1' ? "Login Successful!" : "Incorrect Password";
  message += result + "\n";

  return message;
}

function stringToAsciiConcatenated(inputString) {
  let asciiConcatenated = '';
  for (let i = 0; i < inputString.length; i++) {
    asciiConcatenated += inputString.charCodeAt(i).toString();
  }
  return asciiConcatenated;
}


module.exports = ZKAuth;
