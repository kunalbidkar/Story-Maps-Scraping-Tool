const fs = require("fs");

// importing commonFunctions (generateMultiRequest, parseResponses, json-csv callback...)
const exportFunctions = require("../exportFunctions/commonFunctions.js");
// importing parser functions
const parseDataFunctions = require('../parse/parse.js');
// Code to fetch the data from the json file
const mapJournalContent = fs.readFileSync("data/types.json");
const jsonContent = JSON.parse(mapJournalContent);
// storing the Journal elements inside mapJournalIds array
let mapJournalIds = jsonContent.Journal;

let batchNumber = 0;  // starting from 0th element
const batchSize = 2500;  // dividing number of records by 2500 (batch size) and sending each batch of 2500 records

// calling generateMultiRequest function with => beginning = 0; and end = 2500
// parseFunction => function with name parseCascadeData imported from parseData
// templateName => name of the current template type in order to generate a csv file with this given name

exportFunctions.generateMultiRequest({
	beginning: batchNumber,
	end: batchNumber + batchSize,
	parseFunction : parseDataFunctions.parseJournalData,
	templateName : "mapJournalStats"
}, mapJournalIds);
