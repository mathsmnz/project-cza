import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import http from "http";
import app from "./app";
import { initGridFS } from "./config/gridfs.config";

import User from "./models/user.model";
import Project from "./models/project.model";

import fs from "fs";
import path from "path";

// Helper to read package.json
const readPackageJson = () => {
  try {
    const pkgPath = path.resolve(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return { version: pkg.version || "N/A" };
  } catch (error) {
    return { version: "N/A" };
  }
};

const PORT = process.env.PORT || 4001;
const BASE_MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/";
const DB_NAME = process.env.DB_NAME || "default-db";
const MONGO_URI = BASE_MONGO_URI + DB_NAME;

const server = http.createServer(app);

// Helper function to format bytes into a readable string
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const startServer = async () => {
  try {
    // --- Environment & Build Info ---
    const { version } = readPackageJson();
    const nodeEnv = process.env.NODE_ENV || "development";
    const gitCommitHash = process.env.GIT_COMMIT_HASH || "N/A"; // Injected during build

    console.log("----------------------------------------------------");
    console.log(`🚀 Starting ${process.env.APP_NAME || "Server"} v${version}`);
    console.log(`-  Environment: ${nodeEnv}`);
    console.log(`-  Git Commit: ${gitCommitHash}`);
    console.log(`-  Process ID: ${process.pid}`);
    console.log("----------------------------------------------------");

    // --- Database Connection ---
    console.log(`-  Connecting to MongoDB: ${DB_NAME}`);
    const conn = await mongoose.connect(MONGO_URI);

    if (!conn.connection.db) {
      throw new Error("MongoDB connection failed: database is undefined.");
    }

    console.log("✅ MongoDB connected successfully.");

    initGridFS(conn.connection.db);

    console.log("✅ GridFS initialized.");

    // --- Database & File System Statistics ---
    console.log("-  Fetching data statistics...");

    // Fetch User and Project counts
    const userCount = await User.countDocuments();
    const projectCount = await Project.countDocuments();

    // Fetch File stats using an aggregation pipeline
    const filesCollection = mongoose.connection.db.collection('fs.files');
    const fileStatsArr = await filesCollection.aggregate([
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSizeInBytes: { $sum: '$length' }
        }
      }
    ]).toArray();
    
    const fileStats = fileStatsArr[0] || { totalFiles: 0, totalSizeInBytes: 0 };

    // Display the stats
    console.log("\n📊 --- Data Stats ---");
    console.log(`  - 🧑‍💻 Total Users:    ${userCount}`);
    console.log(`  - 🏗️ Total Projects: ${projectCount}`);
    console.log(`  - 📁 Total Files:    ${fileStats.totalFiles}`);
    console.log(`  - 💾 Total Size:     ${formatBytes(fileStats.totalSizeInBytes)}`);
    console.log("--------------------\n");

    server.listen(PORT, () => {
      console.log(`✅ Server is ready and listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("🔴 Server startup failed:", err);
    process.exit(1);
  }
};

// --- GRACEFUL SHUTDOWN LOGIC ---
const gracefulShutdown = (signal: string) => {
  process.on(signal, async () => {
    console.log(`\n👋 Received ${signal}. Starting graceful shutdown...`);

    // Stop the server from accepting new connections
    server.close(async () => {
      console.log("✅ HTTP server closed.");

      // Close the MongoDB connection
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed.");

      // Exit the process
      process.exit(0);
    });
  });
};

// Listen for shutdown signals
gracefulShutdown("SIGINT"); // For Ctrl+C
gracefulShutdown("SIGTERM"); // For termination signals from services like Docker/Kubernetes

startServer();
