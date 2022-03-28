const connection = require('../Schemas/Connection')
const router = require('express').Router()
const bcrypt = require('bcryptjs')

const dates = {
    convert: function (d) {
        return (
            d.constructor === Date ? d :
                d.constructor === Array ? new Date(d[0], d[1], d[2]) :
                    d.constructor === Number ? new Date(d) :
                        d.constructor === String ? new Date(d) :
                            typeof d === "object" ? new Date(d.year, d.month, d.date) :
                                NaN
        );
    },
    compare: function (a, b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        return (
            isFinite(a = this.convert(a).valueOf()) &&
                isFinite(b = this.convert(b).valueOf()) ?
                (a > b) - (a < b) :
                NaN
        );
    }
}

router.post('/verify/otp', async (req, res) => {
    try {
        const { otp_id, otp, check, password } = req.body;
        if (!otp_id)
            return res.status(400).json({ Status: "Failure", Details: "Verification Key not provided" })
        if (!otp)
            return res.status(400).json({ Status: "Failure", Details: "OTP not Provided" })
        if (!check)
            return res.status(400).json({ Status: "Failure", Details: "Check not Provided" })
        connection.query(`select * from OTP where id='${otp_id}' and check_type='${check}'`, (err, result) => {
            if (err) throw err
            if (result.length != 0) {
                if (result[0].id != otp_id)
                    return res.status(400).send({ Status: "Failure", Details: "OTP was not sent to this particular email or phone number" })
                if (result[0].verified !== 1) {
                    if (dates.compare(result[0].expiration_time, new Date()) === 1) {
                        if (otp == result[0].otp_instance) {
                            connection.query(`update OTP set verified=${true} where ${otp_id}`, async (err) => {
                                if (err) throw err
                                if (check === 'VERIFICATION')
                                    return res.status(200).json({ Status: "Success", Details: "OTP Matched Successfully" })
                                else {
                                    // Updating Password
                                    if (!password)
                                        return res.status(400).json({ Status: "Failure", Details: "Password not provided" })
                                    const salt = await bcrypt.genSalt(10)
                                    const secPass = await bcrypt.hash(password, salt);
                                    connection.query(`update USER set password = '${secPass}' where email='${result[0].email}'`, (err) => {
                                        if (err) throw err
                                        return res.status(204).send()
                                    })
                                }
                            })
                        } else
                            return res.status(400).send({ Status: "Failure", Details: "OTP NOT Matched" })
                    } else
                        return res.status(400).send({ Status: "Failure", Details: "OTP Expired" })
                } else
                    return res.status(400).send({ Status: "Failure", Details: "OTP Already Used" })
            } else
                return res.status(400).send({ Status: "Failure", Details: "Bad Request" })
        })
    } catch (error) {
        res.status(400).send({ Status: "Failure", Details: error.message })
    }
})

module.exports = router