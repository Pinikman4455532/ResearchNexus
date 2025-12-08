const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("MongoDB Atlas Connected...");
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
