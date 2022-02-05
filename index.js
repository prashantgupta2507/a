require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connection = require('./Schemas/Connection')

const app = express()
const port = process.env.PORT;

connection.connect()

app.use(cors())
app.use(express.json())
app.use(require('./Schemas/User'))

app.use('/api/auth',require('./Auth/Register'))
app.use('/api/auth',require('./Auth/Login'))

app.listen(port)