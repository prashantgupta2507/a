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
            return res.status(400).send({ "Status": "Failure", "Details": "Email not provided" })
        // Generate Otp
        const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
        const expirationTime = addMinutesToDate(new Date(), 5)

        // Create OTP instance in DB
        const otp_instance = connection.query(`INSERT INTO OTP (otp_instance,email,check_type,expiration_time) values ('${otp}','${email}','${type}','${expirationTime}')`, function (err) {
            if (err) throw err
        })

        if (type) {
            if (type === 'VERIFICATION') {
                const { message, subject_mail } = require('./RegistrationEmailTemplate')
                email_message = message(otp)
                email_subject = subject_mail
            }
            else if(type === 'FORGET'){
                const { message , subject_mail } = require('./ForgetEmailTemplate');
                email_message = message(otp)
                email_subject = subject_mail
            }
            else
                return res.status(400).send({ "Status": "Failure", "Details": "Incorrect Type Provided" })
        } else
            return res.status(400).send({ "Status": "Failure", "Details": "Type not mentioned" })

        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            secure: true,
            auth: {
                user : process.env.MAIL_USER,
                pass : process.env.MAIL_PASS
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
            "check": type,
            "success": true,
            "message": "OTP sent to user",
            "otp_id": otp_instance._rows[0].insertId
        }
        
        //Send Email
        transporter.sendMail(mailOptions, (err) => {
            if (err)
                return res.status(400).send({ "Status": "Failure", "Details": err });
            else
                return res.status(200).send({ "Status": "Success", "Details": details });
        })
    } catch (error) {
        return res.status(400).send({ "Status": "Failure", "Details": error.message })
    }
}

module.exports = OtpSender;