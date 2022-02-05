const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connection = require('../Schemas/Connection')

const router = express.Router()

router.post('/createUser', [body('email', 'Enter a valid Email').isEmail(), body('password').isLength({ min: 6 })],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty())
            return res.status(400).json({ "errors": errors.array() })
        // check whether the user exist with this email
        try {
            connection.query(`select * from USER where USER.email='${req.body.email}'`, async (err, result) => {
                if (err) throw err
                if (result.length != 0)
                    return res.status(400).json({ "errors": new Array({ "msg": "Sorry a user with this email already exists" }) })
                //Create a new User
                const salt = await bcrypt.genSalt(10)
                const secPass = await bcrypt.hash(req.body.password, salt);
                connection.query(`insert into USER (email, password) values('${req.body.email}','${secPass}')`, (err, result) => {
                    if (err) throw err
                    const data = {
                        user: {
                            id: result.insertId
                        }
                    }
                    const authtoken = jwt.sign(data, process.env.JWT_SECRET_KEY)
                    res.status(201).json({ authtoken })
                })
            })
        } catch (error) {
            res.status(500).send("Internal Server Error")
        }
    }
)

module.exports = router;