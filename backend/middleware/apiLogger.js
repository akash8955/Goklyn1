// Simple in-memory API request logger by IP and endpoint (for dev/debug only)
const apiRequestCounts = {};

function apiLogger(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const endpoint = req.originalUrl.split('?')[0];
  const key = `${ip}|${endpoint}`;

  if (!apiRequestCounts[key]) {
    apiRequestCounts[key] = { count: 0, last: null };
  }
  apiRequestCounts[key].count += 1;
  apiRequestCounts[key].last = new Date();

  // Optionally, log every Nth request for visibility
  if (apiRequestCounts[key].count % 10 === 0) {
    console.log(`[API LOG] ${ip} called ${endpoint} ${apiRequestCounts[key].count} times (last: ${apiRequestCounts[key].last.toLocaleString()})`);
  }

  // Attach for debugging if needed
  req.apiRequestCounts = apiRequestCounts;
  next();
}

// Utility to print all counts (call from a route or REPL if needed)
apiLogger.printStats = function () {
  Object.entries(apiRequestCounts).forEach(([key, val]) => {
    const [ip, endpoint] = key.split('|');
    console.log(`IP: ${ip}, Endpoint: ${endpoint}, Count: ${val.count}, Last: ${val.last}`);
  });
};

module.exports = apiLogger;
