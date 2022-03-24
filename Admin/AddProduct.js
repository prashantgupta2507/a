const router = require('express').Router()
const jwt = require('jsonwebtoken');
const connection = require('../Schemas/Connection')
const { makeDb } = require('mysql-async-simple')

router.post('/addProduct', (req, res) => {
    const { authtoken, category_title, title, quantity, sale_price, list_price, description, main_image_url, image_url1, image_url2, image_url3, image_url4, image_url5, size } = req.body;
    const db = makeDb();
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
            connection.query(`select * from category where title="${category_title}"`, async (err, r) => {
                if (err) throw err
                if (r.length === 0) {
                    await db.query(connection, `insert into category (title) values("${category_title}")`)
                }
                connection.query(`select category_id from category where title="${category_title}"`, (err, rows) => {
                    if (err) throw err
                    connection.query(`insert into product (title,summary,price,discount,quantity,category_id,main_image_url,image_url1,image_url2,image_url3,image_url4,image_url5,size) values ("${title}","${description}",${sale_price},${discount},${quantity},${rows[0].category_id},"${main_image_url}","${image_url1}","${image_url2}","${image_url3}","${image_url4}","${image_url5}",'${size ? size : null}')`, (err) => {
                        if (err) throw err
                        return res.status(201).json({ Status: "Success", Details: "Product Added Successfully" })
                    })
                })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router;