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

// router.get('/distribution',(req,res)=>{
//     connection.query('SELECT * FROM distribution;SELECT groupName from stock',(error,results)=>{
        
//         if(error){
//             console.log(error)
//         } else {
          
//            res.render('distribution', {items:results[0], groups:results[1]})





// }
//     })
    
// })

router.get('/distribution/:id',(req,res)=>{
    let id = req.params.id
    connection.query('SELECT * FROM order_table WHERE id = ?;SELECT groupName from stock',id,(error,results)=>{
      
        
        res.render("distribution",{items:results[0],groups:results[1], error: false})

    })
   
})
//Distribution form
router.get('/distribution',(req,res)=>{
    connection.query('SELECT * FROM distribution',(error,results)=>{
        
        if(error){
            console.log(error)
        } else {
           res.render('distributionInfo',{items:results})
        }
    })
})

//Distribution store form
router.post('/distribution/store/form',(req,res)=>{
    
    let id = req.body.orderID;
    let product = req.body.commodity.toLowerCase();
    let quality = req.body.quality;
    let quantity = req.body.quantity;
    let delivery = req.body.delivery;
    let groupName = req.body.groupName;
   
    
    
    connection.query('SELECT quantity FROM stock WHERE commodity = ? AND quality = ?;SELECT groupName from stock',
    [product, quality ],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
          if(Number(quantity) > results[0][0].quantity ) {
                console.log('Too much!');

                connection.query('SELECT * FROM order_table WHERE id = ?;SELECT groupName from stock',id,(error,results)=>{
      
        
                    res.render("distribution",{items:results[0],groups:results[1], error: true})
            
                })
              
                
             } else {
                connection.query('INSERT INTO distribution ( product, quality, quantity,collection_point,delivery_status, groupName) VALUES (?, ?, ?, ?, ?, ?)',
                [ product, req.body.quality, req.body.quantity,req.body.collection_point, req.body.expected_date, req.body.actual_date, delivery, groupName],  
                (error,results) => { 
                    if(error){
                        console.log(error)
                    } else {
                        res.redirect('/distribution/info');
                        // console.log('inserted into db')
                    }
                }); 
            } 
    
            if(delivery === 'Delivered' && Number(quantity) <= results[0][0].quantity ){
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