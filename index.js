const axios = require("axios");
const fs = require("fs");
const converter = require("json-2-csv");
const maxResults = 10000; 
const promises = [];
const creationDates = [];
let items = [];
let newItems = [];
let lastSearch = false;
let lastItemsCreatedDate;
let parsedItem;
let total;
let withoutDuplicates;

const config = {
    searchURL: "https://www.arcgis.com/sharing/rest/search",
    sortField: "created",
    sortOrder: "asc",
    formatType: "pjson",
    typeKeywords: "story maps",
    type: "Web Mapping Application",
    numberOfRecordsPerQuery: 100,
    delay: 2000,
    outputFileDestination: "csv/outputFile.csv",
    outputJSONDestination: "data/types.json"
};

console.log("Processing...");
/* 
    Call to our first batch, creation date being undefined because we don't know the creation date
    of our items until we fire this first batch.
*/
batchSearch({ pages: 100, creationDates: undefined });

/*
    generateMultiRequest() runs a for loop for 100 times where each iteration fetching 100 records. 
    So at the end of this loop, we expect to have 10000 reocrds. 
    There is a delay assigned after every batch and after the for loop, all the promises are stored 
    into the responses array where we parse those responses in Promise.all 
*/
async function generateMultiRequest(options) {
    const requests = [];
    let creationDateRange;
    for (let j = 0; j < options.pages; j++) {
        const index = j;
        const start = index === 0 ? 1 : index * 100 + 1;
        const batch = index % 10;

        if (options.creationDates !== undefined) {
            creationDateRange = `AND (uploaded:[000000${
                options.creationDates
            } TO 000000${Date.now()}])`;
        } else {
            creationDateRange = "";
        }
        let params = {
            f: config.formatType,
            num: config.numberOfRecordsPerQuery,
            q: `typekeywords:${config.typeKeywords} AND type:${config.type} ${creationDateRange}`,
            start: `${start}`,
            sortOrder: config.sortOrder,
            sortField: config.sortField
        };

        const timedPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                axios
                    .get(config.searchURL, { params })
                    .then(resolve)
                    .catch(reject);
            }, batch * config.delay);
        });
        requests[index] = timedPromise;
    }
    await Promise.all(requests)
        .then(res => {
            parseResponses(options, res, total);
        })
        .catch(error => {
            console.log(error);
        });
}

/*
    batchSearch is called after a batch has been processed eventhough it failed or succedeed. 
    This checks the total at the beginning to check if there are any new items that have been
    added within the duration of our script.
    Note: The if() will execute only for the last set of records. 
*/
async function batchSearch(params) {
    await getTotalResults(params).then((data, params) => {
        total = data;
    });

    if (total < maxResults && lastSearch == false) {
        // this will execute only one time for the last set of 10000 records

        total = total;
        lastSearch = true;
        generateMultiRequest(params);
    } else {
        total = maxResults;
        generateMultiRequest(params);
    }
}

/*
    parseResponses is called in Promise.all where it takes a res array and loops through the
    elements and parses them as per the requirement.
    It also checks if we got all the responses that we were expecting and fires the same batch
    again if we miss out some responses and fires the next batch if we received all the responses
    that we were expecting. 
*/
function parseResponses(params, res, total) {
    res.forEach(result => {
        const resData = result.data;
        resData.results.forEach(item => {
            parsedItem = parseData(item);
            newItems.push(parsedItem);
        });
    });
    if (newItems.length < total) {
        console.log(
            "The query failed to fetch back 10000 records and hence re-firing with creation date ",
            lastItemsCreatedDate
        );
        newItems = [];
        batchSearch({ pages: 100, creationDates: lastItemsCreatedDate });
    } else {
        lastItemsCreatedDate = newItems[newItems.length - 1].created;
        items = items.concat(newItems);
        newItems = [];
        if (lastSearch == false)
            batchSearch({ pages: 100, creationDates: lastItemsCreatedDate });
    }

    if (lastSearch == true) {
        console.log("Copying the records in json-csv");
        // remove duplicates objects from the items array
        withoutDuplicates = removeDuplicates(items);

        // push that array to json-csv converter
        const options = {
            delimiter: {
                wrap: '"', // Double Quote (") character
                field: ",", // Comma field delimiter
                array: ";", // Semicolon array value delimiter
                eol: "\n", // Newline delimiter
                number: ""
            },
            sortHeader: false,
            trimHeaderValues: false,
            trimFieldValues: false
        };

        converter.json2csv(withoutDuplicates, json2csvCallback, options);
    }
}

let contentStatusValue = "false";

/*
    parseData returns an object which filters out the required fields from the response
*/
function parseData(item) {
    if (item.contentStatus === undefined) contentStatusValue = "false";
    else contentStatusValue = item.contentStatus;
    let typekeywords = item.typeKeywords.join(", ");
    let taGs = item.tags.join(", ");
    const parsedItem = {
        id: item.id,
        numViews: item.numViews,
        created: item.created,
        modified: item.modified,
        scoreCompleteness: item.scoreCompleteness,
        tags: taGs,
        type: item.type,
        typeKeywords: typekeywords,
        template: getTemplateName(item),
        orgId: item.orgId,
        contentStatus: contentStatusValue
    };
    return parsedItem;
}

