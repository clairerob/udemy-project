const express = require('express')
const router = express.Router()
const passport = require('passport')
const users = require('../controllers/users')
const wrapAsync = require('../utils/wrapAsync')

router
	.route('/register')
	.get(users.renderRegisterForm)
	.post(wrapAsync(users.registerNewUser))

router
	.route('/login')
	.get(users.renderLoginForm)
	.post(
		passport.authenticate('local', {
			failureFlash: true,
			failureRedirect: '/login',
			keepSessionInfo: true,
		}),
		users.login
	)

//make this post/delete
router.get('/logout', users.logout)

module.exports = router
