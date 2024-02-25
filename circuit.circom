pragma circom 2.1.6;

include "node_modules/circomlib/circuits/comparators.circom";

template Main() {
    signal input attempt;
    signal output isEqual;
    
    var password = 11297115115119111114100;
    component eqChecker = IsEqual();
    attempt ==> eqChecker.in[0];
    password ==> eqChecker.in[1];

    eqChecker.out ==> isEqual;
}

component main  = Main();

