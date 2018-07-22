/* javascript-obfuscator:disable */
/* 
 * Copyright 2017-2018 Mihail Maldzhanski<pollarize@gmail.com>.
 * DICE Money Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
const modEnc = require('../../models/Encryptor/Encryptor_Signer.js');
const modBase58 = require('../../models/Base58/Base58.js');
const modVIEW = require('../../models/VIEW_Console/VIEW_Console.js');
const modCommandParser = require('../../models/CommandParser/CommandParser.js');
const modControllers = require('./Controllers/controllers.js');
const modAmountWorker = require('../../models/AmountWorker/AmountWorker.js');

//Configuration
const exConfig = require('./config/minerConfig.js');


/* javascript-obfuscator:enable */
//Create instances of the following models
var DICE = new modDICEUnit();
var DICEScrap = new modDICEUnit();
var DICEProto = new modDICEPrototype();
var DiceCalculatorL = new modDICECalculator("js");
var DNS = new modDNSBinder();
var AddressGen = new modDigAddress();
var TCPClient = new modTCPWorker();
var DICEValue = new modDICEValue(DiceCalculatorL);
var Time = new Date();
var Bs58 = new modBase58();
var CommandParser = new modCommandParser(process.argv, exConfig.minerArgs);
var nstAmmount = new modAmountWorker();

//Local static Data`
var isRequestTransmitted = false;
var currentState = CommandParser.getState();
var keyPair = {};
var scheduler_10ms = undefined;
var zeroes = undefined;
var globalTh = undefined;
var encryptor = undefined;
var view_console = new modVIEW(exConfig.minerVIEW_IF.tableCodes, exConfig.minerVIEW_IF.tablePorts, exConfig.minerViewOut);
view_console.setAllowed(exConfig.minerViewCfg);
var isCudaReq = false;
var securityCounter = 0;
var isTcpReady = false;
var isDnsHttpRequested = false;
var arrUnitsPacket = undefined;

//Object {get(),remove(fileName)}
var diceScrapFuncHandlers = undefined;

//Check Addresses
var appArgs = JSON.parse(modControllers.checkConfig);

//Set Global args to other components
//modControllers.setArgs(appArgs);

const commandFunctions = {
    'funcListGlobalOperators': funcListGlobalOperators,
    'funcBalance': funcBalance,
    'funcListUnits': funcListUnits,
    "funcUpdateDns": funcUpdateDns,
    "funcCalculate": funcCalculate,
    "funcTradeAmount": funcTradeAmount,
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

                //Convert HexDash to BS58
                getAddrOperator();

                //Init connection
                dnsInitialization();

                currentState = exConfig.minerStates.eStep_DnsBinderWait;
                break;

            case exConfig.minerStates.eStep_DnsBinderWait:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = exConfig.minerStates.eStep_ExchangeCertificates;
                }
                break;

            case exConfig.minerStates.eStep_ExchangeCertificates:
                executeExchangeCertificate(exConfig.minerStates.eStep_RequestZeroes);
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
                    globalTh = receivedData.N;
                    calculateDICE(appArgs, (diceScrapFuncHandlerL) => {
                        currentState = exConfig.minerStates.eStep_SendScrap;
                        diceScrapFuncHandlers = diceScrapFuncHandlerL;
                    }, (dice) => {
                        DICE = dice;
                        currentState = exConfig.minerStates.eStep_RequestValidation;
                        //Stop measuring
                        elapsedTime = Date.now() - Time;
                        view_console.printCode("USER_INFO", "UsInf0065", elapsedTime);

                    });

                    //Scrapping is not supported for SW DICE unit generation
                    if (isCudaReq === true) {
                        currentState = exConfig.minerStates.eStep_IDLE;
                    }
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

            case exConfig.minerStates.eStep_SendScrap:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    //return Object {fileName,unit}
                    DICEScrap = diceScrapFuncHandlers.get().unit;
                    var encryptedData = encryptor.encryptDataPublicKey(DICEScrap.toBS58(), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET DICEScrap", addr, encryptedData);
                },
                        (response) => {
                    printServerReturnData(response);
                    diceScrapFuncHandlers.remove(diceScrapFuncHandlers.get().fileName);
                    currentState = exConfig.minerStates.eStep_IDLE;
                });
                break;

            case exConfig.minerStates.eStep_IDLE:
                //Wait to finish generation of unit
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

                //Get operator address from Dice Unit
                getAddrOperatorFromDICEUnit();

                //Init connection
                dnsInitialization();

                currentState = exConfig.minerStates.eStep_DnsBinderWait;
                break;

            case exConfig.minerStates.eStep_DnsBinderWait:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = exConfig.minerStates.eStep_ExchangeCertificates;
                }
                break;

            case exConfig.minerStates.eStep_ExchangeCertificates:
                executeExchangeCertificate(exConfig.minerStates.eStep_RequestValidation);
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

                // Read File to DICE Unit
                var file = modFs.readFileSync(appArgs.diceUnit, "utf8");
                DICE = DICE.fromBS58(file);

                //Get key and address
                getKeyPair();

                //Get Address from Unit
                getAddrOperatorFromDICEUnit();

                //Init Connections
                dnsInitialization();

                currentState = exConfig.minerStates.eStep_DnsBinderWait;
                break;

            case exConfig.minerStates.eStep_DnsBinderWait:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = exConfig.minerStates.eStep_ExchangeCertificates;
                }
                break;

            case exConfig.minerStates.eStep_ExchangeCertificates:
                executeExchangeCertificate(exConfig.minerStates.eStep_CurrentReleaseOwnerlessToServer);
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
                var file = modFs.readFileSync(appArgs.diceUnit, "utf8");
                DICE = DICE.fromBS58(file);
                getAddrOperatorFromDICEUnit();
                dnsInitialization();
                curOwnerTrade();
                currentState = exConfig.minerStates.eStep_DnsBinderWait;
                break;

            case exConfig.minerStates.eStep_DnsBinderWait:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = exConfig.minerStates.eStep_ExchangeCertificates;
                }
                break;

            case exConfig.minerStates.eStep_ExchangeCertificates:
                executeExchangeCertificate(exConfig.minerStates.eStep_CurrentOwnerClaimToServer);
                break;

            case exConfig.minerStates.eStep_CurrentOwnerClaimToServer:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    DICEValue.setDICEProtoFromUnit(DICE);
                    var claimData = {};
                    claimData["newOwner"] = AddressGen.convertHexDashToBS58(appArgs.addrMin);
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

