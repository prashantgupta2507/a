const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')
const { makeDb } = require('mysql-async-simple')

router.post('/pendingOrders', (req,res)=>{
    const { authtoken } = req.body;
    const db = makeDb();
    if (!authtoken) {
        return res.status(401).send({ error: "Please authenticate using a valid token" })
    }
    try {
        const decoded = jwt.verify(authtoken,process.env.TOKEN_KEY)
        let data = new Array()
        connection.query(`select * from user where email='${decoded.email}' and admin=${true}`,(err,rows)=>{
            if(err) throw err
            if(rows.length===0)
                return res.status(400).send({ msg: "Bad Request" })
            connection.query(`select * from \`order\` where pending=${true}`, async (err, rows) => {
                if (err) throw err
                let i=0;
                while(i<rows.length){
                    const results = await db.query(connection,`select * from SUBORDER where SUBORDER.order_id = ${rows[i].order_id}`)
                    data.push({results})
                    i=i+1
                }
                return res.status(200).send({ users: rows, orders: data })
            })
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error")
    }
})

module.exports = router;