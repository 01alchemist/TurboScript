/**
 * Created by Nidin Vinayakan on 10/04/17.
 */

interface Nightly {
    version: string;
    date: string;
}

const nightlyBaseUrl:string = "http://nodejs.org/download/nightly/";
const request = require('request');
const fs = require('fs');
const exec = require('child_process').exec;

request.get(nightlyBaseUrl + "index.json", function (error, response, body:string) {
    let nightlyInfo: Nightly[] = JSON.parse(body);
    let downloadUrl = generateDownloadUrl(nightlyInfo);

    if(downloadUrl) {
        startDownload();
    }
});

function generateDownloadUrl(nightlyInfo: Nightly[]): string {
    //Just take first entry, assuming it is the latest.
    let latest: Nightly = nightlyInfo[0];
    return nightlyBaseUrl + latest.version + getPlatform();
}

function getPlatform():string {
    let os = process.platform;

    switch (os) {
        case "win32": return "-win-x64.zip";
        case "darwin": return "-darwin-x64.tar.xz";
        case "linux": return "-linux-x64.tar.xz";
    }
}

function startDownload() {

}

function install () {
    exec('-s -o node-v8.tar.xz && tar -xJf node-v8.tar.xz -C nodev8 --strip-components 1 && rm node-v8.tar.xz', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
}