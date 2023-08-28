const getImportSpecifier = (specifier) => {
  const alias = specifier.local.name;
  switch (specifier.type) {
    case "ImportSpecifier":
      return {
        name: specifier.imported.name,
        alias,
      };
    case "ImportDefaultSpecifier":
      return {
        name: "default",
        alias,
      };
    case "ImportNamespaceSpecifier":
      return {
        name: "default",
        alias,
      };
  }
  return null;
};

module.exports = {
  getImportSpecifier,
};
