/* 
 * Copyright (c) 2017, Mihail Maldzhanski
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

const modFs = require('fs');
const modDICECalculator = require('./models/DICECalculator/DICECalculator.js');
const modDICEUnit = require('./models/DICECalculator/DICEUnit.js');
const modDigAddress = require('./models/AdressCalculator_3rd/DigitalAdressCalculator.js');

var DICE = new modDICEUnit();
var DiceCalculatorL = new modDICECalculator();
var AddressGen = new modDigAddress();

//Get arguments
var args = process.argv.slice(2);
var file = args[1];

if (args[0] === "-c") {
    console.log("Calculate new DICE Unit with Level - " + args[4] + " zeroes");
    DICE = DiceCalculatorL.getValidDICE(args[2], args[3], args[4]);
    modFs.writeFile(file, JSON.stringify(DICE.toHexStringifyUnit(), null, 0), 'utf-8', endOfProgram);
} else if (args[0] === "-v") {
    file = modFs.readFileSync(file, "utf8");
    DICE = DICE.from(file);

} else if (args[0] === "-g") {
    console.log("Generating Address to: "+ file);
    console.log("Public Address: "+ AddressGen.privateKey);
    console.log("Private Key: "+ AddressGen.digitalAdress);
    modFs.writeFile(file, JSON.stringify(AddressGen, null, 0), 'utf-8', endOfProgram);
} else {
    console.log("Invalid Arguments!");
    console.log("example: program.exe -c .\\test.json addrOp addrMin validZeroes");
}

if (args[0] === "-c" || args[0] === "-v") {
    console.log("Hash value of Prototype = " + DiceCalculatorL.getSHA3OfUnit(DICE));
}

function endOfProgram(key, value) {
    console.log("\nfinish");
}


