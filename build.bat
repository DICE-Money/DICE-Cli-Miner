@echo off
rem echo Building Applications
rem echo.
rem echo Prepare SHA 3 C Library
rem cd /d ./models/SHA-3_C/
rem call node-gyp configure build
rem cd /d ../../
rem echo.
echo Prepare BUILD for DICE Application 
echo.


echo Building Miner application

call nexe -i ./Apps/Miner/index.js -t win32-x64-8.9.0 -o ./BUILD/Miner_Build/Win/Miner.exe
call nexe -i ./Apps/Miner/index.js -t win32-x86-8.6.0 -o ./BUILD/Miner_Build/Win/Miner_x86.exe

call nexe -i ./Apps/Miner/index.js -t macos-x64-v8.4.0 -o ./BUILD/Miner_Build/Mac/Miner
call nexe -i ./Apps/Miner/index.js -t macos-8.4.0 -o ./BUILD/Miner_Build/Mac/Miner_x86

call nexe -i ./Apps/Miner/index.js -t linux-x64 -o ./BUILD/Miner_Build/Linux/Miner
call nexe -i ./Apps/Miner/index.js -t linux-x32 -o ./BUILD/Miner_Build/Linux/Miner_x86

echo.
echo Building Operator application

call nexe -i ./Apps/Operator/index.js -t win32-x64-8.9.0 -o ./BUILD/Operator_Build/Win/Operator.exe
call nexe -i ./Apps/Operator/index.js -t win32-x86-8.6.0 -o ./BUILD/Operator_Build/Win/Operator_x86.exe

call nexe -i ./Apps/Operator/index.js -t macos-x64-v8.4.0 -o ./BUILD/Operator_Build/Mac/Operator
call nexe -i ./Apps/Operator/index.js -t macos-8.4.0 -o ./BUILD/Operator_Build/Mac/Operator_x86

call nexe -i ./Apps/Operator/index.js -t linux-x64 -o ./BUILD/Operator_Build/Linux/Operator    
call nexe -i ./Apps/Operator/index.js -t linux-x32 -o ./BUILD/Operator_Build/Linux/Operator_x86

echo.

echo Move to new directory
rm -R ./dist
cp -R ./Apps/ ./dist
cd ./dist/Miner/
rm -R ./out/
rm -R ./config/
mkdir out
rm ./index.js
rm ./execute.bat

cd ../../
rm -R ./dist/VIEW/

cd ./dist/Operator/
rm ./index.js
rm ./execute.bat
rm -R ./config/

cd ../../
echo Copy VIEW Interfaces Table
cp ./docs/ConsoleOutputTable.xlsx ./dist/

echo Copy Applications
cp -R ./BUILD/Miner_Build/ ./dist/Miner/
cp -R ./BUILD/Operator_Build/ ./dist/Operator/
cp ./BUILD/Miner_Build/Win/Miner.exe ./dist/Miner/
cp ./BUILD/Operator_Build/Win/Operator.exe ./dist/Operator/

echo Everything finished
pause