const Review = require('../models/reviewsModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (request, response) => {
  const reviews = await Review.find();

  response.status(200).json({
    status: '😁success',
    results: reviews.lenght,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (request, response, next) => {
  const newReview = await Review.create(request.body);

  response.status(201).json({
    status: '😁success',
    data: {
      revew: newReview,
    },
  });
});
