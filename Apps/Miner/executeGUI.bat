@echo off
if exist Miner.exe (
set application=Miner.exe
) else (
set application=node index.js
)

rem Print Version of the Tool
%application% -ver

if exist ./*.dconf (
   rem file exists
) else (
echo Creating configration file
set /p cfgName="What is your name(optional)? "
set cfgKeys=./keys
)

rem Create Configuration
if exist ./defaultConfig.dconf (
 rem file exists
) else (
echo Created new keys
%application% -k "%cfgKeys%"
echo.
echo #######################################
echo # DO NOT GIVE TO ANYONE YOUR KEYS !!! #
echo # YOUR KEYS CAN NOT BE RECOVERED  !!! #
echo #######################################
echo.
echo Created new configuration
%application% -cCfg "%cfgName%" "%cfgKeys%".dkeys
)

:choosing
echo.
echo ###########################################################
echo Current Digital Address                
%application% -pD
echo.
echo What do you want to do ?  
echo    (1) to send or release DICE that I own
echo    (2) to claim ownership over DICE
echo    (3) to validate DICE
echo    (4) to mine new DICE
echo    (5) to export my encryption keys
echo.
set /p choice="Select from [1..5] "

if "%choice%"=="1" (
goto:sendDice
) else if "%choice%"=="2" (
goto:claimOwnership
) else if "%choice%"=="3" (
goto:validateDice
) else if "%choice%"=="4" (
goto:mineNewDice
) else if "%choice%"=="5" (
goto:exportKeys
) else (
    echo "Invalid Choice. Try Again" 
)

goto:choosing
	
:diceVal
%application% -cc ./examples/miner.json ./out/unitTest.txt 3S4pihKB27NVrhCbH5PTugbiwo6 %value%
goto:choosing

:sendDice
set /p dice="Choose DICE " 
echo Who is the new owner?
set /p newOwner="Enter valid digital address or enter "FREE" for ownerless " 

if "%newOwner%"=="FREE" (
rem nothing
) else (
set /p storeFile="Where to store the encrypted file? " 
)

if "%newOwner%"=="FREE" (
%application% -to %dice% 
) else (
%application% -tc %dice% %storeFile% %newOwner%
)
goto:choosing

:claimOwnership
set /p dice="Choose Encrypted DICE "
rem set /p storeFile="Where to store the DICE?"
%application% -tn %dice%
goto:choosing

:validateDice
set /p dice="Choose DICE to validate "
%application% -v %dice%
goto:choosing

:mineNewDice
set /p operatorAddr="What is the operator DICE address? "
set /p storeFile="Where to store the DICE Unit file? " 

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
set noValue="true"
)
if "%noValue%"=="true" ( 
%application% -cc %storeFile% %operatorAddr%
) else (
%application% -cc %storeFile% %operatorAddr% %value%
)
goto:choosing

:exportKeys
set /p storeFile="Where to save keys? "
%application% -eK %storeFile%
goto:choosing

pause