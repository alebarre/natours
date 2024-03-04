const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

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

exports.updateOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('💥 No document found with that ID', 404));
    }

    response.status(200).json({
      status: 'success 😁',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (request, response, next) => {
    const doc = await Model.create(request.body);

    response.status(201).json({
      status: 'success 😁',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(new AppError('💥 No Document found with that ID', 404));
    }
    response.status(200).json({
      status: 'success 😁',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (request, response, next) => {
    //To allow nested GET reviews on Tour (hack)
    let filter = {};
    if (request.params.tourId) {
      filter = { tour: request.params.tourId };
    }

    const features = new APIFeatures(Model.find(filter), request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    response.status(200).json({
      status: 'success 😁',
      requestedAt: request.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
