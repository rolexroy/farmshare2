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

router.get('/marketing', (req, res) => {
    const query = [`SELECT * FROM order_table `,
    'SELECT name FROM customers',
    'SELECT DISTINCT commodity FROM stock'
]
    if(res.locals.isLoggedIn){
        connection.query(
            query.join(';'),
            (error, results) => {
                
                res.render('marketing' , {
                    data:results[0],customers:results[1],commodities:results[2]
                });

               
               
            }
        );
       
    } else {
        res.redirect('/signin')
    }
    
});

//marketing json
router.get('/marketing.json', (req, res) => {
    const query = `SELECT * FROM order_table `
    connection.query(
        query,
        (error, results) => {
           res.json(results)
        }
    );
});


router.post('/order/store', (req, res) => {
   
    let name = req.body.name;
    if(res.locals.isLoggedIn){
        connection.query('INSERT INTO order_table (commodity, quality,quantity,name) VALUES (?, ?, ?, ? )',
        [req.body.product, req.body.quality, req.body.quantity,name],
        
        (error,results) => { 
            if(error){
                console.log(error)
            } else {
                res.redirect('/marketing');
                // console.log('inserted into db')
            }
            
        }); 
    } else {
        res.redirect('/signin')
    }
   
});

module.exports = router;
