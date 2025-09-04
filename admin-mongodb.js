// MongoDB Atlas connection for client-side (using MongoDB Atlas Data API)
const MONGODB_API_URL = 'https://data.mongodb-api.com/app/data-xxxxx/endpoint/data/v1';
const MONGODB_API_KEY = 'YOUR_API_KEY_HERE'; // You'll need to get this from MongoDB Atlas

// Database and collection names
const DB_NAME = 'senior_ideas_db';
const COLLECTIONS = {
    IDEAS: 'ideas',
    USERS: 'users'
};

// Allowed admin emails
const ALLOWED_ADMIN_EMAILS = [
    'younes.ahmad2024@gmail.com',
    'Adamyf2005@hotmail.com',
    'Hussein.m.jaber23@gmail.com',
    'ay589641@gmail.com',
    'Y2005baba@gmail.com'
];

// MongoDB Atlas Data API functions
class MongoDBClient {
    constructor() {
        this.apiUrl = MONGODB_API_URL;
        this.apiKey = MONGODB_API_KEY;
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.apiUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKey
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('MongoDB API request failed:', error);
            throw error;
        }
    }

    // Get all ideas
    async getIdeas() {
        const endpoint = `/action/find`;
        const data = {
            collection: COLLECTIONS.IDEAS,
            database: DB_NAME,
            filter: {}
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Add new idea
    async addIdea(idea) {
        const endpoint = `/action/insertOne`;
        const data = {
            collection: COLLECTIONS.IDEAS,
            database: DB_NAME,
            document: {
                ...idea,
                createdAt: new Date().toISOString(),
                status: 'pending'
            }
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Get all users
    async getUsers() {
        const endpoint = `/action/find`;
        const data = {
            collection: COLLECTIONS.USERS,
            database: DB_NAME,
            filter: {}
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Add new user
    async addUser(user) {
        const endpoint = `/action/insertOne`;
        const data = {
            collection: COLLECTIONS.USERS,
            database: DB_NAME,
            document: {
                ...user,
                createdAt: new Date().toISOString()
            }
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Admin login
    async adminLogin(email, password) {
        const endpoint = `/action/findOne`;
        const data = {
            collection: COLLECTIONS.USERS,
            database: DB_NAME,
            filter: {
                email: email,
                password: password,
                isAdmin: true
            }
        };
        return await this.makeRequest(endpoint, 'POST', data);
    }

    // Ensure admin users exist
    async ensureAdminUsers() {
        for (let i = 0; i < ALLOWED_ADMIN_EMAILS.length; i++) {
            const email = ALLOWED_ADMIN_EMAILS[i];
            
            // Check if admin user exists
            const endpoint = `/action/findOne`;
            const data = {
                collection: COLLECTIONS.USERS,
                database: DB_NAME,
                filter: { email: email }
            };
            
            try {
                const existingUser = await this.makeRequest(endpoint, 'POST', data);
                
                if (!existingUser.document) {
                    // Create admin user
                    const adminUser = {
                        name: `Admin User ${i + 1}`,
                        email: email,
                        password: 'admin123',
                        isAdmin: true,
                        createdAt: new Date().toISOString()
                    };
                    
                    await this.addUser(adminUser);
                    console.log('Created admin user:', email);
                } else {
                    // Update existing user to ensure correct password and admin status
                    const updateEndpoint = `/action/updateOne`;
                    const updateData = {
                        collection: COLLECTIONS.USERS,
                        database: DB_NAME,
                        filter: { email: email },
                        update: {
                            $set: {
                                password: 'admin123',
                                isAdmin: true
                            }
                        }
                    };
                    
                    await this.makeRequest(updateEndpoint, 'POST', updateData);
                    console.log('Updated admin user:', email);
                }
            } catch (error) {
                console.error('Error ensuring admin user:', email, error);
            }
        }
    }
}

// Create global MongoDB client instance
const mongoClient = new MongoDBClient();

// Export for use in other files
window.MongoDBClient = MongoDBClient;
window.mongoClient = mongoClient;
window.ALLOWED_ADMIN_EMAILS = ALLOWED_ADMIN_EMAILS;