if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const MongoStore = require('connect-mongo')

main().catch((err) => console.log(err))

async function main() {
	await mongoose.connect(dbUrl)
	console.log('mongo connected')
}

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(mongoSanitize())

//download some of this stuff
const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net',
	'https://res.cloudinary.com/dxbzza0xl/',
]
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net',
	'https://res.cloudinary.com/dxbzza0xl/',
]
const connectSrcUrls = [
	'https://api.mapbox.com/',
	'https://*.tiles.mapbox.com/',
	'https://events.mapbox.com/',
	'https://res.cloudinary.com/dxbzza0xl/',
]
const fontSrcUrls = ['https://res.cloudinary.com/dxbzza0xl/']

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ['self', ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: [
				"'self'",
				'blob:',
				'data:',
				'https://res.cloudinary.com/dxbzza0xl/',
				'https://images.unsplash.com/',
			],
			fontSrc: ["'self'", ...fontSrcUrls],
			mediaSrc: ['https://res.cloudinary.com/dxbzza0xl/'],
			childSrc: ['blob:'],
		},
	})
)

const secret = process.env.SECRET || 'biiiglamemystery'

const store = MongoStore.create({
	mongoUrl: dbUrl,
	crypto: {
		secret,
	},
	touchAfter: 24 * 60 * 60, //lazy update the session by limiting a period of time on every refresh (here 24hrs)
})

store.on('error', function (e) {
	console.log(`SESSION STORE ERROR ${e}`)
})

const sessionConfig = {
	name: 'session_cooks',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 360000 * 24 * 7,
		maxAge: 360000 * 24 * 7,
		httpOnly: true,
		// secure: true, --deploying only, cuz localhost isnt https
	},
	store,
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
	res.locals.currentUser = req.user
	res.locals.success = req.flash('success')
	res.locals.error = req.flash('error')
	next()
})

//testy test create user
// app.get('/fakeuser', async (req, res) => {
// 	const user = new User({ email: 'lala@gmail.com', username: 'Willie' })
// 	const newUser = await User.register(user, 'iloveclaire')
// 	res.send(newUser)
// })

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
	res.render('home')
})

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err
	if (!err.message) err.message = 'oh no what happened that is not great'
	res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log('hooray')
})
