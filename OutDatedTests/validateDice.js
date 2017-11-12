/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


console.log("Calculate DICE Checksum is equal to 6 zero bits");

const fs = require('fs');
const DICECalculator = require('./DICECalculator.js');
const modDICEUnit = require('./DICEUnit.js');


var data = "";
var DICE = new modDICEUnit();
var DiceCalculatorL = new DICECalculator();

var file = fs.readFileSync('./data2.json', "utf8");
DICE = DICE.from(file);

console.log(DiceCalculatorL.getSHA3OfUnit(DICE));

console.log("finish");
