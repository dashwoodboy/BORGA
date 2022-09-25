'use-strict'

module.exports = {
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

const crypto = require('crypto')
const errors = require('./borga-errors')

const users = []

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
    const checkUser = users[username]

    if (checkUser)
        return Promise.reject(errors.REPEATED_USER)

    const user = newUser(username)
    users[username] = user

    return Promise.resolve(user)
}

function createUserWithPassword(username, password) {
    const checkUser = users[username]

    if (checkUser)
        return Promise.reject(errors.REPEATED_USER)

    const user = newUser(username)
    user.password = password
    users[username] = user

    return Promise.resolve(user)
}

/**
 * Get user
 * @param {String} username 
 * @param {String} authToken
 * @returns Promise<Object> fulfilled if success or Promise<Error> reject if failed
 */
function getUser(username) {
    const user = users[username]

    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    return Promise.resolve(user)
}

/**
 * Creates a group for a given user
 * @param {String} username 
 * @param {String} groupName 
 * @param {String} description 
 * @returns Promise<User> fulfilled if success or Promise<Error> reject if failed
 */
function createGroup(username, groupName, description, authToken) {
    const user = users[username]

    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    if (!authToken || authToken != user.userId)
        return Promise.reject(errors.UNAUTHORIZED_USER)

    const group = newGroup(groupName, description)
    user.groups[group.id] = group

    return Promise.resolve(user)
}

/**
 * Get a specific group for a given user
 * @param {String} username 
 * @param {String} groupId 
 * @returns Promise<Group> fulfilled if success or Promise<Error> reject if failed
 */
function getGroup(username, groupId, authToken) {
    const user = users[username]

    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    if (!authToken || authToken != user.userId)
        return Promise.reject(errors.UNAUTHORIZED_USER)

    const group = user.groups[groupId]

    if (!group)
        return Promise.reject(errors.GROUP_NOT_FOUND)

    return Promise.resolve(group)
}

/**
 * Adds a game to the given group
 * @param {String} username 
 * @param {String} groupId 
 * @param {String} gameName 
 * @returns Promise<Group> fulfilled if success or Promise<Error> reject if failed
 */
function addGameToGroup(username, groupId, gameName, authToken) {
    const user = users[username]

    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    if (!authToken || authToken != user.userId)
        return Promise.reject(errors.UNAUTHORIZED_USER)

    const group = user.groups[groupId]

    if (!group)
        return Promise.reject(errors.GROUP_NOT_FOUND)


    if (group.games[gameName])
        return Promise.reject(errors.GAME_ALREADY_IN_GROUP)

    group.games.push(gameName)

    return Promise.resolve(group)
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
    const user = users[username]
    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    if (!authToken || authToken != user.userId)
        return Promise.reject(errors.UNAUTHORIZED_USER)

    const group = user.groups[groupId]
    if (!group)
        return Promise.reject(errors.GROUP_NOT_FOUND)

    group.name = newGroupName
    group.description = newGroupDesc

    return Promise.resolve(group)
}

/**
 * Removes the specified group
 * @param {String} username 
 * @param {String} groupId 
 * @returns Promise<undefined> fulfilled if success or Promise<Error> reject if failed
 */
function deleteGroup(username, groupId, authToken) {
    const user = users[username]
    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    if (!authToken || authToken != user.userId)
        return Promise.reject(errors.UNAUTHORIZED_USER)

    if (!user.groups[groupId])
        return Promise.reject(errors.GROUP_NOT_FOUND)

    delete user.groups[groupId]

    return Promise.resolve()
}

/**
 * Get info for a specific game in given group
 * @param {String} username 
 * @param {String} groupId 
 * @param {String} gameName 
 * @returns Promise<Game> fulfilled if success or Promise<Error> reject if failed
 */
function getGameInGroup(username, groupId, gameName, authToken) {
    const user = users[username]
    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    if (!authToken || authToken != user.userId)
        return Promise.reject(errors.UNAUTHORIZED_USER)

    const group = user.groups[groupId]

    if (!group)
        return Promise.reject(errors.GROUP_NOT_FOUND)

    const game = group.games.includes(gameName)
    if (!game)
        return Promise.reject(errors.GAME_NOT_IN_GROUP)

    return Promise.resolve(game)
}

/**
 * Removes the specific game from given group
 * @param {String} username 
 * @param {String} groupId 
 * @param {String} gameName 
 * @returns Promise<undefined> fulfilled if success or Promise<Error> reject if failed
 */
function deleteGameFromGroup(username, groupId, gameName, authToken) {
    const user = users[username]

    if (!user)
        return Promise.reject(errors.USER_NOT_FOUND)

    if (!authToken || authToken != user.userId)
        return Promise.reject(errors.UNAUTHORIZED_USER)

    const group = user.groups[groupId]

    if (!group)
        return Promise.reject(errors.GROUP_NOT_FOUND)

    if (!group.games.includes(gameName))
        return Promise.reject(errors.GAME_NOT_IN_GROUP)

    group.games = group.games.filter(item => {
        if (item != gameName) return item
    })

    return Promise.resolve()
}