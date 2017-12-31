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
const modDICECalculator = require('../../models/DICECalculator/DICECalculator.js');
const modDICEUnit = require('../../models/DICECalculator/DICEUnit.js');
const modDICEPrototype = require('../../models/DICECalculator/DICEPrototype.js');
const modDigAddress = require('../../models/AddressCalculator/DigitalAdressCalculator_ECDH.js');
const modDNSBinder = require('../../models/DNSBinder/DNSBinder.js');
const modTCPWorker = require('../../models/TCP_IP/TcpWorker.js');
const modDICEValue = require('../../models/DICEValue/DICEValue.js');
const modEnc = require('../../models/Encryptor/Encryptor.js');
const modBase58 = require('../../models/Base58/Base58.js');
const modeVIEW = require('../../models/VIEW_Console/VIEW_Console.js');
const modeVIEW_IF = require('../VIEW/VIEW_Interfaces.js');

//Create instances of the following models
var DICE = new modDICEUnit();
var DICEProto = new modDICEPrototype();
var DiceCalculatorL = new modDICECalculator("js");
var DNS = new modDNSBinder();
var AddressGen = new modDigAddress();
var TCPClient = new modTCPWorker();
var DICEValue = new modDICEValue(DiceCalculatorL);
var Time = new Date();
var modBS58 = new modBase58();

// Local Types
var appStates = {
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

    //Trading
    eStep_CurrentOwnerTrade: 11,
    eStep_NewOwnerTrade: 12,
    eStep_CurrentReleaseOwnerlessToServer: 13,

    eStep_CurrentOwnerClaimToServer: 14,
    eStep_NewOwnerClaimToServer: 15,
    eStep_CurrentReleaseOwnerless: 16,

    //Idle
    eStep_IDLE: 17,

    eExit_FromApp: 18,
    eCount: 19
};

//Local static Data
var Args = {
    command: undefined,
    fileInput: undefined,
    diceUnit: undefined,
    fileOutput: undefined,
    addrOp: undefined,
    addrMin: undefined,
    spareCommand: undefined,
    cuda: undefined
};

var isRequestTransmitted = false;
var currentState = undefined;
var keyPair = {};
var zeroes = undefined;
var encryptor = undefined;
const pathToCudaApp = "../CUDA/DICECalculator.exe";
var view_console = new modeVIEW(modeVIEW_IF.tableCodes, modeVIEW_IF.tablePorts, 'code');

//#############################################################################
// Local sync logic of Application
//#############################################################################

//Get valid arguments from CMD
var args = process.argv.slice(2);

//Decide how to opperate the application
decideArgs(args);

//Start scheduled program
var scheduler_10ms = setInterval(main10ms, 10);
var scheduler_1s = setInterval(main1s, 1000);
view_console.setAllowed({ERROR: true, WARNING: true, USER_INFO: true, DEV_INFO: false});

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
            zeroes = requestToServer(keyPair.digitalAddress,
                    () => TCPClient.Request("GET Zeroes", keyPair.digitalAddress),
                    () => currentState = appStates.eStep_CalculateDICE);
            break;

        case appStates.eStep_CalculateDICE:
            requestToServer(keyPair.digitalAddress,
                    (addr) => TCPClient.Request("GET Validation", addr),
                    (receivedData) => {
                receivedData = JSON.parse(receivedData);

                //Calculate needed zeroes
                if (Args.spareCommand !== undefined) {
                    view_console.printCode("USER_INFO", "UsInf0051", Args.spareCommand);
                    zeroes = DICEValue.getZeroesFromN(Args.spareCommand, receivedData.N);
                }

                calculateDICE(Args);
                currentState = appStates.eStep_RequestValidation;
            });
            break;

        case appStates.eStep_RequestValidation:
            requestToServer(keyPair.digitalAddress,
                    (addr) => TCPClient.Request("GET Validation", addr),
                    (receivedData) => {
                receivedData = JSON.parse(receivedData);
                DICEValue.setDICEProtoFromUnit(DICE);
                DICEValue.calculateValue(receivedData.k, receivedData.N);
                view_console.printCode("USER_INFO", "UsInf0052", DICEValue.unitValue);
                currentState = (DICEValue.unitValue === "InvalidDICE" ? appStates.eStep_RequestZeroes : appStates.eStep_SendPrototype);
            });
            break;

        case appStates.eStep_SendPrototype:
            requestToServer(keyPair.digitalAddress,
                    (addr) => {
                saveDICEToFile(Args.fileOutput);
                var encryptedData = encryptor.encryptDataPublicKey(DICEValue.getDICEProto().toBS58(), Buffer.from(modBS58.decode(Args.addrOp)));
                TCPClient.Request("SET Prototype", addr, encryptedData);
            },
                    (response) => {
                printServerReturnData(response);
                currentState = appStates.eStep_SHAOfUnit;
            });
            break;

        case appStates.eStep_GenerateAddr:
            view_console.printCode("USER_INFO", "UsInf0053");
            saveKeyPair();
            currentState = appStates.eExit_FromApp;
            break;

        case appStates.eStep_ValidateDICE:
            validateDICEFromFile();
            currentState = appStates.eStep_SHAOfUnit;
            break;

        case appStates.eStep_SHAOfUnit:
            hashOfUnit();
            currentState = appStates.eExit_FromApp;
            break;

