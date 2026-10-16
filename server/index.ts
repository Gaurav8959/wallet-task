import "dotenv/config";
import "reflect-metadata";
import app from "./configs/express.config";
import { AppDataSource } from "./data-source/data-source";

const PORT = process.env.PORT || 5555;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Connected to DB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
