##############################################################################################################################################
# General Revision History
##############################################################################################################################################
Revision 1.11 Trading Ownerless - 14.12.2017
- Included Trading support for ownerless DICE Units
- Add support of user defined value for mining a new DICE Unit
- Update execute.bat file with new commands
- Bug Fixes 
	- Console messages

Revision 1.1 Trading - 10.12.2017
- Included Trading support
- Configuration of Server with file
- Bug Fixes 
	- Miner and Server communication
	- Refactoring of some components
	- Support of SHA3-C library in Standalone applications


	
Revision 1.0 Initial - 06.12.2017
	- Generation of Key pair Digital Address 
	- Communication over TCP between Miner and Server 
	- Encrypted data with Digital addresses 
	- Generation of new DICE Units 
	- Swatch Time calculation 
	- SHA 3 on C for NodeJS (still need some improvement for standalone building) 
	- Encoding to Base 58 
	- Valuiation of units by Server and locally 
	- Registration of DICE unit in its DB 
	- DNS binder for translation of Digital Address to Ip Port communication to Server 
	- Standalone applications for Server and Miner

##############################################################################################################################################
# How to Use
##############################################################################################################################################
1. Example use of Miner Application 
	-Aplication-  -<command> <keyPair filename> <output file for Unit> <address Of Operator>
	Miner.exe -c miner.json unit.txt 3SEdktQGS4K947PUadvbHFD2oJG
	
	-Aplication-  -<command> <keyPair filename> <output file for Unit> <address Of Operator> <DICE Value>
	Miner.exe -c miner.json unit.txt 3SEdktQGS4K947PUadvbHFD2oJG 2
	
	-Aplication-  -<command> <dice Unit in Base 58>
	Miner.exe -v unit.txt
	
	-Aplication-  -<command> <keyPair filename>
	Miner.exe -k keyPair.json
	
	-Aplication-  -<command> <keyPair filename> <Dice Unit file> <output file for Encrypted Unit> <address Of New Owner> <address Of Operator>
	Miner.exe -tc miner.json ./out/unitTest.txt ./out/unitEncToM2.txt 2dnzkaaKeeCeUAXTy2DrxijSKGB 3SEdktQGS4K947PUadvbHFD2oJG
	
	-Aplication-  -<command> <keyPair filename> <Dice Unit file> <output file for Encrypted Unit> <address Of New Owner> <address Of Operator>
	Miner.exe -to miner.json ./out/unitTest.txt 3SEdktQGS4K947PUadvbHFD2oJG
	
	-Aplication-  -<command> <keyPair filename> <Encrypted Dice Unit file> <address Of Operator>
	Miner.exe -tn miner2.json ./out/unitEncToM2.txt 3SEdktQGS4K947PUadvbHFD2oJG

2. Example use of Server Application 
	-Aplication-  -<keyPair filename> <valid zeros> <k> <N>
	Server.exe operator.json 15 1 25

	-Aplication-  -config <configFile>
	Server.exe -config serverConfig.json
##############################################################################################################################################
# EOF
##############################################################################################################################################