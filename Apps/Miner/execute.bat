@echo off
:choosing
echo.

echo "Choose how to use miner application:"
echo "1. Mining"
echo "2. Validating"
echo "3. Generate new Kay Pair"
echo "4. Trading (Current owner to New Owner)"
echo "5. Trading (New owner)"
echo "6. Trading (Ownerless)"
echo "7. Trading (New owner form ownerless)"

set /p choice="Selcet from [1..7]"
echo.
if "%choice%"=="1" (
    node index.js -c miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="2" (
    node index.js -v ./out/unitTest.txt
) else if "%choice%"=="3" (
    node index.js -k keyPair.json
) else if "%choice%"=="4" (
    node index.js -tc miner.json ./out/unitTest.txt ./out/unitEncToM2.txt 2dnzkaaKeeCeUAXTy2DrxijSKGB 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="5" (
    node index.js -tn miner2.json ./out/unitEncToM2.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="6" (
    node index.js -to miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else if "%choice%"=="7" (
    node index.js -tn miner2.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
) else (
    echo "Invalid Choice. Try Again" 
)
    goto:choosing
pause