FOR /L %%A IN (1,1,10) DO (
  ECHO Generating Unit Number: %%A
	rem start node index.js -k ./testKeys/%%A.key
	rem start Miner.exe -cc ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 4B395WJmYWzCN8XJewefz4RawZ3
	rem start mine.bat %%A
	rem start mine.bat %%A
	start node index.js -r ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt WqYSC4cbWZukTqnjbMJwvSGVozo
	start node index.js -r ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 2vnzs6zmGCaqgfYC6Uvmi9dDWXn3
	rem start node index.js -cc ./testKeys/%1.key ./testUnits/unitTest_%1.txt EXnkzzzvCfFcRg1V2NEEWxW951v > ./logs/log%1.txt
	rem Miner.exe -r ./testKeys/%%A.key ./out/(%%A+8). 4B395WJmYWzCN8XJewefz4RawZ3
)
pause