const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/fetchAllProducts', (req,res)=>{
    const {authtoken} = req.body;
    if (!authtoken) {
        return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select * from user where email='${decoded.email}' and admin=${true}`, (err,result)=>{
            if(err) throw err
            if (result.length === 0)
                return res.status(400).send({ msg: "Bad Request" })
            connection.query(`select p.product_id, p.title, c.title as category, summary as description, price, concat(discount,'%') as discount, quantity, main_image_url, image_url1,image_url2,image_url3,image_url4,image_url5,size from product p inner join category c on p.category_id = c.category_id where invalid=${false}`, async (err, rows)=>{
                if(err) throw err
                return res.status(200).send({ products: rows })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router;