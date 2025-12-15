// cors/corsOptions.js

const allowedOrigins = [
  "http://localhost:5173", // Vite (frontend)
  "http://localhost:5174", // (optional) Vite alternate port
  "http://localhost:3000", // Next.js/React
  "https://biteflow.vercel.app", // ✅ Deployed frontend (Vercel)
  // Add your custom domain here later if you use one
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow mobile apps / Postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // More helpful error for debugging
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },

  credentials: true, // ✅ allow cookies (required for withCredentials)
  optionsSuccessStatus: 200,

  // ✅ Added for better control & smoother preflight handling
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
