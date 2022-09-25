'use strict'

const express = require('express')

const app = express()

const PORT = process.env.PORT

require('./lib/borga-server-routes')(app)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})