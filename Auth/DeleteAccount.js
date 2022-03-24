const bcrypt = require('bcryptjs');
const connection = require('../Schemas/Connection');
const router = require('express').Router()
const { makeDb } = require('mysql-async-simple')

router.delete('/', (req, res) => {
    const { email, emailToBeDeleted, password } = req.body;
    const db = makeDb();
    try {
        if (!email)
            return res.status(400).json({ Status: "Failure", Details: "Admin Email not provided" })
        if (!password)
            return res.status(400).json({ Status: "Failure", Details: "Password not provided" })
        if (!emailToBeDeleted)
            return res.status(400).json({ Status: "Failure", Details: "Email is not provided" })

        connection.query(`select * from USER where email='${email}'`, async (err, result) => {
            if (err) throw err
            if (result.length === 0)
                return res.status(400).json({ "errors": new Array({ "msg": "Please try to login with correct credentials" }) })

            const passwordCompare = await bcrypt.compare(password, result[0].password)
            if (!passwordCompare)
                return res.status(400).json({ "errors": new Array({ "msg": "Please try to login with correct credentials" }) })

            connection.query(`select * from USER where email='${emailToBeDeleted}'`, (err, r) => {
                if (err) throw err
                if (r.length === 0)
                    return res.status(400).json({ Status: "Failure", Details: "User not exists" })
                connection.query(`select * from \`ORDER\` o where o.user_id=${r[0].user_id}`, async (err, rows) => {
                    if (err) throw err
                    let i = 0;
                    while (i < rows.length) {
                        await db.query(connection, `delete from SUBORDER where SUBORDER.order_id = ${rows[i].order_id}`)
                        i = i + 1;
                    }
                    await db.query(connection, `delete from \`ORDER\` o where o.user_id=${r[0].user_id}`)
                    return res.status(200).json({ Status: "Success", Details: "Deleted User Successfully" })
                })
            })
        })
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router;