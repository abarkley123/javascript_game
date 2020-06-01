import config from "../client_config.mjs";

// Constants
const LEVEL = config.port;

export default function log(message, level) {
    if (shouldLogMessage(level) === true) {
        console.log(message);
    }
}

function shouldLogMessage(level) {
        // debug - info - error
    return getLogLevel(LEVEL) >= getLogLevel(level);
}

function getLogLevel(level) {
    switch(level) {
        case "debug": return 3;
        case "info": return 2;
        case "error": return 1;
        default: return 1;
    }
}