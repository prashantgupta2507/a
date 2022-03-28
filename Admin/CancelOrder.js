const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/cancelOrder', (req, res) => {
    try {
        const { authtoken, order_id } = req.body;
        if (!authtoken)
            return res.status(400).send({ Status: "Failure", Details: "Token not provided" })
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select * from user where email="${decoded.email}" and admin=${true}`, (err, row) => {
            if (err) throw err
            if (row.length === 0)
                return res.status(400).send({ Status: "Failure", Details: "Provide Correct Credentials" })
            connection.query(`delete from suborder where order_id=${order_id}`, (err) => {
                if (err) throw err;
                connection.query(`delete from \`order\` where order_id=${order_id}`, (err) => {
                    if (err) throw err
                    return res.status(200).send({ Status: "Success", Details: "Order Cancelled Successfully" })
                })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router