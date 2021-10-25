const express = require("express");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session')
const AfricasTalking = require('africastalking');
const reload = require('reload')
const ejs = require('ejs');
const multer = require('multer');
const uuid = require('uuid').v4;
const farmerRoute = require('./Routes/farmer')
const salesRoute = require('./Routes/sales')
const productionRoute = require('./Routes/production')
const distributionRoute = require('./Routes/distribution')
const userRoute = require('./Routes/user')
const blogRoute = require('./Routes/blog')
const marketingRoute = require('./Routes/marketing')
const aggregationRoute = require('./Routes/aggregation')
const customersRoute = require('./Routes/customers');
const { parse } = require("uuid");


const app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge:60*60*24
    }

}))

app.use(express.static('../farmshare2/public'));
app.set('views', './views');
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../farmshare/public/uploads');
    },
    filename: (req, file, cb) => {
      const { originalname } = file;
      cb(null, `${uuid()}-${originalname}`);     
    }  
});

const upload = multer({ storage });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const connection = mysql.createConnection({
    host: 'us-cdbr-east-04.cleardb.com',
    user: 'b889825c0db19b',
    password: '08dae91e',
    multipleStatements:true,
    database: 'heroku_da6aaf54a461862'

});

connection.connect()

  app.use((req,res,next)=>{
    if(req.session.userId === undefined){
        res.locals.isLoggedIn = false;
    } else {
    res.locals.isLoggedIn = true
        res.locals.email = req.session.email
       
        }
     next()
})
const port = process.env.PORT || 3000
// const africastalking = AfricasTalking({
//     apiKey: 'e3edeea31332ecb31388fe2b2f4f1c0c418443a9c3bf31c9e87e213e26ae5d71', 
//     username: 'sandbox'
//   });

// function sendSMS(){
//     app.post('/msg',async (req,res)=>{
//         try{
//             const msg = req.body.msg
//             const result=  await africastalking.SMS.send({
//               to: '+254700356447', 
//               message: msg,
//               from: 'FRMSHARE'
//             });
//             console.log(result);
//         } catch(ex){
//             console.error(ex)
//         }
      
           
         
//     })
    
// }

 
// sendSMS()
app.use('/farmers',farmerRoute)
app.use(salesRoute)
app.use(productionRoute)
app.use(distributionRoute)
app.use(userRoute)
app.use(blogRoute)
app.use(marketingRoute)
app.use(aggregationRoute)
app.use(marketingRoute)
app.use(customersRoute)


app.get('/', (req,res) => {
    if(res.locals.isLoggedIn){
        res.render('index');
    } else {
        //  res.sendStatus(401)
        res.redirect('/signin')
    }
});
app.get('/register',(req,res)=>{
    res.render('register')
})

app.get('/stock.json',(req,res)=>{
    connection.query('SELECT * FROM stock',(error,results) => {
        res.json(results)
    })
})



app.post('/',(req,res)=>{
   const{ phoneNumber,text,sessionId } = req.body
   let response;

   if(text === ''){
       response = 'CON Enter farmer id'
   } 
   if(text !== ''){
    
       let array = text.split('*')
      
       if(array.length === 1){
        connection.query('SELECT id FROM farmers',(error,results)=>{
            const id = results.find(result => result.id === array[0])
            if(id !== 'undefined'){
                response = 'CON Select support needed.\n1.Agroinputs\n2.Extension services'
            } else {
                response = 'END You are not registered'
            }
            
        })
        
       } else if(array.length === 2){
        
           if(parseInt(array[1]) === 1){
               response = 'CON Select agroinputs needed\n1.Chicks\n2.Seedlings'
               
           } else if(parseInt(array[1]) === 2) {
               console.log(array)
               response = 'CON Select Extension services needed\n1.Vetenirany services\n2.Weeding'
           } else{
               response = 'END Invalid input'
           }

       } 
      
    
   
   else if(array.length === 3){
      
    if(parseInt(array[2]) === 1){
        connection.query('UPDATE production SET support = ? WHERE farmerId = ?', ['Chicks',parseInt(array[0])],(error,results)=>{
            if(error){
                console.log(error)
            } else {
            response = 'END Your data was saved successfully'
             console.log('inserted into db')
            }
        })
    
    } else if(parseInt(array[2]) === 2){
        connection.query('INSERT INTO production (support) VALUES (?) WHERE farmerId = ?', ['Seedlings',array[0]],(error,results)=>{
            if(error){
                console.log(error)
            } else {
            response = 'END Your data was saved successfully'
             console.log('inserted into db')
            }
        })
        
    } else {
        response = 'END invalid input'
    }
   }

}

   setTimeout(()=>{
       res.send(response)
       res.end()

   },1500)
})



app.listen(port, () => {
    console.log('Listening to port 3000')
});
