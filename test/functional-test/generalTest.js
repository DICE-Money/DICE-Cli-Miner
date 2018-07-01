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

//Requires
const assert = require('assert');
const modFs = require('fs');
const child_process = require('child_process');
const addContext = require('mochawesome/addContext');
const minerConfig = require('../../config/minerConfig.js');
const commands = minerConfig.minerCommandTable;
//General Test vars
const node = "node";
const minerApp = "../../index.js";
const operatorApp = "../../../Operator/index.js";

process.chdir(process.cwd() + '/Apps/Miner/test/functional-test');
console.log("Current directory: " + process.cwd());

//Default timer for executions of test is 2 minutes
const maxTimeOut = 2 * 60 * 1000;

describe('General functional tests', function () {

    var generalTest =
            [
                {args: ['-ver'], expected: minerConfig.minerVersion, unExpected: 'Err', specificExec: function (appReturnedData) {
                        return true;
                    }},
                {args: ['-h'], expected: minerConfig.minerVersion, unExpected: 'Err', specificExec: function (appReturnedData) {
                        return true;
                    }},
                        /*{args: ['-uDns'], expected: 'UsInf0089', unExpected: 'Err', specificExec: function (appReturnedData) {
                         try {
                         var DNS = JSON.parse(modFs.readFileSync(minerConfig.minerDnsFile.path));
                         DNS["76640-bcfe5-47604-75a2e-c0a6c-90df2-c39ef-97718"] = {ip: "127.0.0.1", port: "1993"};
                         modFs.writeFileSync(minerConfig.minerDnsFile.path, JSON.stringify(DNS), "utf8");
                         return true;
                         } catch (exception) {
                         //Nothing
                         }
                         return false;
                         }},
                         {args: ['-lGO'], expected: 'UsInf0054', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-k', 'testKey'], expected: 'UsInf0053', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return modFs.existsSync("testKey" + minerConfig.minerExtensions.key);
                         }},
                         {args: ['-cCfg', 'Mihail Maldzhanski', `testkey${minerConfig.minerExtensions.key}`, 'testCfg'], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return modFs.existsSync(minerConfig.minerConfigFile);
                         }},
                         {args: ['-uCfg', 'Mihail Maldzhanski New', `testkey${minerConfig.minerExtensions.key}`, 'testCfg'], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return (modFs.readFileSync(minerConfig.minerConfigFile, "utf8")).indexOf('Mihail Maldzhanski New') !== -1;
                         }},
                         {args: ['-iCfg', 'Apps/Miner/contactsInit.dbook', minerConfig.minerConfigFile], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         var configFile = modFs.readFileSync(minerConfig.minerConfigFile, 'utf8');
                         var importedConfigFile = modFs.readFileSync('Apps/Miner/contactsInit.dbook', 'utf8');
                         
                         try {
                         configFile = JSON.parse(configFile);
                         importedConfigFile = JSON.parse(importedConfigFile);
                         
                         for (let operator in importedConfigFile.Operators) {
                         if (!configFile.Operators.hasOwnProperty(operator)) {
                         return false;
                         }
                         }
                         } catch (ex) {
                         throw new Error(ex);
                         return false;
                         }
                         return true;
                         }},
                         {args: ['-aC', 'Tester Name', '3f2b9-2f458-f2066-26c65-ea67c-a6b48-86ced-e9dc6', minerConfig.minerConfigFile], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         var configFile = modFs.readFileSync(minerConfig.minerConfigFile, 'utf8');
                         
                         try {
                         configFile = JSON.parse(configFile);
                         if (!('Tester Name' in configFile.Contacts) ||
                         configFile.Contacts['Tester Name'] !== '3f2b9-2f458-f2066-26c65-ea67c-a6b48-86ced-e9dc6') {
                         return false;
                         }
                         } catch (ex) {
                         throw new Error(ex);
                         return false;
                         }
                         
                         return true;
                         }},
                         {args: ['-aO', 'Tester Operator', '3f2b9-2f458-f2066-26c65-ea67c-a6b48-86ced-e9dc6', minerConfig.minerConfigFile], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         var configFile = modFs.readFileSync(minerConfig.minerConfigFile, 'utf8');
                         
                         try {
                         configFile = JSON.parse(configFile);
                         if (!('Tester Operator' in configFile.Operators) ||
                         configFile.Operators['Tester Operator'] !== '3f2b9-2f458-f2066-26c65-ea67c-a6b48-86ced-e9dc6') {
                         return false;
                         }
                         } catch (ex) {
                         throw new Error(ex);
                         return false;
                         }
                         
                         return true;
                         }},
                         {args: ['-lO', minerConfig.minerConfigFile], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         
                         return true;
                         }},
                         {args: ['-lC', minerConfig.minerConfigFile], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-pN', minerConfig.minerConfigFile], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-pD', minerConfig.minerConfigFile], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-eAc', "exportedContacts"], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-eAo', "exportedOperators"], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-eK', "exportedKeys"], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-cc', './units/testUnit', '76640-bcfe5-47604-75a2e-c0a6c-90df2-c39ef-97718'], expected: 'UsInf0073', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-v', `./units/testUnit${minerConfig.minerExtensions.unit}`], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-to', `./units/testUnit${minerConfig.minerExtensions.unit}`], expected: 'UsInf0075', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-r', `./units/testUnit${minerConfig.minerExtensions.unit}`], expected: 'Warn0028', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-tn', `./units/testUnit${minerConfig.minerExtensions.unit}`, `./units/testUnit${minerConfig.minerExtensions.unit}`], expected: 'UsInf0076', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-b', `./units/`], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-lU', `./units/`], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }},
                         {args: ['-tc', `./units/testUnit${minerConfig.minerExtensions.unit}`, "./units/encrypted", 'd8f54-4fe68-98060-78b6d-bbbf3-1908b-473de-ed2b2'], expected: '', unExpected: 'Err', specificExec: function (appReturnedData) {
                         return true;
                         }}*/
            ];

    before(function () {
        try {
            modFs.readdirSync('./units/').forEach(file => {
                modFs.unlinkSync(`./units/${file}`);
            });
        } catch (ex) {
        }
    });

    /*   it('Check is operator Valid', function () {
     var operatorExecutor = child_process.spawnSync(node, [operatorApp, "-ver"], {stdio: ['pipe', 'pipe', 'pipe']});
     var data = operatorExecutor.stdout.toString();
     
     if (data.length === 0) {
     throw new Error("Operator application is not valid");
     }
     });
     */

    generalTest.forEach(function (test) {
        it('Check properly executon of ' + test.args[0], function () {
            //Add test case variables
            addContext(this, {title: "Test specific values", value: JSON.stringify(test)});
            //Set user defined timeout
            this.timeout(maxTimeOut);
            //Exec node
            console.log(process.cwd(), node, [minerApp, ...test.args], )

            var minerAppExecVersion = child_process.spawnSync(node, [minerApp, ...test.args], {
                cwd: process.cwd(),
                env: process.env,
                stdio: 'pipe',
                encoding: 'utf-8'
            });

//            try {
//                var minerAppExecVersion = child_process.spawnSync(node, [minerApp, ...test.args], {stdio: ['pipe', 'pipe', 'pipe'], shell: true});
//            } catch (ex) {
//                console.log(ex);
//            }
            var data = minerAppExecVersion.output[1];

            console.log(JSON.stringify(minerAppExecVersion));

            //Add return data from execution
            addContext(this, {title: "Execution report", value: data});

            //Real tests
            if (test.expected !== '' && data.indexOf(test.expected) === -1) {
                throw new Error("Expected: " + test.expected + "Found: " + data);
            }

            if (test.unExpected !== '' && data.indexOf(test.unExpected) !== -1) {
                throw new Error("Unxpected: " + test.unExpected + "Found: " + data);
            }

            if (test.specificExec(data) !== true) {
                throw new Error(`Specific execution failed on ${test.args[0]} with ${"\n" + data}`);
            }

        });
    });
    /* 
     it('Check is all commands covert', function () {
     var covert = [];
     var unCovert = [];
     var duplicated = [];
     for (let command of commands) {
     for (let test of generalTest) {
     if (command.args[0] === test.args[0]) {
     if (covert.indexOf(command.args[0]) === -1) {
     covert.push(command.args[0]);
     } else {
     duplicated.push(command.args[0]);
     }
     }
     }
     
     if (unCovert.indexOf(command.args[0]) === -1 &&
     covert.indexOf(command.args[0]) === -1) {
     unCovert.push(command.args[0]);
     } else {
     // The command already exist
     }
     }
     
     if (unCovert.length > 0) {
     throw new Error(
     `Not all commands covert  
     Covert ${covert.length} / Expected ${commands.length} 
     Covert commands: ${covert}
     Uncovert commands: ${unCovert}
     Duplicated commands: ${duplicated}`);
     }
     
     if (duplicated.length > 0) {
     throw new Error(`Duplicated commands: ${duplicated}`);
     }
     
     });
     */
});

