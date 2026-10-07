require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB(process.env.MONGODB_URL);
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
        console.log(`Received ${signal}. Closing server...`);
        server.close(async()=>{
            await mongoose.connection.close();
            process.exit(0);
        });
    };
    process.on("SIGINT",()=>shutdown("SIGINT"));
    process.on("SIGTERM",()=>shutdown("SIGTERM"));
}
startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});