const express = require('express')
const router = express.Router()

const wrapAsync = require('../utils/wrapAsync')

const Campground = require('../models/campground')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

router.get(
	'/',
	wrapAsync(async (req, res) => {
		const campgrounds = await Campground.find({})
		res.render('campgrounds/index', { campgrounds })
	})
)

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new')
})

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	wrapAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground)
		campground.author = req.user._id
		await campground.save()
		req.flash('success', 'Successfully made new campyground')
		res.redirect(`campgrounds/${campground._id}`)
	})
)

router.get(
	'/:id',
	wrapAsync(async (req, res) => {
		const { id } = req.params
		const campground = await Campground.findById(id)
			.populate({
				path: 'reviews',
				populate: {
					path: 'author',
					//may not need all data, consider esp on a larger app how much data per review's author or how many reviews at once
				},
			})
			.populate('author')
		if (!campground) {
			req.flash('error', 'cannot find campground')
			return res.redirect('/campgrounds')
		}
		res.render('campgrounds/show', { campground })
	})
)

router.get(
	'/:id/edit',
	isLoggedIn,
	isAuthor,
	wrapAsync(async (req, res) => {
		const { id } = req.params
		const campground = await Campground.findById(id)
		if (!campground) {
			req.flash('error', 'cannot find campground')
			return res.redirect('/campgrounds')
		}
		res.render('campgrounds/edit', { campground })
	})
)

router.put(
	'/:id',
	isLoggedIn,
	isAuthor,
	validateCampground,
	wrapAsync(async (req, res) => {
		const { id } = req.params
		const campground = await Campground.findByIdAndUpdate(
			id,
			{
				...req.body.campground,
			},
			{ new: true }
		)
		req.flash('success', 'Successfully updated campground')
		res.redirect(`/campgrounds/${campground._id}`)
	})
)

router.delete(
	'/:id',
	isLoggedIn,
	isAuthor,
	wrapAsync(async (req, res) => {
		const { id } = req.params
		const campground = await Campground.findByIdAndDelete(id)
		req.flash('success', 'Successfully deleted campground')
		res.redirect('/campgrounds')
	})
)

module.exports = router