function funcTradeAmount() {
    //Get Units
    var units = extractUnitsRecursivly();
    var sortedUnits = sortListOfUnits(units);

    //List all units
    //listUnit(units);
    listUnitOptimized(sortedUnits, (units, balance) => {
        view_console.printCode("USER_INFO", "UsInf0092", appArgs.ammount);

        var objAmountReaturnData = {units: [], amount: 0.0};

        if (balance * 1024 < appArgs.ammount) {
            //Not enough
            view_console.printCode("WARNING", "Warn0031");
            funcExit();
        } else if (balance * 1024 === appArgs.ammount) {
            //Use all units
            objAmountReaturnData.units = units;
        } else {
            //Get amount
            objAmountReaturnData = nstAmmount.encodeAmount(units, appArgs.ammount);
            if (objAmountReaturnData.amount * 1024 > appArgs.ammount) {
                view_console.printCode("WARNING", "Warn0032", objAmountReaturnData.amount * 1024);
                funcExit();
            }
        }

        //Request Ownerless
        helperFunctionOfAmounTrading(objAmountReaturnData.units, () => {
            view_console.printCode("USER_INFO", "UsInf0092");
            helperFunctionForExportingOfAmountTrading(objAmountReaturnData);
            funcExit();
        });
    });
}

function helperFunctionForExportingOfAmountTrading(objAmountReaturnData) {
    var arrUnitsContent = [];

    //Read allunits and store to array
    for (var unitPath of objAmountReaturnData.units) {
        arrUnitsContent.push(modFs.readFileSync(unitPath, "utf-8"));
    }

    //Decide to encrypt
    if (appArgs.addrMin !== undefined) {
        //Encrypt unit which is in BS58 with new owner address
        var encData = encryptor.encryptFilePublicKey(JSON.stringify(arrUnitsContent), Buffer.from(Bs58.decode(AddressGen.convertHexDashToBS58(appArgs.addrMin))));

        //Preapare data for storing
        var fsData = {};
        fsData['addr'] = keyPair.digitalAddress;
        fsData['unit'] = encData;

    } else {
        var fsData = arrUnitsContent;
    }

    //Save to filsystem
    modFs.writeFileSync(`${appArgs.fileOutput}_${objAmountReaturnData.amount * 1024}${exConfig.minerExtensions.unitsPack}`, Bs58.encode(Buffer.from(JSON.stringify(fsData), "utf-8")).toString());
}

