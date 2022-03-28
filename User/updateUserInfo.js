const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.patch('/accounts/update-user-info', (req, res) => {
    const { authtoken, fName, lName, gender } = req.body;
    try {
        if (!authtoken)
            return res.status(400).json({ Status: "Failure", Details: "Token not be null" })
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`update user set first_name='${fName}', last_name='${lName}', gender='${gender ? gender : ''}' where email='${decoded.email}'`, (err) => {
            if (err) throw err
            return res.status(200).json({ Status: "Success", Details: "User Information Updated Successully" })
        })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

module.exports = router;