// index.ts
import "dotenv/config";
import cors from "cors";
import app from "./server.js";
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
const PORT = Number(process.env.PORT) || 4000; // 4000 locally, 8080 in Railway
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
app.get("/", (_, res) => res.send("backend is live"));
app.get("/api/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
