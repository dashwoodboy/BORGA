'use strict'

const express = require('express')
const borgaWebRouter = require('./borga-web-site')
const borgaApiRouter = require('./borga-web-api')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const openapi = YAML.load('./docs/borga-api-spec.yaml')
const passport = require('passport')


/**
 * 
 * @param {Express} app 
 */
module.exports = function (app) {

	app.set('view engine', 'hbs')

	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))
	app.use(express.static('public'))
	app.use(require('cookie-parser')())
	app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))
	app.use(passport.initialize())
	app.use(passport.session())

	passport.serializeUser((user, done) => {
		done(null, user.username)
	})
	passport.deserializeUser((username, done) => {
		require('./borga-services')
			.getUser(username)
			.then(user => done(null, user))
			.catch(err => done(err))
	})



	app.use('/', borgaWebRouter)

	app.use((req, res, next) => {
		if (req.user && !req.headersSent) {

			req.headers.authorization = `Bearer ${req.user.userId}`
		}
		next()
	})

	app.use('/api', borgaApiRouter)
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi))

	app.use((err, req, resp, _next) => {
		resp
			.status(err.status || 500)
			.json(err.message == undefined ? { message: 'Internal Error, please contact support' } : { message: err.message })
	})

	app.use((req, res, next) => {
		res.status(404)
			.render('errors', { status: 404, message: 'Sorry, resource not found' });
	});

}