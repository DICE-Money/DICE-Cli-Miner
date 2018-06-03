@echo off
set googleDrive="D:\Google Drive\Work Projects\DICE"
set localCopy="D:\Deliveries\DICE"

set deliveryFolder="OutSourcing"
set sourcesFolder="Delivery"

echo ##############################
echo # COPY FILES TO GOOGLE DRIVE #
echo ##############################
cp Delivery*.7z %googleDrive%\%deliveryFolder%
cp EncryptionNodeJS*.7z %googleDrive%\%sourcesFolder%
 
echo ##############################
echo # COPY FILES TO LOCAL DRIVE  #
echo ##############################
cp Delivery*.7z %localCopy%\%deliveryFolder%
cp EncryptionNodeJS*.7z %localCopy%\%sourcesFolder%

pause