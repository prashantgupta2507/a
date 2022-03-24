const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/dashboard', (req, res) => {
    const { authtoken } = req.body
    
    try {
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select * from user where email='${decoded.email}' and admin=${true}`, (err, result) => {
            if (err) throw err
            if (result.length === 0)
                return res.status(400).send({ msg: "Bad Request" })
            connection.query(`select count(user_id) as users from user where admin=${false}`,(err,rows)=>{
                if(err) throw err
                connection.query(`select sum(product_qty) as productSold, sum(price) as totalEarnings from suborder`,(err,r)=>{
                    if(err) throw err
                    return res.status(200).send({users:rows[0].users,productSold:r[0].productSold, totalEarnings:r[0].totalEarnings})
                })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router