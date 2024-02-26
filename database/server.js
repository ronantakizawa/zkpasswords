const express = require('express');
const fs = require('fs').promises;
const fs2 = require('fs')
const { exec } = require("child_process"); 
const cors = require('cors'); 
const snarkjs = require('snarkjs'); // Make sure to install and require snarkjs
const app = express();
const path = require('path');
const port = 8080;

app.use(express.json()); 
app.use(cors()); 
app.post('/set-password', async (req, res) => {
  const { newUsername, newPassword } = req.body;
  const passwordToNum = BigInt(stringToAsciiConcatenated(newPassword));
  const newDirPath = path.join(__dirname, newUsername);
  if (fs2.existsSync(newDirPath)) {
    // If it exists, send a message indicating the username is already taken
    return res.status(400).json({ message: "Username already taken" });
  }
  try {
    // Create a new directory with newUsername as its name
    await fs.mkdir(newDirPath, { recursive: true });

    // Copy files to the new directory
    const setupFilePath = path.join(newDirPath, 'setup.sh');
    await fs.copyFile('setup.sh', setupFilePath);
    const potFilePath = path.join(newDirPath, 'pot14_final.ptau');
    await fs.copyFile('pot14_final.ptau', potFilePath);
    const zkeyFilePath = path.join(newDirPath, 'circuit_final.zkey');
    await fs.copyFile('pot14_final.ptau', zkeyFilePath);


    // Now, read the setup.sh file from the new directory
    const data = await fs.readFile(newDirPath+"/setup.sh", 'utf8');
    
    // Replace the placeholder password with the new password
    var result = data.replace(/var password = \d+;/, `var password = ${passwordToNum};`);
    
    // Write the updated script back to setup.sh in the new directory
    await fs.writeFile(setupFilePath, result, 'utf8');
    
    // Execute the updated script from the new directory
    exec(`./setup.sh`, { cwd: newDirPath }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send('Error executing setup script');
      }
      console.log(`stdout: ${stdout}`);
      
      // Respond to the request indicating success
      res.json({ message: "Password setup successfully" });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/check-password', async (req, res) => {
  const { usernameAttempt,passwordAttempt} = req.body;
  const passwordNum = stringToAsciiConcatenated(passwordAttempt);
  const newDirPath = path.join(__dirname, usernameAttempt);
  if (!fs2.existsSync(newDirPath)) {
    // If it exists, send a message indicating the username is already taken
    return res.status(404).json({ message: "Invalid Username" });
  }

  try {
    const logs = await run(usernameAttempt,passwordNum);
    res.status(200).json({ message: "Execution completed", logs: logs }); // Return logs within the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred', error: error.toString() });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

async function run(usernameAttempt,passwordAttempt) {
  let logs = ""; // Initialize a string to accumulate logs

  const { proof, publicSignals } = await snarkjs.plonk.fullProve({attempt: passwordAttempt}, `./${usernameAttempt}/circuit.wasm`, `./${usernameAttempt}/circuit_final.zkey`);
  const result = publicSignals[0] === '1' ? "Login Successful!" : "Incorrect Password";
  logs += result + "\n";


  return logs; // Return the accumulated logs
}

function stringToAsciiConcatenated(inputString) {
  let asciiConcatenated = '';
  for (let i = 0; i < inputString.length; i++) {
    asciiConcatenated += inputString.charCodeAt(i).toString();
  }
  return asciiConcatenated;
}

