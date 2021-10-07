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


router.get('/sales',(req,res)=>{
    

    const queries = [
        'SELECT name FROM customers',
        'SELECT * FROM invoice INNER JOIN customers ON invoice.customer_id = customers.id',
        'SELECT DISTINCT commodity from stock'
    ]
    connection.query(queries.join(';'),(error,results,fields)=>{
        
        if(error){
            console.log(error)
        } else {
         
           res.render('sales', {customers:results[0],
        invoices:results[1], commodities:results[2]})
            
        }
    })
})
//json sales
router.get('/sales.json',(req,res)=>{
    connection.query('SELECT * FROM invoice INNER JOIN customers ON invoice.customer_id = customers.id',(error,results)=>{
        res.json(results)
    })

})
router.get('/sales/:id',(req,res)=>{
    let id = req.params.id
    
    connection.query(`SELECT * FROM invoice INNER JOIN customers on invoice.customer_id = customers.id WHERE id = ${id};SELECT name FROM customers`, id,(error,results)=>{
        if(error){
            console.log(error)
        } else {
            res.render('invoice',{items:results[0],customers:results[1]})
           
        }
    })
    
    
})
router.post('/sales/:id',(req,res)=>{
  
    let payment = Number(req.body.payment),
        paidDate = req.body.paidDate,
        invoiceNumber = Number(req.body.invoiceNumber);
    connection.query(`UPDATE invoice SET payment = payment +  ? ,date_paid = ? WHERE invoice_number = ?`,[payment,paidDate, invoiceNumber],(error,results)=>{
        if(error){
            console.log(error)
        } else {
           res.redirect('/sales')
        }
    })
})
router.post('/sales',(req,res)=>{
    let invoice = req.body.invoiceDate,
        dueDate = req.body.dueDate,
        customer = req.body.customer,
        item = req.body.item,
        quantity = req.body.quantity,
        amount = req.body.amount,
        payment = req.body.payment,
        balance = req.body.balance;
     const query = 'if '
    connection.query('INSERT INTO invoice (Dates,due_dates,item,quantity,amount,balance,customerName) VALUES(?,?,?,?,?,?,?)',[invoice,dueDate,item,quantity,amount,balance,customer],(error,results)=>{
        if(error){
            console.log(error)
        } else {
            res.redirect('/sales')
        }
    })

})

//sales graph
router.get('/payment.json',(req,res)=>{
    connection.query("SELECT Dates, payment FROM invoice WHERE Dates between '2021-10-01' AND '2021-10-31' ORDER BY Dates;",(error,results)=>{
        res.json(results)
    })
})

module.exports =router;