//Trading
        case appStates.eStep_CurrentOwnerTrade:
            initTcpConnection();
            curOwnerTrade();
            currentState = appStates.eStep_CurrentOwnerClaimToServer;
            break;

        case appStates.eStep_NewOwnerTrade:
            initTcpConnection();
            try {
                newOwnerTrade();
            } catch (e) {
                // Try as normal DICE
                // Read File to DICE Unit
                var file = modFs.readFileSync(Args.diceUnit, "utf8");
                DICE = DICE.fromBS58(file);

                //Get key and address
                getKeyPair();
            }
            currentState = appStates.eStep_NewOwnerClaimToServer;
            break;

        case appStates.eStep_CurrentReleaseOwnerless:
            //Init Connections
            initTcpConnection();

            // Read File to DICE Unit
            var file = modFs.readFileSync(Args.diceUnit, "utf8");
            DICE = DICE.fromBS58(file);

            //Get key and address
            getKeyPair();

            currentState = appStates.eStep_CurrentReleaseOwnerlessToServer;
            break;

        case appStates.eStep_CurrentReleaseOwnerlessToServer:
            requestToServer(keyPair.digitalAddress,
                    (addr) => {
                var claimData = {};
                //Set DICE Unit to Dice validatior
                DICEValue.setDICEProtoFromUnit(DICE);

                claimData["diceProto"] = DICEValue.getDICEProto().toBS58();
                var encryptedData = encryptor.encryptDataPublicKey(JSON.stringify(claimData), Buffer.from(modBS58.decode(Args.addrOp)));
                TCPClient.Request("SET CurrentReleaseOwnerless", addr, encryptedData);
            },
                    (response) => {
                printServerReturnData(response);
                currentState = appStates.eExit_FromApp;
            });
            break;


        case appStates.eStep_CurrentOwnerClaimToServer:
            requestToServer(keyPair.digitalAddress,
                    (addr) => {
                DICEValue.setDICEProtoFromUnit(DICE);
                var claimData = {};
                claimData["newOwner"] = Args.addrMin;
                claimData["diceProto"] = DICEValue.getDICEProto().toBS58();
                var encryptedData = encryptor.encryptDataPublicKey(JSON.stringify(claimData), Buffer.from(modBS58.decode(Args.addrOp)));
                TCPClient.Request("SET CurrentOwnerClaim", addr, encryptedData);
            },
                    (response) => {
                printServerReturnData(response);
                currentState = appStates.eExit_FromApp;
            });
            break;

        case appStates.eStep_NewOwnerClaimToServer:
            requestToServer(keyPair.digitalAddress,
                    (addr) => {
                DICEValue.setDICEProtoFromUnit(DICE);
                var claimData = {};
                claimData["newOwner"] = keyPair.digitalAddress;
                claimData["diceProto"] = DICEValue.getDICEProto().toBS58();
                var encryptedData = encryptor.encryptDataPublicKey(JSON.stringify(claimData), Buffer.from(modBS58.decode(Args.addrOp)));
                TCPClient.Request("SET NewOwnerClaim", addr, encryptedData);
            },
                    (response) => {
                printServerReturnData(response);
                saveDICEToFile(Args.diceUnit + ".decompressed.txt");
                currentState = appStates.eExit_FromApp;
            });
            break;
//End of Trading


        case appStates.eExit_FromApp:
            //If Connection was established
            try {
                TCPClient.close();
            } catch (e) {
            }

            //Exit From Application and stop Shcheduler
            view_console.printCode("USER_INFO", "UsInf0054");
            clearInterval(scheduler_10ms);
            clearInterval(scheduler_1s);
            break;
        default:
            throw "Application has Improper state !";
    }
}

