'use strict'

const REPEATED_USER = 101
const USER_NOT_FOUND = 102
const REPEATED_GROUP = 201
const GROUP_NOT_FOUND = 202
const GAME_NOT_FOUND = 302
const GAME_ALREADY_IN_GROUP = 303
const GAME_NOT_IN_GROUP = 304
const UNAUTHORIZED_USER = 400
const UNKNOWN_INTERNAL_ERROR = 500

module.exports = {
    REPEATED_USER,
    USER_NOT_FOUND,
    REPEATED_GROUP,
    GROUP_NOT_FOUND,
    GAME_NOT_FOUND,
    GAME_ALREADY_IN_GROUP,
    GAME_NOT_IN_GROUP,
    UNAUTHORIZED_USER,
    UNKNOWN_INTERNAL_ERROR,
    rejectPromise
}

const errorMessages = {
    101: { status: 409, msg: 'There is a user with this username already' },
    102: { status: 404, msg: 'No user found with this username' },
    201: { status: 409, msg: 'There is already an group with this name' },
    202: { status: 404, msg: 'No group found with this groupId for this username' },
    302: { status: 404, msg: 'No game found with given name' },
    303: { status: 409, msg: 'This group already has the given game' },
    304: { status: 404, msg: 'This group doesnt have this name' },
    400: { status: 401, msg: 'This user is not authorized to access this username' },
    500: { status: 500, msg: 'Internal Error, please contact support' }
}

/**
 * 
 * @param {Number} errorCode 
 * @returns Promise<Error> rejected
 */
function rejectPromise(errorCode) {
    let error = errorMessages[errorCode]
    const err = new Error(error.msg)
    err.status = error.status
    return Promise.reject(err)
}