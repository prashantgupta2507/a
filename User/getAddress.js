const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/address/get-addresses', (req, res) => {
    try {
        const { authtoken } = req.body;
        if (!authtoken)
            return res.status(400).json({ Status: "Failure", Details: "Token is not valid" })
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY);
        connection.query(`select user_id from user where email='${decoded.email}'`, (err, result) => {
            if (err) throw err
            connection.query(`select * from address where user_id= ${result[0].user_id}`, (err, rows) => {
                if (err) throw err
                return res.status(200).json(rows)
            })
        })
    } catch (error) {
        return res.status(500).json({ error })
    }

})

module.exports = router