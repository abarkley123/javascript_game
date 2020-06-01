import config from "../client_config.mjs";

// Constants
const LEVEL = config.port;

export default function log(message, level) {
    if (shouldLogMessage(level) === true) {
        console.log("[" + getDate() + "] - " + message);
    }
}

// get the date/time and adjust for the timezone
function getDate() {
    let date = new Date(Date.now());
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() + (offset*60*1000));
    return date.toISOString().split('.')[0].replace("T", " ");
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