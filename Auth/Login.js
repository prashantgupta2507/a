const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const connection = require('../Schemas/Connection')
const { makeDb } = require('mysql-async-simple')

router.post('/login', (req, res) => {
    // check whether the user exist with this email and password
    const db = makeDb();
    try {
        const { email, password } = req.body
        if (!email)
            return res.status(400).json({ Status: "Failure", Details: "Email not be null" })
        if (!password)
            return res.status(400).json({ Status: "Failure", Details: "Password not be null" })

        connection.query(`select * from USER where email="${email}"`, async (err, result) => {
            if (err) throw err
            if (result.length == 0)
                return res.status(400).json({ errors: "Please try to login with correct credentials" })
            const passwordCompare = await bcrypt.compare(password, result[0].password)
            if (!passwordCompare)
                return res.status(400).json({ errors: "Please try to login with correct credentials" })
            const token = jwt.sign({ email, password }, process.env.TOKEN_KEY, { expiresIn: "2h" })
            let data = new Array()
            connection.query(`select * from \`ORDER\` o where o.user_id=${result[0].user_id}`, async (err, rows) => {
                if (err) throw err
                let i = 0;
                while (i < rows.length) {
                    const result = await db.query(connection, `select * from SUBORDER where SUBORDER.order_id = ${rows[i].order_id}`)
                    data.push({ result })
                    i = i + 1;
                }
                return res.status(302).json({ Status: "Success", Details: "Login Successfull", Data: { email, fName: result[0].first_name, lName: result[0].last_name, admin: result[0].admin, phone: result[0].mobile, gender: result[0].gender, orders: data, token } })
            })
        })
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
}
)

module.exports = router;