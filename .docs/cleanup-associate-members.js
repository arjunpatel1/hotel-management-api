// Cleanup Script: Remove Associate Member Records
// Run this script to clean up old "Associate Member" records from the Customer collection

const mongoose = require("mongoose");
const path = require("path");
// Try to load .env from the root directory
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Use environment variables or default to local MongoDB
const DB_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB || "HotelManagement";
const CONNECTION_STRING = DB_URL.includes(DB_NAME) ? DB_URL : `${DB_URL}/${DB_NAME}`;

async function cleanupAssociateMembers() {
    try {
        console.log(`🔌 Connecting to database: ${CONNECTION_STRING}`);

        // Connect to MongoDB
        await mongoose.connect(CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Connected to MongoDB");

        // Define strict schema only for what we need
        const Customer = mongoose.models.Customer || mongoose.model("Customer", new mongoose.Schema({
            phoneNumber: String,
            firstName: String,
            lastName: String
        }, { strict: false }));

        // Find all associate members (customers without phone numbers)
        // Criteria: phoneNumber is missing, null, empty string, or whitespace
        const associateMembers = await Customer.find({
            $or: [
                { phoneNumber: { $exists: false } },
                { phoneNumber: null },
                { phoneNumber: "" },
                { phoneNumber: " " }
            ]
        });

        console.log(`\n📊 Found ${associateMembers.length} associate member records to delete`);

        if (associateMembers.length === 0) {
            console.log("✅ No associate members found. Database is clean!");
            process.exit(0);
        }

        // Show sample of records to be deleted
        console.log("\n📋 Sample records to be deleted:");
        associateMembers.slice(0, 5).forEach((member, index) => {
            console.log(`${index + 1}. ${member.firstName} ${member.lastName} - ID: ${member._id}`);
        });

        if (associateMembers.length > 5) {
            console.log(`   ... and ${associateMembers.length - 5} more`);
        }

        // ENABLE DELETION
        const confirmDelete = true;

        if (!confirmDelete) {
            console.log("\n❌ Deletion not confirmed. Set confirmDelete = true in the script to proceed.");
            process.exit(0);
        }

        // Delete associate members
        const result = await Customer.deleteMany({
            $or: [
                { phoneNumber: { $exists: false } },
                { phoneNumber: null },
                { phoneNumber: "" },
                { phoneNumber: " " }
            ]
        });

        console.log(`\n✅ Successfully deleted ${result.deletedCount} associate member records`);
        console.log("🎉 Customer collection is now clean!");

        // Show statistics
        const remainingCustomers = await Customer.countDocuments();
        console.log(`\n📊 Remaining customers (primary customers only): ${remainingCustomers}`);

    } catch (error) {
        console.error("❌ Error during cleanup:", error);
    } finally {
        await mongoose.connection.close();
        console.log("\n✅ Database connection closed");
        process.exit(0);
    }
}

// Run the cleanup
cleanupAssociateMembers();
