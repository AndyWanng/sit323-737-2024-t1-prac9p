const config = require('./config');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');


const uri = process.env.MONGO_URI || 'mongodb://root:password@mongo:27017/admin';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const dbName = 'auth';
const collectionName = 'users';
let db;

const connectDb = async () => {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
    }
    return db;
};
const generateApiKey = () => {
    return crypto.randomBytes(20).toString('hex');
};

const addUser = async (username) => {
    const db = await connectDb();
    const collection = db.collection(collectionName);

    const user = {
        username,
        apiKey: generateApiKey()
    };

    const result = await collection.insertOne(user);

    const insertedUser = {
        _id: result.insertedId,
        ...user,
    };

    return insertedUser;
};


const getUser = async (username) => {
    const db = await connectDb();
    const collection = db.collection(collectionName);

    return collection.findOne({ username });
};

const generateToken = (user) => {
    console.log(config.jwtSecretKey);
    return jwt.sign({ sub: user.username, apiKey: user.apiKey }, config.jwtSecretKey, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecretKey);
    } catch (error) {
        return null;
    }
};

module.exports = {
    addUser,
    getUser,
    generateToken,
    verifyToken
};
