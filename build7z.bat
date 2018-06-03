@echo off
ls -I dist -I BUILD -I obf -I "*.7z" | tr '\n' ' ' > sources.txt
set /p sourcesFolder=<sources.txt
del sources.txt

set deliveryFolder="./dist/*"
set zip="C:\Program Files\7-Zip\7z.exe"

set /p verison="Delivery verion select(example: 1.00) "
set /p label="Delivery main changes/label(example: Scrapping) "

echo ##############################
echo # ARCHIVING DELIVERY VERSION #
echo ##############################
%zip% a -t7z -r Delivery_%1.7z %deliveryFolder%

echo ##############################
echo #      ARCHIVING SOURCES     #
echo ##############################
%zip% a -t7z -r EncryptionNodeJS_%1.7z %sourcesFolder%

pause