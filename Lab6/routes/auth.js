const express = require('express');
const router = express.Router();
const crypto = require('crypto');


const users = []; 


router.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    if (!['operator', 'supervisor'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const exists = users.find(u => u.username === username);
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    users.push({ username, passwordHash, role });
    res.json({ message: 'Registered successfully' });
});


router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const token = crypto.randomBytes(16).toString('hex');
    user.token = token;
    res.json({ message: 'Logged in', token, role: user.role });
});


function authRole(requiredRole) {
    return (req, res, next) => {
        const token = req.headers['x-auth-token'];
        const user = users.find(u => u.token === token);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });
        if (requiredRole && user.role !== requiredRole) return res.status(403).json({ error: 'Forbidden' });
        req.user = user;
        next();
    };
}

module.exports = router;
module.exports.authRole = authRole;
