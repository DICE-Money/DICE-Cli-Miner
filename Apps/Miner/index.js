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
const modVIEW = require('../../models/VIEW_Console/VIEW_Console.js');
const modCommandParser = require('../../models/CommandParser/CommandParser.js');

//Configuration
const exConfig = require('./config/minerConfig.js');

//Create instances of the following models
var DICE = new modDICEUnit();
var DICEProto = new modDICEPrototype();
var DiceCalculatorL = new modDICECalculator("js");
var DNS = new modDNSBinder();
var AddressGen = new modDigAddress();
var TCPClient = new modTCPWorker();
var DICEValue = new modDICEValue(DiceCalculatorL);
var Time = new Date();
var Bs58 = new modBase58();
var CommandParser = new modCommandParser(process.argv, exConfig.minerArgs);


//Local static Data`
var isRequestTransmitted = false;
var appArgs = CommandParser.getArgs();
var currentState = CommandParser.getState();
var keyPair = {};
var scheduler_10ms = undefined;
var zeroes = undefined;
var encryptor = undefined;
var view_console = new modVIEW(exConfig.minerVIEW_IF.tableCodes, exConfig.minerVIEW_IF.tablePorts, exConfig.minerViewOut);
view_console.setAllowed(exConfig.minerViewCfg);
var isCudaReq = false;

const commandFunctions =
        {
            "funcCalculate": funcCalculate,
            'funcValidate': funcValidate,
            'funcKeyGen': funcKeyGen,
            'funcTradeOwnerless': funcTradeOwnerless,
            'funcTradeCurrent': funcTradeCurrent,
            'funcTradeNew': funcTradeNew,
            'funcCalculateCUDA': funcCalculateCUDA,
            'funcRegister': funcRegister,
            'funcVersion': funcVersion,
            'funcHelp': funcHelp,
            'ERROR': funcERROR
        };

//#############################################################################
// Local functions
//#############################################################################
function funcCalculate() {
    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_InitTCPConnection;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_InitTCPConnection:
                //Get Data from input file
                getKeyPair();

                //Init connection
                initTcpConnection();
                currentState = exConfig.minerStates.eStep_RequestZeroes;
                break;

            case exConfig.minerStates.eStep_RequestZeroes:
                zeroes = requestToServer(keyPair.digitalAddress,
                        () => TCPClient.Request("GET Zeroes", keyPair.digitalAddress),
                        () => currentState = exConfig.minerStates.eStep_CalculateDICE);
                break;

            case exConfig.minerStates.eStep_CalculateDICE:
                requestToServer(keyPair.digitalAddress,
                        (addr) => TCPClient.Request("GET Validation", addr),
                        (receivedData) => {
                    receivedData = JSON.parse(receivedData);

                    //Calculate needed zeroes
                    if (appArgs.specificUnitValue !== undefined) {
                        view_console.printCode("USER_INFO", "UsInf0051", appArgs.specificUnitValue);
                        zeroes = DICEValue.getZeroesFromN(appArgs.specificUnitValue, receivedData.N);
                    }

                    calculateDICE(appArgs);
                    currentState = exConfig.minerStates.eStep_RequestValidation;
                });
                break;

            case exConfig.minerStates.eStep_RequestValidation:
                requestToServer(keyPair.digitalAddress,
                        (addr) => TCPClient.Request("GET Validation", addr),
                        (receivedData) => {
                    receivedData = JSON.parse(receivedData);
                    DICEValue.setDICEProtoFromUnit(DICE);
                    DICEValue.calculateValue(receivedData.k, receivedData.N);
                    view_console.printCode("USER_INFO", "UsInf0052", (DICEValue.unitValue * 1024 + "/1024"));
                    currentState = (DICEValue.unitValue === "InvalidDICE" ? exConfig.minerStates.eStep_RequestZeroes : exConfig.minerStates.eStep_SendPrototype);
                });
                break;

            case exConfig.minerStates.eStep_SendPrototype:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    saveDICEToFile(appArgs.fileOutput);
                    var encryptedData = encryptor.encryptDataPublicKey(DICEValue.getDICEProto().toBS58(), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET Prototype", addr, encryptedData);
                },
                        (response) => {
                    printServerReturnData(response);
                    currentState = exConfig.minerStates.eStep_SHAOfUnit;
                });
                break;

            case exConfig.minerStates.eStep_SHAOfUnit:
                hashOfUnit();
                currentState = exConfig.minerStates.eExit_FromApp;
                break;

            case exConfig.minerStates.eExit_FromApp:
                funcExit();
                break;

            default:
                throw "Application has Improper state !";
        }
    }
}

