import { Request, Response, NextFunction } from "express";

export const structuredLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime(); // Get high-resolution start time

  // Listen for the 'finish' event, which is emitted when the response has been sent
  res.on("finish", () => {
    // Calculate the duration in milliseconds
    const durationInMilliseconds = getDurationInMilliseconds(start);

    // Create a structured log object
    const logObject = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      ip: req.ip,
      durationMs: parseFloat(durationInMilliseconds.toFixed(3)),
    };

    // Use different console methods based on the status code for leveling
    const logJson = JSON.stringify(logObject);
    
    if (res.statusCode >= 500) {
      // Server errors
      console.error(logJson);
    } else if (res.statusCode >= 400) {
      // Client errors
      console.warn(logJson);
    } else {
      // Successful responses
      console.info(logJson);
    }
  });

  next();
};

// Helper function to calculate duration from process.hrtime
const getDurationInMilliseconds = (start: [number, number]): number => {
    const NS_PER_SEC = 1e9; // Nanoseconds per second
    const NS_TO_MS = 1e6;   // Nanoseconds to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};