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
const modCfg = require('../../../models/ContactsWorker/ContactsWorker.js');
const modCommandParser = require('../../../models/CommandParser/CommandParser.js');
const modDigAddress = require('../../../models/AddressCalculator/DigitalAdressCalculator_ECDH.js');
const modVIEW = require('../../../models/VIEW_Console/VIEW_Console.js');
const modBase58 = require('../../../models/Base58/Base58.js');
const modDICEUnit = require('../../../models/DICECalculator/DICEUnit.js');
const modDICEValue = require('../../../models/DICEValue/DICEValue.js');
const modDICECalculator = require('../../../models/DICECalculator/DICECalculator.js');
/* javascript-obfuscator:enable */

//Init worker
var AddressGen = new modDigAddress();
var Bs58 = new modBase58();
var DICE = new modDICEUnit();
var DiceCalculatorL = new modDICECalculator("js");
var DICEValue = new modDICEValue(DiceCalculatorL);

//Configuration
const exConfig = require('../config/minerConfig.js');
var view_console = new modVIEW(exConfig.minerVIEW_IF.tableCodes, exConfig.minerVIEW_IF.tablePorts, exConfig.minerViewOut);
var securityCounter = 0;
var appArgs = {};
var isTcpReady = false;
var keyPair = {};

//#############################################################################
// Parsing of Commands
//#############################################################################
const commandFunctions =
        {
            'funcBalance': funcBalance,
            'funcListUnits': funcListUnits
        };

//#############################################################################
// External functions
//#############################################################################
function funcBalance() {
    //Get Units
    var units = extractUnitsRecursivly();

    //Validate all
    validateUnit(units);
}

function funcListUnits() {
    //Get Units
    var units = extractUnitsRecursivly();

    //List all units
    listUnit(units);
}

//#############################################################################
// Local functions
//#############################################################################
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

        return {hasMoreFolders: folders.length > 0, units: units, folders: folders};
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
                unitsData[fileIndex] = {name: units[fileIndex], operator: AddressGen.convertBS58ToHexDash(appArgs.addrOp), owner: curOwnwer, value: DICEValue.unitValue};
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

function printListOfUnits(unitsData) {
    var index = 1;
    for (var unit in unitsData) {
        var unitData = unitsData[unit];
        view_console.print(`${(index++)} # ${unitData.name} # ${unitData.operator} # ${unitData.owner} # ${unitData.value}`);
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

function balanceCtrl() {

}

function setAppArgs(args) {
    appArgs = args;
}

//Exported interfaces
module.exports.balanceCtrl = balanceCtrl;
module.exports.setArgs = setAppArgs;