function helperFunctionOfAmounTrading(arrUnitPaths, funcCallback) {
    //Copy in local stack
    var arrUnitPaths = JSON.parse(JSON.stringify(arrUnitPaths));

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_CurrentReleaseOwnerless;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_CurrentReleaseOwnerless:
                //Get key and address
                getKeyPair();
                //Init Connections
                dnsInitialization();
                //Clean previous use of var
                appArgs.addrOp = undefined;
                currentState = exConfig.minerStates.eStep_GetDICE_FromArray;
                break;

            case exConfig.minerStates.eStep_GetDICE_FromArray:
                if (arrUnitPaths !== undefined && arrUnitPaths.length > 0) {
                    // Read File to DICE Unit
                    var file = modFs.readFileSync(arrUnitPaths.pop(), "utf8");
                    DICE = DICE.fromBS58(file);

                    //Read address of operator
                    var addrOpL = Bs58.encode(Buffer.from(DICE.addrOperator, "hex")).toString();

                    if (addrOpL !== appArgs.addrOp) {
                        //Get Address from Unit
                        appArgs.addrOp = addrOpL;

                        //Request exchanging of certificates
                        currentState = exConfig.minerStates.eStep_DnsBinderWait;
                    } else {
                        currentState =
                                appArgs.addrMin !== undefined ?
                                exConfig.minerStates.eStep_CurrentOwnerClaimToServer : // TRUE
                                exConfig.minerStates.eStep_CurrentReleaseOwnerlessToServer; // FALSE
                    }
                } else {
                    currentState = exConfig.minerStates.eExit_FromApp;
                }
                break;

            case exConfig.minerStates.eStep_DnsBinderWait:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = exConfig.minerStates.eStep_ExchangeCertificates;
                }
                break;

            case exConfig.minerStates.eStep_ExchangeCertificates:
                executeExchangeCertificate(
                        appArgs.addrMin !== undefined ?
                        exConfig.minerStates.eStep_CurrentOwnerClaimToServer : // TRUE
                        exConfig.minerStates.eStep_CurrentReleaseOwnerlessToServer); // FALSE
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
                    currentState = exConfig.minerStates.eStep_GetDICE_FromArray;
                });
                break;

            case exConfig.minerStates.eStep_CurrentOwnerClaimToServer:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    DICEValue.setDICEProtoFromUnit(DICE);
                    var claimData = {};
                    claimData["newOwner"] = AddressGen.convertHexDashToBS58(appArgs.addrMin);
                    claimData["diceProto"] = DICEValue.getDICEProto().toBS58();
                    var encryptedData = encryptor.encryptDataPublicKey(JSON.stringify(claimData), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET CurrentOwnerClaim", addr, encryptedData);
                },
                        (response) => {
                    printServerReturnData(response);
                    currentState = exConfig.minerStates.eStep_GetDICE_FromArray;
                });
                break;

            case exConfig.minerStates.eExit_FromApp:
                clearInterval(scheduler_10ms);
                funcCallback();
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

    //Local vars
    var bIsPacket = false;

    function main10ms() {
        switch (currentState) {
            case exConfig.minerStates.eStep_NewOwnerTrade:

                //Get key and address
                getKeyPair();

                //Read data from file input
                bIsPacket = newOwnerTrade();

                //Check is it packet 
                if (!bIsPacket) {
                    getAddrOperatorFromDICEUnit();
                    dnsInitialization();
                    currentState = exConfig.minerStates.eStep_DnsBinderWait;
                } else {
                    //received data is packet of units
                    currentState = exConfig.minerStates.eStep_GetDICE_FromArray;
                }
                break;

            case exConfig.minerStates.eStep_GetDICE_FromArray:
                if (arrUnitsPacket !== undefined && arrUnitsPacket.length > 0) {
                    DICE = DICE.fromBS58(arrUnitsPacket.pop());
                    var addrOpL = Bs58.encode(Buffer.from(DICE.addrOperator, "hex")).toString();

                    //Check for different operator in units set
                    if (addrOpL !== appArgs.addrOp) {
                        getAddrOperatorFromDICEUnit();
                        dnsInitialization();
                        currentState = exConfig.minerStates.eStep_DnsBinderWait;
                    } else {
                        currentState = exConfig.minerStates.eStep_NewOwnerClaimToServer;
                    }

                    dnsInitialization();
                } else {
                    funcExit();
                }
                break;

            case exConfig.minerStates.eStep_DnsBinderWait:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = exConfig.minerStates.eStep_ExchangeCertificates;
                }
                break;

            case exConfig.minerStates.eStep_ExchangeCertificates:
                executeExchangeCertificate(exConfig.minerStates.eStep_NewOwnerClaimToServer);
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
                    if (appArgs.diceUnit === undefined) {
                        if (!modFs.existsSync(appArgs.diceUnit)) {
                            saveDICEToFile(appArgs.diceUnit);
                        }
                    } else {
                        saveDICEToFile(appArgs.fileOutput);
                    }
                    currentState = exConfig.minerStates.eStep_GetDICE_FromArray;
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

    //Get Address from Unit
    getAddrOperatorFromDICEUnit();

    //Init connection
    dnsInitialization();

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = exConfig.minerStates.eStep_DnsBinderWait;

    function main10ms() {
        switch (currentState) {

            case exConfig.minerStates.eStep_DnsBinderWait:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = exConfig.minerStates.eStep_ExchangeCertificates;
                }
                break;

            case exConfig.minerStates.eStep_ExchangeCertificates:
                executeExchangeCertificate(exConfig.minerStates.eStep_RequestValidation);
                break;

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

function funcListGlobalOperators() {
    var dnsData = modFs.readFileSync(exConfig.minerDnsFile.path, "utf8");
    var dnsObject = JSON.parse(dnsData);
    var counter = 0;
    for (var operator in dnsObject) {
        view_console.print(`${++counter}. ${operator} - ${dnsObject[operator].system}`);
    }
    funcExit();
}

function funcUpdateDns() {
    //Delete file
    modFs.unlink(exConfig.minerDnsFile.path, () => {
        //Download
        dnsInitialization(funcExit);
        view_console.printCode("USER_INFO", "UsInf0089");
    });
}

function funcBalance() {
    //Get Units
    var units = extractUnitsRecursivly();
    var sortedUnits = sortListOfUnits(units);

    //Validate All
    //validateUnit(units);
    validateUnitOptimized(sortedUnits);
}

function funcListUnits() {
    //Get Units
    var units = extractUnitsRecursivly();
    var sortedUnits = sortListOfUnits(units);

    //List all units
    //listUnit(units);
    listUnitOptimized(sortedUnits, (unitsData, balance) => {
        printListOfUnits(unitsData);
        view_console.printCode("USER_INFO", "UsInf0090", balance*1024);
        funcExit();
    });
}

function funcHelp() {
    var text = CommandParser.getHelpString(exConfig.minerCommandTable);
    view_console.print("\n" + exConfig.minerVersion + "\n");
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

    //Terminate the process
    process.exit();
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
if (commandFunctions.hasOwnProperty(funcName) === true) {
    commandFunctions[funcName]();
} else {
    // Nothing
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
            try {
                receivedData = encryptor.decryptDataPublicKey(receivedData, Buffer.from(Bs58.decode(appArgs.addrOp)));
            } catch (e) {
                //Nothing
                //Do not decrypt the data
                //Exit from the application
                view_console.printCode("ERROR", "Err0006");
                funcExit();
            }
            deactivate(receivedData);
        }
    }
    return receivedData;
}

function exchangeCertificates(addrMiner, activate, deactivate) {
    var receivedData;
    if (false === isRequestTransmitted) {
        activate(addrMiner);
        isRequestTransmitted = true;
    } else {
        receivedData = TCPClient.readByAddress(addrMiner);
        if (receivedData !== undefined) {
            isRequestTransmitted = false;
            deactivate(receivedData);
        }
    }
    return receivedData;
}

function executeExchangeCertificate(nextState) {
    exchangeCertificates(keyPair.digitalAddress,
            () => {
        var certificate = encryptor.getKeyExchangeCertificate(Buffer.from(Bs58.decode(appArgs.addrOp)));
        TCPClient.Request("SET Certificate", keyPair.digitalAddress, certificate);
    }, (cert) => {
        try {
            var valid = encryptor.acceptKeyExchangeCertificate(cert, Buffer.from(Bs58.decode(appArgs.addrOp)));
            if (valid !== undefined) {
                if (typeof valid === "string") {
                    currentState = nextState;
                } else {
                    view_console.printCode("ERROR", "Err0007");
                }
            }
        } catch (e) {
            if (exConfig.minerSecurityLevels.length > securityCounter) {
                //Update security level
                encryptor.setSecurityLevel(exConfig.minerSecurityLevels[securityCounter]);
                securityCounter++;
            } else {
                //Exit
                view_console.printCode("ERROR", "Err0007", e);
                funcExit();
            }
        }
    });
}

//Function Generate DICE unit (Contains busy loop)
function calculateDICE(Args, diceScrapCallback, finishCallback) {
    //Inform for generetion
    view_console.printCode("USER_INFO", "UsInf0056", zeroes);
    var elapsedTime = 0;
    var addrOpL = Bs58.decode(Args.addrOp).toString('hex');
    var addrMinL = Bs58.decode(keyPair.digitalAddress).toString('hex');

    //Start measuring
    Time = Date.now();

    //Generating new DICE Unit  
    if (true === isCudaReq) {
        DICE = DiceCalculatorL.getValidDICE_CUDA(addrOpL, addrMinL, zeroes, globalTh, exConfig.minerPathToCuda, `cudaJsUnit_${keyPair.digitalAddress}.json`, diceScrapCallback, finishCallback);
    } else {
        DICE = DiceCalculatorL.getValidDICE(Args.addrOp, keyPair.digitalAddress, zeroes);
        finishCallback(DICE);
    }
}

//Save to File 
function saveDICEToFile(fileOutput) {
    var fileIncrementor = 0;
    var testFile = fileOutput;

    while (modFs.existsSync(testFile + exConfig.minerExtensions.unit)) {
        testFile = fileOutput + "." + fileIncrementor;
        fileIncrementor++;
    }

    //Save new name of file
    fileOutput = testFile;

    //Inform for saving
    view_console.printCode("USER_INFO", "UsInf0057", fileOutput);

    //Write to File
    modFs.writeFileSync(fileOutput + exConfig.minerExtensions.unit, DICE.toBS58());

    //Write to File
    //modFs.writeFileSync(fileOutput + ".json", JSON.stringify(DICE.toHexStringifyUnit()), 'utf8');
}

//Calculate Hash
function hashOfUnit() {
    view_console.printCode("USER_INFO", "UsInf0071", DiceCalculatorL.getSHA3OfUnit(DICE));
}

//Init TCP Connection
function dnsInitialization(callback) {
    //Initialize DNS
    if (modFs.existsSync(exConfig.minerDnsFile.path) && isDnsHttpRequested === false) {
        DNS.initializeDB(exConfig.minerDnsFile.path, exConfig.minerDnsFile.type);
        isTcpReady = true;
    } else {
        if (!isDnsHttpRequested) {
            DNS.getGoogleDriveData(Buffer.from(exConfig.minerHttpDns, "base64").toString(), () => {
                isTcpReady = true;
                if (callback !== undefined) {
                    callback();
                }
            });
            isDnsHttpRequested = true;
        }
    }
}

function continueInitconnection() {
    //Set Tcp to ready
    isTcpReady = true;

    //Requst DNS Binder to get IP and PORT
    var serverData;
    try {
        serverData = DNS.lookup(AddressGen.convertBS58ToHexDash(appArgs.addrOp));
    } catch (e) {
        serverData = DNS.lookup(AddressGen.convertHexToHexDash(appArgs.addrOp));
    }

    try {
        //Create connection
        TCPClient.create("client", serverData.ip, serverData.port, (error) => {
            view_console.printCode("ERROR", "Err0001", error);
            currentState = exConfig.minerStates.eExit_FromApp;
        }, view_console);
    } catch (e) {
        view_console.printCode("ERROR", "Err0008", e + appArgs.addrOp);
        funcExit();
    }
}

//Read key pair from file
function getKeyPair() {
    if (undefined !== appArgs.keyPair) {
        var file = modFs.readFileSync(appArgs.keyPair, "utf8");
        keyPair = JSON.parse(file);
        keyPair = AddressGen.fromHexDash(keyPair);
        encryptor = new modEnc({
            private: Bs58.decode(keyPair.privateKey),
            public: Bs58.decode(keyPair.digitalAddress)
        }, exConfig.minerSecurityLevels[securityCounter]);
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
        keyPair.digitalAddress = AddressGen.getDigitalAdress('hexDash');

        //Print newly generated pair
        view_console.printCode("USER_INFO", "UsInf0059", keyPair.privateKey);
        view_console.printCode("USER_INFO", "UsInf0060", keyPair.digitalAddress);

        //Print newly generated pair
        view_console.printCode("DEV_INFO", "DevInf0111", AddressGen.getPrivateKey('hex'));
        view_console.printCode("DEV_INFO", "DevInf0112", AddressGen.getDigitalAdress('hex'));

        //Save to file
        modFs.writeFileSync(appArgs.fileOutput + exConfig.minerExtensions.key, JSON.stringify(keyPair), 'utf8');
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
    var encData = encryptor.encryptFilePublicKey(DICE.toBS58(), Buffer.from(Bs58.decode(AddressGen.convertHexDashToBS58(appArgs.addrMin))));

    //Hash of Unit
    var hashOfUnit = DiceCalculatorL.getSHA3OfUnit(DICE);

    //Preapare data for storing
    var fsData = {};
    fsData['addr'] = keyPair.digitalAddress;
    fsData['unit'] = encData;

    //Save to file
    modFs.writeFileSync(appArgs.fileOutput + exConfig.minerExtensions.unitEnc, Bs58.encode(Buffer.from(JSON.stringify(fsData))), 'utf8');
    return hashOfUnit;
}

//Miner 2 receives
function newOwnerTrade() {

    //Returned Data
    var bIsPacket = false;

    //Get KeyPair
    getKeyPair();

    //Read DICE Unit from FS
    var DiceFileJSON = modFs.readFileSync(appArgs.diceUnit, "utf8");

    //Try to decrypt DICE Unit
    try {
        //Parse file from object
        var DiceFile = JSON.parse(Bs58.decode(DiceFileJSON));

        //Encrypt Hash with new owner address
        var decoded = encryptor.decryptFilePublicKey(DiceFile.unit, Buffer.from(Bs58.decode(DiceFile.addr)));

        //Check is it packet or signle unit
        try {
            arrUnitsPacket = JSON.parse(decoded);
            if (Array.isArray(arrUnitsPacket)) {
                bIsPacket = true;
            }
        } catch (ex) {
            //Logic for application is to trade an already mined unit which is stored in FS
            DICE = DICE.fromBS58(decoded.toString());
        }

    } catch (ex) {
        //Check is it packet or signle unit
        try {
            arrUnitsPacket = JSON.parse(Bs58.decode(DiceFileJSON));
            if (Array.isArray(arrUnitsPacket)) {
                bIsPacket = true;
            }
        } catch (ex) {
            // Try as normal DICE
            // Read File to DICE Unit
            DICE = DICE.fromBS58(DiceFileJSON);
        }
    }

    return bIsPacket;
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

function getAddrOperatorFromDICEUnit() {
    if (appArgs.diceUnit !== undefined) {
        appArgs.addrOp = Bs58.encode(Buffer.from(DICE.addrOperator, "hex")).toString();
    }
}

function getAddrOperator() {
    if (appArgs.addrOp !== undefined) {
        appArgs.addrOp = AddressGen.convertHexDashToBS58(appArgs.addrOp);
    }
}

function findUnits(folder) {
    try {
        var units = [];
        var folders = [];
        var indexUnits = 0;
        var indexFolders = 0;
        modFs.readdirSync(folder).forEach(file => {
            if (file.indexOf(exConfig.minerExtensions.unit) !== -1) {
                units[indexUnits++] = file;
            } else {
                folders[indexFolders++] = file;
            }
        });

        return {
            hasMoreFolders: folders.length > 0,
            units: units,
            folders: folders
        };
    } catch (e) {
        //Nothing
    }
}

function validateUnit(units) {
    var file = "";
    var fileIndex = 0;
    var balance = 0;

    const states = {
        eState_ReadFile: 0,
        eState_InitConnection: 1,
        eState_WaitDNS: 2,
        eState_ExcahngeCert: 3,
        eState_RequestOperator: 4,
        eState_AddValue: 5,
        eState_SendProto: 6,

        eState_Count: 7
    };

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = states.eState_ReadFile;

    function main10ms() {
        switch (currentState) {
            case states.eState_InitConnection:
                //Get Data from input file
                getKeyPair();

                //Get operator address from Dice Unit
                appArgs.addrOp = Bs58.encode(Buffer.from(DICE.addrOperator, "hex")).toString();

                //Init connection
                dnsInitialization();

                currentState = states.eState_WaitDNS;
                break;

            case states.eState_WaitDNS:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = states.eState_ExcahngeCert;
                }
                break;

            case states.eState_ExcahngeCert:
                executeExchangeCertificate(states.eState_RequestOperator);
                break;

            case states.eState_RequestOperator:
                requestToServer(keyPair.digitalAddress,
                        (addr) => TCPClient.Request("GET Validation", addr),
                        (receivedData) => {
                    receivedData = JSON.parse(receivedData);
                    DICEValue.setDICEProtoFromUnit(DICE);
                    DICEValue.calculateValue(receivedData.k, receivedData.N);
                    currentState = states.eState_SendProto;
                });
                break;

            case exConfig.minerStates.eStep_SendPrototype:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    var encryptedData = encryptor.encryptDataPublicKey(DICEValue.getDICEProto().toBS58(), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET Prototype", addr, encryptedData);
                },
                        (data) => {
                    var response = JSON.parse(data);
                    if (response.data.curOwner === AddressGen.convertBS58ToHexDash(keyPair.digitalAddress)) {
                        currentState = states.eState_AddValue;
                    } else {
                        currentState = states.eState_ReadFile;
                    }
                });
                break;

            case states.eState_AddValue:
                if ((DICEValue.unitValue) !== "InvalidDICE") {
                    balance += DICEValue.unitValue;
                }
                currentState = states.eState_ReadFile;
                break;

            case states.eState_ReadFile:
                if (fileIndex < units.length) {
                    file = modFs.readFileSync(units[fileIndex++], "utf8");

                    //Read DICE Unit from file
                    try {
                        DICE = DICE.from(file);
                    } catch (e) {
                        DICE = DICE.fromBS58(file);
                    }

                    //Clean security levels
                    securityCounter = 0;
                    currentState = states.eState_InitConnection;

                } else {
                    view_console.printCode("USER_INFO", "UsInf0090", balance);
                    funcExit();
                }

                break;

            default:
            //Nothing
        }
    }
}

function validateUnitOptimized(units) {
    var fileIndex = 0;
    var balance = 0;
    var valData = {k: undefined, N: undefined};

    const states = {

        //New Operator Specific
        eState_InitConnection: 0,
        eState_WaitDNS: 1,
        eState_ExcahngeCert: 2,

        //Get Global TH
        eState_RequestOperator: 3,

        //Add new Value
        eState_AddValue: 4,
        eState_SendProto: 5,

        eState_Count: 7
    };

    //Read keys
    getKeyPair();

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 0);
    currentState = states.eState_InitConnection;

    function main10ms() {
        switch (currentState) {
            case states.eState_InitConnection:
                //Get operator from unit
                appArgs.addrOp = units[fileIndex].op;

                //Init connection
                dnsInitialization();

                currentState = states.eState_WaitDNS;
                break;

            case states.eState_WaitDNS:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = states.eState_ExcahngeCert;
                }
                break;

            case states.eState_ExcahngeCert:
                executeExchangeCertificate(states.eState_RequestOperator);
                break;

            case states.eState_RequestOperator:
                if (valData.k === undefined) {
                    requestToServer(keyPair.digitalAddress,
                            (addr) => TCPClient.Request("GET Validation", addr),
                            (receivedData) => {
                        receivedData = JSON.parse(receivedData);
                        valData.k = receivedData.k;
                        valData.N = receivedData.N;
                        currentState = exConfig.minerStates.eStep_SendPrototype;
                    });
                } else {
                    currentState = exConfig.minerStates.eStep_SendPrototype;
                }
                break;

            case exConfig.minerStates.eStep_SendPrototype:
                if (fileIndex < units.length) {
                    var curOp = units[fileIndex].op;
                    if (curOp === appArgs.addrOp) {
                        requestToServer(keyPair.digitalAddress,
                                (addr) => {
                            DICEValue.setDICEProtoFromUnit(units[fileIndex].unit);
                            var encryptedData = encryptor.encryptDataPublicKey(DICEValue.getDICEProto().toBS58(), Buffer.from(Bs58.decode(appArgs.addrOp)));
                            TCPClient.Request("SET Prototype", addr, encryptedData);
                        },
                                (data) => {
                            var response = JSON.parse(data);
                            if (response.data.curOwner === AddressGen.convertBS58ToHexDash(keyPair.digitalAddress)) {
                                DICEValue.calculateValue(valData.k, valData.N);
                                if ((DICEValue.unitValue) !== "InvalidDICE") {
                                    balance += DICEValue.unitValue;
                                }
                            }
                            fileIndex++;
                        });
                    } else {
                        securityCounter = 0;
                        currentState = states.eState_InitConnection;
                    }
                } else {
                    view_console.printCode("USER_INFO", "UsInf0090", balance*1024);
                    funcExit();
                }

                break;

            default:
            //Nothing
        }
    }
}

