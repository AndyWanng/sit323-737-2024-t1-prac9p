const express = require('express');
const router = express.Router();
const authService = require('./authService');
const logger = require('./utils/logger');

router.post('/register', async (req, res) => { // 添加 async 关键字
    const { username } = req.body;
    if (!username) {
        logger.error('Registration failed: username is required.');
        return res.status(400).json({ message: 'Username is required.' });
    }
    try {
        const user = await authService.addUser(username);
        logger.info(`User registered: ${username}`);
        res.status(201).json(user);
    } catch (error) {
        logger.error(`Registration failed: ${error.message}`);
        res.status(500).json({ message: 'Registration failed due to server error.' });
    }
});


router.post('/login', async (req, res) => {
    const { username, apiKey } = req.body;
    try {
        const user = await authService.getUser(username);
        if (!user || user.apiKey !== apiKey) {
            logger.error('Login failed: Invalid username or apiKey.');
            return res.status(401).json({ message: 'Invalid username or apiKey.' });
        }
        const token = authService.generateToken(user);
        logger.info(`User logged in: ${username}`);
        res.json({ token });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/verifyToken', (req, res) => {
    const { token } = req.body;
    try {
        const user = authService.verifyToken(token);
        res.json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or expired.' });
    }
});

module.exports = router;
