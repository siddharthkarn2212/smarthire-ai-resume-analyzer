require("dotenv").config();
const express = require("express");
const cors = require("cors");
const resumeRoutes = require("./routes/resumeRoutes");
//const { connectDB } = require("./config/db");
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SmartHire API" });
});

app.use("/api", resumeRoutes);

app.use((err, req, res, next) => {
  console.error("ERROR:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   await connectDB();
//   app.listen(PORT, () => {
//     console.log(`SmartHire backend running on port ${PORT}`);
//   });
// };

// startServer();

app.listen(PORT, () => {
  console.log(`SmartHire backend running on port ${PORT}`);
});