const express = require('express');
const router = express.Router();
const { authRole } = require('./auth');

let batteryState = {
    charge: 50,      
    status: 'idle'   
};


router.get('/status', authRole(), (req, res) => {
    res.json(batteryState);
});


router.post('/charge', authRole(), (req, res) => {
    const { mode, amount } = req.body; // mode = charge/discharge
    if (!['charge','discharge'].includes(mode)) return res.status(400).json({ error: 'Invalid mode' });

    batteryState.status = mode;
    batteryState.charge += mode === 'charge' ? amount : -amount;
    batteryState.charge = Math.max(0, Math.min(100, batteryState.charge));
    res.json({ message: `Battery ${mode}d`, state: batteryState });
});


router.post('/emergency-stop', authRole('supervisor'), (req, res) => {
    batteryState.status = 'emergency';
    res.json({ message: 'Emergency stop activated', state: batteryState });
});

module.exports = router;
