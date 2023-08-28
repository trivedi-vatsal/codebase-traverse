const { getPatternNames } = require("./astGetPatternNames");

const getDeclarationNames = (node) => {
  switch (node.type) {
    case "VariableDeclaration":
      return node.declarations.reduce((ret, node) => {
        if (node.id) {
          return ret.concat(getPatternNames(node.id));
        } else {
          console.warn(
            "getDeclarationNames - VariableDeclaration id not exist, node:",
            node
          );
          return ret;
        }
      }, []);
    case "FunctionDeclaration":
    case "ClassDeclaration":
      if (node.id) {
        return getPatternNames(node.id);
      }
      return null;
  }
  return null;
};

module.exports = {
  getDeclarationNames,
};
