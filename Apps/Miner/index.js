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

//Includes
const modFs = require('fs');
const modBS58 = require('bs58');
const modDICECalculator = require('../../models/DICECalculator/DICECalculator.js');
const modDICEUnit = require('../../models/DICECalculator/DICEUnit.js');
const modDICEPrototype = require('../../models/DICECalculator/DICEPrototype.js');
const modDigAddress = require('../../models/AddressCalculator/DigitalAdressCalculator_ECDH.js');
const modDNSBinder = require('../../models/DNSBinder/DNSBinder.js');
const modTCPWorker = require('../../models/TCP_IP/TcpWorker.js');
const modDICEValue = require('../../models/DICEValue/DICEValue.js');
const modEnc = require('../../models/Encryptor/Encryptor.js');

//Create instances of the following models
var DICE = new modDICEUnit();
var DICEProto = new modDICEPrototype();
var DiceCalculatorL = new modDICECalculator();
var DNS = new modDNSBinder();
var AddressGen = new modDigAddress();
var TCPClient = new modTCPWorker();
var DICEValue = new modDICEValue();
var Time = new Date();

//Local Constants
var cCONST = {

};

// Local Types
var appStates =
        {
            //Mining States
            eStep_InitTCPConnection: 0,
            eStep_ConnectToServer: 1,
            eStep_RequestZeroes: 2,
            eStep_CalculateDICE: 3,
            eStep_RequestValidation: 4,
            eStep_SendPrototype: 5,

            //Generating Addr & Key Pair
            eStep_GenerateAddr: 6,
            eStep_SaveKeyPairToFile: 7,

            //Validatig DICE Value
            eStep_ValidateDICE: 8,

            //Calculate SHA3 Of Unit
            eStep_SHAOfUnit: 9,

            eExit_FromApp: 10,
            eCount: 11
        };

//Local static Data
var Args = {
    command: undefined,
    fileInput: undefined,
    fileOutput: undefined,
    addrOp: undefined
};
var isRequestTransmitted = false;
var currentState = undefined;
var keyPair = {};
var zeroes = undefined;
var encryptor = undefined;

//#############################################################################
// Local sync logic of Application
//#############################################################################

//Get valid arguments from CMD
var args = process.argv.slice(2);

//Decide how to opperate the application
decideArgs(args);

//Get Data from input file
getDataFromInput();

//Start scheduled program
var scheduler = setInterval(main10ms, 10);


//#############################################################################
// Main 10 ms function - Periodic function
//#############################################################################

//Main scheduled function
function main10ms() {
    switch (currentState) {
        case appStates.eStep_InitTCPConnection:
            initTcpConnection();
            currentState = appStates.eStep_RequestZeroes;
            break;

        case appStates.eStep_RequestZeroes:
            zeroes = requestToServer(keyPair.digitalAdress,
                    () => TCPClient.Request("GET Zeroes", keyPair.digitalAdress),
                    () => currentState = appStates.eStep_CalculateDICE);
            break;

        case appStates.eStep_CalculateDICE:
            calculateDICE(Args);
            currentState = appStates.eStep_RequestValidation;
            break;

        case appStates.eStep_RequestValidation:
            requestToServer(keyPair.digitalAdress,
                    (addr) => TCPClient.Request("GET Validation", addr),
                    (receivedData) =>
            {
                receivedData = JSON.parse(receivedData);
                DICEValue.setDICEProtoFromUnit(DICE);
                DICEValue.calculateValue(receivedData.k, receivedData.N);
                console.log("DICE Value: " + DICEValue.unitValue);
                currentState = (DICEValue.unitValue === "InvalidDICE" ? appStates.eStep_RequestZeroes : appStates.eStep_SendPrototype);
            });
            break;

        case appStates.eStep_SendPrototype:
            requestToServer(keyPair.digitalAdress,
                    (addr) =>
            {
                saveDICEToFile();
                var encryptedData = encryptor.encryptDataPublicKey(DICE.toBS58(), Buffer.from(modBS58.decode(Args.addrOp)));
                TCPClient.Request("SET Prototype", addr, encryptedData);
            },
                    () =>
            {
                currentState = appStates.eStep_SHAOfUnit;
            });
            break;

        case appStates.eStep_SHAOfUnit:
            hashOfUnit();
            currentState = appStates.eExit_FromApp;
            break;

        case appStates.eExit_FromApp:

            //If Connection was established
            try {
                TCPClient.close();
            } catch (e) {
            }

            //Exit From Application and stop Shcheduler
            console.log("Exit from Program");
            clearInterval(scheduler);

            break;
        default:
            throw "Application has Inproper state !";
            break;
    }
}

