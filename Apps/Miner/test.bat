FOR /L %%A IN (1,1,1000) DO (
  ECHO Generating Unit Number: %%A
	start node index.js -r ./examples/miner.json ./out/unitTest.txt.38 3S4pihKB27NVrhCbH5PTugbiwo6
)
