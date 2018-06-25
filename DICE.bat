@echo off
if exist Miner.exe (
	set application=Miner.exe
) else (
	set application=node index.js
)

echo updating DNS binder file...
%application% -uDns

rem Print Version of the Tool
%application% -ver

if exist ./*.dconf (
	rem file exists
) else (
	echo.
	echo creating configration file
	set cfgName=./config
	set cfgKeys=./keys
)

rem Create Configuration
if exist ./*.dconf (
	rem file exists
) else (
	echo new keys created
	%application% -k "%cfgKeys%"
	echo.
	echo #######################################
	echo # DO NOT GIVE YOUR KEYS TO ANYONE !!! #
	echo # YOUR KEYS CAN NOT BE RECOVERED  !!! #
	echo #######################################
	echo.
	echo new configuration created
	%application% -cCfg "%cfgName%".dconf "%cfgKeys%".dkeys
	echo.
)

:menu
echo.
echo ###########################################################
echo personal digital address  ((* this is your own address! *))
%application% -pD
echo.
echo what do you want to do?  
echo   (1) known operators
echo   (2) send or release
echo   (3) claim ownership
echo   (4) validate
echo   (5) mine new
echo.
set /p choice="your choice [1..5]: "

if "%choice%"=="1" (
	goto:listOperators
) else if "%choice%"=="2" (
	goto:sendRelease
) else if "%choice%"=="3" (
	goto:claimOwnership
) else if "%choice%"=="4" (
	goto:validateDice
) else if "%choice%"=="5" (
	goto:mineNew
) else (
	echo "invalid choice" 
)

goto:menu
	
:diceVal
%application% -cc ./examples/miner.json ./out/unitTest.txt 3S4pihKB27NVrhCbH5PTugbiwo6 %value%
goto:menu

:sendRelease
set /p dice="DICE file name: " 
set /p newOwner="new owner address or "FREE" for ownerless: " 

if "%newOwner%"=="FREE" (
	%application% -to %dice% 
) else (
	set /p storeFile="encrypted file name for the new owner: " 
	%application% -tc %dice% %storeFile% %newOwner%
)
goto:menu

:claimOwnership
set /p dice="encrypted DICE file name: "
rem set /p storeFile="new DICE file name: "
%application% -tn %dice%
goto:menu

:validateDice
set /p dice="DICE file name: "
%application% -v %dice%
goto:menu

:mineNew
set /p operatorAddr="operator: "
set /p storeFile="file name for new DICE: " 
%application% -cc %storeFile% %operatorAddr%
goto:menu

:exportKeys
set /p storeFile="file name for the keys: "
%application% -eK %storeFile%
goto:menu

:updateDns
echo updating DNS binder file...
%application% -uDns
goto:menu

:listOperators
echo listing all known operators...
%application% -lGO
goto:menu

pause