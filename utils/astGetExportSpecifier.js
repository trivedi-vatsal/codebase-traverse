const getExportSpecifier = (specifier) => {
  if (specifier.type === "ExportSpecifier") {
    const alias = specifier.exported.name;
    return {
      name: specifier.local.name,
      alias,
    };
  }
  return null;
};

module.exports = {
  getExportSpecifier,
};
