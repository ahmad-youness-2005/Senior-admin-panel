const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToMongoDB, getDatabase, COLLECTIONS } = require('./mongodb-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Connect to MongoDB
connectToMongoDB().catch(console.error);

// Routes

// Get all ideas
app.get('/api/ideas', async (req, res) => {
    try {
        const db = await getDatabase();
        const ideas = await db.collection(COLLECTIONS.IDEAS).find({}).toArray();
        res.json(ideas);
    } catch (error) {
        console.error('Error fetching ideas:', error);
        res.status(500).json({ error: 'Failed to fetch ideas' });
    }
});

// Add new idea
app.post('/api/ideas', async (req, res) => {
    try {
        const db = await getDatabase();
        const idea = {
            ...req.body,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        const result = await db.collection(COLLECTIONS.IDEAS).insertOne(idea);
        res.json({ id: result.insertedId, ...idea });
    } catch (error) {
        console.error('Error adding idea:', error);
        res.status(500).json({ error: 'Failed to add idea' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const db = await getDatabase();
        const users = await db.collection(COLLECTIONS.USERS).find({}).toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Add new user
app.post('/api/users', async (req, res) => {
    try {
        const db = await getDatabase();
        const user = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const result = await db.collection(COLLECTIONS.USERS).insertOne(user);
        res.json({ id: result.insertedId, ...user });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: 'Failed to add user' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await getDatabase();
        const admin = await db.collection(COLLECTIONS.USERS).findOne({ 
            email, 
            password, 
            isAdmin: true 
        });
        
        if (admin) {
            res.json({ success: true, admin });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Serve the admin panel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.listen(PORT, () => {
    console.log(`Admin panel server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});