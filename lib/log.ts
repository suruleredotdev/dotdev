const levels = [
  "INFO", // debug INFO
  "DEBUG", // debug DEBUG
  "ERROR", // debug ERROR
  // each subsequent level logs messages for previous levels
];

export function log(level: "INFO" | "DEBUG" | "ERROR", ...body: any[]) {
  const logLevelSetting = (process.env.LOG_LEVEL || process.env.DEBUG)?.toUpperCase() || "INFO";

  const shouldLog = levels
    .slice(levels.indexOf(level))
    .includes(logLevelSetting);

  const logType: "warn" | "log" = level === "ERROR" ? "warn" : "log";
  if (shouldLog) console[logType](...body);
}
