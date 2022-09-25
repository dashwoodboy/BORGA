'use strict'

const request = require('supertest')
const express = require('express')
const jestOpenAPI = require('jest-openapi').default
const services = require('../lib/borga-services')
const db = require('../lib/borga-db')

jestOpenAPI(process.cwd() + '/docs/borga-api-spec.yaml')

const app = express()
require('../lib/borga-server-routes')(app)

let davidUser = null
let julinhoUser = null

let davidEconomicGroup = null
let davidPuzzleGroup = null
let julinhoActionGroup = null
let julinhoCardsGroup = null

function insertDummies() {
    return services.createUser('david').then(user => {
            davidUser = user
        })
        .then(() => services.createUser('julinho'))
        .then(user => {
            julinhoUser = user
        })
        .then(() => services.createGroup('david', 'economic', 'jogos ricos', davidUser.userId))
        .then(user => {
            for (const groupId in user.groups) {
                const group = user.groups[groupId]
                if (group.name == 'economic') {
                    davidEconomicGroup = group
                }
            }
        })
        .then(() => services.createGroup('david', 'puzzle', 'dificil', davidUser.userId))
        .then(user => {
            for (const groupId in user.groups) {
                const group = user.groups[groupId]
                if (group.name == 'puzzle') {
                    davidPuzzleGroup = group
                }
            }
        })
        .then(() => services.createGroup('julinho', 'action', 'jogos bacanos', julinhoUser.userId))
        .then(user => {
            for (const groupId in user.groups) {
                const group = user.groups[groupId]
                if (group.name == 'action') {
                    julinhoActionGroup = group
                }
            }
        })
        .then(() => services.createGroup('julinho', 'cards', 'cartas', julinhoUser.userId))
        .then(user => {
            for (const groupId in user.groups) {
                const group = user.groups[groupId]
                if (group.name == 'cards') {
                    julinhoCardsGroup = group
                }
            }
        })
        .then(() => services.addGameToGroup('david', davidEconomicGroup.id, 'Catan', davidUser.userId))
        .then(() => services.addGameToGroup('david', davidEconomicGroup.id, 'Starfarers of Catan', davidUser.userId))
}

beforeAll(() => {
    services.setToMock()
        // To test using ElasticSearch, put true in the if
    if (true) {
        db.setUrl('test')
        return db.clearByIndex()
            .then(() => insertDummies())
    } else {
        services.setToLocal()
        return insertDummies()
    }
})

test('Get top games', () => {
    return request(app)
        .get('/api/games')
        .set('Accept', 'application/json')
        .expect(200)
        .then(resp => {
            expect(Object.keys(resp.body).length).toBe(3)
        })
})

test('Get existent game', () => {
    return request(app)
        .get('/api/games/Catan')
        .set('Accept', 'application/json')
        .expect(200)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body).toStrictEqual({
                id: 'OIXt3DmJU0',
                name: 'Catan',
                url: 'https://www.boardgameatlas.com/game/OIXt3DmJU0/catan'
            })
        })
})

test('Get unknown game', () => {
    return request(app)
        .get('/api/games/ffghg')
        .set('Accept', 'application/json')
        .expect(404)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.message).toStrictEqual('No game found with given name')
        })
})

test('Create user vala', () => {
    return request(app)
        .post('/api/users')
        .send({ 'username': 'vala' })
        .set('Accept', 'application/json')
        .expect(201)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.username).toBe('vala')
        })
})

test('Create user with already existent username', () => {
    return request(app)
        .post('/api/users')
        .send({ 'username': 'david' })
        .set('Accept', 'application/json')
        .expect(409)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.message).toBe('There is a user with this username already')
        })
})

test('Get user david', () => {
    return request(app)
        .get('/api/users/david')
        .set('Authorization', davidUser.userId)
        .set('Accept', 'application/json')
        .expect(200)
        .expect(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(Object.keys(resp.body.groups).length).toBe(2)
        })
})

test('Get unkown user', () => {
    return request(app)
        .get('/api/users/un')
        .set('Accept', 'application/json')
        .expect(404)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.message).toBe('No user found with this username')
        })
})

