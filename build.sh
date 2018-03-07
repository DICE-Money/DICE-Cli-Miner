#!/bin/bash
echo Building Miner application

nexe --build -i ./Apps/Miner/index.js  -o ./BUILD/Miner_arm

echo
echo Building Server application

nexe --build -i ./Apps/Operator/index.js -o ./BUILD/Operator_arm
echo

echo
echo Everything finished