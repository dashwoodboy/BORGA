'use strict'

const services = require('./borga-services')

const router = require('express').Router()

/**
 * 
 * @param {String} token 
 * @returns 
 */
function convertAuthToken(token) {
    if (!token) return ''
    const splited = token.split(' ')
    if (splited.length > 1)
        return splited[1]
    else
        return splited[0]
}

/**
 * Get the list of most popular games
 */
router.get('/games', (req, res, next) => {
    services
        .getGames()
        .then(games => {
            res.statusCode = 200
            res.json(games)
        })
        .catch(next)
})

/**
 * Get the game with the given name
 */
router.get('/games/:gameName', (req, res, next) => {
    services
        .getGame(req.params.gameName)
        .then(game => {
            res.statusCode = 200
            res.json(game)
        })
        .catch(next)
})

/**
 * Creates an user with given parameters
 */
router.post('/users', (req, res, next) => {
    services
        .createUser(req.body.username)
        .then(user => {
            res.statusCode = 201
            res.json(user)
        })
        .catch(next)
})

/**
 * Get user
 */
router.get('/users/:username', (req, res, next) => {
    services
        .getUser(req.params.username)
        .then(user => {
            if (user.userId != convertAuthToken(req.headers.authorization)) {
                res.statusCode = 409
            } else {
                res.statusCode = 200
                res.json(user)
            }
        })
        .catch(next)
})

/**
 * Creates a group for a given user
 */
router.post('/users/:username/groups', (req, res, next) => {
    services
        .createGroup(req.params.username, req.body.name, req.body.description, convertAuthToken(req.headers.authorization))
        .then(user => {
            res.statusCode = 201
            res.json(user)
        })
        .catch(next)
})

/**
 * Get a specific group for a given user
 */
router.get('/users/:username/groups/:groupId', (req, res, next) => {
    services
        .getGroup(req.params.username, req.params.groupId, convertAuthToken(req.headers.authorization))
        .then(group => {
            res.statusCode = 200
            res.json(group)
        })
        .catch(next)
})

/**
 * Adds a game to the given group
 */
router.post('/users/:username/groups/:groupName', (req, res, next) => {
    services
        .addGameToGroup(req.params.username, req.params.groupName, req.body.gameName, convertAuthToken(req.headers.authorization))
        .then(game => {
            res.statusCode = 201
            res.json(game)
        })
        .catch(next)
})

/**
 * Edits the given group
 */
router.put('/users/:username/groups/:groupId', (req, res, next) => {
    services
        .updateGroup(req.params.username, req.params.groupId, req.body.name, req.body.description, convertAuthToken(req.headers.authorization))
        .then(group => {
            res.statusCode = 200
            res.json(group)
        })
        .catch(next)
})

/**
 * Removes the specified group
 */
router.delete('/users/:username/groups/:groupId', (req, res, next) => {
    services
        .deleteGroup(req.params.username, req.params.groupId, convertAuthToken(req.headers.authorization))
        .then(() => {
            res.statusCode = 204
            res.json({})
        })
        .catch(next)
})

/**
 * Get info for a specific game in given group
 */
router.get('/users/:username/groups/:groupName/games/:gameName', (req, res, next) => {
    services
        .getGameInGroup(req.params.username, req.params.groupName, req.params.gameName, convertAuthToken(req.headers.authorization))
        .then(game => {
            res.statusCode = 200
            res.json(game)
        })
        .catch(next)
})

/**
 * Removes the specific game from given group
 */
router.delete('/users/:username/groups/:groupName/games/:gameName', (req, res, next) => {
    services
        .deleteGameFromGroup(req.params.username, req.params.groupName, req.params.gameName, convertAuthToken(req.headers.authorization))
        .then(() => {
            res.statusCode = 204
            res.json()
        })
        .catch(next)
})

module.exports = router