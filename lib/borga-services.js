'use strict'

module.exports = {
    setToMock,
    setToBga,
    setToLocal,
    setToElastic,
    getGames,
    getGame,
    createUser,
    createUserWithPassword,
    getUser,
    createGroup,
    getGroup,
    addGameToGroup,
    updateGroup,
    deleteGroup,
    getGameInGroup,
    deleteGameFromGroup
}

const errors = require('./borga-errors')
const elasticDb = require('./borga-db')
const dataMem = require('./borga-data-mem')
const dataBGA = require('./borga-games-data')
const dataMock = require('./borga-games-mock')

let db = dataMem
let bga = dataBGA

function setToMock() {
    bga = dataMock
}

function setToBga() {
    bga = dataBGA
}

function setToLocal() {
    db = dataMem
}

function setToElastic() {
    db = elasticDb
}

/**
 * Get the list of most popular games
 * @returns Promise<Object> fulfilled if success or Promise<Error> reject if failed
 */
function getGames() {
    return bga.getGames()
        .catch(code => errors.rejectPromise(code))
}

/**
 * Get the game with the given name
 * @param {String} gameName 
 * @returns Promise<Game> fulfilled if success or Promise<Error> reject if failed
 */
function getGame(gameName) {
    return bga.getGame(gameName)
        .catch(code => errors.rejectPromise(code))
}

/**
 * Creates an user with given parameters
 * @param {String} username 
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function createUser(username) {
    return db.createUser(username)
        .catch(code => errors.rejectPromise(code))
}

function createUserWithPassword(username, password) {
    return db.createUserWithPassword(username, password)
        .catch(code => errors.rejectPromise(code))
}

/**
 * Get user
 * @param {String} username 
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function getUser(username) {
    return db.getUser(username)
        .catch(code => errors.rejectPromise(code))
}

/**
 * Creates a group for a given user
 * @param {String} username 
 * @param {String} name 
 * @param {String} description 
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function createGroup(username, name, description, authToken) {
    return db.createGroup(username, name, description, authToken)
        .catch(code => errors.rejectPromise(code))
}

/**
 * Get a specific group for a given user
 * @param {String} username 
 * @param {String} groupId 
 * @returns Promise<Group> fulfilled if success or Promise<Error> reject if failed
 */
function getGroup(username, groupId, authToken) {
    return db.getGroup(username, groupId, authToken)
        .catch(code => errors.rejectPromise(code))
}

/**
 * Adds a game to the given group
 * @param {String} username 
 * @param {String} groupId
 * @param {String} gameName 
 * @returns Promise<Game> fulfilled if success or Promise<Error> reject if failed
 */
function addGameToGroup(username, groupId, gameName, authToken) {
    return bga.getGame(gameName)
        .then(game => {
            return db.addGameToGroup(username, groupId, gameName, authToken)
                .then(() => game)
        })
        .catch(code => errors.rejectPromise(code))
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
    return db.updateGroup(username, groupId, newGroupName, newGroupDesc, authToken)
        .catch(code => errors.rejectPromise(code))
}

/**
 * Removes the specified group
 * @param {String} username 
 * @param {String} groupName 
 * @returns Promise<undefined> fulfilled if success or Promise<Error> reject if failed
 */
function deleteGroup(username, groupId, authToken) {
    return db.deleteGroup(username, groupId, authToken)
        .catch(code => errors.rejectPromise(code))
}

/**
 * Get info for a specific game in given group
 * @param {String} username 
 * @param {String} groupName 
 * @param {String} gameName 
 * @returns Promise<Game> fulfilled if success or Promise<Error> reject if failed
 */
function getGameInGroup(username, groupName, gameName, authToken) {
    return db.getGameInGroup(username, groupName, gameName, authToken)
        .then(() => bga.getGame(gameName))
        .catch(code => errors.rejectPromise(code))
}

/**
 * Removes the specific game from given group
 * @param {String} username 
 * @param {String} groupName 
 * @param {String} gameName 
 * @returns Promise<undefined> fulfilled if success or Promise<Error> reject if failed
 */
function deleteGameFromGroup(username, groupName, gameName, authToken) {
    return bga.getGame(gameName)
        .then(() => db.deleteGameFromGroup(username, groupName, gameName, authToken))
        .catch(code => errors.rejectPromise(code))
}