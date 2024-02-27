const express = require('express');
const fs = require('fs').promises;
const fs2 = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const snarkjs = require('snarkjs'); 
const { exec } = require("child_process");

const app = express();
const port = process.env.PORT || 8080; // Prefer environment variable for port

// Apply Helmet for basic security practices
app.use(helmet());

// Enable CORS with default settings
app.use(cors());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Securely handle the creation of a new user password
app.post('/set-password', async (req, res) => {
  const { newUsername, newPassword } = req.body;
  // Basic input validation
  
  const newDirPath = path.join(__dirname, newUsername);

  if (fs2.existsSync(newDirPath)) {
    return res.status(400).json({ message: "Username already taken" });
  }

  try {
    const passwordToNum = BigInt(stringToAsciiConcatenated(newPassword));
    await fs.mkdir(newDirPath, { recursive: true });
    // Copy necessary files to the new user directory
    const filesToCopy = ['setup.sh', 'pot14_final.ptau', 'circuit_final.zkey'];
    for (const file of filesToCopy) {
      await fs.copyFile(file, path.join(newDirPath, file));
    }

    // Read, modify, and write the setup.sh file
    let setupFileContents = await fs.readFile(path.join(newDirPath, "setup.sh"), 'utf8');
    setupFileContents = setupFileContents.replace(/var password = \d+;/, `var password = ${passwordToNum};`);
    await fs.writeFile(path.join(newDirPath, "setup.sh"), setupFileContents, 'utf8');
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
  const { usernameAttempt, passwordAttempt } = req.body;

  // Basic input validation
  if (!usernameAttempt || !passwordAttempt) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const passwordNum = stringToAsciiConcatenated(passwordAttempt);
  const newDirPath = path.join(__dirname, usernameAttempt);

  if (!fs2.existsSync(newDirPath)) {
    return res.status(404).json({ message: "Invalid Username" });
  }

  try {
    const logs = await run(usernameAttempt, passwordNum);
    res.status(200).json({ message: "Execution completed", logs: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred', error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

async function run(usernameAttempt, passwordAttempt) {
  let logs = "";

  const { proof, publicSignals } = await snarkjs.plonk.fullProve({ attempt: passwordAttempt }, `./${usernameAttempt}/circuit.wasm`, `./${usernameAttempt}/circuit_final.zkey`);
  const result = publicSignals[0] === '1' ? "Login Successful!" : "Incorrect Password";
  logs += result + "\n";

  return logs;
}

function stringToAsciiConcatenated(inputString) {
  let asciiConcatenated = '';
  for (let i = 0; i < inputString.length; i++) {
    asciiConcatenated += inputString.charCodeAt(i).toString();
  }
  return asciiConcatenated;
}

// Note: Implement HTTPS in production by setting up SSL/TLS certificates
// Note: Consider deploying behind a reverse proxy like Nginx for additional security and performance benefits
