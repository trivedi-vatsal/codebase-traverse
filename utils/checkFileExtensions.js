const { log } = require("../logger");
const constants = require("../constants");

const allowedExtensions = constants.allowedExtensions || [];

const checkFileExtension = (fileName = "") => {
  try {
    if (fileName == "") {
      return false;
    }

    for (let i = 0; i < allowedExtensions.length; i++) {
      if (fileName.endsWith(`.${allowedExtensions[i]}`)) {
        return true; // Return true if the file has a allowed extension
      }
    }

    return false;
  } catch (e) {
    log("checkFileExtension() - " + e, "ERROR");
    return false;
  }
};

module.exports = {
  checkFileExtension,
};
