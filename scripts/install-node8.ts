/**
 * Created by Nidin Vinayakan on 10/04/17.
 */

interface Nightly {
    version: string;
    date: string;
}

const nightlyBaseUrl: string = "http://nodejs.org/download/nightly/";
const request = require('request');
const fs = require('fs');
const exec = require('child_process').exec;
const installerName: string = `node-v8${getPlatform()}`;
let fileName:string = null;

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
            console.log("Done");
            let os = process.platform;

            switch (os) {
                case "win32":
                    return installWindows();
                case "darwin":
                    return installMac();
                case "linux":
                    return installLinux();
            }
        })
        .pipe(fs.createWriteStream(installerName));
}

function installWindows() {
    exec('7z x node-v8-win-x64.7z', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        exec(`move ${fileName.replace(".7z", "")} node-v8`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
    });
}

function installMac() {
    exec('tar -xf node-v8-darwin-x64.tar.xz', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        exec(`move ${fileName.replace(".tar.xz", "")} node-v8`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
    });
}

function installLinux() {
    exec('tar -xf node-v8-darwin-x64.tar.xz', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        exec(`move ${fileName.replace(".tar.xz", "")} node-v8`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
        });
    });
}