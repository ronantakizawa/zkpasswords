#!/bin/bash

echo "Creating circuit.circom file..."
# Create circuit.circom file with the provided content
cat <<EOT > circuit.circom
pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/comparators.circom";

template Main() {
    signal input attempt;
    signal output isEqual;

    var password = 11297115115119111114100;
    component eqChecker = IsEqual();
    attempt ==> eqChecker.in[0];
    password ==> eqChecker.in[1];

    eqChecker.out ==> isEqual;
}

component main = Main();
EOT
echo "circuit.circom file created."

echo "Compiling the circuit..."
# Compile the circuit
circom circuit.circom --r1cs --wasm --sym
echo "Circuit compiled."

echo "Exporting the R1CS to JSON..."
# Export the R1CS to JSON
snarkjs r1cs export json circuit.r1cs circuit.r1cs.json
echo "R1CS exported to JSON."

echo "Creating input.json file..."
# Create input.json file with the provided content
cat <<EOT > input.json
{"attempt": 1}
EOT
echo "input.json file created."

echo "Generating witness..."
# Generate witness
cd circuit_js && node generate_witness.js circuit.wasm ../input.json ../witness.wtns && cd -
echo "Witness generated."

echo "Setting up Plonk proving system..."
# Set up Plonk proving system
snarkjs plonk setup circuit.r1cs pot14_final.ptau circuit_final.zkey
echo "Plonk proving system set up."

echo "Exporting verification key..."
# Export verification key
snarkjs zkey export verificationkey circuit_final.zkey verification_key.json
echo "Verification key exported."

echo "Generating proof..."
# Generate proof
snarkjs plonk prove circuit_final.zkey witness.wtns proof.json public.json
echo "Proof generated."

echo "Moving circuit.wasm to the root directory and cleaning up..."
# Move circuit.wasm to the root directory and remove the circuit_js directory
mv circuit_js/circuit.wasm . && rm -rf circuit_js
echo "Cleanup done."

echo "Removing specified files..."
# Remove specified files
rm -f circuit.r1cs circuit.r1cs.json public.json proof.json witness.wtns circuit.sym input.json circuit.circom
echo "Specified files removed."

exit 0
