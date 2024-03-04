const Review = require('../models/reviewsModel');
const factory = require('../controllers/handlerFactory');

exports.setTourUserIds = (request, response, next) => {
  //Allow the params needed to implements nested routes
  if (!request.body.tour) {
    request.body.tour = request.params.tourId;
  }
  if (!request.body.user) {
    request.body.users = request.params.id;
  }
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
