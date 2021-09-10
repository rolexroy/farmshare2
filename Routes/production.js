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


router.get('/production',(req,res)=>{
    if(res.locals.isLoggedIn){
        connection.query('SELECT name,id from farmers',(error,results)=>{
        
            if(error){
                console.log(error)
            } else {
               res.render('production',{names:results})
            }
        })
    } else {
        res.redirect('/signin')
    }
   
    
})

//production json




router.post('/product/new',(req,res)=>{ 
    if(res.locals.isLoggedIn){
        let id = req.body.id
    let farmerName = req.body.farmerName
    let trimmedFarmer = farmerName.trim()
    
    let commodity = req.body.commodity
    let yield = req.body.yield
    let collection = req.body.collection
    let region = req.body.region
    let quality = req.body.quality
    
    const query =  'INSERT INTO production (id,commodity,expectedYield,collectionCenter,region,quality,farmerName) VALUES(?,?,?,?,?,?,?);'
   
    
    connection.query(query,[id,commodity,yield,collection,region,quality,trimmedFarmer],
    (error,results) =>{
        if(error){
            console.log(error)
        } else {
            console.log('values inserted successfully')
          
            res.redirect('/production')
        }
    }
    )
    



    connection.query('UPDATE stock SET quantity = quantity + ? WHERE commodity = ? AND quality = ?',[yield, commodity, quality],  
    (error,results) => { 
    if(error){
        console.log(error)
    } else {
        //res.redirect('/distribution');
         console.log('inserted into db')
    }     
    }); 

    connection.query('INSERT INTO stock (commodity,quality,quantity) VALUES(?,?,?)',  [commodity,quality,yield],
    (error,results) => { 
    if(error){
        console.log(error)
    } else {
        //res.redirect('/distribution');
        console.log('inserted into db')
    }     
    })
    } else {
        res.redirect('/signin')
    }
    
})

router.get('/production.json',(req,res)=>{
    connection.query('SELECT * FROM farmers INNER JOIN production ON farmers.name = production.farmerName',(error,results)=>{
        res.json(results)
        
    })
    
})



module.exports = router