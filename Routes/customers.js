const express = require('express')
const mysql = require('mysql');
const router = express.Router()

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sql1pass',
    multipleStatements:true,
    database: 'farmshare'

});
connection.connect()

router.get('/customers',(req,res)=>{
    connection.query('SELECT * FROM customers',(error,results)=>{
        res.render('customers',{customers:results})
    })
    
})

router.post('/customers',(req,res)=>{
    let name = req.body.name,
        phoneNumber = req.body.phoneNumber,
        email = req.body.email;

    connection.query('INSERT INTO customers (name,phone_number,email) VALUES (?,?,?)',[name,phoneNumber,email],(error,results)=>{
        res.redirect("/customers")
    })
})

module.exports = router;