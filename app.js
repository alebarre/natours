const path = require('path');
const express = require('express');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES ##############################

//Serving statics files
app.use(express.static(path.join(__dirname, 'public')));

//Security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  //Development login
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  //limits the request from the same IP
  max: 100,
  windowMs: 60 * 60 * 1000, //100 requests for the same IP for 1 hour
  message: '🖐️Too many request from the same IP. Please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from the body into request.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization in MongoDB
// Works against 'NoSQL' query injection.
// Will filter all the '$' and "." against this injecctions tries about mongoDB
app.use(mongoSanitize());

//Data sanitization against Cross Site atack XSS.
//Against some maliciuos code like javascript code against it, converting all the http symbols.
app.use(xss());

// Prevent parameter pollution.
// In this case, creates a 'whitelist' with the parameters that will excluded from "possible" pollution attempt because could be well used in application
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//Serving statics files
app.use(express.static(path.join(__dirname, 'public')));

//Test middleware
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

//3) ROUTES ##############################

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
