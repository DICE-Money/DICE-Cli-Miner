#!/bin/bash
echo Building Miner application

nexe --build -i ./Apps/Miner/index.js  -o ./Apps/Miner/Build/Linux_Arm/x86/Miner_arm

echo
echo Building Server application

nexe --build -i ./Apps/Operator/index.js -o ./Apps/Operator/Build/Linux_Arm/x86/Operartor_arm
echo

echo
echo Everything finished