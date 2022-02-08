const connection = require('./Connection')

const createUser = (req, res, next) => {
    connection.query('CREATE TABLE if not exists USER (id int auto_increment primary key,email varchar(30) unique not null, password varchar(100) not null)', function (err, rows) {
        if (err) throw err
        next()
    })
}

const createOtp = (req, res, next) => {
    connection.query('CREATE TABLE if not exists OTP (id int auto_increment primary key,otp_instance int not null,email varchar(30) not null,check_type varchar(20) not null,verified TINYINT(1) default 0,expiration_time varchar(70) not null)', function (err, rows) {
        if (err) throw err
        next()
    })
}

module.exports = { createUser, createOtp };