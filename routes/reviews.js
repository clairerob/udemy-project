const express = require('express')
const router = express.Router({ mergeParams: true })
//need mergeParams to access params from campground, eg id

const wrapAsync = require('../utils/wrapAsync')

const Campground = require('../models/campground')
const Review = require('../models/review')

const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware')

router.post(
	'/',
	isLoggedIn,
	validateReview,
	wrapAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		const review = new Review(req.body.review)
		review.author = req.user._id
		campground.reviews.push(review)
		//should be doing these saves in parallel, hopefully he revisits?? or i explore
		await review.save()
		await campground.save()
		req.flash('success', 'your review was added!')
		res.redirect(`/campgrounds/${campground._id}`)
	})
)

router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	wrapAsync(async (req, res) => {
		const { id, reviewId } = req.params
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
		await Review.findByIdAndDelete(reviewId)
		req.flash('success', 'your review was deleted!')
		res.redirect(`/campgrounds/${id}`)
	})
)

module.exports = router