function funcValidate() {

    //Print data inside Encoded DICE Unit
    printDiceUnitFromBS58();

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_InitTCPConnection;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_InitTCPConnection:
                //Get Data from input file
                getKeyPair();

                //Init connection
                initTcpConnection();
                currentState = exConfig.minerStates.eStep_RequestValidation;
                break;

            case exConfig.minerStates.eStep_RequestValidation:
                requestToServer(keyPair.digitalAddress,
                        (addr) => TCPClient.Request("GET Validation", addr),
                        (receivedData) => {
                    receivedData = JSON.parse(receivedData);
                    DICEValue.setDICEProtoFromUnit(DICE);
                    DICEValue.calculateValue(receivedData.k, receivedData.N);
                    view_console.printCode("USER_INFO", "UsInf0052", (DICEValue.unitValue * 1024 + "/1024"));
                    currentState = exConfig.minerStates.eStep_SHAOfUnit;
                });
                break;

            case exConfig.minerStates.eStep_SHAOfUnit:
                hashOfUnit();
                currentState = exConfig.minerStates.eExit_FromApp;
                break;

            case exConfig.minerStates.eExit_FromApp:
                funcExit();
                break;

            default:
                throw "Application has Improper state !";
        }
    }
}

function funcKeyGen() {
    view_console.printCode("USER_INFO", "UsInf0053");
    saveKeyPair();
}

function funcTradeOwnerless() {
    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_CurrentReleaseOwnerless;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_CurrentReleaseOwnerless:
                //Init Connections
                initTcpConnection();

                // Read File to DICE Unit
                var file = modFs.readFileSync(appArgs.diceUnit, "utf8");
                DICE = DICE.fromBS58(file);

                //Get key and address
                getKeyPair();

                currentState = exConfig.minerStates.eStep_CurrentReleaseOwnerlessToServer;
                break;

            case exConfig.minerStates.eStep_CurrentReleaseOwnerlessToServer:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    var claimData = {};
                    //Set DICE Unit to Dice validatior
                    DICEValue.setDICEProtoFromUnit(DICE);

                    claimData["diceProto"] = DICEValue.getDICEProto().toBS58();
                    var encryptedData = encryptor.encryptDataPublicKey(JSON.stringify(claimData), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET CurrentReleaseOwnerless", addr, encryptedData);
                },
                        (response) => {
                    printServerReturnData(response);
                    currentState = exConfig.minerStates.eExit_FromApp;
                });
                break;

            case exConfig.minerStates.eExit_FromApp:
                funcExit();
                break;

            default:
                throw "Application has Improper state !";
        }
    }
}

function funcTradeCurrent() {
    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_CurrentOwnerTrade;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_CurrentOwnerTrade:
                initTcpConnection();
                curOwnerTrade();
                currentState = exConfig.minerStates.eStep_CurrentOwnerClaimToServer;
                break;

            case exConfig.minerStates.eStep_CurrentOwnerClaimToServer:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    DICEValue.setDICEProtoFromUnit(DICE);
                    var claimData = {};
                    claimData["newOwner"] = appArgs.addrMin;
                    claimData["diceProto"] = DICEValue.getDICEProto().toBS58();
                    var encryptedData = encryptor.encryptDataPublicKey(JSON.stringify(claimData), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET CurrentOwnerClaim", addr, encryptedData);
                },
                        (response) => {
                    printServerReturnData(response);
                    currentState = exConfig.minerStates.eExit_FromApp;
                });
                break;

            case exConfig.minerStates.eExit_FromApp:
                funcExit();
                break;

            default:
                throw "Application has Improper state !";
        }
    }
}

