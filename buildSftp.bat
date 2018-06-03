@echo off
set scp="scp" 
set ssh="ssh"

set defFolder="/home/espdev/"

set arm32="root@192.168.1.90"
set arm32Port="22"

set arm64="root@192.168.1.219"
set arm64Port="25"

echo ##############################
echo #     BUILD ON ARM32 PC      #
echo ##############################
%scp% -P %arm32Port% -r "./obf/Apps" "./obf/models" %arm32%:%defFolder%DICE/EncryptionNodeJS
%ssh% -p %arm32Port% %arm32% -t -t "su -l; %defFolder%EncryptionNodeJS/BUILD/Operator_Build/Linux_arm/Operator_x86 -ver"
%scp% -P %arm32Port% -r %arm32%:%defFolder%DICE/EncryptionNodeJS/BUILD ./obf/

echo ##############################
echo #     BUILD ON ARM64 PC      #
echo ##############################
%scp% -P %arm64Port% -r "./obf/Apps" "./obf/models" %arm64%:%defFolder%EncryptionNodeJSSources
%ssh% -p %arm64Port% %arm64% -t -t "cd %defFolder%/EncryptionNodeJSSources; ./build_x64.sh; ./BUILD/Operator_Build/Linux_arm/Operator -ver"
%scp% -P %arm64Port% -r %arm64%:%defFolder%EncryptionNodeJSSources/BUILD ./obf/

echo ##############################
echo #           READY            #
echo ##############################
pause