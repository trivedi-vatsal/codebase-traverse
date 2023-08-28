const { getPatternNames } = require("./astGetPatternNames");
const { getDeclarationNames } = require("./astGetDeclarationNames");
const { default: generate } = require("@babel/generator");

const astRelations = (relations = {}) => {
  let scope = { privates: new Set(), candidates: [] };
  const parentScopes = [];
  const addRefsToPrivates = (refs) => {
    refs.forEach(({ alias }) => scope.privates.add(alias));
  };
  const newScope = () => {
    parentScopes.push(scope);
    scope = { privates: new Set(), candidates: [] };
  };
  const exitScopeHandler = () => {
    if (parentScopes.length <= 1) return;
    const { candidates, privates } = scope;
    const filteredCandidates = candidates.filter(
      (d) => typeof d !== "string" || !privates.has(d)
    );
    scope = parentScopes.pop();
    scope.candidates = Array.from(
      new Set(scope.candidates.concat(filteredCandidates))
    );
    return filteredCandidates;
  };
  return {
    FunctionDeclaration({ node }) {
      if (node.id) {
        scope.privates.add(node.id.name);
      }
    },
    ClassDeclaration({ node }) {
      if (node.id) {
        scope.privates.add(node.id.name);
      }
    },
    VariableDeclaration: {
      enter({ node }) {
        const refs = getDeclarationNames(node);
        if (refs) {
          addRefsToPrivates(refs);
        }
        newScope();
      },
      exit({ node }) {
        const candidates = exitScopeHandler();
        if (parentScopes.length === 1) {
          const refs = getDeclarationNames(node);
          if (refs) {
            refs.forEach(({ alias }) => {
              relations[alias] = {
                dependencies: Array.from(new Set(candidates)),
                code: generate(node).code,
              };
            });
          }
        }
      },
    },
    ExportNamedDeclaration({ node }) {
      if (node.source) {
        node.specifiers.forEach((specifier) => {
          const ref = getModuleRefFromExportSpecifier_1.default(specifier);
          if (ref && !relations[ref.name]) {
            relations[ref.alias] = {
              dependencies: [],
              code: generate(node).code,
            };
          }
        });
      }
    },
    ExportDefaultDeclaration: {
      enter() {
        scope.privates.add("default");
        newScope();
      },
      exit({ node }) {
        const candidates = exitScopeHandler();
        if (parentScopes.length === 1) {
          relations["default"] = {
            dependencies: Array.from(new Set(candidates)),
            code: generate(node).code,
          };
        }
      },
    },
    Scopable: {
      enter(p) {
        newScope();
        if (p.isFunction()) {
          const refs = p.node.params.reduce((ret, param) => {
            return ret.concat(getPatternNames(param));
          }, []);
          addRefsToPrivates(refs);
        } else if (p.isCatchClause()) {
          addRefsToPrivates(getPatternNames(p.node.param));
        }
      },
      exit(p) {
        const { node, parent } = p;
        const candidates = exitScopeHandler();
        if (parentScopes.length === 1) {
          const dedupCandidates = Array.from(new Set(candidates));
          const id = node.id || (parent && parent.id);
          if (id) {
            getPatternNames(id).forEach(({ alias }) => {
              relations[alias] = {
                dependencies: dedupCandidates,
                code: generate(node).code,
              };
            });
          }
        }
      },
    },
    VariableDeclarator({ node }) {
      addRefsToPrivates(getPatternNames(node.id));
    },
    CallExpression({ node }) {
      const { callee, arguments: args } = node;
      // dynamic import
      if (callee.type === "Import" && args[0].type === "StringLiteral") {
        scope.candidates.push({
          source: args[0].value,
          name: "default",
          alias: "",
        });
      }
    },
    Identifier(p) {
      const { node, key } = p;
      const parentPath = p.parentPath;
      // exclude function/class identifier
      if (parentPath.isClass() || parentPath.isFunction()) {
        return;
      }
      if (
        // exclude property
        !p.isProperty() &&
        key !== "property" &&
        !(parentPath.isProperty() && key === "key")
      ) {
        scope.candidates.push(node.name);
      }
    },
    JSXOpeningElement({ node }) {
      let identifier = node.name;
      while (identifier.type === "JSXMemberExpression") {
        identifier = identifier.object;
      }
      if (identifier.type === "JSXIdentifier") {
        scope.candidates.push(identifier.name);
      }
    },
  };
};

module.exports = { astRelations };
