/* javascript-obfuscator:disable */
/* 
 * Copyright (c) 2018, Mihail Maldzhanski
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
const modCfg = require('../../../models/ContactsWorker/ContactsWorker.js');
const modCommandParser = require('../../../models/CommandParser/CommandParser.js');
const modDigAddress = require('../../../models/AddressCalculator/DigitalAdressCalculator_ECDH.js');
const modVIEW = require('../../../models/VIEW_Console/VIEW_Console.js');
/* javascript-obfuscator:enable */

//Init configration worker
var cfgWorker = new modCfg();
var digAddrWorker = new modDigAddress();

//Configuration
const exConfig = require('../config/minerConfig.js');
var view_console = new modVIEW(exConfig.minerVIEW_IF.tableCodes, exConfig.minerVIEW_IF.tablePorts, exConfig.minerViewOut);

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
try {
    commandFunctions[funcName]();
} catch (e) {
    //Must to be done ???
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