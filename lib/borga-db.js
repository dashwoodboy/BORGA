'use strict'

const fetch = require('node-fetch')
const crypto = require('crypto')
const errors = require('./borga-errors')

module.exports = {
    setUrl,
    getUrl,
    createUser,
    createUserWithPassword,
    getUser,
    createGroup,
    getGroup,
    addGameToGroup,
    updateGroup,
    deleteGroup,
    getGameInGroup,
    deleteGameFromGroup,
    clearByIndex
}

/**
 * URL of users index in ElasticSearch database.
 */
let usersUrl = 'http://localhost:9200/users/'

function setUrl(index) {
    usersUrl = `http://localhost:9200/${index}/`
}

function getUrl() {
    return usersUrl
}

function clearByIndex() {
    return fetch(usersUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
}

/**
 * 
 * @param {String} username 
 * @returns new User
 */
function newUser(username) {
    const uuid = crypto.randomUUID()
    return {
        userId: uuid,
        username: username,
        groups: {}
    }
}

/**
 * 
 * @param {String} name 
 * @param {String} description 
 * @returns new Group
 */
function newGroup(name, description) {
    const uuid = crypto.randomUUID()
    return {
        id: uuid,
        name: name,
        description: description,
        games: []
    }
}

/**
 * Creates an user with given parameters
 * @param {String} username 
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function createUser(username) {
    const user = newUser(username)
    return saveUserToDb(user)

}

function createUserWithPassword(username, password) {
    const user = newUser(username)
    user.password = password
    return saveUserToDb(user)
}

function saveUserToDb(user) {
    return fetch(usersUrl + '_doc/' + user.username + '?refresh=true&op_type=create', {
            method: 'post',
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => {
            return res.status != 201 ?
                res.json().then(() => { throw Error(errors.REPEATED_USER) }) :
                res.json()
        })
        .then(() => {
            return user
        })
        .catch(err => {
            if (err.message === '101')
                return Promise.reject(errors.REPEATED_USER)
            else
                return Promise.reject(errors.UNKNOWN_INTERNAL_ERROR)
        })
}

/**
 * Get user
 * @param {String} username 
 * @param {String} authToken
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function getUser(username) {
    return fetch(usersUrl + '_doc/' + username)
        .then(res => {

            return res.status != 200 ?
                res.json().then(() => {
                    throw Error(errors.USER_NOT_FOUND)
                }) :
                res.json()
        })
        .then(doc => {
            return doc._source
        })
        .catch(err => {
            if (err.message === '102')
                return Promise.reject(errors.USER_NOT_FOUND)
            else
                return Promise.reject(errors.UNKNOWN_INTERNAL_ERROR)
        })
}

/**
 * Updates the User in ElasticSearch
 * @param {User} user 
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function updateUser(user) {
    return fetch(usersUrl + '_doc/' + user.username + '?refresh=true', {
            method: 'PUT',
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => {
            return res.status != 200 ?
                res.json().then(msg => {
                    throw Error(errors.UNKNOWN_INTERNAL_ERROR)
                }) :
                res.json()
        })
        .then(() => user)
        .catch(err => {
            if (err.message === '102')
                return Promise.reject(errors.USER_NOT_FOUND)
        })
}

/**
 * Creates a group for a given user
 * @param {String} username 
 * @param {String} groupName 
 * @param {String} description 
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function createGroup(username, groupName, description, authToken) {
    return getUser(username, authToken)
        .then(user => {
            if (authToken != user.userId)
                return Promise.reject(errors.UNAUTHORIZED_USER)
            const group = newGroup(groupName, description)

            user.groups[group.id] = group
            return updateUser(user)
        })
        .then(user => user)
}

/**
 * Get a specific group for a given user
 * @param {String} username 
 * @param {String} groupId 
 * @returns Promise<Group> fulfilled if success or Promise<Error> reject if failed
 */
function getGroup(username, groupId, authToken) {
    return getUser(username, authToken)
        .then(user => {
            if (authToken != user.userId)
                return Promise.reject(errors.UNAUTHORIZED_USER)
            const group = user.groups[groupId]

            if (!group)
                return Promise.reject(errors.GROUP_NOT_FOUND)

            return group
        })
}

/**
 * Adds a game to the given group
 * @param {String} username 
 * @param {String} groupId 
 * @param {String} gameName 
 * @returns Promise<Group> fulfilled if success or Promise<Error> reject if failed
 */
function addGameToGroup(username, groupId, gameName, authToken) {
    return getUser(username, authToken)
        .then(user => {
            if (authToken != user.userId)
                return Promise.reject(errors.UNAUTHORIZED_USER)
            const group = user.groups[groupId]

            if (!group)
                return Promise.reject(errors.GROUP_NOT_FOUND)

            if (group.games.includes(gameName))
                return Promise.reject(errors.GAME_ALREADY_IN_GROUP)

            group.games.push(gameName)

            return updateUser(user)
        })
        .then(user => user.groups[groupId])
}

/**
 * Edits the given group
 * @param {String} username 
 * @param {String} groupId
 * @param {String} newGroupName 
 * @param {String} newGroupDesc 
 * @returns Promise<Group> fulfilled if success or Promise<Error> reject if failed
 */
function updateGroup(username, groupId, newGroupName, newGroupDesc, authToken) {
    return getUser(username, authToken)
        .then(user => {
            if (authToken != user.userId)
                return Promise.reject(errors.UNAUTHORIZED_USER)
            const group = user.groups[groupId]

            if (!group)
                return Promise.reject(errors.GROUP_NOT_FOUND)

            group.name = newGroupName
            group.description = newGroupDesc

            return updateUser(user)
        })
        .then(user => user.groups[groupId])
}

/**
 * Removes the specified group
 * @param {String} username 
 * @param {String} groupId 
 * @returns Promise<undefined> fulfilled if success or Promise<Error> reject if failed
 */
function deleteGroup(username, groupId, authToken) {
    return getUser(username, authToken)
        .then(user => {
            if (authToken != user.userId)
                return Promise.reject(errors.UNAUTHORIZED_USER)
            if (!user.groups[groupId])
                return Promise.reject(errors.GROUP_NOT_FOUND)

            delete user.groups[groupId]

            return updateUser(user)
        })
        .then(user => undefined)
}

/**
 * Get info for a specific game in given group
 * @param {String} username 
 * @param {String} groupId 
 * @param {String} gameName 
 * @returns Promise<Game> fulfilled if success or Promise<Error> reject if failed
 */
function getGameInGroup(username, groupId, gameName, authToken) {
    return getUser(username, authToken)
        .then(user => {
            if (authToken != user.userId)
                return Promise.reject(errors.UNAUTHORIZED_USER)
            const group = user.groups[groupId]
            if (!group)
                return Promise.reject(errors.GROUP_NOT_FOUND)

            const game = group.games.includes(gameName)
            if (!game)
                return Promise.reject(errors.GAME_NOT_IN_GROUP)

            return game
        })
}

/**
 * Removes the specific game from given group
 * @param {String} username 
 * @param {String} groupId 
 * @param {String} gameName 
 * @returns Promise<undefined> fulfilled if success or Promise<Error> reject if failed
 */
function deleteGameFromGroup(username, groupId, gameName, authToken) {
    return getUser(username, authToken)
        .then(user => {
            if (authToken != user.userId)
                return Promise.reject(errors.UNAUTHORIZED_USER)
            const group = user.groups[groupId]
            if (!group)
                return Promise.reject(errors.GROUP_NOT_FOUND)

            if (!group.games.includes(gameName))
                return Promise.reject(errors.GAME_NOT_IN_GROUP)

            group.games = group.games.filter(item => {
                if (item != gameName) return item
            })

            return updateUser(user)
        })
        .then(user => undefined)
}