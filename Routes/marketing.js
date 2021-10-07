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
                    data:results[0],customers:results[1],commodities:results[2],error:false
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


//search for commodity in dummy markettest
// router.post('/commodity/search',(req,res)=>{
//     const commodity = req.body.commodity
//     connection.query('SELECT * FROM order_table',(error,results)=>{
//      response = results.filter((result)=>{
//          if (commodity.toLowerCase() === result.commodity.toLowerCase()){
//      res.render('markettest',{result})
//      }
//     })
 

// })
// })
router.post('/market',(req,res)=>{
    let id = req.body.id
    let quantity = req.body.quantity
    let commodity = req.body.commodity.toLowerCase()
    let quality = req.body.quality

    connection.query('SELECT quantity FROM stock WHERE commodity = ? AND quality = ?;SELECT name FROM customers',[commodity,quality],(error,results)=>{
        if(results[0].length < 1){
            res.redirect('/marketing?x=c&error=' + encodeURIComponent('Not in stock'));
        } else {

        
        if(Number(quantity) > results[0][0].quantity ) {
            console.log('Too much!');
            res.redirect('/marketing?x=c&error=' + encodeURIComponent('Not enough stock'));
          
            
         }  else {
            connection.query('INSERT INTO distribution ( product, quality, quantity) VALUES (?, ?, ?)',
            [commodity,quality,quantity],  
            (error,results) => { 
                if(error){
                    console.log(error)
                } else {
                    res.redirect('/distribution/info');
                    // console.log('inserted into db')
                }
            }); 
            connection.query('UPDATE stock SET quantity = quantity - ? WHERE commodity = ? AND quality = ?',[quantity,commodity, quality],  
            (error,results) => { 
            if(error){
                console.log(error)
            } else {
                console.log('updated');
            }
        })
        connection.query('DELETE FROM order_table WHERE id =?',id,(error,results)=>{
            console.log('deleted from database')
            
        })
         }
        }

   
})
})
    



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
