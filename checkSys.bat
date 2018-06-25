@echo off
set recomendedVerion=388.00
set fullPathNvidiaSmix64="C:\Program Files\NVIDIA Corporation\NVSMI\nvidia-smi.exe"
set fullPathNvidiaSmix86="C:\Program Files (86)\NVIDIA Corporation\NVSMI\nvidia-smi.exe"
set commandGetInfo="-q"

if exist %fullPathNvidiaSmix64% (
    set properPath=%fullPathNvidiaSmix64%
    goto:verify
) else (
	if exist %fullPathNvidiaSmix86% (
		set properPath=%fullPathNvidiaSmix86%
		goto:verify
	) else (
		echo NVIDIA DRIVER was not found on local system
		echo Please check for available NVIDIA GPU on current system or install driver
		goto:end
	)
)

:verify
%properPath% %commandGetInfo% | findstr "Driver.*Version" > nvidia.txt
set /p driverVersion=<nvidia.txt
del nvidia.txt
set version=%driverVersion:~-6%

if %version% GEQ %recomendedVerion% (
	echo NVIDIA Driver is Supported
) else (
    echo NVIDIA Driver is NOT Supported
	echo Please visit www.nvidia.com and install NVIDIA Graphics driver newer than %recomendedVerion%
)

:end