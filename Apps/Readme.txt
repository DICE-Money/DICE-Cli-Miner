##############################################################################################################################################
# General Revision History
##############################################################################################################################################
Revision 1.21 Command Arguments - 08.01.2018
- Add abstraction for Command Arguments (CommandParser model)
- Add '--help' command for both applications
- Refactoring of applications to use build configuration files
- Add returning value in "validation"
- Add checking for mismatch in registration of new DICE Unit
- Add '-r, --registration' command for separated registration of DICE Unit
- Add "dnsBinder" path in configuration file for operator application
- Add "-ver, --version" command to inform for current version of applications
- Change return value from operator as Code instead Text

Revision 1.20 CUDA Optimization - 31.12.2017
- Implement CUDA Application Revision 1.00
- Use JS SHA3 library instead C Library.
- Update C Library to use raw bytes instead HEX
- Add VIEW_Console model
- Add VIEW_Console code table and port table
- Add Excel for generation of code table
- Integration Optimization for separated builds for Win/Mac/Linux (x86 and x64)

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
	Miner.exe -cc miner.json unit.txt 3SEdktQGS4K947PUadvbHFD2oJ

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

	-Aplication-  -<command> <keyPair filename> <Encrypted Dice Unit file> <address Of Operator>
	Miner.exe -tn miner2.json ./out/unitEncToM2.txt 3SEdktQGS4K947PUadvbHFD2oJG

2. Example use of Server Application 
	-Aplication-  -<keyPair filename> <valid zeros> <k> <N>
	Server.exe operator.json 15 1 25

	-Aplication-  -config <configFile>
	Server.exe -config serverConfig.json

	-Aplication-  -<command> <keyPair filename> <Encrypted Dice Unit file> <address Of Operator>
	Miner.exe -tn miner2.json ./out/unitEncToM2.txt 3SEdktQGS4K947PUadvbHFD2oJG

	-Aplication-  -<command> <keyPair filename> <Encrypted Dice Unit file> <address Of Operator>
	Miner.exe -tn miner2.json ./out/unitEncToM2.txt 3SEdktQGS4K947PUadvbHFD2oJG
##############################################################################################################################################
# EOF
##############################################################################################################################################