function listUnit(units) {
    var file = "";
    var fileIndex = 0;
    var unitsData = [];
    var curOwnwer = "";

    const states = {
        eState_ReadFile: 0,
        eState_InitConnection: 1,
        eState_WaitDNS: 2,
        eState_ExcahngeCert: 3,
        eState_RequestOperator: 4,
        eState_AddValue: 5,
        eState_SendProto: 6,

        eState_Count: 7
    };

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 10);
    currentState = states.eState_ReadFile;

    function main10ms() {
        switch (currentState) {
            case states.eState_InitConnection:
                //Get Data from input file
                getKeyPair();

                //Get operator address from Dice Unit
                appArgs.addrOp = Bs58.encode(Buffer.from(DICE.addrOperator, "hex")).toString();

                //Init connection
                dnsInitialization();

                currentState = states.eState_WaitDNS;
                break;

            case states.eState_WaitDNS:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = states.eState_ExcahngeCert;
                }
                break;

            case states.eState_ExcahngeCert:
                executeExchangeCertificate(states.eState_RequestOperator);
                break;

            case states.eState_RequestOperator:
                requestToServer(keyPair.digitalAddress,
                        (addr) => TCPClient.Request("GET Validation", addr),
                        (receivedData) => {
                    receivedData = JSON.parse(receivedData);
                    DICEValue.setDICEProtoFromUnit(DICE);
                    DICEValue.calculateValue(receivedData.k, receivedData.N);
                    currentState = states.eState_SendProto;
                });
                break;

            case exConfig.minerStates.eStep_SendPrototype:
                requestToServer(keyPair.digitalAddress,
                        (addr) => {
                    var encryptedData = encryptor.encryptDataPublicKey(DICEValue.getDICEProto().toBS58(), Buffer.from(Bs58.decode(appArgs.addrOp)));
                    TCPClient.Request("SET Prototype", addr, encryptedData);
                },
                        (data) => {
                    var response = JSON.parse(data);
                    curOwnwer = response.data.curOwner;
                    currentState = states.eState_AddValue;
                });
                break;

            case states.eState_AddValue:
                unitsData[fileIndex] = {
                    name: units[fileIndex],
                    operator: AddressGen.convertBS58ToHexDash(appArgs.addrOp),
                    owner: curOwnwer,
                    value: DICEValue.unitValue
                };
                fileIndex++;
                currentState = states.eState_ReadFile;
                break;

            case states.eState_ReadFile:
                if (fileIndex < units.length) {
                    file = modFs.readFileSync(units[fileIndex], "utf8");

                    //Read DICE Unit from file
                    try {
                        DICE = DICE.from(file);
                    } catch (e) {
                        DICE = DICE.fromBS58(file);
                    }

                    //Clean security levels
                    securityCounter = 0;
                    currentState = states.eState_InitConnection;

                } else {
                    printListOfUnits(unitsData);
                    funcExit();
                }

                break;

            default:
            //Nothing
        }
    }
}

