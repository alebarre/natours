/* eslint-disable no-use-before-define */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

exports.singUp = catchAsync(async (request, response, next) => {
  const newUser = await User.create({
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
    role: request.body.role,
    passwordConfirm: request.body.passwordConfirm,
    passwordChangedAt: request.body.passwordChangedAt,
    passwordResetToken: request.body.passwordResetToken,
    passwordResetExpires: request.body.passwordResetExpires,
  });

  const token = await generateJWT(newUser._id);

  response.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

function generateJWT(id) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      },
    );
  });
}

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;

  // 1) Check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please, provide email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect E-mail or Password', 401));
  }

  // 3) If everithing is Ok, send the token to the client
  const token = await generateJWT(user._id);
  response.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (request, response, next) => {
  // 1) Getting the token and check if it´s there
  let token;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith('Bearer')
  ) {
    token = request.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please proceed to Login!', 401),
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'Sorry...☹️ The user owner of this token no longer exist.',
        400,
      ),
    );
  }

  // 4) Check if user changed the password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        '🚫 User recently changed the password! Please, login again.',
        401,
      ),
    );
  }

  //If reaches here, grants access to the next route.
  request.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (request, response, next) => {
    // roles ['admin', 'lead-guide']
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError(
          'Sorry...🫤 , You do not have permission to perform this action',
          403,
        ),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (request, response, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    return next(new AppError('👎There is no user with provided email', 404));
  }

  // 2) Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user email
  const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `🫤 Forgot your password? \n\nSubmit a PATCH request with your new password and passwordConfirm to adress below: \n\n➡️${resetURL}.\n\nIf you didn't, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset Token! ⏲️ Valid only for 10 minutes',
      message,
    });

    response.status(200).json({
      status: 'success 😁',
      message: 'Token sent to email!📨',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        '☹️ There was an error sending the email. Try again a little later!',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (request, response, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(request.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken, //find the user with hashedToken
    passwordResetExpires: { $gt: Date.now() }, //Verify if the tken has expired
  });

  // 2) If token has no expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  user.password = request.body.password;
  user.passwordConfirm = request.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Update changedPasswordAt propoerty for the user

  // 4) Log the user in, send JWT
  const token = await generateJWT(user._id);
  response.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = (request, response, next) => {
  // 1) Get user from colletction
  // 2) Check if POSTed current password is correct
  // 3) If it is correct, then, update password
  // 4) Log user in, send JWT
};
