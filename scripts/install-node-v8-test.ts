import {Terminal} from "../src/utils/terminal";
/**
 * Created by Nidin Vinayakan on 10/04/17.
 */

interface NodeJS {
    version: string;
    date: string;
}

const baseUrl: string = "http://nodejs.org/download/test/";
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;
const DOWNLOAD_NAME: string = `tmp/node-v8${getPlatform()}`;
const NODE_PATH = "node-v8";
let fileName: string = "";

//Clean old files
if (fs.existsSync(NODE_PATH)) {
    fs.removeSync(NODE_PATH);
}
if (!fs.existsSync("tmp")) {
    fs.mkdirSync("tmp");
}

Terminal.write("##########################################");
Terminal.write("#   Installing node.js with webassembly  #");
Terminal.write("##########################################");

request.get(baseUrl + "index.json", function (error:Error, response:Response, body: string) {
    let nodeJSInfo: NodeJS[] = JSON.parse(body);
    let downloadUrl = generateDownloadUrl(nodeJSInfo);
    if (downloadUrl) {
        startDownload(downloadUrl);
    }
});

function generateDownloadUrl(nodeJSInfo: NodeJS[]): string {
    //Just take first entry, assuming it is the latest.
    let latest: NodeJS = nodeJSInfo[0];
    fileName = "node-" + latest.version + getPlatform();
    return baseUrl + latest.version + "/" + fileName;
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
    return "";
}

function startDownload(url:string) {
    Terminal.write(`Downloading ${url}`);
    request
        .get(url)
        .on('error', err => {
            Terminal.write(err)
        })
        .on('end', () => {
            Terminal.write("Extracting...");
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
            Terminal.error(`exec error: ${error}`);
            return;
        }
        // exec(`move ${fileName.replace(".7z", "")} node-v8/bin`, (error, stdout, stderr) => {
        //     if (error) {
        //         Terminal.error(`exec error: ${error}`);
        //         return;
        //     }
        // });
        if (!fs.existsSync("node-v8")) {
            fs.mkdirSync("node-v8");
        }
        fs.moveSync(fileName.replace(".7z", ""), "node-v8/bin");
        Terminal.write("Cleaning...");
        fs.removeSync(DOWNLOAD_NAME);
        Terminal.write("Completed!");
    });
}

function installUnix() {
    exec(`tar -xf ${DOWNLOAD_NAME}`, (error, stdout, stderr) => {
        if (error) {
            Terminal.error(`exec error: ${error}`);
            return;
        }
        fs.moveSync(fileName.replace(".tar.xz", ""), "node-v8");
        Terminal.write("Cleaning...");
        fs.removeSync(DOWNLOAD_NAME);
        Terminal.write("Completed!");
    });
}
