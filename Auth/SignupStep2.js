const connection = require('../Schemas/Connection')
const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/register', async (req, res) => {
    try {
        const { email, fName, lName, password, admin } = req.body
        if (!email)
            return res.status(400).json({ Status: "Failure", Details: "Email not be null" })
        if (!fName)
            return res.status(400).json({ Status: "Failure", Details: "First name not be null" })
        if (!lName)
            return res.status(400).json({ Status: "Failure", Details: "Last name not be null" })
        if (!password)
            return res.status(400).json({ Status: "Failure", Details: "Password not be null" })

        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt);

        //check if user is verified or not
        connection.query(`select * from otp where email='${email}' and verified=${true}`, function (err) {
            if (err) throw err
            // Creating User
            connection.query(`select * from user where email='${email}'`, function (err, result) {
                if (err) throw err
                else if (result.length !== 0)
                    return res.status(400).json({ Status: "Failure", Details: "First Verify your Account" })
                else if (admin === false) {
                    connection.query(`insert into USER (email, password,first_name,last_name) values('${email}','${secPass}','${fName}','${lName}')`, (err) => {
                        if (err) throw err
                        return res.status(201).json({ Status: "Success", Details: "User Registration Successfull", "Data": { email, password, fName, lName } })
                    })
                } else {
                    connection.query(`insert into USER (email, password,first_name,last_name, admin) values('${email}','${secPass}','${fName}','${lName}',${true})`, (err) => {
                        if (err) throw err
                        const token = jwt.sign({ email, password }, process.env.TOKEN_KEY, { expiresIn: "2h" })
                        return res.status(201).json({ Status: "Success", Details: "User Registration Successfull", Data: { email: email, password: password, fName: fName, lName: lName, admin: true, token } })
                    })
                }
            })

        })
    } catch (error) {
        res.status(400).send({ Status: "Failure", Details: error.message })
    }
})

module.exports = router;