function funcTradeNew() {
    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_NewOwnerTrade;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_NewOwnerTrade:
                initTcpConnection();
                try {
                    newOwnerTrade();
                } catch (e) {
                    // Try as normal DICE
                    // Read File to DICE Unit
                    var file = modFs.readFileSync(appArgs.diceUnit, "utf8");
                    DICE = DICE.fromBS58(file);

                    //Get key and address
                    getKeyPair();
                }
                currentState = exConfig.minerStates.eStep_NewOwnerClaimToServer;
                break;

            case exConfig.minerStates.eStep_NewOwnerClaimToServer:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    DICEValue.setDICEProtoFromUnit(DICE);
                    var claimData = {};
                    claimData["newOwner"] = keyPair.digitalAddress;
                    claimData["diceProto"] = DICEValue.getDICEProto().toBS58();
                    var encryptedData = encryptor.encryptDataPublicKey(JSON.stringify(claimData), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET NewOwnerClaim", addr, encryptedData);
                },
                        (response) => {
                    printServerReturnData(response);
                    saveDICEToFile(appArgs.diceUnit + ".decompressed.txt");
                    currentState = exConfig.minerStates.eExit_FromApp;
                });
                break;

            case exConfig.minerStates.eExit_FromApp:
                funcExit();
                break;

            default:
                throw "Application has Improper state !";
        }
    }
}

function funcCalculateCUDA() {
    isCudaReq = true;
    funcCalculate();
}

function funcRegister() {

    //Get KeyPair
    getKeyPair();

    //Read DICE Unit from FS
    var DiceFile = modFs.readFileSync(appArgs.diceUnit, "utf8");

    //Logic for application is to trade an already mined unit which is stored in FS
    DICE = DICE.fromBS58(DiceFile);

    //Init connection
    initTcpConnection();

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_RequestValidation;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_RequestValidation:
                requestToServer(keyPair.digitalAddress,
                        (addr) => TCPClient.Request("GET Validation", addr),
                        (receivedData) => {
                    receivedData = JSON.parse(receivedData);
                    DICEValue.setDICEProtoFromUnit(DICE);
                    DICEValue.calculateValue(receivedData.k, receivedData.N);
                    view_console.printCode("USER_INFO", "UsInf0052", (DICEValue.unitValue * 1024 + "/1024"));
                    currentState = (DICEValue.unitValue === "InvalidDICE" ? exConfig.minerStates.eExit_FromApp : exConfig.minerStates.eStep_SendPrototype);
                });
                break;

            case exConfig.minerStates.eStep_SendPrototype:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    var encryptedData = encryptor.encryptDataPublicKey(DICEValue.getDICEProto().toBS58(), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET Prototype", addr, encryptedData);
                },
                        (response) => {
                    printServerReturnData(response);
                    currentState = exConfig.minerStates.eStep_SHAOfUnit;
                });
                break;

            case exConfig.minerStates.eStep_SHAOfUnit:
                hashOfUnit();
                currentState = exConfig.minerStates.eExit_FromApp;
                break;

            case exConfig.minerStates.eExit_FromApp:
                funcExit();
                break;

            default:
                throw "Application has Improper state !";
        }
    }
}

function funcHelp() {
    var text = CommandParser.getHelpString(exConfig.minerCommandTable);
    view_console.print(text);
}

function funcVersion() {
    view_console.print(exConfig.minerVersion);
}

