const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/fetchAllUsers', (req, res) => {
    const { authtoken } = req.body;
    if (!authtoken) {
        return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select * from user where email="${decoded.email}" and admin=${true}`, (err, result) => {
            if (err) throw err
            if (result.length === 0)
                return res.status(400).send({ msg: "Bad Request" })
            connection.query(`select email,first_name,last_name,mobile from user where admin=${false}`, (err, rows) => {
                if (err) throw err
                return res.status(200).send({ users: rows })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router;