function listUnitOptimized(units, funcCallback) {
    var fileIndex = 0;
    var balance = 0;
    var valData = {k: undefined, N: undefined};
    var unitsData = [];

    const states = {

        //New Operator Specific
        eState_InitConnection: 0,
        eState_WaitDNS: 1,
        eState_ExcahngeCert: 2,

        //Get Global TH
        eState_RequestOperator: 3,

        //Add new Value
        eState_AddValue: 4,
        eState_SendProto: 5,

        eState_Count: 7
    };

    //Read keys
    getKeyPair();

    //Start scheduled program
    scheduler_10ms = setInterval(main10ms, 0);
    currentState = states.eState_InitConnection;

    function main10ms() {
        switch (currentState) {
            case states.eState_InitConnection:
                //Get operator from unit
                appArgs.addrOp = units[fileIndex].op;

                //Init connection
                dnsInitialization();

                currentState = states.eState_WaitDNS;
                break;

            case states.eState_WaitDNS:
                if (isTcpReady) {
                    continueInitconnection();
                    currentState = states.eState_ExcahngeCert;
                }
                break;

            case states.eState_ExcahngeCert:
                executeExchangeCertificate(states.eState_RequestOperator);
                break;

            case states.eState_RequestOperator:
                if (valData.k === undefined) {
                    requestToServer(keyPair.digitalAddress,
                            (addr) => TCPClient.Request("GET Validation", addr),
                            (receivedData) => {
                        receivedData = JSON.parse(receivedData);
                        valData.k = receivedData.k;
                        valData.N = receivedData.N;
                        currentState = exConfig.minerStates.eStep_SendPrototype;
                    });
                } else {
                    currentState = exConfig.minerStates.eStep_SendPrototype;
                }
                break;

            case exConfig.minerStates.eStep_SendPrototype:
                if (fileIndex < units.length) {
                    var curOp = units[fileIndex].op;
                    if (curOp === appArgs.addrOp) {
                        requestToServer(keyPair.digitalAddress,
                                (addr) => {
                            DICEValue.setDICEProtoFromUnit(units[fileIndex].unit);
                            var encryptedData = encryptor.encryptDataPublicKey(DICEValue.getDICEProto().toBS58(), Buffer.from(Bs58.decode(appArgs.addrOp)));
                            TCPClient.Request("SET Prototype", addr, encryptedData);
                        },
                                (data) => {
                            var response = JSON.parse(data);
                            DICEValue.calculateValue(valData.k, valData.N);

                            //Only currrent owner or ownerless
                            if (response.data.curOwner.length < 2 || response.data.curOwner === AddressGen.convertBS58ToHexDash(keyPair.digitalAddress)) {
                                unitsData[fileIndex] = {
                                    name: units[fileIndex].name,
                                    operator: AddressGen.convertBS58ToHexDash(curOp),
                                    owner: response.data.curOwner,
                                    value: DICEValue.unitValue
                                };
                            }

                            if (response.data.curOwner === AddressGen.convertBS58ToHexDash(keyPair.digitalAddress)) {
                                if ((DICEValue.unitValue) !== "InvalidDICE") {
                                    balance += DICEValue.unitValue;
                                }
                            }
                            fileIndex++;
                        });
                    } else {
                        securityCounter = 0;
                        currentState = states.eState_InitConnection;
                    }
                } else {
                    clearInterval(scheduler_10ms);
                    funcCallback(unitsData, balance);
                }

                break;

            default:
            //Nothing
        }
    }
}


