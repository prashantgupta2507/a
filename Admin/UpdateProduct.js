const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/updateProduct', (req, res) => {
    const { authtoken, category_title, product_id, product_name, quantity, sale_price, list_price, description, main_image_url, size } = req.body;
    if (!authtoken) {
        return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        const discount = ((list_price - sale_price) / list_price) * 100;

        connection.query(`select * from user where email='${decoded.email}' and admin=${true}`, (err, result) => {
            if (err) throw err
            if (result.length === 0)
                return res.status(400).send({ msg: "Bad Request" })
            connection.query(`select category_id from category where title="${category_title}"`, (err, rows) => {
                if (err) throw err
                connection.query(`update product set title="${product_name}", summary="${description}", price=${sale_price}, discount=${discount}, quantity=${quantity}, category_id=${rows[0].category_id}, main_image_url="${main_image_url}", size=${size ? size : null} where product_id=${product_id}`, (err) => {
                    if (err) throw err
                    return res.status(201).json({ Status: "Success", Details: "Product Updated Successfully" })
                })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router