const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const perfConfig = require('./perf-config');
const fs = require('fs');

// Launch Chrome and Lighthouse 
function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
    opts.port = chrome.port;
    return lighthouse(url, opts, config).then(results => {
      // The gathered artifacts are typically removed as they can be quite large (~50MB+)
      delete results.artifacts;
      return chrome.kill().then(() => results)
    });
  });
}


function parseLighthouseResults(results) {
  const audit = results.audits;
  const data = new Array();

  if (!fs.existsSync('competitor-stats.csv')) {
    createFile();
  };

  data.push(results.url);
  data.push(getDateTime());
  data.push(audit['first-meaningful-paint']['displayValue']);
  data.push(audit['speed-index-metric']['displayValue']);
  data.push(audit['time-to-first-byte']['displayValue']);
  data.push(audit['first-interactive']['displayValue']);
  data.push(audit['network-requests']['displayValue']);
  data.push(audit['total-byte-weight']['displayValue']);

  fs.open('competitor-stats.csv', 'a', function(e, id) {
    fs.write(id, data.join('; ') + "\n", null, 'utf8', function() {
      fs.close(id, function() {});
    });
  });
  console.log(urls[index] + ' is done being tested. ' + (urls.length - index) + ' websites left');
  index += 1;

  if (urls.length >= index + 1) {
    console.log('Now testing ' + urls[index]);
    launchChromeAndRunLighthouse(urls[index], opts, perfConfig).then(results => {
      parseLighthouseResults(results);
    }).catch((err) => {
      console.log(err);
    });
  };
}

function createFile() {
  const columnNames = new Array();
  columnNames.push('URL');
  columnNames.push('Date');
  columnNames.push('First Meaningful Paint');
  columnNames.push('Speed Index Metric');
  columnNames.push('Time To First Byte');
  columnNames.push('First Interactive');
  columnNames.push('Network Requests');
  columnNames.push('Total Byte Weight');
  fs.writeFile("competitor-stats.csv", columnNames.join('; ') + "\n", function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("New file created");
  });
}

const opts = {};

// Sites to compare with.
const urls = [
  'https://www.wpi.edu',
  'https://www.holycross.edu/',
  'https://www.bentley.edu/',
  'https://www.umass.edu/',
  'https://www.brown.edu/',
  'https://www.yale.edu/',
  'https://www.duke.edu/',
  'http://www.psu.edu/',
  'https://www.trentu.ca/',
  'https://www.princeton.edu/',
  'https://www.ncaa.com/',
  'https://www.nih.gov/',
  'https://www.ibtimes.com/',
  'https://www.conserveca.org/',
  'https://www.collegeboard.org/'
];

var index = 0;

launchChromeAndRunLighthouse(urls[index], opts, perfConfig).then(results => {
  parseLighthouseResults(results);
}).catch((err) => {
  console.log(err);
});

function getDateTime() {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + "-" + month + "-" + day + " " + hour + ":" + min;

}