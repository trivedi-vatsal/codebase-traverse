const getPatternNames = (pattern) => {
  switch (pattern.type) {
    case "Identifier":
      return [
        {
          name: pattern.name,
          alias: pattern.name,
        },
      ];
    case "ArrayPattern":
      return pattern.elements.reduce((ret, el) => {
        return el ? ret.concat(getPatternNames(el)) : ret;
      }, []);
    case "ObjectPattern":
      return pattern.properties.reduce((ret, prop) => {
        let next = prop.type === "RestElement" ? prop.argument : prop.value;
        if (next) {
          return ret.concat(getPatternNames(next));
        } else {
          console.warn(
            `getPatternNames - ObjectPattern next is invalid! Value: ${next}.`
          );
          return ret;
        }
      }, []);
    case "RestElement":
      return getPatternNames(pattern.argument);
  }
  return [];
};

module.exports = {
  getPatternNames,
};
