const { getImportSpecifier } = require("./astGetImportSpecifier");
const { getExportSpecifier } = require("./astGetExportSpecifier");
const { default: generate } = require("@babel/generator");

const astImports = (imports = []) => {
  return {
    ImportDeclaration({ node }) {
      const modulePath = node.source.value;
      node.specifiers.forEach((specifier) => {
        const dep = getImportSpecifier(specifier);
        if (dep) {
          const { name, alias } = dep;
          imports.push({
            alias,
            name,
            source: modulePath,
            code: generate(node).code,
          });
        }
      });
    },
    // Dynamic import support
    CallExpression({ node, parent, parentPath }) {
      const { callee, arguments: args, loc } = node;
      if (callee.type === "Import" && args[0].type === "StringLiteral") {
        const source = args[0].value;
        const scopedNaming = (member) => `${source}#${member}`;
        const id = (
          parent && parent.type === "AwaitExpression"
            ? parentPath.parent
            : parent
        ).id;
        if (id && id.type === "ObjectPattern") {
          for (let i = id.properties.length; i--; ) {
            const prop = id.properties[i];
            if (prop.type === "RestElement") {
              break;
            }
            const name = scopedNaming(prop.key.name);
            imports.push({
              alias: name,
              name,
              source,
              code: generate(node).code,
            });
          }
        }
        const name = scopedNaming("default");
        imports.push({
          alias: name,
          name,
          source,
          code: generate(node).code,
        });
      }
    },
    ExportNamedDeclaration({ node }) {
      const { specifiers, source, loc } = node;
      if (!source || !specifiers.length) {
        return;
      }
      specifiers.forEach((specifier) => {
        const dep = getExportSpecifier.default(specifier);
        if (dep) {
          imports.push(
            Object.assign(Object.assign({}, dep), {
              source: source.value,
              code: generate(node).code,
            })
          );
        }
      });
    },
  };
};

module.exports = {
  astImports,
};
