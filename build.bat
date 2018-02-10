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

call nexe -i ./Apps/Miner/index.js -t win32-x64-8.9.0 -o ./Apps/Miner/Build/Win/Miner.exe
call nexe -i ./Apps/Miner/index.js -t win32-x86-8.6.0 -o ./Apps/Miner/Build/Win/Miner_x86.exe

call nexe -i ./Apps/Miner/index.js -t macos-x64-v8.4.0 -o ./Apps/Miner/Build/Mac/Miner
call nexe -i ./Apps/Miner/index.js -t macos-8.4.0 -o ./Apps/Miner/Build/Mac/Miner_x86

call nexe -i ./Apps/Miner/index.js -t linux-x64 -o ./Apps/Miner/Build/Linux/Miner
call nexe -i ./Apps/Miner/index.js -t linux-x32 -o ./Apps/Miner/Build/Linux/Miner_x86

echo.
echo Building Operator application

call nexe -i ./Apps/Operator/index.js -t win32-x64-8.9.0 -o ./Apps/Operator/Build/Win/Operator.exe
call nexe -i ./Apps/Operator/index.js -t win32-x86-8.6.0 -o ./Apps/Operator/Build/Win/Operator_x86.exe

call nexe -i ./Apps/Operator/index.js -t macos-x64-v8.4.0 -o ./Apps/Operator/Build/Mac/Operator
call nexe -i ./Apps/Operator/index.js -t macos-8.4.0 -o ./Apps/Operator/Build/Mac/Operator_x86

call nexe -i ./Apps/Operator/index.js -t linux-x64 -o ./Apps/Operator/Build/Linux/Operator    
call nexe -i ./Apps/Operator/index.js -t linux-x32 -o ./Apps/Operator/Build/Linux/Operator_x86

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
cp ./Build/Win/Miner.exe ./

cd ../../
rm -R ./dist/VIEW/

cd ./dist/Operator/
rm ./index.js
rm ./execute.bat
rm -R ./config/
cp ./Build/Win/Operator.exe ./

cd ../../
echo Copy VIEW Interfaces Table
cp ./docs/ConsoleOutputTable.xlsx ./dist/

echo Everything finished
pause