const express = require('express')
const mysql = require('mysql');
const router = express.Router()
const bcrypt = require('bcrypt')


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sql1pass',
    multipleStatements:true,
    database: 'farmshare'

});
connection.connect()


router.get('/signup',(req,res)=>{
    res.render('signup')
})


router.post('/signup',(req,res)=>{
    let name = req.body.name
    let password = req.body.password
    
 
    
       bcrypt.hash(password,10,(error,hash) => {
          connection.query('INSERT INTO user(name,password) VALUES (?,?)',
          [name,hash],
          res.redirect('/signinin')
          
          )
          
       })
     
       console.log('Account created successfully')
    
 
 })
//signin
router.get('/signin',(req,res)=>{
    res.render('signin')
})
router.post('/signin',(req,res)=>{
    let name = req.body.name
    let password = req.body.password

   connection.query('SELECT * FROM user WHERE name = ?',name,(error,results)=>{
    bcrypt.compare(password,results[0].password,(error,isEqual) =>{
       if(isEqual){
             req.session.userId = results[0].id
           
             res.redirect('/')
          } else {
             console.log("incorrect password")
             res.redirect('/signin')
          }
        })
    
 })
})

router.get('/logout',(req,res)=>{
    req.session.destroy(function(err) {
        res.redirect('/signin')
      })
})

module.exports = router;