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

//Application version
const version =
        "Copyright (c) 2018, Mihail Maldzhanski <pollarize@gmail.com>\n\
DICE Money <www.dice.money> - Miner Application Version[1.45] - 07 .04.2018";

//Application states
const appStates = {
    //Mining States
    eStep_InitTCPConnection: 0,
    eStep_ExchangeCertificates: 1,
    eStep_ConnectToServer: 2,
    eStep_RequestZeroes: 3,
    eStep_CalculateDICE: 4,
    eStep_RequestValidation: 5,
    eStep_SendPrototype: 6,
    eStep_SHAOfUnit: 7,

    //Trading
    eStep_CurrentOwnerTrade: 8,
    eStep_NewOwnerTrade: 9,
    eStep_CurrentReleaseOwnerlessToServer: 10,

    eStep_CurrentOwnerClaimToServer: 11,
    eStep_NewOwnerClaimToServer: 12,
    eStep_CurrentReleaseOwnerless: 13,

    //Idle
    eStep_IDLE: 14,

    //DNS Downloading
    eStep_DnsBinderWait: 15,

    eExit_FromApp: 16,
    eStep_Count: 17
};

//Data stored buffer from console arguments
const Args = {
    configurationFile: undefined,
    keyPair: undefined,
    diceUnit: undefined,
    fileOutput: undefined,
    addrOp: undefined,
    addrMin: undefined,
    specificUnitValue: undefined,
    nameOfOwner: undefined,
    externalConfigurationFile: undefined,
    nameOfContact: undefined,
    nameOfOperator: undefined,
    digitalAddrOfContact: undefined,
    digitalAddrOfOperator: undefined,
    folderWithUnits: undefined
};

//Command execution table
const CommandsTable =
        [
            //Configration and adressbook
            {args: ['-cCfg', '--createConfiguration'], dataArgs: ['nameOfOwner', 'keyPair', 'configurationFile'], exec: 'funcCreateCfg', help: "Create Configuration of the current owner."},
            {args: ['-uCfg', '--updateConfiguration'], dataArgs: ['nameOfOwner', 'keyPair', 'configurationFile'], exec: 'funcUpdateCfg', help: "Update Configuration of the current owner.(Do not delete existing contacts and operators!)"},
            {args: ['-iCfg', '--importConfiguration'], dataArgs: ['externalConfigurationFile', 'configurationFile'], exec: 'funcImportCfg', help: "Import external configration file."},
            {args: ['-aC', '--addContact'], dataArgs: ['nameOfContact', 'digitalAddrOfContact', 'configurationFile'], exec: 'funcAddContact', help: "Add new Contact in configuration file."},
            {args: ['-aO', '--addOperator'], dataArgs: ['nameOfOperator', 'digitalAddrOfOperator', 'configurationFile'], exec: 'funcAddOperator', help: "Add new Operator in configration file."},
            {args: ['-eAc', '--exportAllContacts'], dataArgs: ['externalConfigurationFile', 'configurationFile'], exec: '', help: "Export all Contacts from local configuration file."},
            {args: ['-eAo', '--exportAllOperators'], dataArgs: ['externalConfigurationFile', 'configurationFile'], exec: '', help: "Export all Operators from local configration file."},
            {args: ['-lO', '--listOperators'], dataArgs: ['configurationFile'], exec: 'funcListOperators', help: "List all Operators in confgiration file."},
            {args: ['-lC', '--listOperators'], dataArgs: ['configurationFile'], exec: 'funcListContacts', help: "List all Operators in confgiration file."},
            {args: ['-eK', '--exportKeys'], dataArgs: ['fileOutput', 'configurationFile'], exec: 'funcExportKeys', help: "Export keys saved in configuration file."},
            {args: ['-pD', '--printDigitalAddress'], dataArgs: ['configurationFile'], exec: 'funcPrintDA', help: "Print Digital Address from configuration file."},
            {args: ['-pN', '--printName'], dataArgs: ['configurationFile'], exec: 'funcPrintName', help: "Print Name from configuration file."},

            //General Use Commands 
            {args: ['-uDns', '--updateDnsBinder'], dataArgs: [], exec: 'funcUpdateDns', help: "Downaload latest version of dns binder file."},
            {args: ['-b', '--balance'], dataArgs: ['folderWithUnits', 'keyPair'], exec: 'funcBalance', help: "Calculate current balance of DICE in specified folder."},
            {args: ['-lU', '--listUnits'], dataArgs: ['folderWithUnits', 'keyPair'], exec: 'funcListUnits', help: "List all units in specific folder with current value, owner and operator."},
            {args: ['-c', '--calculate'], dataArgs: ['fileOutput', 'addrOp', 'specificUnitValue', 'keyPair'], exec: 'funcCalculate', help: "Calculate new DICE Unit by using CPU and JS based SHA3 Library"},
            {args: ['-v', '--validate'], dataArgs: ['diceUnit', 'keyPair'], exec: 'funcValidate', help: "Exports content from Base58 saved unit and value of the unit"},
            {args: ['-k', '--keygen'], dataArgs: ['fileOutput'], exec: 'funcKeyGen', help: "Generate new KeyPair of Digital Address and Private Key"},
            {args: ['-to', '--tradeOwnerless'], dataArgs: ['diceUnit', 'keyPair'], exec: 'funcTradeOwnerless', help: "Trade ownerless dice unit"},
            {args: ['-tc', '--tradeCurrent'], dataArgs: ['diceUnit', 'fileOutput', 'addrMin', 'keyPair'], exec: 'funcTradeCurrent', help: "Trade current owner of unit "},
            {args: ['-tn', '--tradeNew'], dataArgs: ['diceUnit', 'fileOutput', 'keyPair'], exec: 'funcTradeNew', help: "Trade request from new owner (for ownerless unit or traded unit)"},
            {args: ['-cc', '--calculateCuda'], dataArgs: ['fileOutput', 'addrOp', 'specificUnitValue', 'keyPair'], exec: 'funcCalculateCUDA', help: "Calculate new DICE Unit by using CUDA accelerated application"},
            {args: ['-r', '--register'], dataArgs: ['diceUnit', 'keyPair'], exec: 'funcRegister', help: "Send prototype to operator to register it in its DB."},
            {args: ['-ver', '--version'], dataArgs: [], exec: 'funcVersion', help: "Prints application current version"},
            {args: ['-h', '--help'], dataArgs: [], exec: 'funcHelp', help: "Print Following list"}
        ];

