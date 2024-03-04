const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('../controllers/handlerFactory');

const filterObj = (obj, ...alowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((element) => {
    if (alowedFields.includes(element)) {
      newObj[element] = obj[element];
    }
  });
  return newObj;
};

exports.getMe = (request, response, next) => {
  request.params.id = request.user.id;
  next();
};

exports.updateMe = catchAsync(async (request, response, next) => {
  // 1) Create error if users POSTs password data
  if (request.body.password || request.body.passwordConfirm) {
    return next(
      new AppError(
        '🫤This route is not for passeord updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2) Update user document
  // After all, we nedd to filter only the arguments that are be alloewd to be updated
  // 'filterObj' will do this and will store in 'filteredBody'
  const filteredBody = filterObj(request.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(
    request.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  );

  response.status(200).json({
    status: '😁 success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (request, response, next) => {
  await User.findByIdAndUpdate(request.user.id, { active: false });

  response.status(204).json({
    status: '😁 success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

exports.createUser = (request, response) => {
  response.status(500).json({
    status: '☹️ error',
    message: 'This route is not yet defined...',
  });
};

//Do NOT update passwords using this.
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