test('Create group strategy for user julinho', () => {
    return request(app)
        .post('/api/users/julinho/groups')
        .send({ 'name': 'strategy', 'description': 'porque gosta de xadrez' })
        .set('Accept', 'application/json')
        .set('Authorization', julinhoUser.userId)
        .expect(201)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.name).toBe(julinhoUser.name)
            expect(Object.keys(resp.body.groups).length).toBe(3)
            for (const groupId in resp.body.groups) {
                const group = resp.body.groups[groupId]
                if (group.name == 'strategy') {
                    expect(group.description).toBe('porque gosta de xadrez')
                }
            }
        })
})

test('Create group for unkown user', () => {
    return request(app)
        .post('/api/users/un/groups')
        .send({ 'name': 'action', 'description': 'this is a action game' })
        .set('Accept', 'application/json')
        .expect(404)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.message).toBe('No user found with this username')
        })
})

test('Create group with existent name for David', () => {
    return request(app)
        .post('/api/users/david/groups')
        .send({ 'name': 'puzzle', 'description': 'these are puzzles' })
        .set('Accept', 'application/json')
        .set('Authorization', davidUser.userId)
        .expect(201)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.name).toBe(davidUser.name)
            expect(Object.keys(resp.body.groups).length).toBe(3)
            for (const groupId in resp.body.groups) {
                const group = resp.body.groups[groupId]
                if (group.description == 'description') {
                    expect(group.name).toBe('puzzle')
                }
            }
        })
})

test('Get group economic from user david', () => {
    return request(app)
        .get(`/api/users/david/groups/${davidEconomicGroup.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', davidUser.userId)
        .expect(200)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.name).toBe('economic')
            expect(resp.body.games.includes('Catan')).toBe(true)
        })
})

test('Get single group for unkown user', () => {
    return request(app)
        .get(`/api/users/un/groups/${julinhoActionGroup.id}`)
        .set('Accept', 'application/json')
        .expect(404)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.message).toBe('No user found with this username')
        })
})

test('Get single unknown group for David', () => {
    return request(app)
        .get('/api/users/David/groups/un')
        .set('Accept', 'application/json')
        .set('Authorization', davidUser.userId)
        .expect(404)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.message).toBe('No user found with this username')
        })
})


test('Add game Star Trek: Catan to group action for user julinho', () => {
    return request(app)
        .post(`/api/users/julinho/groups/${julinhoActionGroup.id}`)
        .send({ 'gameName': 'Star Trek: Catan' })
        .set('Accept', 'application/json')
        .set('Authorization', julinhoUser.userId)
        .expect(201)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.name).toBe('Star Trek: Catan')
        })
})

test('Update group puzzle from user david', () => {
    return request(app)
        .put(`/api/users/david/groups/${davidPuzzleGroup.id}`)
        .send({ 'name': 'action', 'description': 'divertido' })
        .set('Accept', 'application/json')
        .set('Authorization', davidUser.userId)
        .expect(200)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.name).toBe('action')
            expect(resp.body.description).toBe('divertido')
        })
})


test('Delete group cards from user julinho', () => {
    return request(app)
        .delete(`/api/users/julinho/groups/${julinhoCardsGroup.id}`)
        .set('Authorization', julinhoUser.userId)
        .expect(204)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
        })
})

test('Get game Catan from group economic from user david', () => {
    return request(app)
        .get(`/api/users/david/groups/${davidEconomicGroup.id}/games/Catan`)
        .set('Accept', 'application/json')
        .set('Authorization', davidUser.userId)
        .expect(200)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
            expect(resp.body.name).toBe('Catan')
        })
})

test('Delete game Starfarers of Catan from group economic from user david', () => {
    return request(app)
        .delete(`/api/users/david/groups/${davidEconomicGroup.id}/games/Starfarers of Catan`)
        .set('Authorization', davidUser.userId)
        .expect(204)
        .then(resp => {
            expect(resp).toSatisfyApiSpec()
        })
})