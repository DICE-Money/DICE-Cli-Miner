@echo off
call checkSys.bat
echo.

rem change the %cpar% value to -c if not using nVidia GPU (mining will be VERY SLOW)
set cpar=-cc

set units=./units
set inbox=./inbox
set outbox=./outbox
set application=Miner.exe

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
echo   (1) list operators
echo   (2) list units
echo   (3) validate
echo   (4) mine new (continuously)
echo   (5) send or release
echo   (6) claim ownership
echo.
set /p choice="your choice [1..6]: "

if "%choice%"=="1" (
	goto:listOperators
) else if "%choice%"=="2" (
	goto:listUnits
) else if "%choice%"=="3" (
	goto:validateDice
) else if "%choice%"=="4" (
	goto:mineNew
) else if "%choice%"=="5" (
	goto:sendRelease
) else if "%choice%"=="6" (
	goto:claimOwnership
) else (
	echo "invalid choice" 
)

goto:menu
	
:diceVal
%application% -cc ./examples/miner.json ./out/unitTest.txt 3S4pihKB27NVrhCbH5PTugbiwo6 %value%
goto:menu

:updateDns
echo updating DNS binder file...
%application% -uDns
goto:menu

:listOperators
echo listing all known operators...
%application% -lGO
goto:menu

:exportKeys
set /p storeFile="full path for the keys file: "
%application% -eK %storeFile%
goto:menu

:validateDice
set /p dice="full path to DICE file: "
%application% -v %dice%
goto:menu

:claimOwnership
set /p dice="%inbox%/ encrypted or ownerless DICE file name: "
set /p diceNew="%units%/ name (only) for the claimed DICE: "
%application% -tn %inbox%/%dice% %units%/%diceNew%
goto:menu

:listUnits
if exist %units%/*.dice (
	%application% -lU %units%
) else (
	echo no DICE units in %units%/
)
goto:menu

:sendRelease
set /p dice="%units%/ DICE file name: "
set /p newOwner="new owner address or "FREE" for ownerless: "

if "%newOwner%"=="FREE" (
	%application% -to %units%/%dice%
) else (
	%application% -tc %units%/%dice% %outbox%/%dice% %newOwner%
	echo.
	echo ######### file to send to the new owner: %outbox%/%dice%.diceEnc
)
goto:menu

:mineNew
set /p operatorAddr="operator address: "
:mineLoop
set storeFile=%units%/%RANDOM%%RANDOM%
%application% %cpar% %storeFile% %operatorAddr%
goto:mineLoop

pause
