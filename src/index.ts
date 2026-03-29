import express from "express";
import path from "path";
import { userRouter } from "./routes/users";
import { nameRouter } from "./routes/names";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// API routes
app.use("/api/users", userRouter);
app.use("/api/names", nameRouter);

// Serve React frontend
const frontendPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendPath));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
