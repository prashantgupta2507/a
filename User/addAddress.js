const router = require('express').Router()
const connection = require('../Schemas/Connection')
const jwt = require('jsonwebtoken')

router.post('/address/add-address', (req, res) => {
    try {
        const { authtoken, name, number, pincode, locality, houseAddress, city, state, landmark, alternateNumber, addressType } = req.body;
        if (!authtoken)
            return res.status(400).json({ Status: "Failure", Details: "Token not provided" })
        const decoded = jwt.verify(authtoken, process.env.TOKEN_KEY)
        connection.query(`select user_id from user where email='${decoded.email}'`, (err, result) => {
            if (err) throw err
            connection.query(`insert into address (name,number,locality,houseAddress,city,state,pincode,landmark,alternateNumber,addressType,user_id) values('${name}','${number}','${locality}','${houseAddress}','${city}','${state}','${pincode}','${landmark}','${alternateNumber}','${addressType}',${result[0].user_id})`, (err) => {
                if (err) throw err
                return res.status(200).json({ Status: "Success", Details: "Address Added Successfully" })
            })
        })
    } catch (error) {
        return res.status(500).json({ error })
    }
})

module.exports = router