import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./database/db";
import { seedMailConfig, seedMailTemplates } from "./seeds/seedMail";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Run mail seeds (idempotent — only creates if missing)
    await seedMailConfig();
    await seedMailTemplates();

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port : ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();