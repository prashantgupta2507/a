const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.patch('/accounts/update-phone', (req, res) => {
    try {
        const { authtoken, phone } = req.body
        if (!authtoken)
            return res.status(400).json({ Status: "Failure", Details: "Token not provided" })
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`update user set mobile='${phone}' where email='${decoded.email}'`, (err) => {
            if (err) throw err;
            return res.status(200).json({ Status: "Success", Details: "Phone number updated successfully" })
        })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

module.exports = router