# WPI-Webite-Performance
This repository contains scripts written in javascript to monitor [wpi.edu](wpi.edu) performance. The purpose is to make sure that WPI website get a good score in [Google Lighthouse](https://developers.google.com/web/tools/lighthouse/) and also compare it to other Drupal websites to see WPI website ranking.</br>
Later this ranking is displayed via tableau dashboard.
## Folder structure
- **`competitor-stats.csv`** - File that contains all of the competitor websites statistics. This file is used to track over time our improvements and how we stack up against the competitor websites.
- **`index.js`** - This is the javascript file where the testing automation happens.
- **`perf-config.js`** - The `launchChromeAndRunLighthouse` function in `index.js` uses this file to figure out what tests and options we want to run.
- **`test-perf`** - The is the shell script that is saved in `/usr/local/bin`. 
- **`wpi_perf.js`** - This the javascript file that monitors performance of different webpages of WPI website and then calculates their average for a given time. The result is stored in wpi-perf-avg.csv and wpi-perf-stats.csv files. </br></br>

Below is the performance of First Meaningful Paint metric displayed in tableau dashboard.</br>
![Alt_Text](https://github.com/isrivastava/WPI-Webite-Performance/blob/master/Screenshot/WPI_Tab_1.png)


