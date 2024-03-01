const Review = require('../models/reviewsModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

exports.getAllReviews = catchAsync(async (request, response) => {
  let filter = {};

  if (request.params.tourId) {
    filter = { tour: request.params.tourId };
  }

  const reviews = await Review.find(filter);

  response.status(200).json({
    status: '😁success',
    results: reviews.lenght,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (request, response, next) => {
  //Allow the params needed to implements nested routes
  if (!request.body.tour) {
    request.body.tour = request.params.tourId;
  }
  if (!request.body.user) {
    request.body.users = request.params.id;
  }

  const newReview = await Review.create(request.body);

  response.status(201).json({
    status: '😁success',
    data: {
      revew: newReview,
    },
  });
});

exports.deleteReview = factory.deleteOne(Review);
