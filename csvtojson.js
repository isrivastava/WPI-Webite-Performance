let csvToJson = require('convert-csv-to-json');

let fileInputName = 'wpi-perf-stats.csv'; 
let fileOutputName = 'sites-perf-stats.json';

csvToJson.generateJsonFileFromCsv(fileInputName,fileOutputName);
