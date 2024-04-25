require('express-async-errors')
const express = require('express')
const app = express()
const cors = require('cors')
const usersRouter = require('./controllers/users')
const notesRouter = require('./controllers/notes')
const loginRouter = require('./controllers/login')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')


mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)

    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch(error => {
        logger.info('error connecting to MongoDB:', error.message)
    })

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/users', usersRouter)
app.use('/api/notes', notesRouter)
app.use('/api/login', loginRouter)


// handler of requests with unknown endpoint
app.use(middleware.unknownEndpoint)
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(middleware.errorHandler)

module.exports = app