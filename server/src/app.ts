import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { routes } from "./routes";
import { prismaDisconnect } from "./lib/prisma";
import { startServer } from "./lib/startServer";
import { kafkaDisconnect } from "./lib/kafka";
import { config } from "dotenv";

config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

startServer(app);

process.on("SIGINT", async () => {
  await prismaDisconnect();
  await kafkaDisconnect();
  process.exit(0);
});
