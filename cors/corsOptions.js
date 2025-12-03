// cors/corsOptions.js
const allowedOrigins = [
  "http://localhost:5173",  // Vite (frontend)
  "http://localhost:3000",  // Next.js/React
  // Add your deployed frontend URL here later
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow mobile apps / Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies
  optionsSuccessStatus: 200,
};

export default corsOptions;
