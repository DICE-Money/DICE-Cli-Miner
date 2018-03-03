@echo off
rem Print version of the application
Miner.exe -ver

:choosing
echo.
echo What do you want to do ?  
echo    (1) to send or release DICE that I own
echo    (2) to claim ownership over DICE
echo    (3) to validate DICE
echo    (4) to mine new DICE
echo    (5) to export my encryption keys
echo.

set /p choice="Select from [1..5]"

if "%choice%"=="1" (
goto:sendDice
) else if "%choice%"=="2" (
goto:choosing
) else if "%choice%"=="3" (
goto:validateDice
) else if "%choice%"=="4" (
goto:mineNewDice
) else if "%choice%"=="5" (
goto:choosing
) else (
    echo "Invalid Choice. Try Again" 
)

goto:choosing
	
:diceVal
node index.js -cc ./examples/miner.json ./out/unitTest.txt 3S4pihKB27NVrhCbH5PTugbiwo6 %value%
goto:choosing

:sendDice
set /p dice="Choose DICE " 
echo Who is the new owner?
set /p newOwner="Enter valid digital address or enter "FREE" for ownerless " 

if "%newOwner%"=="FREE" (
set /p storeFile="Where to store the encrypted file? " 
 Miner.exe -to ./examples/miner2.json %dice%
) else (
 Miner.exe -tc ./examples/miner.json %dice% %storeFile% %newOwner%
)
goto:choosing

:claimOwnership
set /p dice="Choose Encrypted DICE "
rem set /p storeFile="Where to store the DICE?"
 Miner.exe -tn ./examples/miner2.json %dice%
goto:choosing

:validateDice
set /p dice="Choose DICE to validate "
Miner.exe -v  ./examples/miner.json %dice%
goto:choosing

:mineNewDice
set /p operatorAddr="What is the operator DICE address? "

:mineNewDiceChooseUnit
set /p minimumValue="What minimum unit value to mine? (-10...10) "
if "%minimumValue%"=="-10" (
set value="1/1024"
) else if "%minimumValue%"=="-9" (
set value="2/1024"
) else if "%minimumValue%"=="-8" (
set value="4/1024"
) else if "%minimumValue%"=="-7" (
set value="8/1024"
) else if "%minimumValue%"=="-6" (
set value="16/1024"
) else if "%minimumValue%"=="-5" (
set value="32/1024"
) else if "%minimumValue%"=="-4" (
set value="64/1024"
) else if "%minimumValue%"=="-3" (
set value="128/1024"
) else if "%minimumValue%"=="-2" (
set value="256/1024"
) else if "%minimumValue%"=="-1" (
set value="512/1024"
) else if "%minimumValue%"=="0" (
set value="1"
) else if "%minimumValue%"=="1" (
set value="2"
) else if "%minimumValue%"=="2" (
set value="4"
) else if "%minimumValue%"=="3" ( 
set value="8"
) else if "%minimumValue%"=="4" (
set value="16"
) else if "%minimumValue%"=="5" (
set value="32"
) else if "%minimumValue%"=="6" (
set value="64"
) else if "%minimumValue%"=="7" (
set value="128"
) else if "%minimumValue%"=="8" (
set value="256"
) else if "%minimumValue%"=="9" (
set value="512"
) else if "%minimumValue%"=="10" (
set value="1024"
) else (
echo Invalid Unit Size. Try Again
goto:mineNewDiceChooseUnit
)

Miner.exe -cc ./examples/miner.json ./out/unitTest.txt %operatorAddr% %value%
goto:choosing

:exportKeys
goto:choosing


:: calculate 2^n 
SET n=%minimumValue%
SET result=1
FOR /L %%i IN (1,1,%n%) DO SET /A result*=x
ECHO %result%

pause