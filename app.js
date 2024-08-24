require('dotenv').config({path: `${process.cwd()}/.env`});
const express = require('express');
const authRouter = require('./route/authRoute');
const musicRouter = require('./route/musicRoute');
const catchAsync = require('./utils/catchAsync');
const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');

const app = express();

app.use(express.json()); // for parsing application/json



app.use('/api/v1/auth', authRouter);
app.use('/api/v1/music', musicRouter);

// didnt use "*" because it require port reset
app.use('*', catchAsync (async(req, res, next) => {
    throw new AppError(`Can't find ${req.originalUrl} on this server`,404);
    
}));

app.use(globalErrorHandler);

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => {
    console.log('Server is running ',PORT);
    });