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
const modVIEWCon = require('../../models/VIEW_Console/VIEW_Console.js');

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

//External const
const viewIf = require('../VIEW/VIEW_Interfaces.js');

//Local Stub
var table = {
            ERROR:
                    {
                        Err0001: {str: 'Cannot connect to server. No Active server', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0002: {str: 'Ip/Port is busy', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0003: {str: 'Cannot process command', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0004: {str: 'Error in configuration file', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0005: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0006: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0007: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0008: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0009: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Err0010: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]}
                    },
            WARNING:
                    {
                        Warn0011: {str: 'TCP Connection Closed', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0012: {str: 'Client spontaneous disconnected.', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0013: {str: 'Error DICE Unit has Invalid Value', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0014: {str: 'Error Mismatch with Current Owner', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0015: {str: 'Error New owner was already set', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0016: {str: 'Error Mismatch New Owner field and requested address', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0017: {str: 'Error Mismatch New Owner field and claimed owner', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0018: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0019: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        Warn0020: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]}
                    },
            USER_INFO:
                    {
                        UsInf0021: {str: 'User settings for value of new DICE Unit: %s', plch: [() => {
                                    return Args.spareCommand;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0022: {str: 'DICE Value: %s', plch: [() => {
                                    return DICEValue.unitValue;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0023: {str: 'Generating new Digital Address and Key Pair', plch: [() => {
                                    return undefined;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0024: {str: 'Exit from Program', plch: [() => {
                                    return undefined;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0025: {str: 'SHA3 Speed: %s hash/s', plch: [() => {
                                    return DiceCalculatorL.getSHA3Count();
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0026: {str: 'Calculate new DICE Unit with Level - %s Operator Threshold', plch: [() => {
                                    return zeroes;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0027: {str: 'Saving generated Unit to %s', plch: [() => {
                                    return fileOutput;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0028: {str: 'Hash value of Prototype: %s', plch: [() => {
                                    return DiceCalculatorL.getSHA3OfUnit(DICE);
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0029: {str: 'Server Running', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0030: {str: 'Base 58 Key:  %s', plch: [() => {
                                    return keyPair.privateKey;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0031: {str: 'Base 58 Addr: %s', plch: [() => {
                                    return keyPair.digitalAddress;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0032: {str: 'Server Params: Operator Threshold: %s  Global Threshold: %s', plch: [() => {
                                    return zeroes;
                                }, () => {
                                    return valData.N;
                                }, () => {
                                    return;
                                }]},
                        UsInf0033: {str: '%s %s %s', plch: [() => {
                                    return keyPair.digitalAddress;
                                }, () => {
                                    return serverData.ip;
                                }, () => {
                                    return serverData.port;
                                }]},
                        UsInf0034: {str: 'Unit Content in HEX', plch: [() => {
                                    return undefined;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0035: {str: 'Operator Address: %s', plch: [() => {
                                    return Buffer.from(DICE.addrOperator.buffer).toString('hex');
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0036: {str: 'Miner Address: %s', plch: [() => {
                                    return Buffer.from(DICE.addrMiner.buffer).toString('hex');
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0037: {str: 'Traling Zeroes:  %s', plch: [() => {
                                    return Buffer.from(DICE.validZeros.buffer).toString('hex');
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0038: {str: 'Time: %s', plch: [() => {
                                    return Buffer.from(DICE.swatchTime.buffer).toString('hex');
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0039: {str: 'Payload: %s', plch: [() => {
                                    return Buffer.from(DICE.payLoad.buffer).toString('hex');
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0040: {str: '\nServer Response Message', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0041: {str: 'Response Status: %s', plch: [
                                   "response.status.toString()"
                                , () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0042: {str: 'Current Owner: %s', plch: [() => {
                                    return response.data.curOwner;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0043: {str: 'DICE Value: %s', plch: [() => {
                                    return response.data.diceValue;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0044: {str: 'Hash value of Prototype: %s', plch: [() => {
                                    return response.data.hash;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0045: {str: 'End of Server Response Message \n', plch: [() => {
                                    return undefined;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0046: {str: 'DICE Unit successfully registered in Data Base', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0047: {str: 'DICE Value: %s', plch: [() => {
                                    return DICEValue.unitValue;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0048: {str: 'Claim accepted!', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0049: {str: 'New owner accepted!', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0050: {str: 'New configuration applied at: %s', plch: [() => {
                                    return curr.mtime;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0051: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        UsInf0052: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]}
                    },
            DEV_INFO:
                    {
                        DevInf0053: {str: 'Base Hex Key:  %s', plch: [() => {
                                    return AddressGen.getPrivateKey('hex');
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0054: {str: 'Base Hex Addr: %s', plch: [() => {
                                    return AddressGen.getDigitalAdress('hex');
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0055: {str: 'Data received: %s', plch: [() => {
                                    return data.toString();
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0056: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0057: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0058: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0059: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0060: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0061: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]},
                        DevInf0062: {str: '', plch: [() => {
                                    return;
                                }, () => {
                                    return;
                                }, () => {
                                    return;
                                }]}
                    }
        };
        
//Create view instance
var modVIEW = new modVIEWCon(table);

//Set View Config
modVIEW.setAllowed({ERROR: true, WARNINGS:true, USER_INFO: true, DEV_INFO: true});

//Local Constants
var cCONST = {

};

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
                    modVIEW.printCode("USER_INFO", "UsInf0021");
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
                modVIEW.printCode("USER_INFO", "UsInf0022");
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
            modVIEW.printCode("USER_INFO", "UsInf0023");
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
            modVIEW.printCode("USER_INFO", "UsInf0024");
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
            modVIEW.printCode("USER_INFO", "UsInf0025");
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
    modVIEW.printCode("USER_INFO", "UsInf0026");
    var elapsedTime = 0;
    var addrOpL = modBS58.decode(Args.addrOp).toString('hex');
    var addrMinL = modBS58.decode(keyPair.digitalAddress).toString('hex');
    //Start measuring
    console.time("time used");
    Time = Date.now();

    //Generating new DICE Unit  
    if (true === Args.cuda) {
        DICE = DiceCalculatorL.getValidDICE_CUDA(addrOpL, addrMinL, zeroes, pathToCudaApp, "cudaJsUnit.json");
    } else {
        DICE = DiceCalculatorL.getValidDICE(Args.addrOp, keyPair.digitalAddress, zeroes);
    }

    elapsedTime = Date.now() - Time;
    //Stop measuring
    console.timeEnd("time used");

//    console.log("SHA3 Speed: " + (DiceCalculatorL.getSHA3Count()/elapsedTime)*1000 + " hash/s");
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
    modVIEW.printCode("USER_INFO", "UsInf0027");

    //Write to File
    modFs.writeFileSync(fileOutput, DICE.toBS58());

    //Write to File
    modFs.writeFileSync(fileOutput + ".json", JSON.stringify(DICE.toHexStringifyUnit()), 'utf8');
}

//Calculate Hash
function hashOfUnit() {
    modVIEW.printCode("USER_INFO", "UsInf0028");
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
        modVIEW.printCode("ERROR", "Err0001");
        currentState = appStates.eExit_FromApp;
    }, modVIEW);
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
        modVIEW.printCode("USER_INFO", "UsInf0030");
        modVIEW.printCode("USER_INFO", "UsInf0031");

        //Print newly generated pair
        modVIEW.printCode("DEV_INFO", "UsInf0053");
        modVIEW.printCode("DEV_INFO", "UsInf0054");

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

    modVIEW.printCode("USER_INFO", "UsInf0034");
    modVIEW.printCode("USER_INFO", "UsInf0035");
    modVIEW.printCode("USER_INFO", "UsInf0036");
    modVIEW.printCode("USER_INFO", "UsInf0037");
    modVIEW.printCode("USER_INFO", "UsInf0038");
    modVIEW.printCode("USER_INFO", "UsInf0039");
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
    modVIEW.printCode("USER_INFO", "UsInf0040");
    modVIEW.printCode("USER_INFO", "UsInf0041");
    modVIEW.printCode("USER_INFO", "UsInf0042");
    modVIEW.printCode("USER_INFO", "UsInf0043");
    modVIEW.printCode("USER_INFO", "UsInf0044");
    modVIEW.printCode("USER_INFO", "UsInf0045");
}