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


//Init configration worker
var cfgWorker = new modCfg();
var digAddrWorker = new modDigAddress();

//Configuration
const exConfig = require('../config/minerConfig.js');
var view_console = new modVIEW(exConfig.minerVIEW_IF.tableCodes, exConfig.minerVIEW_IF.tablePorts, exConfig.minerViewOut);

/* javascript-obfuscator:enable */
//#############################################################################
// Parsing of Commands
//#############################################################################
const commandFunctions =
        {
            "funcPrintName": funcPrintName,
            "funcPrintDA": funcPrintDA,
            "funcAddContact": funcAddContact,
            "funcExportKeys": funcExportKeys,
            "funcAddOperator": funcAddOperator,
            "funcCreateCfg": funcCreateCfg,
            "funcUpdateCfg": funcUpdateCfg,
            "funcImportCfg": funcImportCfg,
            "funcListOperators": funcListOperators,
            "funcListContacts": funcListContacts
        };

//Read Commands
var CommandParser = new modCommandParser(process.argv, exConfig.minerArgs);
var appArgs = CommandParser.getArgs();

//Get function name which must to me executed
var funcName = CommandParser.getExecFuncByTable(exConfig.minerCommandTable);

//Check for config
if (appArgs.configrationFile === undefined ||
        appArgs.configurationFile === "") {
    if (modFs.exists(exConfig.minerConfigFile)) {
        modFs.readdirSync("./").forEach(file => {
            if (file.indexOf(exConfig.minerExtensions.conf) !== -1) {
                appArgs.configurationFile = file;
            }
        });
    } else {
        appArgs.configurationFile = exConfig.minerConfigFile;
    }
}

//Update Instance
cfgWorker = new modCfg(appArgs.configurationFile);

//Execute function 
if (commandFunctions.hasOwnProperty(funcName) === true) {
    commandFunctions[funcName]();
} else {
    //Nothing
}

//#############################################################################
// Functions to be executed
//#############################################################################
function funcCreateCfg() {
    var cfgData = {Path: appArgs.configurationFile, Name: appArgs.nameOfOwner, Keys: appArgs.keyPair};
    cfgWorker.CreateNewConfig(cfgData);
    view_console.printCode("USER_INFO", "UsInf0088");
}

function funcImportCfg() {
    cfgWorker.ImportOperatorsAndContacts(appArgs.externalConfigurationFile);
    view_console.printCode("USER_INFO", "UsInf0085");
}

function funcListOperators() {
    view_console.print(cfgWorker.GetOperatorsToString());
}

function funcListContacts() {
    view_console.print(cfgWorker.GetContactsToString());
}

function funcAddContact() {
    cfgWorker.AddContact({Name: appArgs.nameOfContact, DA: appArgs.digitalAddrOfContact});
    view_console.printCode("USER_INFO", "UsInf0086");
}

function funcAddOperator() {
    cfgWorker.AddOperator({Name: appArgs.nameOfOperator, DA: appArgs.digitalAddrOfOperator});
    view_console.printCode("USER_INFO", "UsInf0087");
}

function funcUpdateCfg() {
    cfgWorker.SetName(appArgs.nameOfOwner);
    cfgWorker.SetKeysPath(appArgs.keyPair);
}

function funcExportKeys() {
    var path = cfgWorker.GetKeysPath();
    modFs.writeFileSync(appArgs.fileOutput, modFs.readFileSync(path));
}

function funcPrintDA() {
    var keys = modFs.readFileSync(cfgWorker.GetKeysPath());
    keys = JSON.parse(keys);
    view_console.print(keys.digitalAddress);
}

function funcPrintName() {
    view_console.print(cfgWorker.GetName());
}

//#############################################################################
// Functions to be executed
//#############################################################################
function checkConfig() {
    if (!digAddrWorker.IsValidAddress(appArgs.addrMin)) {
        appArgs.addrMin = cfgWorker.GetContactAddr(appArgs.addrMin);
    }

    if (!digAddrWorker.IsValidAddress(appArgs.addrOp)) {
        appArgs.addrOp = cfgWorker.GetOperatorAddr(appArgs.addrOp);
    }

    if (appArgs.keyPair === undefined || appArgs.keyPair === "") {
        appArgs.keyPair = cfgWorker.GetKeysPath();
    }

    return JSON.stringify(appArgs);
}


//Exported interfaces
module.exports.checkConfig = checkConfig();