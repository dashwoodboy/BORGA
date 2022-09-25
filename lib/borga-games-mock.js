'use strict'

module.exports = {
    getGames,
    getGame
}

const errors = module.require('./borga-errors')

const games = {
    'Catan': {
        id: 'OIXt3DmJU0',
        name: 'Catan',
        url: 'https://www.boardgameatlas.com/game/OIXt3DmJU0/catan'
    },
    'Star Trek: Catan': {
        id: 'l2i97dfuvD',
        name: 'Star Trek: Catan',
        url: 'https://www.boardgameatlas.com/game/l2i97dfuvD/star-trek-catan'
    },
    'Starfarers of Catan': {
        id: 'b7EIdXzESo',
        name: 'Starfarers of Catan',
        url: 'https://www.boardgameatlas.com/game/b7EIdXzESo/starfarers-of-catan'
    }
}

/**
 * 
 * @param {String} gameName 
 * @returns returns Game object
 */
function findGame(gameName) { return games[gameName] }

/**
 * 
 * @param {String} id 
 * @param {String} name 
 * @param {String} url 
 * @returns new Game
 */
function newGame(id, name, url) {
    return {
        id: id,
        name: name,
        url: url
    }
}

/**
 * Get the list of most popular games
 * @returns Promise<Object> fulfilled if success or Promise<Error> reject if failed
 */
function getGames() {
    const gamesRet = {}
    let max = 30;

    for (const gameName in games) {
        const gameGot = findGame(gameName)

        gamesRet[gameName] = newGame(gameGot.id, gameGot.name, gameGot.url)
        if (max-- <= 0) break
    }

    return Promise.resolve(gamesRet)
}

/**
 * Get the game with the given name
 * @param {String} gameName 
 * @returns Promise<Game> fulfilled if success or Promise<Error> reject if failed
 */
function getGame(gameName) {
    const gameGot = findGame(gameName)

    if (!gameGot)
        return Promise.reject(errors.GAME_NOT_FOUND)

    const game = newGame(gameGot.id, gameGot.name, gameGot.url)

    return Promise.resolve(game)
}