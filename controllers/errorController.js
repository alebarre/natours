const AppError = require('../utils/appError');

const handleJwtError = () =>
  new AppError('Invalid token ⛔ Please Login again.', 401);

const handleJwtExpired = () =>
  new AppError('Your Token has expired ⏰ Please Login again.', 401);

const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (error) => {
  const value = error.message.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const errorMessage = Object.values(error.errors).map(
    (element) => element.message,
  );
  const message = `Invalid Input data. ${errorMessage.join('. | ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, response) => {
  //ERROR: Operational -> trusted error: send message to the client
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
    //ERROR: Programming or other -> Unknopw error: Don´t leak errors client
  } else {
    // 1) Log the error
    console.error('ERROR 💥', error);

    // 2) Send a generic message
    response.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.satus || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, response);
  } else if (process.env.NODE_ENV === 'production') {
    let err = error;
    if (err.name === 'CastError') {
      err = handleCastErrorDB(err);
    }
    if (err.code === 1000) {
      err = handleDuplicateFields(err);
    }
    if (err.name === 'ValidationError') {
      err = handleValidationErrorDB(err);
    }
    if (err.name === 'JsonWebTokenError') {
      err = handleJwtError();
    }
    if (err.name === 'TokenExpiredError') {
      err = handleJwtExpired();
    }
    sendErrorProd(err, response);
  }
};
