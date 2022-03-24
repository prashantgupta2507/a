const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const connection = require('../Schemas/Connection')

const addMinutesToDate = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000)
}

const OtpSender = async (req, res) => {
    try {
        const { email, type } = req.body;
        let email_subject, email_message
        if (!email)
            return res.status(400).send({ Status: "Failure", Details: "Email not provided" })
        // Generate Otp
        const otp = otpGenerator.generate(5, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        const expirationTime = addMinutesToDate(new Date(), 5)

        let otp_instance;
        // Create OTP instance in DB
        connection.query(`INSERT INTO OTP (otp_instance,email,check_type,expiration_time) values ('${otp}','${email}','${type}','${expirationTime}')`, async (err, rows) => {
            if (err) throw err
            otp_instance = rows.insertId;
        })

        if (type) {
            if (type === 'VERIFICATION') {
                const { message, subject_mail } = require('../Templates/RegistrationEmailTemplate')
                email_message = message(otp)
                email_subject = subject_mail
            }
            else if (type === 'FORGET') {
                const { message, subject_mail } = require('../Templates/ForgetEmailTemplate');
                email_message = message(otp)
                email_subject = subject_mail
            }
            else
                return res.status(400).send({ Status: "Failure", Details: "Incorrect Type Provided" })
        } else
            return res.status(400).send({ Status: "Failure", Details: "Type not mentioned" })

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        const mailOptions = {
            from: `"Bestof Shopping"<bestofshopping@gmail.com>`,
            to: `${email}`,
            subject: email_subject,
            text: email_message
        };

        await transporter.verify()

        // Create details object containing the email and otp id
        const details = {
            "success": true,
            "message": "OTP sent to user",
            "otp_id": otp_instance
        }

        //Send Email
        transporter.sendMail(mailOptions, (err) => {
            if (err)
                return res.status(400).send({ Status: "Failure", Details: err });
            else
                return res.status(200).send({ Status: "Success", Details: details });
        })
    } catch (error) {
        res.status(400).send({ Status: "Failure", Details: error.message })
    }
}

module.exports = OtpSender;