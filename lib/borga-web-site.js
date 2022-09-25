const router = require('express').Router()

const services = require('./borga-services')

router.use(checkLocals)

/**
 * Home page route
 */
router.get('/', (req, res) => { res.render('index') })

/**
 * Sign Up page route
 */
router.get('/signup/', (req, res) => { res.render('signup') })

/**
 * Post route called from HTML form in Sign Up page
 */
router.put('/signup/', createUser)

/**
 * Get top games from Board Atlas Api
 */
router.get('/games/', getGames)

router.get('/games/search/',(req, res, next) => res.render('gameSearch'))

router.post('/games/search/', searchGame) 
/**
 * Get details for specific game
 */
router.get('/games/:gameName/', getGameByName)

/**
 * Sign In page route
 */
router.get('/signin/', (req, res, next) => { res.render('signin') })
router.post('/signin/', signin)
router.use('/users/:username/groups/', checkUser)

router.post('/signout/', signout)
/**
 * Get user's route
 */
router.get('/users/:username/groups/', getUser)

/**
 * Create group page route, this page was created to make navigation more intuitive 
 */
router.get('/users/:username/groups/create/', (req, res, next) => res.render('groupsInsert'))
    /**
     * Post route called from HTML form in create group page
     */
router.post('/users/:username/groups/create/', createGroup)

/**
 * Group details route
 */
router.get('/users/:username/groups/:groupId/', getGroupDetail)

/**
 * Add game to group page route, this page was created to make navigation more intuitive 
 */
router.get('/users/:username/groups/:groupId/create/', (req, res, next) => res.render('gamesInsert', { 'error': false }))

/**
 * Post route called from HTML form in add game to group page
 */
router.post('/users/:username/groups/:groupId/create/', addGameToGroup)

/**
 * Get game details route, use for games in a group
 */
router.get('/users/:username/groups/:groupId/:gameName/', getGameInGroup)

/**
 * Error page route
 */
router.use((err, req, resp, _next) => {
    resp.status(404).render('errors', err.message == undefined ? { status: 500, message: 'Internal Error, please contact support' } : { status: err.status, message: err.message });
});

function checkLocals(req, res, next) {
    if (req.session.alert) {
        const alert = req.session.alert
        delete req.session.alert
        res.locals.alert = alert
    }

    if (req.user) {
        res.locals.user = req.user
        res.locals.userLink = `/users/${req.user.username}/groups/`
    }
    next()
}

function checkUser(req, res, next) {
    if (!req.user) {
        req.session.alert = { message: "You do not have access, please login or create an acount!" }
        return res.redirect('/signin/')
    }
    if (req.user.username != req.params.username) {
        req.session.alert = { message: "This page doesn't belong you, login with correct username to access" }
        return res.redirect('/signin/')
    }
    next()
}

function getGames(req, res, next) {
    services.getGames().then(games => {
        return res.render('gamesList', { 'games': games })
    }).catch(next)
}

function searchGame(req, res, next) {
	return res.redirect(`/games/${req.body.gameName}/`)
}

function getGameByName(req, res, next) {
    services.getGame(req.params.gameName).then(game => {
        return res.render('gameDetails', game)
    }).catch(next)
}

function createUser(req, res, next) {
    services.createUserWithPassword(req.body.username, req.body.password)
        .then(user => {
            req.logIn(user, err => {
                if (err) return next(err)
                res.status(201).end()
            })
        }).catch(error => {
            if (error.status === 409) {
                res.status(409)
                res.statusMessage = "This user already exists"
                res.end()
            } else
                next(error)
        })
}

function signin(req, res, next) {
    const username = req.body.username
    services.getUser(username)
        .then(user => {
            if (user.password != req.body.password) {
                res.status(409)
                res.statusMessage = "Username or password incorrect!"
                res.end();
            } else {
                req.logIn(user, err => {
                    if (err) return next(err)
                    res.status(200).end()
                })
            }
        }).catch(error => {
            if (error.status === 404) {
                req.session.alert = { message: "This user does not exits, please create an acount" }
                res.status(404)
                res.end()
            } else
                next(error)
        })
}


function signout(req, res, next) {
	req.logout()
	res.status(301)
	res.redirect('/')
}

function getUser(req, res, next) {
    services.getUser(req.params.username)
        .then(user => {
            return res.render('groupsList', { 'user': user })
        }).catch(next)
}

function createGroup(req, res, next) {
    services.createGroup(req.params.username, req.body.name, req.body.description, req.user.userId)
        .then(() =>
            res.setHeader('Location', `/users/${req.params.username}/groups/`)
            .status(302)
            .end()
        ).catch(next)
}

function getGroupDetail(req, res, next) {
    services.getGroup(req.params.username, req.params.groupId, req.user.userId)
        .then(group => {
            return res.render('groupsDetails', { 'details': { 'group': group, 'games': group.games.map(item => { return { 'gameName': item } }) } })
        }).catch(next)
}

function addGameToGroup(req, res, next) {
    services.addGameToGroup(req.params.username, req.params.groupId, req.body.gameName, req.user.userId)
        .then(() => {
            return res.setHeader('Location', `/users/${req.params.username}/groups/${req.params.groupId}/`)
                .status(302)
                .end()
        }).catch(error => {
            return res.render('gamesInsert', { 'error': true, 'msg': error.message })
        })
}

function getGameInGroup(req, res, next) {
    services.getGame(req.params.gameName).then(game => {
        return res.render('gameDetails', game)
    })
}

module.exports = router