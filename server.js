const app = require("./src/app");
const connectDB = require("./src/config/db");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

// Boot sequence — connect DB first, then start listening
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Base URL: http://localhost:${PORT}/api\n`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database. Exiting...", err.message);
    process.exit(1);
  });