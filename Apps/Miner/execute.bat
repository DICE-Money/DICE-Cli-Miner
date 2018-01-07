@echo off
:choosing
echo.

echo "Choose how to use miner application:"
echo "1. Mining - Operator threshold"
echo "2. Mining - Specific Dice value"
echo "3. Validating"
echo "4. Generate new Key Pair"
echo "5. Trading (current owner)"
echo "6. Trading (new owner)"
echo "7. Trading (ownerless)"
echo "8. Trading (new owner from ownerless)"
echo "9. Mining - Operator threshold - CUDA Accelerated"
echo "10. Register - Mined DICE Unit"
echo "12. Application version"
echo "12. Help"
set /p choice="Selcet from [1..12]"
echo.

if "%choice%"=="1" (
    node index.js -c ./examples/miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="2" (
    set /p value="Select DICE Value [1/1024..1024]"	
	goto:diceVal
) else if "%choice%"=="3" (
     node index.js -v  ./examples/miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="4" (
    node index.js -k keyPair.json
) else if "%choice%"=="5" (
    node index.js -tc ./examples/miner.json ./out/unitTest.txt ./out/unitEncToM2.txt 2dnzkaaKeeCeUAXTy2DrxijSKGB 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="6" (
    node index.js -tn ./examples/miner2.json ./out/unitEncToM2.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="7" (
    node index.js -to ./examples/miner2.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="8" (
    node index.js -tn ./examples/miner2.json ./out/unitTest.txt.0 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="9" (
    node index.js -cc ./examples/miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="10" (
    node index.js -r ./examples/miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="11" (
    node index.js -ver
) else if "%choice%"=="12" (
    node index.js -h
) else (
    echo "Invalid Choice. Try Again" 
)

    goto:choosing
	
:diceVal
node index.js -cc ./examples/miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG %value%
goto:choosing

pause