FOR /L %%A IN (1,1,450) DO (
  ECHO Generating Unit Number: %%A
	rem start node index.js -k ./testKeys/%%A.key
	rem start Miner.exe -cc ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 4B395WJmYWzCN8XJewefz4RawZ3
	rem start mine.bat %%A
	rem start mine.bat %%A
	start node index.js -r ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 2vnzs6zmGCaqgfYC6Uvmi9dDWXn3
	rem start node index.js -r ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 2vnzs6zmGCaqgfYC6Uvmi9dDWXn3 ./logs/log_zero%%A.txt
	rem start node index.js -r ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 2vnzs6zmGCaqgfYC6Uvmi9dDWXn3 ./logs/log_zero%%A_%%A.txt
	rem start node index.js -cc ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 2vnzs6zmGCaqgfYC6Uvmi9dDWXn3 > ./logs/log%%A.txt
	rem Miner.exe -r ./testKeys/%%A.key ./out/(%%A+8). 4B395WJmYWzCN8XJewefz4RawZ3 WqYSC4cbWZukTqnjbMJwvSGVozo
)

FOR /L %%A IN (151,1,450) DO (
  ECHO Generating Unit Number: %%A
	start node index.js -cc ./testKeys/%%A.key ./testUnits/unitTest_%%A.txt 2vnzs6zmGCaqgfYC6Uvmi9dDWXn3 > ./logs/log%%A.txt
)
pause