const mapTourTemplateIds = [];
const mapJournalTemplateIds = [];
const cascadeTemplateIds = [];
const mapSeriesTemplateIds = [];
const swipeTemplateIds = [];
const crowdSourceIds = [];
const unknownIds = [];
const shortListIds = [];

/*
    The response generated (item) has typeKeywords.
    This function checks the typeKeywords and assigns a template type based on the 
    typeKeywords value
*/
function getTemplateName(item) {
    let template = "";
    if (item.typeKeywords.includes("Map Tour")) {
        template = "map-tour";
        mapTourTemplateIds.push(item.id);
    } else if (
        item.typeKeywords.includes("MapJournal") ||
        item.typeKeywords.includes("mapjournal")
    ) {
        template = "map-journal";
        mapJournalTemplateIds.push(item.id);
    } else if (item.typeKeywords.includes("Cascade")) {
        template = "cascade";
        cascadeTemplateIds.push(item.id);
    } else if (
        item.typeKeywords.includes("MapSeries") ||
        item.typeKeywords.includes("mapseries")
    ) {
        template = "map-series";
        mapSeriesTemplateIds.push(item.id);
    } else if (item.typeKeywords.includes("Crowdsource")) {
        template = "crowdsource";
        crowdSourceIds.push(item.id);
    } else if (
        item.typeKeywords.includes("SwipeSpyglass") ||
        item.typeKeywords.includes("swipe")
    ) {
        template = "swipe";
        swipeTemplateIds.push(item.id);
    } else if (
        item.typeKeywords.includes("Shortlist") ||
        item.typeKeywords.includes("shortlist")
    ) {
        template = "shortlist";
        shortListIds.push(item.id);
    } else {
        template = "unknown";
        unknownIds.push(item.id);
    }
    return template;
}

/*
    This is a callback function called from the convertor once we have
    all the required data.
    This function copies the data into a csv file and also groups the item ids based
    on template types
*/
let json2csvCallback = function(err, csv) {
    if (err) throw err;

    // This appends the items string into a csv file
    fs.appendFile(config.outputFileDestination, csv, err => {
        if (err) {
            console.log(err);
        }
    });

    //  Remove duplicates from the ids
    const Tour = flattenUniq(mapTourTemplateIds);
    const Cascade = flattenUniq(cascadeTemplateIds);
    const Crowd = flattenUniq(crowdSourceIds);
    const Series = flattenUniq(mapSeriesTemplateIds);
    const Journal = flattenUniq(mapJournalTemplateIds);
    const Unknown = flattenUniq(unknownIds);
    const Short = flattenUniq(shortListIds);
    const Swipe = flattenUniq(swipeTemplateIds);

    const templateObject = {
        Cascade,
        Crowd,
        Series,
        Journal,
        Unknown,
        Tour,
        Short,
        Swipe
    };

    console.log("Tour = ", Tour.length);
    console.log("Cascade = ", Cascade.length);
    console.log("Journal = ", Journal.length);
    console.log("Series = ", Series.length);
    console.log("Short = ", Short.length);
    console.log("Swipe = ", Swipe.length);
    console.log("Crowd = ", Crowd.length);
    console.log("Type not defined = ", Unknown.length);

/*
   types.json is used to classify the ids as per their category. 
   It groups the item ids based on its template type
   For example: cascadeIds : [..., ..., ...,], mapTourIds: [...,...,...,],... 
*/
    fs.writeFile(config.outputJSONDestination, JSON.stringify(templateObject), err => {
        if (err) {
            console.log(err);
        } else console.log("");
    });
};

/*
    This function is called in every batchSearch function to get the total results
    at current instance of time
    getTotalResults gives total based on the query having the creation date at every batch search
*/
async function getTotalResults(params) {
    if (params.creationDates !== undefined) {
        creationDateRange = `AND (uploaded:[000000${
            params.creationDates
        } TO 000000${Date.now()}])`;
    } else {
        creationDateRange = "";
    }

    const paramsForTotal = {
        f: config.formatType,
        num: 1,
        q: `typekeywords:${config.typeKeywords} AND type:${config.type} ${creationDateRange}`,
        sortOrder: config.sortOrder,
        sortField: config.sortField
    };
    return axios
        .get(config.searchURL, {
            paramsForTotal
        })
        .then(response => {
            return response.data.total;
        })
        .catch(function(error) {
            console.log("Error: ", err);
        });
}
/*
    Since we use [] for the creation dates in the creation date range, we have some duplicate entries
    since it takes inclusive creation date and fires the query.
    This function takes the items array and removes duplicate ids from the items array
*/
function removeDuplicates(items) {
    const results = [];
    let idsSeen = {},
        idSeenValue = {};
    for (let i = 0, len = items.length, id; i < len; ++i) {
        id = items[i].id;
        if (idsSeen[id] !== idSeenValue) {
            results.push(items[i]);
            idsSeen[id] = idSeenValue;
        }
    }
    return results;
}

/*
    This function removes the duplicates from the template arrays (cascade, tour, series, journal) and 
    returns an unique array of elements
*/
function flattenUniq(array) {
    let unique = array.filter(function(elem, pos) {
        return array.indexOf(elem) == pos;
    });
    return unique;
}