//#############################################################################
// Local Help function
//#############################################################################

//General Use Functions to work properly with server
function requestToServer(addrMiner, activate, deactivate) {
    var receivedData;
    if (false === isRequestTransmitted) {
        activate(addrMiner);
        isRequestTransmitted = true;
    } else {
        receivedData = TCPClient.readByAddress(addrMiner);
        receivedData = encryptor.decryptDataPublicKey(Buffer.from(receivedData), Buffer.from(modBS58.decode(Args.addrOp)));
        if (receivedData !== undefined) {
            isReady = true;
            isRequestTransmitted = false;
            deactivate(receivedData);
        }
    }
    return receivedData;
}

//Function Generate DICE unit (Contains busy loop)
function calculateDICE(Args) {
    //Inform for generetion
    console.log("Calculate new DICE Unit with Level - " + zeroes + " zeroes");

    //Start measuring
    time = new Date();

    //Generating new DICE Unit
    DICE = DiceCalculatorL.getValidDICE(Args.addrOp, keyPair.digitalAdress, zeroes);
    //Stop measuring
    time = new Date() - time; //in miliseconds

    //Print Time
    console.log("Current spent time: " + time + "ms");
}

//Save to File 
function saveDICEToFile() {
    var fileIncrementor = 0;
    var testFile = Args.fileOutput;

    while (modFs.existsSync(testFile)) {
        testFile = Args.fileOutput + "." + fileIncrementor;
        fileIncrementor++;
    }

    //Save new name of file
    Args.fileOutput = testFile;

    //Inform for saving
    console.log("Saving generated Unit to ", Args.fileOutput);

    //Write to File
    modFs.writeFileSync(Args.fileOutput, DICE.toBS58());
}

//Calculate Hash
function hashOfUnit() {
    if (args[0] === "-c" || args[0] === "-h" || args[0] === "-v") {
        console.log("Hash value of Prototype = " + DiceCalculatorL.getSHA3OfUnit(DICE));
    }
}

//Decide arguments by input command
function decideArgs(args) {
    switch (args[0]) {
        case "-c":
            Args.fileInput = args[1];
            Args.fileOutput = args[2];
            Args.addrOp = args[3];

            //Init current state
            currentState = appStates.eStep_InitTCPConnection;
            break;

        case "-h":
            Args.fileInput = args[1];

            //Init current state
            currentState = appStates.eStep_SHAOfUnit;
            break;

        case "-v":
            Args.fileInput = args[1];

            //Init current state
            currentState = appStates.eStep_ValidateDICE;
            break;

        case "-k":
            Args.fileOutput = args[1];

            //Init current state
            currentState = appStates.eStep_GenerateAddr;
            break;

        default:
            throw "Invalid Command";
            break;
    }
}

//Init TCP Connection
function initTcpConnection() {
    //Initialize DNS
    DNS.initializeDB('../../models/DNSBinder/dns.json', 'json');

    //Requst DNS Binder to get IP and PORT
    var serverData = DNS.lookup(Args.addrOp);

    //Create connection
    TCPClient.create("client", serverData.ip, serverData.port, () => {
        console.log("There is no Active server!");
        currentState = appStates.eExit_FromApp;
    });
}

//Read key pair from file
function getDataFromInput() {
    if (undefined !== Args.fileInput) {
        var file = modFs.readFileSync(Args.fileInput, "utf8");
        keyPair = JSON.parse(file);
        encryptor = new modEnc(Buffer.from(modBS58.decode(keyPair.privateKey)), 'sect131r1', 2);
    } else {
        //Nothing
    }
}