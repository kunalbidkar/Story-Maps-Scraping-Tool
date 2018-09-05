const fs = require("fs");
const axios = require("axios");
const util = require("util");
const converter = require("json-2-csv");
const url = "https://www.arcgis.com/sharing/rest/content/items/";
let items = [];
let id;
let newItems = [];
let failedIds = [];
let noData = [];
let failedRequests = [];
let response;
let batchNumber = 0;
const batchSize = 2500;
let templateNameForParser;
let templateParser;
let end = batchSize + batchNumber;
console.log("Processing...");
//  exporting these four functions to be used in other files
module.exports = {
	processData,
	parseFailedData,
	parseResponses,
	generateMultiRequest
};
/*
	generateMultiRequest() runs a for loop for 100 times where each iteration fetching 100 records.
	So at the end of this loop, we expect to have 10000 reocrds. 
    There is a delay assigned after every batch and after the for loop, all the promises are stored into 
    the responses array where we parse those responses in Promise.all 
*/
async function generateMultiRequest(options, array) {
	const requests = [];
	if (!templateParser) {
		templateParser = options.parseFunction;
	}
	if (!templateNameForParser) {
		templateNameForParser = options.templateName;
	}

	for (let j = options.beginning; j < options.end; j++) {
		const timedPromise = new Promise((resolve, reject) => {
			const url = `https://www.arcgis.com/sharing/rest/content/items/${
				array[j]
			}/data?f=json`;
			let currentId = array[j];
			let currentJ = j;

			axios
				.get(url)
				.then(axiosResponse => {
					if (axiosResponse) {
						axiosResponse.id = currentId;
					}
					resolve(axiosResponse);
				})
				.catch(() => {
					failedIds.push(currentId);
					newItems = [];
					resolve();
				});
		});
		requests.push(timedPromise);
	}
	await Promise.all(requests)
		.then(res => {
			parseResponses(res, array);
		})
		.catch(() => {
			newItems = [];
			generateMultiRequest(
				{
					beginning: end,
					end: end + batchSize
				},
				array
			);
		});
}

/*
	This function is called from axios.get().then(parseResponses) so it contains responses as a first param
	and the array of the specific template that was passed to check the length and decide whether or not to
	make the next call based on array length. 
	It calls parseData function (templateParser) and parses the data accordingly, pushing the data to newItems
*/
function parseResponses(res, array) {
	res.forEach(result => {
		if (result.hasOwnProperty("data") && result.data) {
			const resData = result.data;
			let parsedData = templateParser(resData, result.id);
			newItems.push(parsedData);
		} else {
			noData.push(result);
		}
	});
	// send next batch
	items = items.concat(newItems);
	newItems = [];

	if (end < array.length) {
		let updatedBeginning = end;
		let updatedEnd = Math.min(array.length, end + batchSize);

		end = end + batchSize;
		generateMultiRequest(
			{
				beginning: updatedBeginning,
				end: updatedEnd
			},
			array
		);
		// beginning : 2500
		// end : min(72361, 5000) => 5000
	} else {
		// at this point, we have done looping through all the records and we are processing
		// the failed ids that were stored in the failedIds array
		failedIds.forEach(element => {
			id = element;
			const url = `https://www.arcgis.com/sharing/rest/content/items/${element}/data?f=json`;
			const timedPromise = new Promise((resolve, reject) => {
				axios
					.get(url)
					.then(axiosResponse => {
						if (axiosResponse) {
							axiosResponse.id = id;
						}
						resolve(axiosResponse);
					})
					.catch(() => {
						resolve();
					});
			});
			failedRequests.push(timedPromise);
		});

		Promise.all(failedRequests)
			.then(res => {
				res.id = id;
			processData(res);
		})
			.catch(console.log);
	}
}

//  parses the failed records storing them in the newItems array
function parseFailedData(res, id) {

	res.forEach(result => {
		if (result && result.hasOwnProperty) {
			if (result.hasOwnProperty("data") && result.data) {
				const resData = result.data;
				let parsedData = templateParser(resData, id);
				newItems.push(parsedData);
			} else {
				noData.push(result);
			}
		}
	});
}
/*
	This function processes the data for failedRequests and appends that data to our items
	array which transfers those records to csv
*/
function processData(res) {
	newItems = [];
	noData = [];
	response = res;
	parseFailedData(res, res.id);

	if (newItems.length + noData.length !== res.length) {
		newItems = [];
		noData = [];
		console.log(
			"we have failed responses in the failed array and we are re-sending the requests again.."
		);
		failedIds.forEach(element => {
			const url = `https://www.arcgis.com/sharing/rest/content/items/${element}/data?f=json`;
			const timedPromise = new Promise((resolve, reject) => {
				axios
					.get(url)
					.then(axiosResponse => {
						if (axiosResponse) {
							axiosResponse.id = element;
						}
						resolve(axiosResponse);
					})
					.catch(() => {
						resolve();
					});
			});
			failedRequests.push(timedPromise);
		});

		Promise.all(failedRequests)
			.then(processData)
			.catch(console.log);
	} else {
		converter.json2csv(items, json2csvCallback);
	}
}

/*
	This is the json-csv callback and it transfers the csv(string) into the given filename
	We have a common summary file which shows all the 4 templates data into a single file
	In order to do that, we append the data to a common file name called finalSummary.csv
*/
var json2csvCallback = function(err, csv) {
	if (err) throw err;
	fs.appendFile(`csv/${templateNameForParser}.csv`, csv, err => {
		if (err) {
			console.log(err);
		} else
			console.log(
				`Data transferred successfully to csv/${templateNameForParser}.csv`
			);
	});
};
