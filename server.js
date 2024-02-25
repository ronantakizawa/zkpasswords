const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require("child_process"); 
const snarkjs = require('snarkjs'); // Make sure to install and require snarkjs
const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON bodies

app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/set-password', async (req, res) => {
  const { newPassword } = req.body;
  const passwordToNum =  BigInt(stringToAsciiConcatenated(newPassword))
  console.log(passwordToNum);
  
  // Read the setup.sh file
  fs.readFile('setup.sh', 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    
    // Replace the placeholder password with the new password
    var result = data.replace(/var password = \d+;/, `var password = ${passwordToNum};`);
    
    // Write the updated script back to setup.sh or to a new temporary script file
    fs.writeFile('setup.sh', result, 'utf8', function (err) {
       if (err) return console.log(err);
       
       // Execute the updated script
       exec('./setup.sh', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error executing setup script');
          }
          console.log(`stdout: ${stdout}`);
          
          // Respond to the request indicating success
          res.json({ message: "Password setup successfully" });
       });
    });
  });
});

app.post('/check-password', async (req, res) => {
  const { passwordAttempt } = req.body;
  const passwordNum = stringToAsciiConcatenated(passwordAttempt);

  try {
    const logs = await run(passwordNum);
    res.json({ message: "Execution completed", logs: logs }); // Return logs within the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred', error: error.toString() });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

async function run(passwordAttempt) {
  let logs = ""; // Initialize a string to accumulate logs

  const { proof, publicSignals } = await snarkjs.plonk.fullProve({attempt: passwordAttempt}, "circuit.wasm", "circuit_final.zkey");
  const result = publicSignals[0] === '1' ? "Correct Password" : "Incorrect Password";
  logs += result + "\n";


  // Accumulate logs instead of console.log
  logs += "Proof: \n" + JSON.stringify(proof, null, 1) + "\n";


  return logs; // Return the accumulated logs
}

function stringToAsciiConcatenated(inputString) {
  let asciiConcatenated = '';
  for (let i = 0; i < inputString.length; i++) {
    asciiConcatenated += inputString.charCodeAt(i).toString();
  }
  return asciiConcatenated;
}

