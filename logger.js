const constants = require("./constants");

const formatters = {
  level(label, number) {
    return { level: label };
  },
};

// logger init
const logger = require("pino")({
  level: constants.default_log_level,
  messageKey: "message",
  timestamp: false,
  formatters: formatters,
});

// method init
const log = (message, type = "INFO") => {
  const logg = logger.child({
    timestamp: new Date().toISOString(),
  });
  try {
    switch (type.toUpperCase()) {
      case "INFO":
        logg.info(message);
        break;
      case "DEBUG":
        logg.debug(message);
        break;
      case "WARN":
        logg.warn(message);
        break;
      case "ERROR":
        logg.error(message);
        break;
      default:
        logg.trace(message);
        break;
    }
  } catch (error) {
    logg.error(`Rrror in logging() - ${message}`);
    logg.error(error);
  }
};

module.exports = { log };
