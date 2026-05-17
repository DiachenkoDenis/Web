require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');        
const batteryRoutes = require('./routes/battery');  
const { httpsRedirect } = require('./middleware/security'); 

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(httpsRedirect); 


app.use('/auth', authRoutes);
app.use('/api/battery', batteryRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BESS server running on port ${PORT}`);
});