function main1s()
{
    switch (currentState) {
        case appStates.eStep_CalculateDICE:
            view_console.printCode("USER_INFO", "UsInf0055", DiceCalculatorL.getSHA3Count());
            break;

        default:

            break;
    }
}
//#############################################################################
// Local Help function
//#############################################################################

//General Use Function to work properly with server
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
            receivedData = encryptor.decryptDataPublicKey(Buffer.from(receivedData), Buffer.from(modBS58.decode(Args.addrOp)));
            deactivate(receivedData);
        }
    }
    return receivedData;
}

//Function Generate DICE unit (Contains busy loop)
function calculateDICE(Args) {
    //Inform for generetion
    view_console.printCode("USER_INFO", "UsInf0056", zeroes);
    var elapsedTime = 0;
    var addrOpL = modBS58.decode(Args.addrOp).toString('hex');
    var addrMinL = modBS58.decode(keyPair.digitalAddress).toString('hex');

    //Start measuring
    Time = Date.now();

    //Generating new DICE Unit  
    if (true === Args.cuda) {
        DICE = DiceCalculatorL.getValidDICE_CUDA(addrOpL, addrMinL, zeroes, pathToCudaApp, "cudaJsUnit.json");
    } else {
        DICE = DiceCalculatorL.getValidDICE(Args.addrOp, keyPair.digitalAddress, zeroes);
    }
    //Stop measuring
    elapsedTime = Date.now() - Time;

    view_console.printCode("USER_INFO", "UsInf0065", elapsedTime);
}

//Save to File 
function saveDICEToFile(fileOutput) {
    var fileIncrementor = 0;
    var testFile = fileOutput;

    while (modFs.existsSync(testFile)) {
        testFile = fileOutput + "." + fileIncrementor;
        fileIncrementor++;
    }

    //Save new name of file
    fileOutput = testFile;

    //Inform for saving
    view_console.printCode("USER_INFO", "UsInf0057", fileOutput);

    //Write to File
    modFs.writeFileSync(fileOutput, DICE.toBS58());

    //Write to File
    modFs.writeFileSync(fileOutput + ".json", JSON.stringify(DICE.toHexStringifyUnit()), 'utf8');
}

//Calculate Hash
function hashOfUnit() {
    view_console.printCode("USER_INFO", "UsInf0071", DiceCalculatorL.getSHA3OfUnit(DICE));
}

//Decide arguments by input command
function decideArgs(args) {
    switch (args[0]) {
        case "-c":
        case "-cCuda":
            Args.fileInput = args[1];
            Args.fileOutput = args[2];
            Args.addrOp = args[3];
            Args.spareCommand = args[4];

            //Is it CUDA requested
            if ("-cCuda" === args[0]) {
                Args.cuda = true;
            }

            //Get Data from input file
            getKeyPair();

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

        case "-to": // Miner1 -> Ownerlesss
            Args.fileInput = args[1];
            Args.diceUnit = args[2];
            Args.addrOp = args[3];

            //Init current state
            currentState = appStates.eStep_CurrentReleaseOwnerless;
            break;

        case "-tc": // Miner1 -> Miner2
            Args.fileInput = args[1];
            Args.diceUnit = args[2];
            Args.fileOutput = args[3];
            Args.addrMin = args[4];
            Args.addrOp = args[5];

            //Init current state
            currentState = appStates.eStep_CurrentOwnerTrade;
            break;

        case "-tn": // Miner2
            Args.fileInput = args[1];
            Args.diceUnit = args[2];
            Args.addrOp = args[3];

            //Init current state
            currentState = appStates.eStep_NewOwnerTrade;
            break;

        default:
            throw "Invalid Command";
    }
}

//Init TCP Connection
function initTcpConnection() {
    //Initialize DNS
    DNS.initializeDB('../DNS_DB/dns.json', 'json');

    //Requst DNS Binder to get IP and PORT
    var serverData = DNS.lookup(Args.addrOp);

    //Create connection
    TCPClient.create("client", serverData.ip, serverData.port, () => {
        view_console.printCode("ERROR", "Err0001");
        currentState = appStates.eExit_FromApp;
    }, view_console);
}

//Read key pair from file
function getKeyPair() {
    if (undefined !== Args.fileInput) {
        var file = modFs.readFileSync(Args.fileInput, "utf8");
        keyPair = JSON.parse(file);
        encryptor = new modEnc(modBS58.decode(keyPair.privateKey), 'sect131r1', 2);
    } else {
        //Nothing
    }
}

