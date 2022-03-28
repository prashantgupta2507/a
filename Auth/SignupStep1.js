const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const connection = require('../Schemas/Connection')
const OtpSender = require('./OtpSender')

router.post('/otp', [body('email', 'Enter a valid Email').isEmail()], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })
    // check whether the user exist with this email
    try {
        connection.query(`select * from USER where USER.email='${req.body.email}'`, async (err, result) => {
            if (err) throw err
            if (result.length != 0)
                return res.status(400).json({ errors: new Array({ "msg": "Sorry a user with this email already exists" }) })
            return await OtpSender(req, res);
        })
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
}
)

module.exports = router;