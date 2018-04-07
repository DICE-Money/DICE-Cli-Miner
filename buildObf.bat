@echo off
echo #############################################
echo ###       BUILD SECURE APPLICATIONS       ###
echo #############################################

echo 1. Obfusticate Applications
call javascript-obfuscator ./Apps --output ./obf --compact "true" --controlFlowFlattening "true" --controlFlowFlatteningThreshold "1" --deadCodeInjection "true" --deadCodeInjectionThreshold "1" --debugProtection "true" --debugProtectionInterval "true" --disableConsoleOutput "true" --identifierNamesGenerator "hexadecimal" --log "false" --renameGlobals "false" --rotateStringArray "true" --selfDefending "true" --stringArray "true" --stringArrayEncoding "rc4" --stringArrayThreshold "1" --transformObjectKeys "true" --unicodeEscapeSequence "false"

echo 2. Obfusticate Models
call javascript-obfuscator ./models --output ./obf --compact "true" --controlFlowFlattening "true" --controlFlowFlatteningThreshold "1" --deadCodeInjection "true" --deadCodeInjectionThreshold "1" --debugProtection "true" --debugProtectionInterval "true" --disableConsoleOutput "true" --identifierNamesGenerator "hexadecimal" --log "false" --renameGlobals "false" --rotateStringArray "true" --selfDefending "true" --stringArray "true" --stringArrayEncoding "rc4" --stringArrayThreshold "1" --transformObjectKeys "true" --unicodeEscapeSequence "false"

echo 3. Copy nodeJS modules
cp -R ./node_modules ./obf

echo 4. Copy BUILD folder
cp -R ./BUILD ./obf

echo 5. Copy build script
cp ./build.bat ./obf

echo 6. Go to ./obf folder
cd ./obf

echo 7. Build Applications
call build.bat

echo 8. Copy Obfusticate BUILD Applications
cp -R ./BUILD ../

echo #############################################
echo ###                 READY                 ###
echo #############################################
pause