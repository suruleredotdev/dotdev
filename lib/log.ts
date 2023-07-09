export function log(level: "INFO" | "DEBUG" | "ERROR", ...body: any[]) {
  const levels = [
    "INFO", // debug INFO
    "DEBUG", // debug DEBUG
    "ERROR", // debug ERROR
    // each subsequent level logs messages for previous levels
  ];
  const shouldLog = levels
    .slice(levels.indexOf(level))
    .includes(process.env.DEBUG?.toUpperCase());
  const logType: "warn" | "log" = level === "ERROR" ? "warn" : "log";
  if (shouldLog) console[logType](...body);
}
