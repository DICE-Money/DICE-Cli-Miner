echo -----------------------------------------------------Test %1 ----------------------------------------------------
rem node index.js -cc ./testKeys/%1.key ./testUnits/unitTest_%1.txt WqYSC4cbWZukTqnjbMJwvSGVozo > ./logs_Neo/log%1_own.txt
rem node index.js -r ./testKeys/%1.key ./testUnits/unitTest_%1.txt WqYSC4cbWZukTqnjbMJwvSGVozo > ./logs_Neo/log%1_own_check.txt
node index.js -r ./testKeys/%1.key ./testUnits/unitTest_%1.txt 2vnzs6zmGCaqgfYC6Uvmi9dDWXn3
rem pause