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

router.get('/',(req,res)=>{
    if(res.locals.isLoggedIn){
        connection.query('SELECT * FROM  farmers',(error,results)=>{
            res.render('farmers',{items:results})
        })
    } else {
        res.redirect('/signin')
    }
   
})

//json farmers

router.get('/farmers.json',(req,res)=>{
    connection.query('SELECT * FROM farmers',(error,results)=>{
        res.json(results)
    })
})

router.post('/new', (req, res) => {
    let id = req.body.id;
    let group = req.body.group;
    if(res.locals.isLoggedIn){
        connection.query('INSERT INTO farmers (groupName,name, tel, plotSize, plotNature, valueChain, investement, harvest, weight,date) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?)',
    [group, req.body.name, req.body.tel, req.body.plot, req.body.plot_nature, req.body.valueChain, req.body.investment, req.body.harvest, req.body.weight,req.body.date],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            res.redirect('/');
            // console.log('inserted into db')
        }
        
    });
    } else {
        res.redirect('/signin')
    }
    
});

router.get('/statistics.json',(req,res)=>{
    connection.query('SELECT COUNT(name) AS Number,MONTHNAME(date) as Month,YEAR(date) AS year FROM farmers GROUP BY Month,year ORDER BY Month DESC',(error,results)=>{
           res.json(results)
    })
})

module.exports = router;