const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/orders/get-order-details', (req, res) => {
    const { authtoken } = req.body;
    try {
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select user_id from user where email='${decoded.email}'`, (err) => {
            if (err) throw err
            connection.query(`select group_concat(s.product_name separator ' -- ') 'Products Name',group_concat(s.product_qty separator ' -- ') 'Products Quantity',group_concat(s.price separator ' -- ') 'Products Price', total_price 'Total Price', s.product_img 'Product Image Url',c.order_date,c.paymentMode,c.houseAddress,name,locality,city,state,pincode from (select order_id, o.user_id, total_price, o.order_date,o.paymentMode, a.houseAddress,name, locality, city, state, pincode from \`order\` o join address a on o.address_id = a.address_id and o.user_id=1) as c join suborder s on c.order_id = s.order_id group by c.order_id`, (err, result) => {
                if (err) throw err
                return res.status(200).json(result)
            })
        })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

module.exports = router