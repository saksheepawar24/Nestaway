const express = require('express');
const router = express.Router({ mergeParams: true });

//files
const Listing = require("../models/listings");
const Reviews = require("../models/reviews");
const wrapAsync = require("../utils/wrapAsync");
const { validateReviews, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/reviews");

//Reviews Routes
router.post("/", isLoggedIn, validateReviews, wrapAsync(reviewController.postReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;