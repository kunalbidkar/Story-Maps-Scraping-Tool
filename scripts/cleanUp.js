const fs = require("fs");

/*
	This script deletes the pre-existing csv files from the csv/ folder 
*/
const fileNames = [
	"csv/cascadeStats.csv",
	"csv/mapTourStats.csv",
	"csv/mapSeriesStats.csv",
	"csv/mapJournalStats.csv",
	"csv/outputFile.csv",
	"csv/finalSummary.csv"
];

fileNames.forEach((item)=>{
	fs.stat(item, function(err, stat) {
		if (err == null) {
			// file exists
			fs.unlinkSync(item);
		} else if (err.code == "ENOENT") {
			// file does not exist
			console.log("File",item," does not exist to delete");
		} else {
			console.log("Some other error: ", err.code);
		}
	});
});