//Path to CUDA application
const pathToCudaApp = "./CUDA/DICECalculator.exe";

//View output allowed type of codes
const viewModelCfg = {
    ERROR: true,
    WARNING: true,
    USER_INFO: true,
    DEV_INFO: false
};

//Ex: 'text' 'code' 'rpc'
const viewModelOutput = 'code';

//Default extentions
const configExt = ".dconf";
const keyExt = ".dkeys";
const unitExt = ".dice";
const unitEncExt = ".diceEnc";

/* javascript-obfuscator:disable */
//View Interfaces
const confAppViewIF = require('../../VIEW/VIEW_Interfaces.js');
/* javascript-obfuscator:enable */

//path to DNS binder
const dnsFile = {path: './dns.json', type: 'json'};

//Default path to config file
const configFile = "defaultConfig" + configExt;

//Security Config tries
const securityLevels = ["general", "advanced", "heavy"];

//HTTP DNS
const httpsDns = "https://drive.google.com/uc?id=1QHFoQckGksPWsstb4tQc0locVVPuPjZ-&export=download";
const httpDns = "http://192.168.1.90/DICE/dns.json";

//Exported config
module.exports.minerArgs = Args;
module.exports.minerStates = appStates;
module.exports.minerPathToCuda = pathToCudaApp;
module.exports.minerCommandTable = CommandsTable;
module.exports.minerViewCfg = viewModelCfg;
module.exports.minerViewOut = viewModelOutput;
module.exports.minerVIEW_IF = confAppViewIF;
module.exports.minerDnsFile = dnsFile;
module.exports.minerVersion = version;
module.exports.minerSecurityLevels = securityLevels;
module.exports.minerConfigFile = configFile;
module.exports.minerHttpDns = httpsDns;
module.exports.minerExtensions = {unit: unitExt, key: keyExt, conf: configExt, unitEnc: unitEncExt};