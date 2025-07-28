const allowedOrigins = [
  process.env.FRONTEND_URL, // The URL from your .env file
  'http://localhost:3000', // Main React app (from package.json)
  'http://localhost:3001', // Admin panel (from previous app.js config)
  'http://localhost:3006', // Frontend development port
  'http://localhost:5173', // Common Vite/React dev port
];

/**
 * @type {import('cors').CorsOptions}
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-XSRF-TOKEN',
    'XSRF-TOKEN',
    'Cache-Control',
    'Pragma',
    'Expires',
    'If-Modified-Since',
  ],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: true, // This is crucial for sending cookies or auth headers.
  optionsSuccessStatus: 204,
  preflightContinue: false,
};

module.exports = corsOptions;