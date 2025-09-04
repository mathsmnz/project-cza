// src/config/gridfs.config.ts
import mongoose from "mongoose";
import { Db } from "mongodb";

// We will export a bucket instance that gets initialized once
export let gfs: mongoose.mongo.GridFSBucket;

export const initGridFS = (db: Db) => {
  gfs = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "uploads",
  });
  console.log("✅ GridFS Initialized.");
};
