#!/bin/bash
echo Building Miner application

nexe --build -i ./Apps/Miner/index.js  -o ./BUILD/Miner_Build/Linux_arm/Miner_x86

echo
echo Building Server application

nexe --build -i ./Apps/Operator/index.js -o ./BUILD/Operator_Build/Linux_arm/Operator_x86
echo

echo
echo Everything finished