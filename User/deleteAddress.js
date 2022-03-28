const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/address/delete-address', (req, res) => {
    try {
        const { authtoken, id } = req.body;
        if (!authtoken)
            return res.status(400).json({ Status: "Failure", Details: "Token is not valid" })
        if (!id)
            return res.status(400).json({ Status: "Failure", Details: "Id is not provided" })
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select user_id from user where email='${decoded.email}'`, (err, result) => {
            if (err) throw err
            connection.query(`delete from address where user_id=${result[0].user_id} and address_id=${id}`, (err) => {
                if (err) throw err
                return res.status(200).json({ Status: "Success", Details: "Address Deleted Successfully" });
            })
        })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

module.exports = router