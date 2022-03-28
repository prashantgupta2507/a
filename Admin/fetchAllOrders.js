const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/fetchAllOrders', (req, res) => {

    const { authtoken } = req.body
    if (!authtoken) {
        return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select * from user where email="${decoded.email}" and admin=${true}`, (err, result) => {
            if (err) throw err
            if (result.length === 0)
                return res.status(400).send({ msg: "Bad Request" })
            connection.query("select group_concat(s.product_name separator ' -- ') 'Products Name',group_concat(s.product_qty separator '  --  ') 'Products Quantity',group_concat(s.price separator '  --  ') 'Products Price', total_price 'Total Price', name,locality,city,state,pincode from (select order_id, o.user_id,total_price, name, locality, city, state, pincode from `order` o join address a on o.address_id = a.address_id) as c join suborder s on c.order_id = s.order_id group by c.order_id", (err, rows) => {
                if (err) throw err;
                return res.status(200).send({ orders: rows })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router