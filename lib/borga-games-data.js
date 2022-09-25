'use strict'

module.exports = {
    getGames,
    getGame
}

const fetch = require('node-fetch')

const ATLAS_HOST = 'https://api.boardgameatlas.com/api/'
const ATLAS_CLIENT_ID = process.env.ATLAS_CLIENT_ID

const ATLAS_SEARCH_MULTIPLE = `search?order_by=rank&ascending=false&client_id=${ATLAS_CLIENT_ID}&limit=`
const ATLAS_SEARCH_SINGLE = `search?client_id=${ATLAS_CLIENT_ID}&name=`
const ATLAS_GET_MECHANIC = `game/mechanics?client_id=${ATLAS_CLIENT_ID}`
const ATLAS_GET_CATEGORIES = `game/categories?client_id=${ATLAS_CLIENT_ID}`

const errors = module.require('./borga-errors')

/**
 * 
 * @param {Array} propNames 
 * @param {Object} obj 
 * @returns object with filtered propreties
 */
function filterProperties(propNames, obj) {
    let o = {}

    for (let propName of Object.keys(obj)) {
        if (propNames.includes(propName))
            o[propName] = obj[propName]
    }

    return o
}

/**
 * 
 * @param {Array} propNames 
 * @param {Array} objs 
 * @returns Array of filtered objects
 */
function filterPropertiesN(propNames, objs) {
    return objs.map(obj => filterProperties(propNames, obj))
}

/**
 * Get the list of most popular games
 * @returns Promise<Array> where all games have filtered propreties
 */
function getGames() {
    const max = 30;
    const path = ATLAS_HOST + ATLAS_SEARCH_MULTIPLE + max

    return fetch(path)
        .then(res => res.json())
        .then(obj => {
            const filtered = filterPropertiesN(['id', 'name', 'url'], obj.games)
            return filtered
        })
        .catch(() => Promise.reject(errors.UNKNOWN_INTERNAL_ERROR))
}

/**
 * Get the game with the given name
 * @param {String} gameName 
 * @returns Promise<Game> where game have filtered propreties
 */
function getGame(gameName) {
    const path = ATLAS_HOST + ATLAS_SEARCH_SINGLE + gameName
    return fetch(path)
        .then(res => res.json())
        .then(obj => {
            if (!obj)
                return Promise.reject(errors.UNKNOWN_INTERNAL_ERROR)

            const filtered = filterProperties(['id', 'name', 'url', 'description_preview', 'image_url', 'mechanics', 'categories'], obj.games[0])

            if (filtered.name != gameName)
                return Promise.reject(errors.GAME_NOT_FOUND)

            const mechanics = getMechanics(filtered.mechanics).then(mechanics => {
                filtered.mechanics = mechanics
                return filtered
            })
            const categories = getCategories(filtered.categories).then(categories => {
                filtered.categories = categories
                return categories
            })
            return Promise.all([mechanics, categories]).then(() => filtered)
        })
        .catch(() => Promise.reject(errors.GAME_NOT_FOUND))
}

function getMechanics(ids) {
    const path = ATLAS_HOST + ATLAS_GET_MECHANIC
    return fetch(path)
        .then(res => res.json())
        .then(obj => {
            const mechanics = []
            ids.forEach(element => {
                for (const mechanic of obj.mechanics) {
                    if (mechanic.id === element.id) {
                        mechanics.push(mechanic.name)
                        break
                    }
                }
            })
            return mechanics
        })
        .catch(() => Promise.reject(errors.UNKNOWN_INTERNAL_ERROR))
}

function getCategories(ids) {
    const path = ATLAS_HOST + ATLAS_GET_CATEGORIES
    return fetch(path)
        .then(res => res.json())
        .then(obj => {
            const categories = []
            ids.forEach(element => {
                for (const category of obj.categories) {
                    if (category.id === element.id) {
                        categories.push(category.name)
                        break
                    }
                }
            })
            return categories
        })
        .catch(() => Promise.reject(errors.UNKNOWN_INTERNAL_ERROR))
}