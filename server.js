import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

// fix __dirname (مهم)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static files
app.use(express.static(path.join(__dirname, "dist/public")));

// fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/public/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});