require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connection = require('./Schemas/Connection')
const {createUser, createOtp} = require('./Schemas/Tables')

const app = express()
const port = process.env.PORT;

connection.connect()

app.use(cors())
app.use(express.json())
app.use(createUser)
app.use(createOtp)

app.use('/api/auth/createUser',require('./Auth/Register'))
app.use('/api/auth/createUser',require('./Auth/OtpVerification'))
app.use('/api/auth',require('./Auth/Login'))
app.use('/api/auth/forgot', require('./Auth/ForgetPassword'))

app.listen(port,()=>console.log(`Server started at port ${port}`))