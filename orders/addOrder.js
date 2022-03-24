const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')
const { makeDb } = require('mysql-async-simple')

router.post('/orders/complete-order', (req, res) => {
    try {
        const { authtoken, items, addressId, totalAmount, paymentMode } = req.body
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        const db = makeDb();

        connection.query(`select user_id from user where email='${decoded.email}'`, (err, rows) => {
            if (err) throw err
            connection.query(`insert into \`order\`(user_id,total_price,address_id,paymentMode,order_date) values (${rows[0].user_id},${totalAmount},${addressId},'${paymentMode}','${new Date().toLocaleDateString()}')`, async (err, result) => {
                if (err) throw err
                for (let i = 0; i < items.length; ++i) {
                    const r = await db.query(connection, `select * from product where product_id=${items[i].productId}`)
                    await db.query(connection, `insert into suborder (order_id,product_name,product_img,product_qty,price) values(${result.insertId},'${r[0].title}','${r[0].main_image_url}',${items[i].qty},${items[i].price})`)
                    const r2 = await db.query(connection, `select quantity from product where product_id = ${items[i].productId}`)
                    await db.query(connection,`update product set quantity = ${r2[0].quantity - items[i].qty} where product_id = ${items[i].productId}`)
                }
                return res.status(200).json({ Status: "Success", Details: "Order Added Successfully" })
            })
        })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

module.exports = router