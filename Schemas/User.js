const connection = require('./Connection')

const createUser = (req,res,next)=>{ 
        connection.query('CREATE TABLE if not exists USER (id int auto_increment primary key,email varchar(30) unique not null, password varchar(100) not null)', function (err, rows) {
        if (err) throw err
        console.log(rows)
        next()
    })
}

module.exports = createUser;