##############################################################################################################################################
# General Revision History
##############################################################################################################################################
Revision 1.48 Global Threshold and UNIT testing - 30.05.2018
 -Add prevention of Error handling.	
 -Add "Error" event handling.	
 -Add CloudRequester to get Global threshold from remote server and also automatic check on each 2 minutes.	
 -Add UNIT Test environment and better management of executed commands. 	
 -Change getting of dns.json from cloud to happen through CloudRequester.	
 -Add CloudRequester to get data from CLOUD.	
 -Add configuration parameter for exact number CPU to be used by the application.	
 -Pipe stdout from CUDA application to Node application console output.	

Revision 1.46 Scrapping - 08.05.2018
-Add new view interface for Scrapping functionality.	
-Add scrapping functionality on Operator side. Update operator configuration file template.	
-Update proper mining time measurement and overwriting of existing units. 	
-Add Scrapping on miner side.	
-Add Scrap functionality. Use Async functions to handle scrapped dice units.
-Update CUDA Application to save "scrapped" dice units. 	

Revision 1.45 Units Listing and Balance - 07.04.2018
- Listing of Units from folder
- Balance in folder
- Security Update of binaries
- Optimization of Listing and balance functions
- Specify a folder as output after accepting new DICE unit

Revision 1.42 File Extensions - 06.03.2018
- Update noted changes for file extensions and .dconf auto find in directory.
- Add general start points for delayed security level update (Not Finished).
- Re-factor Code(Nothing added).
- Add Google Drive Dynamic path finder.
- Remove DNS Binder. Add static configuration of operator.
- Update with new Messages and Errors
- Remove old  units, add Controllers and instance of Configuration controller. 
  New Commands to use contacts bank. New Bat file to use program. 
  Google Drive remote DNS binder file.
- Add remote downloading of dns binder file.
- Add initial revision of ContactWorker(Configuration Worker).
- Remove checking of arguments count

Revision 1.40 Miner configuration and address book - 03.03.2018
-Added triple encryption levels: general=256, advanced=384, heavy=521
-Added Initial revision of proxy server(later use for multi-system cluster model)
-Added digital address format of "HexDash"
-Optimize tcp/ip communication protocol to use 1/3 less memory

Revision 1.35 TCP Secure Protocol Optimization - 18.02.2018
- Parallel model for operator application
- Bug fixes of communication protocol
- Added AES-256-GCM Encryption instead AES-256-CBC
- New Key generation schema (159 unique bits + 1 sign bit)
- Command Parser for nexe build capability(different count of arguments)
- Build environment for ARM 64 bit

Revision 1.31 TCP Buffering - 11.02.2018
- Certificate exchange in hex format instead buffer type
- Add TCP buffering of messages 

Revision 1.30 Security Improvement (Certificate) - 10.02.2018
- Change main encryption curve from sect113r1 to secp160k1
- Add new schema for key generation 
- Add second ephemeral key exchange with curve secp521r1
- Add signing and verification with two new curves
- Overall improved security communication between operator and miner
- Re-generated key pairs by using new schema

Revision 1.22 MySql Database - 15.01.2018
- Add MySql Database support for server application
- Add classes to use MySql database
- First revision of JSDOC for proper way to describe methods and classes in doxygen format
- Change from sync to async database method invoke
- Add safety way to invoke invalid method on server
- Operator changed to use properly outside configuration with JSON file
- Add safety mechanism to prevent breaking the Operator Application if there is no table or DB
 
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
# EOF
##############################################################################################################################################