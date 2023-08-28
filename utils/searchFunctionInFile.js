const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { log } = require("../logger");
const { astVisitors } = require("./astVisitors");
const { astImports } = require("./astImports");
const { astExports } = require("./astExports");
const { astRelations } = require("./astRelations");

const searchFunctionInFile = async (filePaths = [], functionName = "") => {
  try {
    if (functionName == "") {
      log("searchFunctionInFile() - Required parameters missing.", "ERROR");
      return -1;
    }

    if (filePaths && !filePaths.length > 0) {
      log("searchFunctionInFile() - Required parameters missing.", "ERROR");
      return -1;
    }

    let fileTree = [];

    const functionPaths = filePaths.map(async (filePath) => {
      // read the file
      let code = fs.readFileSync(filePath, "utf-8");

      // generate ast tree
      let ast = parser.parse(code, {
        sourceType: "module",
        plugins: [],
      });

      let imports = [];
      let exports = { members: [] };
      let declarations = {};

      // traverse ast tree
      traverse(
        ast,
        astVisitors(
          astImports(imports),
          astExports(exports),
          astRelations(declarations)
        )
      );

      fileTree.push({
        file: filePath,
        imports: imports,
        exports: exports,
        relations: declarations,
      });
    });

    return fileTree;
  } catch (e) {
    log("searchFunctionInstancesInFolder() - " + e, "ERROR");
    return -1;
  }
};

module.exports = {
  searchFunctionInFile,
};
