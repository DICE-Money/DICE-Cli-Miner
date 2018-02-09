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
goto:choosing
) else if "%choice%"=="4" (
goto:choosing
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
set /p dice="Choose DICE"
echo Who is the new owner?
set /p newOwner="Enter valid digital address or enter "FREE" for ownerless"

if "%newOwner%"=="FREE" (
set /p storeFile="Where to store the encrypted file?"
 Miner.exe -to ./examples/miner2.json %dice% 3SEdktQGS4K947PUadvbHFD2oJG
) else (
 Miner.exe -tc ./examples/miner.json %dice% %storeFile% %newOwner% 3SEdktQGS4K947PUadvbHFD2oJG
)

goto:choosing

:claimOwnership
set /p dice="Choose Encrypted DICE"
rem set /p storeFile="Where to store the DICE?"
 Miner.exe -tn ./examples/miner2.json %dice% 3SEdktQGS4K947PUadvbHFD2oJG
goto:choosing

:validateDice
set /p dice="Choose DICE to validate"
 Miner.exe -v  ./examples/miner.json %dice% 3SEdktQGS4K947PUadvbHFD2oJG
goto:choosing

:mineNewDice
set /p operatorAddr="What is the operator DICE address?"
set /p minimumValue="What minimum unit value to mine? (-10...10)"
if "%minimumValue%">="0" (
Miner.exe -cc ./examples/miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG %value%
) else (
)
goto:choosing

:exportKeys
goto:choosing


pause