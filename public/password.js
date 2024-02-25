const proofComponent = document.getElementById('proof');
const resultComponent = document.getElementById('result');
const bGenProof = document.getElementById("bGenProof");
const ansComponent = document.getElementById("answer");
const passwordInput = document.getElementById("passwordInput"); 

bGenProof.addEventListener("click", calculateProof);

async function calculateProof() {
    const passwordString = passwordInput.value;

    const passwordNum = stringToAsciiConcatenated(passwordString);
    console.log(passwordNum);

    const { proof, publicSignals } =
      await snarkjs.plonk.fullProve({attempt: BigInt(passwordNum)}, "./circuit.wasm", "circuit_final.zkey");

    proofComponent.innerHTML = JSON.stringify(proof, null, 1);

    const vkey = await fetch("verification_key.json").then(function(res) {
        return res.json();
    });

    const res = await snarkjs.plonk.verify(vkey, publicSignals, proof);

    resultComponent.innerHTML = res ? "Verification successful" : "Verification failed";

    const ans = publicSignals[0] === '1' ? "Correct Passowrd" : "Incorrect Password"
    ansComponent.innerText = ans
}

function stringToAsciiConcatenated(inputString) {
    let asciiConcatenated = '';
    for (let i = 0; i < inputString.length; i++) {
      asciiConcatenated += inputString.charCodeAt(i).toString();
    }
    return asciiConcatenated;
  }