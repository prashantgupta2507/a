const router = require('express').Router()
const connection = require('../Schemas/Connection')

router.get('/product/:category_name',(req,res)=>{
    const name  = req.params['category_name']
    if(name === undefined || name === null)
        res.status(500).send("Internal Server Error")
    try {
        connection.query(`select category_id from category where title="${name}"`, (err, result)=>{
            if(err) throw err
            if(result.length !== 0){
                connection.query(`select * from product where category_id=${result[0].category_id} and invalid=${false}`, (err,rows)=>{
                    if(err) throw err
                    return res.status(200).json(rows)
                })
            }else{
                return res.status(500).send("Not Found Any Product")
            }
        })
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router;