function printListOfUnits(unitsData) {
    var index = 1;
    for (var unit in unitsData) {
        var unitData = unitsData[unit];
        view_console.print(`${(index++)} # ${unitData.name} # ${unitData.operator} # ${unitData.owner} # ${unitData.value*1024}`);
    }
}

function extractUnitsRecursivly() {
    var hasMoreFolders = true;
    var indexOfUnits = 0;
    var units = [];
    var currentFolders = [appArgs.folderWithUnits];

    //Extract all units recursivly
    while (hasMoreFolders) {
        hasMoreFolders = false;
        var returnData = {};
        var newFolders = [];
        var indexOfNewFolders = 0;

        for (var folder in currentFolders) {
            //Extract folders and units
            returnData = findUnits(currentFolders[folder]);

            //Copy Units
            for (var unit in returnData.units) {
                units[indexOfUnits++] = `${currentFolders[folder]}/${returnData.units[unit]}`;
            }

            //Copy New folders
            for (var newFolder in returnData.folders) {
                newFolders[indexOfNewFolders++] = `${currentFolders[folder]}/${returnData.folders[newFolder]}`;
            }

            hasMoreFolders = returnData.hasMoreFolders;
        }
        currentFolders = newFolders;
    }
    return units;
}

function sortListOfUnits(units) {
    //Create buffer object
    var unitsOrdered = [];
    var operator = "";
    var LocalDICE = new modDICEUnit();
    var file = "";

    //Extract all units operator and data
    for (var item in units) {
        file = modFs.readFileSync(units[item], "utf8");
        LocalDICE = new modDICEUnit();

        //Read DICE Unit from file
        try {
            LocalDICE = LocalDICE.from(file);
        } catch (e) {
            LocalDICE = LocalDICE.fromBS58(file);
        }

        //Exract operator
        operator = Bs58.encode(Buffer.from(LocalDICE.addrOperator, "hex")).toString();

        //Save them to bank
        unitsOrdered[item] = {
            name: units[item],
            op: operator,
            unit: LocalDICE
        };
    }

    unitsOrdered = unitsOrdered.sort(function (a, b) {
        return a.op > b.op;
    });

    return unitsOrdered;
}