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

router.get('/distribution',(req,res)=>{
    connection.query('SELECT distribution.order_id, distribution.product, distribution.quality , distribution.quantity, distribution.payment , distribution.collection_point, distribution.expected_date, distribution.actual_date, delivery_status FROM distribution;SELECT groupName from stock',(error,results)=>{
        
        if(error){
            console.log(error)
        } else {
          
           res.render('distribution', {items:results[0], groups:results[1]})





}
    })
    
})
//Distribution form
router.get('/distribution/form',(req,res)=>{
    connection.query('SELECT stock.groupName FROM stock',(error,results)=>{
        
        if(error){
            console.log(error)
        } else {
           res.render('distribution_form',{items:results})
        }
    })
})

//Distribution store form
router.post('/distribution/store/form',(req,res)=>{
    let id = req.body.id;
    let product = req.body.product.toLowerCase();
    let quality = req.body.quality;
    let quantity = req.body.quantity;
    let delivery = req.body.delivery;
    let groupName = req.body.groupName;
   
    
    connection.query('SELECT stock.quantity FROM stock WHERE groupName = ? AND commodity = ? AND quality = ?',
    [groupName, product, quality ],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            if(Number(quantity) > results[0][0].quantity ) {
                console.log('Too much!');
                res.render('distribution_validation', { items: [{ order_id: req.body.id, product: req.body.product.toLowerCase(), quality: req.body.quality, quantity: req.body.quantity, payment: req.body.payment,
                collection_point: req.body.collection_point, expected_date: req.body.expected_date, actual_date: req.body.actual_date, delivery_status: req.body.delivery }],  groups:results[1] });
               
            } else {
                connection.query('INSERT INTO distribution ( product, quality, quantity, payment, collection_point, expected_date, actual_date, delivery_status, groupName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [ product, req.body.quality, req.body.quantity, req.body.payment, req.body.collection_point, req.body.expected_date, req.body.actual_date, delivery, groupName],  
                (error,results) => { 
                    if(error){
                        console.log(error)
                    } else {
                        res.redirect('/distribution/form');
                        // console.log('inserted into db')
                    }
                }); 
            } 
    
            if(delivery === 'Delivered'){
                connection.query('UPDATE stock SET quantity = quantity - ? WHERE groupName= ? AND commodity = ? AND quality = ?',[quantity, groupName, product, quality],  
                    (error,results) => { 
                    if(error){
                        console.log(error)
                    } else {
                        console.log('updated');
                    }
                })
            }
        } 
    }); 
  
})

router.get('/distribution/:id', (req,res) => {
    let id = Number(req.params.id);
        connection.query(        
            'SELECT * FROM distribution WHERE order_id = ? ',[id] ,
            (error,results) => {
                // if(results.length === 1){
                    let check = results[0].delivery_status == 'Delivered';
                    res.render ('edit_distribution' , {item : [results[0], check]});
                // } else {
                //     res.render ('error');
                // }
            }
        );
});

//update distribution record
router.post('/update/distribution/:id', (req, res) => {
    let id = Number(req.params.id);
    let quality = req.body.quality;
    let quantity = req.body.quantity;
    let product = req.body.product.toLowerCase();
    let delivery = req.body.delivery;
    let check = req.body.check;
    let value = req.body.initial_qty;
    console.log(value);
    connection.query('UPDATE distribution SET  product = ?, quality = ?, quantity = ?, payment = ?, collection_point = ?, expected_date = ?, actual_date = ?, delivery_status = ? WHERE order_id = ?',
        [ product, req.body.quality, req.body.quantity, req.body.payment, req.body.collection_point, req.body.expected_date, req.body.actual_date, delivery, id],
        (error, results) => {
            if(error){
                console.log(error)
            } else {
                res.redirect('/distribution');
            } 
        });
        // __________________________________________________________________________________________________________________________________
       if(check === 'false'){
            if(delivery === 'Delivered'){
                connection.query('UPDATE stock SET quantity = quantity - ? WHERE commodity = ? AND quality = ?',[ quantity, product, quality],  
                    (error,results) => { 
                    if(error){
                        console.log(error)
                    } else {
                    }     
                }); 
            } 
       } else if(check === 'true'){
            if(delivery === 'Delivered'){
                connection.query('UPDATE stock SET quantity = quantity + ? - ? WHERE commodity = ? AND quality = ?',[value, quantity, product, quality],  
                    (error,results) => { 
                    if(error){
                        console.log(error)
                    } else {
                    }     
                }); 
            } 
       } else {
            if(delivery === 'Pending'){
                connection.query('UPDATE stock SET quantity = quantity + ? WHERE commodity = ? AND quality = ?',[value, product, quality],  
                    (error,results) => { 
                    if(error){
                        console.log(error)
                    } else {
                        // res.redirect('/distribution');
                        // console.log('inserted into db')
                    }     
                }); 
            } 
       }
});

module.exports = router;