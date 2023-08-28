const { getDeclarationNames } = require("./astGetDeclarationNames");
const { getExportSpecifier } = require("./astGetExportSpecifier");
const { default: generate } = require("@babel/generator");

const astExports = (exports = { members: [] }) => {
  return {
    ExportAllDeclaration({ node }) {
      exports.extends = (exports.extends || []).concat(node.source.value);
    },
    ExportNamedDeclaration({ node }) {
      const { specifiers, declaration, loc } = node;
      specifiers.forEach((specifier) => {
        const dep = getExportSpecifier(specifier);
        if (dep) {
          exports.members.push(
            Object.assign(Object.assign({}, dep), {
              code: generate(node).code,
            })
          );
        }
      });
      if (declaration) {
        const names = getDeclarationNames(declaration);
        if (names && names.length) {
          names.forEach(({ name }) => {
            exports.members.push({
              name,
              alias: name,
              code: generate(node).code,
            });
          });
        }
      }
    },
    ExportDefaultDeclaration({ node }) {
      const { declaration, loc } = node;
      const alias = "default";
      const names = getDeclarationNames(declaration);
      if (names && names.length) {
        names.forEach(({ name }) => {
          name = name || "default";
          exports.members.push({ name, alias, code: generate(node).code });
        });
      } else {
        exports.members.push({
          name: "default",
          alias: "default",
          code: generate(node).code,
        });
      }
    },
  };
};

module.exports = {
  astExports,
};
