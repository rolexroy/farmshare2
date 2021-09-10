const express = require("express");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session')

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
const customersRoute = require('./Routes/customers')


const app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge:60*60*24
    }

}))

app.use(express.static('../farmshare/public'));
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
    host: 'localhost',
    user: 'root',
    password: 'sql1pass',
    multipleStatements:true,
    database: 'farmshare'

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

app.listen(3000, () => {
    console.log('Listening to port 3080')
});
