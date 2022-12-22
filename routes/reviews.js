const express = require('express')
const router = express.Router({ mergeParams: true })
//need mergeParams to access params from campground, eg id
const reviews = require('../controllers/reviews')
const wrapAsync = require('../utils/wrapAsync')
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware')

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview))

router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	wrapAsync(reviews.deleteReview)
)

module.exports = router
