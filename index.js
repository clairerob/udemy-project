const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const wrapAsync = require('./utils/wrapAsync')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas')

main().catch((err) => console.log(err))

async function main() {
	await mongoose.connect('mongodb://localhost:27017/yelp-camp')
	console.log('mongo connected')
}

app.engine('ejs', engine)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)
	console.log(error)
	if (error) {
		const msg = error.details.map((el) => el.message).join(',')
		throw new ExpressError(msg, 400)
	} else {
		next()
	}
}

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body)
	if (error) {
		const msg = error.details.map((el) => el.message).join(',')
		throw new ExpressError(msg, 400)
	} else {
		next()
	}
}

app.get('/', (req, res) => {
	res.render('home')
})
app.get(
	'/campgrounds',
	wrapAsync(async (req, res) => {
		const campgrounds = await Campground.find({})
		res.render('campgrounds/index', { campgrounds })
	})
)

app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new')
})

app.post(
	'/campgrounds',
	validateCampground,
	wrapAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground)
		await campground.save()
		res.redirect(`campgrounds/${campground._id}`)
	})
)

app.get(
	'/campgrounds/:id',
	wrapAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate(
			'reviews'
		)
		res.render('campgrounds/show', { campground })
	})
)

app.get(
	'/campgrounds/:id/edit',
	wrapAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		res.render('campgrounds/edit', { campground })
	})
)

app.put(
	'/campgrounds/:id',
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
		res.redirect(`/campgrounds/${campground._id}`)
	})
)

app.delete(
	'/campgrounds/:id',
	wrapAsync(async (req, res) => {
		const { id } = req.params
		const campground = await Campground.findByIdAndDelete(id)
		res.redirect('/campgrounds')
	})
)

app.post(
	'/campgrounds/:id/reviews',
	validateReview,
	wrapAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id)
		const review = new Review(req.body.review)
		campground.reviews.push(review)
		//should be doing this in parallel, hopefully he revisits?? or i explore
		await review.save()
		await campground.save()
		res.redirect(`/campgrounds/${campground._id}`)
	})
)

app.delete(
	'/campgrounds/:id/reviews/:reviewId',
	wrapAsync(async (req, res) => {
		const { id, reviewId } = req.params
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
		await Review.findByIdAndDelete(reviewId)
		res.redirect(`/campgrounds/${id}`)
	})
)

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err
	if (!err.message) err.message = 'oh no what happened that is not great'
	res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
	console.log('serving on port 3000')
})
