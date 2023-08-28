const setFunctionArgs = (arg = "") => {
  try {
    if (arg == "") {
      return "";
    }

    return arg;
  } catch (e) {
    console.log(e);
    return "";
  }
};

module.exports = {
  setFunctionArgs,
};
