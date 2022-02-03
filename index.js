require('dotenv').config()
const express = require('express')
const connection = require('./Schemas/Connection')
const createUser = require('./Schemas/User')

const app = express()
const port = process.env.PORT;

connection.connect()

app.use(()=>createUser)


app.listen(port)

connection.end()