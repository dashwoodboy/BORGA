'use strict'

const services = require('../lib/borga-services')

let davidUser = null
let julinhoUser = null

let davidEconomicGroup = null
let davidPuzzleGroup = null
let julinhoActionGroup = null
let julinhoCardsGroup = null

function insertDummies() {
    const usersProms = []
    const groupsProms = []
    usersProms.push(
        services.createUser('david').then(user => {
            davidUser = user
            return user
        })
    )
    usersProms.push(
        services.createUser('julinho').then(user => {
            julinhoUser = user
            return user
        })
    )

    return Promise.all(usersProms).then(() => {
        groupsProms.push(
            services.createGroup('david', 'economic', 'jogos ricos', davidUser.userId).then(user => {
                for (const groupId in user.groups) {
                    const group = user.groups[groupId]
                    if (group.name == 'economic') {
                        davidEconomicGroup = group
                        return group
                    }
                }
            })
        )
        groupsProms.push(
            services.createGroup('david', 'puzzle', 'dificil', davidUser.userId).then(user => {
                for (const groupId in user.groups) {
                    const group = user.groups[groupId]
                    if (group.name == 'puzzle') {
                        davidPuzzleGroup = group
                        return group
                    }
                }
            })
        )
        groupsProms.push(
            services.createGroup('julinho', 'action', 'jogos bacanos', julinhoUser.userId).then(user => {
                for (const groupId in user.groups) {
                    const group = user.groups[groupId]
                    if (group.name == 'action') {
                        julinhoActionGroup = group
                        return group
                    }
                }
            })
        )
        groupsProms.push(
            services.createGroup('julinho', 'cards', 'cartas', julinhoUser.userId).then(user => {
                for (const groupId in user.groups) {
                    const group = user.groups[groupId]
                    if (group.name == 'cards') {
                        julinhoCardsGroup = group
                        return group
                    }
                }
            })
        )
        return Promise.all(groupsProms)
            .then(groups => {
                return Promise.all([
                    services.addGameToGroup('david', groups[0].id, 'Catan', davidUser.userId),
                    services.addGameToGroup('david', groups[0].id, 'Starfarers of Catan', davidUser.userId),
                ])
            })
    })

}

beforeAll(() => {
    services.setToMock()
    services.setToLocal()
    return insertDummies()
})

test('Get top games', () => {
    return services.getGames()
        .then(games => expect(Object.keys(games).length).toBe(3))
})

test('Get existent game', () => {
    return services.getGame('Catan')
        .then(game => expect(game.name).toBe('Catan'))
})

test('Get unkown game', () => {
    return services.getGame('ffghg')
        .catch(erro => expect(erro).toStrictEqual(new Error('No game found with given name')))
})

test('Create user vala', () => {
    return services.createUser('vala')
        .then(user => expect(user.username).toBe('vala'))
})

test('Get user david', () => {
    return services.getUser('david', davidUser.userId)
        .then(user => expect(Object.keys(user.groups).length).toBe(2))
})

test('Create group strategy for user julinho', () => {
    return services.createGroup('julinho', 'strategy', 'porque gosta de xadrez', julinhoUser.userId)
        .then(user => {
            expect(user).toBe(julinhoUser)
            expect(Object.keys(user.groups).length).toBe(3)
            for (const groupId in user.groups) {
                const group = user.groups[groupId]
                if (group.name == 'strategy') {
                    expect(group.description).toBe('porque gosta de xadrez')
                }
            }
        })
})

test('Get group economic from user david', () => {
    return services.getGroup('david', davidEconomicGroup.id, davidUser.userId)
        .then(group => {
            expect(group.name).toBe('economic')
            expect(group.games.includes('Catan')).toBe(true)
        })
})

test('Add game Star Trek: Catan to group action for user julinho', () => {
    return services.addGameToGroup('julinho', julinhoActionGroup.id, 'Star Trek: Catan', julinhoUser.userId)
        .then(game => {
            expect(game.name).toBe('Star Trek: Catan')
        })
})

test('Update group puzzle from user david', () => {
    return services.updateGroup('david', davidPuzzleGroup.id, 'action', 'divertido', davidUser.userId)
        .then(group => {
            expect(group.name).toBe('action')
            expect(group.description).toBe('divertido')
        })
})

test('Delete group cards from user julinho', () => {
    return services.deleteGroup('julinho', julinhoCardsGroup.id, julinhoUser.userId)
        .then(ret => expect(ret).toBe(undefined))
})

test('Get game Catan from group economic from user david', () => {
    return services.getGameInGroup('david', davidEconomicGroup.id, 'Catan', davidUser.userId)
        .then(game => expect(game.name).toBe('Catan'))
})

test('Delete game Starfarers of Catan from group economic from user david', () => {
    return services.deleteGameFromGroup('david', davidEconomicGroup.id, 'Starfarers of Catan', davidUser.userId)
        .then(group => expect(group).toBe(undefined))
})