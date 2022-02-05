const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connection = require('../Schemas/Connection')

const router = express.Router()

router.post('/login', [body('email', 'Enter a valid Email').isEmail(), body('password', 'Password cannot be blank').exists()], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ "errors": errors.array() })
    // check whether the user exist with this email and password
    try {
        connection.query(`select * from USER where USER.email='${req.body.email}'`, async (err, result) => {
            if (err) throw err
            if (result.length == 0)
                return res.status(400).json({ "errors": new Array({ "msg": "Please try to login with correct credentials" }) })
            const passwordCompare = await bcrypt.compare(req.body.password, result[0].password)
            if (!passwordCompare)
                return res.status(400).json({ "errors": new Array({ "msg": "Please try to login with correct credentials" }) })
            const data = {
                user: {
                    id: result[0].id
                }
            }
            const authtoken = jwt.sign(data, process.env.JWT_SECRET_KEY)
            res.status(302).json({ authtoken })
        })
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
}
)

module.exports = router;