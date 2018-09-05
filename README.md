
# Story Maps Scraping Tool


This application consists of making thousands of call using Axios module, classifying and then parsing the responses received and finally presenting the parsed data into a csv file for better readability which can be further used for having stastical analysis and research. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

What things you need to install the software : 
Node Package Manager : (npm)

### Configuration and Usage

You can configure the default query to anything you wish. In order to provide your custom search query parameters please go to index.js file in the root folder and edit this code snippet to your custom configurations: 

```
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
```
With these configurations, you can easily change the output file destinations, type and typeKeywords of the query, sortField and sortOrder, delay and the format type.


### Installing and Running

A step by step series of examples that tell you how to get a development env running

Go to the directory when you download the zip or clone the project and when you are inside the project directory run

```
npm install
```
This will install all the dependencies that are required by the application.
```
npm run build
```
This command will run all the build scripts that will pre-configure all the things that you need to run this project.
After this step, you can see the csv files generated in the csv folder of the project directory


## Technologies Used

* [Node](https://www.w3schools.com/html/html5_intro.asp) - Open-source, cross-platform JavaScript run-time environment that executes JavaScript code server-side.
* [JavaScript](https://sass-lang.com/guide) - Extension of CSS that adds power and elegance to the basic language
* [ArcGIS REST API](https://developers.arcgis.com/) - ArcGIS is a platform for organizations to create, manage, share, and analyze spatial data. It consists of server components, mobile and desktop applications, and developer tools.
* [npm](https://npmjs.com) - Default package manager for the JavaScript runtime environment Node.js
 

## Authors

* **Kunal Bidkar** - *Initial work* - [Kunal Bidkar](https://github.com/kunalbidkar)

## Acknowledgments

* Story Maps ArcGIS APIs.
* Stephen Sylvia, Alison Sizer, and Owen Evans for throughout guidance & suggestions in the project.
