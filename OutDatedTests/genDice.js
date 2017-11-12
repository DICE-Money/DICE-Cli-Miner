/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


console.log("Calculate DICE - 6 zero bits");

const DICECalculator = require('./DICECalculator.js');
const fs = require('fs');

var unit = new DICECalculator();

var DICE = unit.getValidDICE("18yEQthHFiSpxCH7T2rkmHHAAykxuKzbmg", "1N4EaE2sk6MhrpwNi8r3K3eGn5jEHVipKt", 10);
fs.writeFile('./data2.json', JSON.stringify(DICE.toHexStringifyUnit(), null, 0), 'utf-8');

console.log("finish");
