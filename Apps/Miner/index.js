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
const modDICECalculator = require('../../models/DICECalculator/DICECalculator.js');
const modDICEUnit = require('../../models/DICECalculator/DICEUnit.js');
const modDICEPrototype = require('../../models/DICECalculator/DICEPrototype.js');
const modDigAddress = require('../../models/AddressCalculator/DigitalAdressCalculator_ECDH.js');
const modDNSBinder = require('../../models/DNSBinder/DNSBinder.js');
const modTCPWorker = require('../../models/TCP_IP/TcpWorker.js');
const modDICEValue = require('../../models/DICEValue/DICEValue.js');


var DICE = new modDICEUnit();
var DICEProto = new modDICEPrototype();
var DiceCalculatorL = new modDICECalculator();
var DNS = new modDNSBinder();
var AddressGen = new modDigAddress();
var TCPClient = new modTCPWorker();
var DICEValue = new modDICEValue();

//Get arguments
var args = process.argv.slice(2);
var file = args[0];
var time = new Date();
var minerStates =
        {
            eStep1: 0,
            eStep2: 1,
            eStep3: 2,
            eStep4: 3,
            eExit: 4,
            eCount: 5
        };
var currentState = minerStates.eStep1;

//Initialize DNS
DNS.initializeDB('../../models/DNSBinder/dns.json', 'json');

//Create connection
var serverData = DNS.lookup(args[1]);
TCPClient.create("client", serverData.ip, serverData.port, () => {
    console.log("There is no Active server!");
    currentState = minerStates.eExit;
});

var isRequestTransmitted = false;

//Start scheduled program
var scheduler = setInterval(main, 10);

function main() {
    switch (currentState) {
        case minerStates.eStep1:
            args[3] = requestToServer(args[2],
                    () => TCPClient.Request("Zeroes", args[2]),
                    () => currentState = minerStates.eStep2);
            break;

        case minerStates.eStep2:
            calculateDICE(args);
            currentState = minerStates.eStep3;
            break;

        case minerStates.eStep3:
            requestToServer(args[2],
                    (addr) => TCPClient.Request("Validation", addr, DICE.toHexStringifyUnit()),
                    (receivedData) =>
            {
                DICEValue.setDICEProtoFromUnit(DICE);
                DICEValue.calculateValue(receivedData.k, receivedData.N);
                console.log(DICEValue.unitValue);
                currentState = DICEValue.unitValue === "InvalidDICE" ? minerStates.eStep1 : minerStates.eStep4;
            });
            break;

        case minerStates.eStep4:
            saveToFile();
            currentState = minerStates.eExit;
            break;

        case minerStates.eExit:
            TCPClient.close();
            console.log("Exit from Program");
            clearInterval(scheduler);
            break;
        default:
            break;
    }
}


function calculateDICE(args) {
    //Inform for generetion
    console.log("Calculate new DICE Unit with Level - " + args[3] + " zeroes");
    //Start measuring
    time = new Date();
    //Generating new DICE Unit
    DICE = DiceCalculatorL.getValidDICE(args[1], args[2], args[3]);
    //Stop measuring
    time = new Date() - time; //in miliseconds

    //Print Time
    console.log("Current spent time: " + time + "ms");

    //Clean buffer
    TCPClient.cleanByAddress(args[2]);
}

function saveToFile() {
    var fileIncrementor = 0;

    while (modFs.existsSync(file)) {
        file += "." + fileIncrementor;
        fileIncrementor++;
    }
        
    //Inform for saving
    console.log("Saving generated Unit to ", file);
    
//    //Write to File
//    modFs.writeFileSync(file, JSON.stringify(DICE.toHexStringifyUnit(), null, 0), 'utf-8');

    //Write to File
    modFs.writeFileSync(file, DICE.toBS58());
}

function requestToServer(addrMiner, activate, deactivate) {
    var receivedData;
    if (false === isRequestTransmitted) {
        activate(addrMiner);
        isRequestTransmitted = true;
    } else {
        receivedData = TCPClient.readByAddress(addrMiner);
        if (receivedData !== undefined) {
            isReady = true;
            isRequestTransmitted = false;
            deactivate(receivedData);
        }
    }
    return receivedData;
}
