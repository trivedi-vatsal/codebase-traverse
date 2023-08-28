const fs = require("fs");
const path = require("path");
const { log } = require("../logger");
const constants = require("../constants");
const { checkFileExtension } = require("./checkFileExtensions");

const folderToExclude = constants.folderToExclude || [];

const traverseDirectory = (directoryPath = "") => {
  try {
    if (directoryPath == "") {
      return [];
    }

    let filePaths = [];
    const files = fs.readdirSync(directoryPath);

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);

      if (file.startsWith(".")) {
        continue; // Skip files and folders starting with a dot
      }

      if (stats.isDirectory()) {
        // Skip node_modules folder
        if (!folderToExclude.includes(file)) {
          console.log("Directory:", filePath);
          let folderFilePaths = traverseDirectory(filePath); // Recursively traverse subdirectories
          filePaths = [...folderFilePaths, ...filePaths];
        } else {
          console.log("Skipped:", filePath);
        }
      } else {
        console.log("File:", filePath);
        if (checkFileExtension(filePath) === true) {
          filePaths.push(filePath);
        }
      }
    }
    return filePaths;
  } catch (e) {
    log("traverseDirectory() - " + e, "ERROR");
    return [];
  }
};

module.exports = {
  traverseDirectory,
};
