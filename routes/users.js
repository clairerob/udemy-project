const express = require('express')
const router = express.Router()
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')

const wrapAsync = require('../utils/wrapAsync')
const ExpressError = require('../utils/ExpressError')

const User = require('../models/user')

router.get('/register', (req, res) => {
	res.render('users/register')
})
router.post(
	'/register',
	wrapAsync(async (req, res, next) => {
		try {
			const { email, username, password } = req.body
			const user = new User({ email, username })
			const registeredUser = await User.register(user, password)
			req.login(registeredUser, (err) => {
				if (err) return next(err)
				req.flash('success', 'welcome to Yelp Camp!')
				res.redirect('/campgrounds')
			})
		} catch (e) {
			req.flash('error', e.message)
			res.redirect('register')
		}
	})
)

router.get('/login', (req, res) => {
	res.render('users/login')
})
router.post(
	'/login',
	passport.authenticate('local', {
		failureFlash: true,
		failureRedirect: '/login',
		keepSessionInfo: true,
	}),
	(req, res) => {
		req.flash('success', 'welcome back!')
		const redirectUrl = req.session.returnTo || '/campgrounds'
		delete req.session.returnTo
		res.redirect(redirectUrl)
	}
)

//make this post/delete
router.get('/logout', (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err)
		req.flash('success', 'Goodbye!')
		res.redirect('/campgrounds')
	})
})

module.exports = router
