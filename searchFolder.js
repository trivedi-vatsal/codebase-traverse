const { log } = require("./logger");
const fs = require("fs");
const moment = require("moment");
const {
  traverseDirectory,
  setFunctionArgs,
  searchFunctionInFile,
} = require("./utils");

const logFilename = `${moment().format("YYYY-MM-DD_HHmmss")}`;

let logger = fs.createWriteStream(`./logs/${logFilename}.txt`, {
  flags: "a",
});

// Function name to search for
let functionName = "";

// Folder path to search
let folderPath = "";

const searchFunctionInstancesInFolder = async () => {
  try {
    if (functionName == "") {
      log("Required arguments missing - function name", "ERROR");
      return -1;
    }

    if (folderPath == "") {
      log("Required arguments missing - folder path", "ERROR");
      return -1;
    }

    let filePaths = await traverseDirectory(folderPath);

    if (filePaths.length == 0) {
      log("No files found in the path or path is not accessible.", "ERROR");
      return -1;
    }

    let fileTreeResp = await searchFunctionInFile(filePaths, functionName);

    logger.write(JSON.stringify(fileTreeResp, null, 2));

    return 1;
  } catch (e) {
    log("searchFunctionInstancesInFolder() - " + e, "ERROR");
    return -1;
  }
};

if (process.argv.length > 2) {
  logger.write(`${moment().format("YYYY-MM-DD HH:mm:ss")}` + "\n");
  functionName = setFunctionArgs(process.argv[2]);
  folderPath = setFunctionArgs(process.argv[3]);
  searchFunctionInstancesInFolder();
} else {
  log("Required arguments missing.", "ERROR");
}
