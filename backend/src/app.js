const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const { ALLOWED_ORIGINS, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('./config/env');
const errorMiddleware = require('./middleware/errorMiddleware');
const requestLogger = require('./middleware/requestLogger');


const locationRoutes = require('./routes/locationRoutes');
const disasterRoutes = require('./routes/disasterRoutes');
const visualizationRoutes = require('./routes/visualizationRoutes');

const app = express();


app.use(helmet());


app.use(cors({
  origin: ALLOWED_ORIGINS.split(','),
  credentials: true
}));


const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(compression());


app.use(morgan('dev'));
app.use(requestLogger);


app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


app.use('/api/location', locationRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/visualization', visualizationRoutes);


app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});


app.use(errorMiddleware);

module.exports = app;