/**
 * Created by Nidin Vinayakan on 10/04/17.
 */

interface Nightly {
    version: string;
    date: string;
}

const nightlyBaseUrl: string = "http://nodejs.org/download/nightly/";
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;
const DOWNLOAD_NAME: string = `tmp/node-v8${getPlatform()}`;
const NODE_PATH = "node-v8";
let fileName: string = null;

//Clean old files
if (fs.existsSync(NODE_PATH)) {
    fs.removeSync(NODE_PATH);
}
if (!fs.existsSync("tmp")) {
    fs.mkdirSync("tmp");
}

console.log("##########################################");
console.log("#   Installing node.js with webassembly  #");
console.log("##########################################");

request.get(nightlyBaseUrl + "index.json", function (error, response, body: string) {
    let nightlyInfo: Nightly[] = JSON.parse(body);
    let downloadUrl = generateDownloadUrl(nightlyInfo);
    if (downloadUrl) {
        startDownload(downloadUrl);
    }
});

function generateDownloadUrl(nightlyInfo: Nightly[]): string {
    //Just take first entry, assuming it is the latest.
    let latest: Nightly = nightlyInfo[0];
    fileName = "node-" + latest.version + getPlatform();
    return nightlyBaseUrl + latest.version + "/" + fileName;
}

function getPlatform(): string {
    let os = process.platform;

    switch (os) {
        case "win32":
            return "-win-x64.7z";
        case "darwin":
            return "-darwin-x64.tar.xz";
        case "linux":
            return "-linux-x64.tar.xz";
    }
}

function startDownload(url) {
    console.log(`Downloading ${url}`);
    request
        .get(url)
        .on('error', err => {
            console.log(err)
        })
        .on('end', () => {
            console.log("Extracting...");
            let os = process.platform;

            switch (os) {
                case "win32":
                    return installWindows();
                case "darwin":
                case "linux":
                    return installUnix();
            }
        })
        .pipe(fs.createWriteStream(DOWNLOAD_NAME));
}

function installWindows() {
    exec(`7z x ${DOWNLOAD_NAME}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        // exec(`move ${fileName.replace(".7z", "")} node-v8/bin`, (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`exec error: ${error}`);
        //         return;
        //     }
        // });
        if (!fs.existsSync("node-v8")) {
            fs.mkdirSync("node-v8");
        }
        fs.moveSync(fileName.replace(".7z", ""), "node-v8/bin");
        console.log("Cleaning...");
        fs.removeSync(DOWNLOAD_NAME);
        console.log("Completed!");
    });
}

function installUnix() {
    exec(`tar -xf ${DOWNLOAD_NAME}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        fs.moveSync(fileName.replace(".tar.xz", ""), "node-v8");
        console.log("Cleaning...");
        fs.removeSync(DOWNLOAD_NAME);
        console.log("Completed!");
    });
}