@echo off
echo #############################################
echo ###       BUILD SECURE APPLICATIONS       ###
echo #############################################

echo 1. Obfusticate Applications
call javascript-obfuscator ./Apps --output ./obf --compact "true" --controlFlowFlattening "true" --controlFlowFlatteningThreshold "1" --deadCodeInjection "true" --deadCodeInjectionThreshold "1" --debugProtection "true" --debugProtectionInterval "true" --disableConsoleOutput "true" --identifierNamesGenerator "hexadecimal" --log "false" --renameGlobals "false" --rotateStringArray "true" --selfDefending "true" --stringArray "true" --stringArrayEncoding "rc4" --stringArrayThreshold "1" --transformObjectKeys "true" --unicodeEscapeSequence "false"

echo 2. Obfusticate Models
call javascript-obfuscator ./models --output ./obf --compact "true" --controlFlowFlattening "true" --controlFlowFlatteningThreshold "1" --deadCodeInjection "true" --deadCodeInjectionThreshold "1" --debugProtection "true" --debugProtectionInterval "true" --disableConsoleOutput "true" --identifierNamesGenerator "hexadecimal" --log "false" --renameGlobals "false" --rotateStringArray "true" --selfDefending "true" --stringArray "true" --stringArrayEncoding "rc4" --stringArrayThreshold "1" --transformObjectKeys "true" --unicodeEscapeSequence "false"

echo 3. Copy nodeJS modules 
rsync -tr --ignore-errors ./node_modules ./obf/

echo 4. Copy BUILD folder
echo # X # - DISABLED
rem rsync -tr ./BUILD ./obf

echo 5. Copy build script
rsync ./build.bat ./obf

echo 6. Go to ./obf folder
cd ./obf

echo 7. Build Applications
call build.bat

echo 6. Go to Unit test folder
cd ../Apps/Miner/test/functional-test/

echo 7. Execute Unit test reporter
call mocha generalTestBinary.js --reporter mochawesome
call /mochawesome-report/mochawesome.html

echo 8. Go to Main directory
cd ../../../../

echo 9. Execute Remote builder for ARM targets
call buildSftp.bat

echo 10. Go to ./obf folder
cd ./obf

echo 11. Copy Obfusticate BUILD Applications
cp -R ./BUILD ../

echo 12. Prepare Delivery folder
echo -Copy CUDA Application
cp -R ../Apps/Miner/CUDA ../dist/Miner/

echo -Copy new applications for Windows 64-bit OS
cp ./BUILD/Miner_Build/Win/Miner.exe ../dist/Miner/
cp ./BUILD/Operator_Build/Win/Operator.exe ../dist/Operator/

echo -Copy full package of applications
cp -R ./BUILD/Miner_Build ../dist/Miner/
cp -R ./BUILD/Operator_Build ../dist/Operator/

echo -Copy README 
cp ../Apps/Readme.txt ../dist/
cp ../Apps/Install_Operator.txt ../dist/

echo 13. Go to ./ folder
cd ./

echo 14. Execute Archiving of Deliveries
call build7z.bat

echo 15. Execute Moving of Deliveries
call buildDistribute.bat

echo 16. Remove Deliveries from current folder
rm Delivery*.7z 
rm EncryptionNodeJS*.7z 

echo #############################################
echo ###                 READY                 ###
echo #############################################
pause