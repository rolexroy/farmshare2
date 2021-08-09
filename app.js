const express = require("express");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session')
const bcrypt = require('bcrypt')
const ejs = require('ejs');
const multer = require('multer');
const uuid = require('uuid').v4;



const app = express();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge:60*60*24
    }

}))
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads');
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
    database: 'farmshare'

});
connection.connect()



  app.use((req,res,next)=>{
    if(req.session.userId === undefined){
        res.locals.isLoggedIn = false;
        console.log('you are not logged in')
    } else {
    res.locals.isLoggedIn = true
        res.locals.email = req.session.email
        console.log('logged in')
        }
     next()
})


// connection.connect(function(err) {
//     if(err) {
//         console.log('error connecting: ' + err.stack);
//         return;
//     }
// });

app.get('/', (req,res) => {
    if(res.locals.isLoggedIn){
        res.render('index');
    } else {
         res.sendStatus(401)
    }
});

app.post('/farmer/new', (req, res) => {
    let id = req.body.id;
    let group = req.body.group;
    if(res.locals.isLoggedIn){
        connection.query('INSERT INTO farmers (groupName, name, tel, plotSize, plotNature, valueChain, investement, harvest, weight) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)',
    [group, req.body.name, req.body.tel, req.body.plot, req.body.plot_nature, req.body.valueChain, req.body.investment, req.body.harvest, req.body.weight],
    
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
//register farmer 

app.get('/register',(req,res)=>{
    res.render('register')
})
app.get('/aggregation',(req, res) => {
    const query = `SELECT farmers.groupName AS groupName, production.commodity, production.quality, SUM(production.expectedYield) AS quantity
    FROM farmers
    INNER JOIN production ON production.id = farmers.id
    GROUP BY  groupName, commodity, quality;`
    connection.query(
        query,
        (error, results) => {
            
            res.render('aggregation' , {
                data:results
            });
        }
    );
});

//aggregation json

app.get('/aggregation.json',(req,res)=>{
    const query = `SELECT farmers.groupName AS groupName, production.commodity, production.quality, SUM(production.expectedYield) AS quantity
    FROM farmers
    INNER JOIN production ON production.id = farmers.id
    GROUP BY  groupName, commodity, quality;`
    
    connection.query(query,(error, results) => {
        res.json(results);
        }
    );
})

//get farmers

app.get('/farmers',(req,res)=>{
    if(res.locals.isLoggedIn){
        connection.query('SELECT * FROM  farmers',(error,results)=>{
            res.render('farmers',{items:results})
        })
    } else {
        res.redirect('/signin')
    }
   
})

//json farmers

app.get('/farmers.json',(req,res)=>{
    connection.query('SELECT * FROM farmers',(error,results)=>{
        res.json(results)
    })
})


app.get('/marketing', (req, res) => {
    const query = `SELECT * FROM order_table `
    if(res.locals.isLoggedIn){
        connection.query(
            query,
            (error, results) => {
                console.log(results);
                res.render('marketing' , {
                    data:results
                });
            }
        );
    } else {
        res.redirect('/signin')
    }
    
});

//marketing json
app.get('/marketing.json', (req, res) => {
    const query = `SELECT * FROM order_table `
    connection.query(
        query,
        (error, results) => {
           res.json(results)
        }
    );
});


app.post('/order/store', (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    if(res.locals.isLoggedIn){
        connection.query('INSERT INTO order_table (id,commodity, quality,quantity,name) VALUES (?, ?, ?, ?, ? )',
        [id,req.body.product, req.body.quality, req.body.quantity,name],
        
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

app.get('/blog', (req, res) => {
    const blog = 'SELECT * FROM blog';
    connection.query(
        blog,
        (error, results) => {
            res.render('blog' , {
                items:results,
            });
        }
    );
});

app.get('/blog/new', (req, res) => {
    res.render('create')
});

// app.post('/posts/store', upload.single('myImage'), (req, res) => {
//     let articleName = req.body.title;
//     let image = req.file.filename;
//     connection.query('INSERT INTO blog (title, content, image) VALUES (?, ?, ?)',
//     [articleName, req.body.content, image],
    
//     (error,results) => { 
//         if(error){
//             console.log(error)
//         } else {
//             res.redirect('/blog');
//             // console.log('inserted into db')
//         }
        
//     });
// });

//view page
app.get('/post/:id',(req,res) => {
    // get route parameter (id)
    
    let id = Number(req.params.id);
   
        connection.query(        
            'SELECT * FROM blog WHERE id = ? ',[id] ,
            (error,results) => {
            //     console.log(results);
            //   console.log(typeof id)
                 if(results.length === 1){
                    res.render ('view' , {item : results[0]});
                 } else {
                    //  res.render ('error');
                 }
            }
        );
    
});

// edit page
app.get('/blog/:id', upload.single('myImage') ,(req,res) => {
    // get route parameter (id)
    let id = Number(req.params.id);
        connection.query(        
            'SELECT * FROM blog WHERE id = ? ',[id] ,
            (error,results) => {
                // if(results.length === 1){
                    res.render ('edit' , {item : results[0]});
                // } else {
                //     res.render ('error');
                // }
            }
        );
});

//update item
app.post('/update/:id', upload.single('myImage'), (req, res) => {
    let title = req.body.title;
    // console.log(req.file.filename);
    let content = req.body.content;
    // let image = req.body.image;
    let image = req.file.filename;

    connection.query('UPDATE blog SET title = ?, content = ?, image = ? WHERE id = ? ',
        [title, content, image, req.params.id],
        (error, results) => {
            if(error){
                console.log(error)
            } else {
                res.redirect('/blog');
            } 
        }
    );
});

//delete item
app.post('/delete/:id', (req ,res) => {
    const id = Number(req.params.id);
    connection.query('DELETE FROM blog WHERE id = ?',[id], 
        (error, results) => {
            res.redirect('/blog');
        }
    );
})

app.get('/production',(req,res)=>{
    if(res.locals.isLoggedIn){
        connection.query('SELECT farmers.name,farmers.groupname,farmers.valuechain,production.expectedYield,production.commodity FROM farmers INNER JOIN production',(error,results)=>{
        
            if(error){
                console.log(error)
            } else {
               res.render('production')
            }
        })
    } else {
        res.redirect('/signin')
    }
   
    
})

//production json
app.get('/production.json',(req,res)=>{
    connection.query('SELECT farmers.name,farmers.groupname,farmers.valuechain,production.expectedYield,production.commodity FROM farmers INNER JOIN production',(error,results)=>{
        res.json(results)
        
    })
    
})



app.post('/product/new',(req,res)=>{ 
    if(res.locals.isLoggedIn){
        let id = req.body.id
    let farmer_id = req.body.farmerId
    let commodity = req.body.commodity
    let yield = req.body.yield
    let collection = req.body.collection
    let region = req.body.region
    let quality = req.body.quality
    
    connection.query('INSERT INTO production (id,farmer_id,commodity,expectedYield,collectionCenter,region,quality) VALUES(?,?,?,?,?,?,?)',[id,farmer_id,commodity,yield,collection,region,quality],
    (error,results) =>{
        if(error){
            console.log(error)
        } else {
            console.log('values inserted successfully')
            res.redirect('/')
        }
    }
    )
    } else {
        res.redirect('/signin')
    }
    

})

//signup
app.get('/signup',(req,res)=>{
    res.render('signup')
})
app.post('/signup',(req,res)=>{
    let password = req.body.password
    let name = req.body.name
    bcrypt.hash(password,10,(error,hash)=>{
        connection.query('INSERT INTO user (name,password) VALUES (?,?)',[name,hash],(error,results)=>{
            if(error){
                console.log(error)
            } else {
                res.redirect('/signin')
            }
        })
    })
  
})

app.get('/signin',(req,res)=>{
    res.render('signin')
})
app.post('/signin',(req,res)=>{
    let name = req.body.name
    let password = req.body.password
    connection.query('SELECT * FROM user where name = ?',name,(error,results)=>{
        bcrypt.compare(password,results[0].password,(error,isTrue)=>{
           
            if(isTrue){
                req.session.userId = results[0].id
                res.redirect('/')
               
            } else {
                res.redirect('/signin')
                
            }
        })
    })
})

//logout

app.get('/logout',(req,res)=>{
    req.session.destroy(function(err) {
        res.redirect('/signin')
      })
})
app.listen(3000 , () => {
    console.log('App listening on port 3000');
});