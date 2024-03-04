const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// We have to set "mergeParams: true" in order to enabling receive tour ID that will come through tours route, when needed.
const router = express.Router({ mergeParams: true });

//IMPORTANT
//All of the routes below needs to be protectd, so we don´t need to implemenst the same in each one of them.
//Using the middleware below all other lines right below them will be protected, just because the middlewares run in sequence.
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
