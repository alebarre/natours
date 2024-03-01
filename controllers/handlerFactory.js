const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndDelete(request.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    response.status(204).json({
      status: 'success 😁',
      data: null,
    });
  });
