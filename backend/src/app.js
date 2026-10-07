const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const requirementRoutes = require("./routes/requirementRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();


app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "100kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/requirements", requirementRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;