// MongoDB Configuration for Admin Panel
const { MongoClient } = require('mongodb');

// Your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://admin:Ahmad2005Younes123@seniroldeas.01cnqvk.mongodb.net/?retryWrites=true&w=majority&appName=SeniroIdeas';

// Database name
const DB_NAME = 'senior_ideas_db';

// Collections
const COLLECTIONS = {
    IDEAS: 'ideas',
    USERS: 'users',
    ADMIN_SETTINGS: 'admin_settings'
};

// MongoDB client
let client = null;
let db = null;

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        if (!client) {
            client = new MongoClient(MONGODB_URI);
            await client.connect();
            console.log('Connected to MongoDB Atlas');
        }
        
        if (!db) {
            db = client.db(DB_NAME);
        }
        
        return { client, db };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

// Get database instance
async function getDatabase() {
    if (!db) {
        await connectToMongoDB();
    }
    return db;
}

// Close connection
async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB connection closed');
    }
}

// Export functions
module.exports = {
    connectToMongoDB,
    getDatabase,
    closeConnection,
    COLLECTIONS,
    DB_NAME
};