function funcExit() {
    try {
        //If Connection was established
        TCPClient.close();

        //stop Shcheduler
        clearInterval(scheduler_10ms);
    } catch (e) {
        //NoThing
    }

    //Exit From Application
    view_console.printCode("USER_INFO", "UsInf0054");
}

function funcERROR() {
    view_console.printCode("ERROR", "Err0005");
    funcExit();
}

//#############################################################################
// Local logic of Application
//#############################################################################

//Get function name which must to me executed
var funcName = CommandParser.getExecFuncByTable(exConfig.minerCommandTable);

//Execute function 
commandFunctions[funcName]();


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
            receivedData = encryptor.decryptDataPublicKey(Buffer.from(receivedData), Buffer.from(Bs58.decode(appArgs.addrOp)));
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
    var addrOpL = Bs58.decode(Args.addrOp).toString('hex');
    var addrMinL = Bs58.decode(keyPair.digitalAddress).toString('hex');

    //Start measuring
    Time = Date.now();

    //Generating new DICE Unit  
    if (true === isCudaReq) {
        DICE = DiceCalculatorL.getValidDICE_CUDA(addrOpL, addrMinL, zeroes, exConfig.minerPathToCuda, "cudaJsUnit.json");
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

//Init TCP Connection
function initTcpConnection() {
    //Initialize DNS
    DNS.initializeDB(exConfig.minerDnsFile.path, exConfig.minerDnsFile.type);

    //Requst DNS Binder to get IP and PORT
    var serverData = DNS.lookup(appArgs.addrOp);

    //Create connection
    TCPClient.create("client", serverData.ip, serverData.port, () => {
        view_console.printCode("ERROR", "Err0001");
        currentState = exConfig.minerStates.eExit_FromApp;
    }, view_console);
}

//Read key pair from file
function getKeyPair() {
    if (undefined !== appArgs.fileInput) {
        var file = modFs.readFileSync(appArgs.fileInput, "utf8");
        keyPair = JSON.parse(file);
        encryptor = new modEnc(Bs58.decode(keyPair.privateKey), 'sect131r1', 2);
    } else {
        //Nothing
    }
}

//Write key pair from file
function saveKeyPair() {
    if (undefined !== appArgs.fileOutput) {
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
        modFs.writeFileSync(appArgs.fileOutput, JSON.stringify(keyPair), 'utf8');
    } else {
        //Nothing
    }
}

//Validating DICE Unit from file in Base 58 encoding
function printDiceUnitFromBS58() {
    var file = modFs.readFileSync(appArgs.diceUnit, "utf8");

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
    var DiceFile = modFs.readFileSync(appArgs.diceUnit, "utf8");

    //Logic for application is to trade an already mined unit which is stored in FS
    DICE = DICE.fromBS58(DiceFile);

    //Encrypt unit which is in BS58 with new owner address
    var encData = encryptor.encryptDataPublicKey(DICE.toBS58(), Buffer.from(Bs58.decode(appArgs.addrMin)));

    //Hash of Unit
    var hashOfUnit = DiceCalculatorL.getSHA3OfUnit(DICE);

    //Preapare data for storing
    var fsData = {};
    fsData['addr'] = keyPair.digitalAddress;
    fsData['unit'] = Bs58.encode(encData);

    //Save to file
    modFs.writeFileSync(appArgs.fileOutput, Bs58.encode(Buffer.from(JSON.stringify(fsData))), 'utf8');

    return hashOfUnit;
}

//Miner 2 receives
function newOwnerTrade() {

    //Get KeyPair
    getKeyPair();

    //Read DICE Unit from FS
    var DiceFileJSON = modFs.readFileSync(appArgs.diceUnit, "utf8");

    //Parse file from object
    var DiceFile = JSON.parse(Bs58.decode(DiceFileJSON));

    //Encrypt Hash with new owner address
    var decoded = encryptor.decryptDataPublicKey(Bs58.decode(DiceFile.unit), Buffer.from(Bs58.decode(DiceFile.addr)));

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