//Write key pair from file
function saveKeyPair() {
    if (undefined !== Args.fileOutput) {
        //Calculate new pair
        AddressGen.CalculateKeyAdressPair();

        //Save to local var
        keyPair.privateKey = AddressGen.getPrivateKey('bs58');
        keyPair.digitalAddress = AddressGen.getDigitalAdress('bs58');

        //Print newly generated pair
        view_console.printCode("USER_INFO", "UsInf0059", keyPair.privateKey);
        view_console.printCode("USER_INFO", "UsInf0060", keyPair.digitalAddress);

        //Print newly generated pair
        view_console.printCode("DEV_INFO", "DevInf0111", AddressGen.getPrivateKey('hex'));
        view_console.printCode("DEV_INFO", "DevInf0112", AddressGen.getDigitalAdress('hex'));

        //Save to file
        modFs.writeFileSync(Args.fileOutput, JSON.stringify(keyPair), 'utf8');
    } else {
        //Nothing
    }
}

//Validating DICE Unit from file in Base 58 encoding
function validateDICEFromFile() {
    var file = modFs.readFileSync(Args.fileInput, "utf8");

    //Read DICE Unit from file
    try {
        DICE = DICE.from(file);
    } catch (e) {
        DICE = DICE.fromBS58(file);
    }
    Buffer.from(DICE.payLoad.buffer).toString('hex');

    view_console.printCode("USER_INFO", "UsInf0061");
    view_console.printCode("USER_INFO", "UsInf0062", Buffer.from(DICE.addrOperator.buffer).toString('hex'));
    view_console.printCode("USER_INFO", "UsInf0063", Buffer.from(DICE.addrMiner.buffer).toString('hex'));
    view_console.printCode("USER_INFO", "UsInf0064", Buffer.from(DICE.validZeros.buffer).toString('hex'));
    view_console.printCode("USER_INFO", "UsInf0065", Buffer.from(DICE.swatchTime.buffer).toString('hex'));
    view_console.printCode("USER_INFO", "UsInf0066", Buffer.from(DICE.payLoad.buffer).toString('hex'));

}

//Miner 1 sends unit to new owner
function curOwnerTrade() {

    //Get KeyPair
    getKeyPair();

    //Read DICE Unit from FS
    var DiceFile = modFs.readFileSync(Args.diceUnit, "utf8");

    //Logic for application is to trade an already mined unit which is stored in FS
    DICE = DICE.fromBS58(DiceFile);

    //Encrypt unit which is in BS58 with new owner address
    var encData = encryptor.encryptDataPublicKey(DICE.toBS58(), Buffer.from(modBS58.decode(Args.addrMin)));

    //Hash of Unit
    var hashOfUnit = DiceCalculatorL.getSHA3OfUnit(DICE);

    //Preapare data for storing
    var fsData = {};
    fsData['addr'] = keyPair.digitalAddress;
    fsData['unit'] = modBS58.encode(encData);

    //Save to file
    modFs.writeFileSync(Args.fileOutput, modBS58.encode(Buffer.from(JSON.stringify(fsData))), 'utf8');

    return hashOfUnit;
}

//Miner 2 receives
function newOwnerTrade() {

    //Get KeyPair
    getKeyPair();

    //Read DICE Unit from FS
    var DiceFileJSON = modFs.readFileSync(Args.diceUnit, "utf8");

    //Parse file from object
    var DiceFile = JSON.parse(modBS58.decode(DiceFileJSON));

    //Encrypt Hash with new owner address
    var decoded = encryptor.decryptDataPublicKey(modBS58.decode(DiceFile.unit), Buffer.from(modBS58.decode(DiceFile.addr)));

    //Logic for application is to trade an already mined unit which is stored in FS
    DICE = DICE.fromBS58(decoded.toString());

    //Hash of Unit
    var hashOfUnit = DiceCalculatorL.getSHA3OfUnit(DICE);

    return hashOfUnit;
}

function printServerReturnData(data) {
    var response = JSON.parse(data);

    //Print data
    view_console.printCode("USER_INFO", "UsInf0067");
    view_console.printCode("USER_INFO", "UsInf0068", response.status.toString());
    view_console.printCode("USER_INFO", "UsInf0069", response.data.curOwner);
    view_console.printCode("USER_INFO", "UsInf0070", response.data.diceValue);
    view_console.printCode("USER_INFO", "UsInf0071", response.data.hash);
    view_console.printCode("USER_INFO", "UsInf0072");
}