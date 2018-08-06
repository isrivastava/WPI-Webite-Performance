const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const perfConfig = require('./perf-config');
const fs = require('fs');
const total_first_meaning_paint = new Array();
const total_speed_index = new Array();
const total_time_first_byte = new Array();
const total_first_interactive = new Array();
const total_nw_req = new Array();
const total_byte_wt = new Array();


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
  

  if (!fs.existsSync('wpi-perf-stats.csv')) {
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

  total_first_meaning_paint.push(data[2].replace(/,|ms/g,''));
  total_speed_index.push(data[3].replace(',',''));
  total_time_first_byte.push(data[4].replace(/,|ms/g,''));
  total_first_interactive.push(data[5].replace(/,|ms/g,''));
  total_nw_req.push(data[6]);
  total_byte_wt.push(data[7].replace(/Total size was|KB/g,''));

  fs.open('wpi-perf-stats.csv', 'a', function(e, id) {
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
  }
  else if (urls.length = index) { 
    average();
  };

}

function average(){
  const data_avg = new Array();
  if (!fs.existsSync('wpi-perf-avg.csv')) {
    createAvgFile();
  }

  var sum_first_meaning_paint = 0;
  for(var i = 0; i < total_first_meaning_paint.length; i++){
    sum_first_meaning_paint += parseInt(total_first_meaning_paint[i]);
  }
  var avg_first_meaning_paint = (sum_first_meaning_paint / (total_first_meaning_paint.length)).toFixed(2);

  var sum_speed_index = 0;
  for(var i = 0; i < total_speed_index.length; i++){
    sum_speed_index += parseInt(total_speed_index[i]);
  }
  var avg_speed_index = (sum_speed_index / (total_speed_index.length)).toFixed(2);

  var sum_time_first_byte = 0;
  for(var i = 0; i < total_time_first_byte.length; i++){
    sum_time_first_byte += parseInt(total_time_first_byte[i]);
  }
  var avg_time_first_byte = (sum_time_first_byte / (total_time_first_byte.length)).toFixed(2);

  var sum_first_interactive = 0;
  for(var i = 0; i < total_first_interactive.length; i++){
    sum_first_interactive += parseInt(total_first_interactive[i]);
  }
  var avg_first_interactive = (sum_first_interactive / (total_first_interactive.length)).toFixed(2);

  var sum_nw_req = 0;
  for(var i = 0; i < total_nw_req.length; i++){
    sum_nw_req += parseInt(total_nw_req[i]);
  }
  var avg_nw_req = (sum_nw_req / (total_nw_req.length)).toFixed(2);

  var sum_byte_wt = 0;
  for(var i = 0; i < total_byte_wt.length; i++){
    sum_byte_wt += parseInt(total_byte_wt[i]);
  }
  var avg_byte_wt = (sum_byte_wt / (total_byte_wt.length)).toFixed(2);

  data_avg.push(getDateTime());
  data_avg.push(avg_first_meaning_paint);
  data_avg.push(avg_speed_index);
  data_avg.push(avg_time_first_byte);
  data_avg.push(avg_first_interactive);
  data_avg.push(avg_nw_req);
  data_avg.push(avg_byte_wt);

  fs.open('wpi-perf-avg.csv', 'a', function(e, id) {
    fs.write(id, data_avg.join('; ') + "\n", null, 'utf8', function() {
      fs.close(id, function() {});
    });
  });

}

function createAvgFile() {
  const columnNames = new Array();
  columnNames.push('Date');
  columnNames.push('Average value first-meaningful-paint');
  columnNames.push('Average value speed-index-metric');
  columnNames.push('Average value time-to-first-byte');
  columnNames.push('Average value speed-index-metric');
  columnNames.push('Average value speed-index-metric');
  columnNames.push('Average value speed-index-metric');
  fs.writeFile("wpi-perf-avg.csv", columnNames.join('; ') + "\n", function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("New file created");
  });
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
  fs.writeFile("wpi-perf-stats.csv", columnNames.join('; ') + "\n", function(err) {
    if (err) {
      return console.log(err);
    }

    console.log("New file created");
  });
}

const opts = {};

// Sites to compare with.
const urls = [
  'https://www.wpi.edu/about/awards/presidents-iqp-awards',
  'https://www.wpi.edu/node/101731',
  'https://www.wpi.edu/c/summer-courses-high-school-students',
  'https://www.wpi.edu/academics/departments/data-science',
  'https://www.wpi.edu/news/calendar/events/december-2018-graduation-date',
  'https://www.wpi.edu/about/facts/figures/rankings-generic-best-value-collegetop-return-investment-payscale',
  'https://www.wpi.edu/',
  'https://www.wpi.edu/about/locations/85-prescott-street-gateway-park',
  'https://www.wpi.edu/student-experience/community/voices/chia-r',
  'https://www.wpi.edu/news/margot-lee-shetterly-author-hidden-figures-delivers-address-worcester-polytechnic-institute',
  'https://www.wpi.edu/offices/registrar',
  'https://www.wpi.edu/offices/registrar/course-registration/non-wpi-student-registration',
  'https://www.wpi.edu/project-based-learning/global-project-program/project-centers/san-jose-costa-rica-project-center',
  'https://www.wpi.edu/about/emergency-management/safety-notifications/2013-08-29-074200',
  'https://www.wpi.edu/academics/study/actuarial-mathematics-bs',
  'https://www.wpi.edu/offices/registrar/application-bachelors-degree',
  'https://www.wpi.edu/academics/faculty/directory'
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
