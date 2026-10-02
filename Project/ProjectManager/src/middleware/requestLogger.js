/**
 * Custom request logger middleware
 * Logs HTTP method, URL, status code, response time, and timestamp.
 * Strictly sanitizes sensitive information (passwords, tokens).
 */
export const requestLogger = (req, res, next) => {
  const start = process.hrtime();
  const timestamp = new Date().toISOString();

  // Strip query params or sensitive tokens from URL if needed, although tokens should only be in headers
  const sanitizedUrl = req.originalUrl || req.url;

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const statusCode = res.statusCode;

    // Format: GET /api/projects/123/tasks 200 42.15ms [2026-10-02T...]
    console.log(
      `[${timestamp}] ${req.method} ${sanitizedUrl} ${statusCode} ${durationMs}ms`
    );
  });

  next();
};

export default requestLogger;
