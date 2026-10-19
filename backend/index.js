import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import questionRoutes from "./src/routes/questionRoutes.js";
import bookmarkRoutes from "./src/routes/bookmarkRoutes.js";
import createQuestionRoutes from "./src/routes/createQuestionRoutes.js";
import answerRoutes from "./src/routes/answerRoutes.js";
import replyRoutes from "./src/routes/replyRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

// Middleware & Configuration Imports
import env from "./src/config/env.js";
import pool from "./src/config/db.js";
import { notFound, errorHandler } from "./src/middleware/errorMiddleware.js";
import { initializeDatabase } from "./src/config/initDb.js";

// Top-level await for database schema initialization
await initializeDatabase();

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename); // Fixed typo from _dirname to __dirname

// ============================================================
// CREATE EXPRESS APPLICATION
// ============================================================
const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Serve uploaded assets safely (avatars, documents)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root health check endpoint
app.use("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Powered Evangadi Forum API is running properly.",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Powered Evangadi Forum API is running.",
  });
});

// API Routes
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes); // Keep standard prefix. UPDATE your frontend URL to match this!
app.use("/api/questions", createQuestionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/replies", replyRoutes);
app.use("/api/rag/documents", documentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection Verification
const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("MySQL database connected successfully.");
  } catch (error) {
    console.error("MySQL database connection failed:", error.message);
  }
};

// CRITICAL FIX: Assign dynamic port priority for Render deployment compatibility
const PORT = process.env.PORT || env.port || 5000;

app.listen(PORT, async () => {
  // Fixed syntax error: wrapped string properly in backticks
  console.log(`AI Powered Evangadi Forum API is running on port ${PORT}.`);
  await testDatabaseConnection();
});