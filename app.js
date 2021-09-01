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
    password: '',
    multipleStatements:true,
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


connection.connect(function(err) {
    if(err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
});
app.get('/signup',(req,res)=>{
    res.render('signup')
 })
  
  
app.post('/signup',(req,res)=>{
    let name = req.body.name
    let password = req.body.password
    
        bcrypt.hash(password,10,(error,hash) => {
           connection.query('INSERT INTO user(name,password) VALUES (?,?)',
            [name,hash],
           res.redirect('/signin')
           )
        })         
    })

app.get('/', (req,res) => {
    if(res.locals.isLoggedIn){
        res.render('index');
    } else {
        //  res.sendStatus(401)
        res.redirect('/signin')
    }
});

//signin
app.get('/signin',(req,res)=>{
    res.render('signin')
})

app.post('/signin',(req,res)=>{
    let name = req.body.name
    let password = req.body.password
    
   connection.query('SELECT * FROM user WHERE name = ?',[name],(error,results)=>{
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


app.post('/farmer/new', (req, res) => {
    let id = req.body.id;
    let group = req.body.group;
    if(res.locals.isLoggedIn){
        connection.query('INSERT INTO farmers (groupName, farmerName, tel, plotSize, plotNature, valueChain, investement, harvest, weight,date) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?)',
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

//dashboard json
app.get('/farmer-statistics.json',(req,res)=>{
    connection.query('SELECT COUNT(name) AS Number,MONTHNAME(date) as Month,YEAR(date) AS year FROM farmers GROUP BY Month,year ORDER BY Month DESC',(error,results)=>{
           res.json(results)
    })
})
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

//store posts
app.post('/posts/store', upload.single('myImage'), (req, res) => {
    let articleName = req.body.title;
    let image = req.file.filename;
    connection.query('INSERT INTO blog (title, content, image) VALUES (?, ?, ?)',
    [articleName, req.body.content, image],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            res.redirect('/blog');
            // console.log('inserted into db')
        }
        
    });
});

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
                
                    res.render ('edit' , {item : results[0]});
                
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
        // connection.query('SELECT farmers.name,farmers.groupname,farmers.valuechain,production.expectedYield,production.commodity FROM farmers INNER JOIN production ON farmers.id = production.farmer_id;',(error,results)=>{
]
        connection.query('SELECT farmerName, id from farmers',(error,results)=>{

        
            if(error){
                console.log(error)
            } else {
               res.render('production',{names:results})
            }
        })
    } else {
        res.redirect('/signin');
    }   
})

//production json
app.get('/production.json',(req,res)=>{

    connection.query('SELECT * FROM production CROSS JOIN farmers',(error,results)=>{
        res.json(results)
        
    })
    
})

app.post('/product/new',(req,res)=>{ 
    if(res.locals.isLoggedIn){
        let id = req.body.id
<<<<<<< HEAD
        let farmer_id = req.body.farmerId
        let commodity = req.body.commodity
        let yield = req.body.yield
        let collection = req.body.collection
        let region = req.body.region
        let quality = req.body.quality
=======
    let farmerName = req.body.farmerName
    let commodity = req.body.commodity
    let yield = req.body.yield
    let collection = req.body.collection
    let region = req.body.region
    let quality = req.body.quality
>>>>>>> 031d782ac42110c68bc67fc4651dc9681f07222b
    
    const queries = [
        'SELECT name FROM customers',
        'INSERT INTO production (id,commodity,expectedYield,collectionCenter,region,quality,farmerName) VALUES(?,?,?,?,?,?,?)'
    ]
    
    connection.query(queries.join(';'),[id,commodity,yield,collection,region,quality,farmerName],
    (error,results,fields) =>{
        if(error){
            console.log(error)
        } else {
            console.log('values inserted successfully')
            res.send(results[0])
        }
    }
    )

<<<<<<< HEAD
        // ___________________________________________________________________________________________________________________________________
        connection.query('UPDATE stock SET quantity = quantity + ? WHERE commodity = ? AND quality = ?',[yield, commodity, quality],  
        (error,results) => { 
        if(error){
            console.log(error)
        } else {
            // res.redirect('/distribution');
            // console.log('inserted into db')
        }     
        }); 
      
        connection.query('INSERT INTO stock  VALUES(?, ?, ?) WHERE commodity IS NULL',[commodity, quality, yield,],  
        (error,results) => { 
        if(error){
            console.log(error)
        } else {
            // res.redirect('/distribution');
            // console.log('inserted into db')
        }     
        }); 

=======
    connection.query('UPDATE stock SET quantity = quantity + ? WHERE commodity = ? AND quality = ?',[yield, commodity, quality],  
    (error,results) => { 
    if(error){
        console.log(error)
    } else {
        // res.redirect('/distribution');
        // console.log('inserted into db')
    }     
    }); 

    connection.query('INSERT INTO stock VALUES(?,?,?) WHERE commodity IS NULL',  [commodity,quality,yield],
    (error,results) => { 
    if(error){
        console.log(error)
    } else {
        // res.redirect('/distribution');
        console.log('inserted into db')
    }     
    })
>>>>>>> 031d782ac42110c68bc67fc4651dc9681f07222b
    } else {
        res.redirect('/signin')
    }
})
    
})
app.get('/distribution',(req,res)=>{
    connection.query('SELECT distribution.order_id, distribution.product, distribution.quality , distribution.quantity, distribution.payment , distribution.collection_point, distribution.expected_date, distribution.actual_date, delivery_status FROM distribution',(error,results)=>{
        
        if(error){
            console.log(error)
        } else {
           
           res.render('distribution', {items:results})





}
    })
    
})
//Distribution form
app.get('/distribution/form',(req,res)=>{
    connection.query('SELECT stock.groupName FROM stock',(error,results)=>{
        
        if(error){
            console.log(error)
        } else {
           res.render('distribution_form',{items:results})
        }
    })
})

//Distribution view
app.get('/distribution',(req,res)=>{
    connection.query('SELECT distribution.order_id, distribution.product, distribution.quality , distribution.quantity, distribution.payment, distribution.collection_point, distribution.expected_date, distribution.actual_date, delivery_status FROM distribution',(error,results)=>{
        
        if(error){
            console.log(error)
        } else {
           res.render('distribution', {items:results})
       
        }
    })
    
})

//stock json
app.get('/stock.json',(req,res)=>{
    connection.query('SELECT * FROM stock',(error,results)=>{
        res.json(results)
    })
})

//Distribution store form
app.post('/distribution/store/form',(req,res)=>{
    let id = req.body.id;
    let product = req.body.product.toLowerCase();
    let quality = req.body.quality;
    let quantity = req.body.quantity;
    let delivery = req.body.delivery;
    let groupName = req.body.groupName;  
    
    connection.query('SELECT stock.quantity FROM stock WHERE commodity = ? AND quality = ? AND groupName = ? ; SELECT stock.groupName FROM stock',[product, quality, groupName],
    (error, results) => {
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
<<<<<<< HEAD
        } 
    }
    })
    // _____________________________________________________________________________________________________________________________________

    // __________________________________________________________________________________________________________________________________

})

//edit distribution data
app.get('/distribution/:id', (req,res) => {
    let id = Number(req.params.id);
        connection.query(        
            'SELECT * FROM distribution WHERE order_id = ?; SELECT stock.groupName FROM stock ',[id] ,
            (error,results) => {
                // if(results.length === 1){
                    let check = results[0].delivery_status == 'Delivered';
                     res.render ('edit_distribution', {items : results[0], groups : results[1]});
=======
        })
}
  
})

app.get('/distribution/:id', (req,res) => {
    let id = Number(req.params.id);
        connection.query(        
            'SELECT * FROM distribution WHERE order_id = ? ',[id] ,
            (error,results) => {
                // if(results.length === 1){
                    let check = results[0].delivery_status == 'Delivered';
                    res.render ('edit_distribution' , {item : [results[0], check]});
>>>>>>> 031d782ac42110c68bc67fc4651dc9681f07222b
                // } else {
                //     res.render ('error');
                // }
            }
        );
});

//update distribution record
app.post('/update/distribution/:id', (req, res) => {
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
//sales

app.get('/sales',(req,res)=>{

    const queries = [
        'SELECT name FROM customers',
        'SELECT * FROM invoice INNER JOIN customers ON invoice.customer_id = customers.id'
    ]
    connection.query(queries.join(';'),(error,results,fields)=>{
        
        if(error){
            console.log(error)
        } else {
         
           res.render('sales', {customers:results[0],
        invoices:results[1]})
            
        }
    })
})
//json sales
app.get('/sales.json',(req,res)=>{
    connection.query('SELECT * FROM invoice INNER JOIN customers ON invoice.customer_id = customers.id',(error,results)=>{
        res.json(results)
    })

})
app.get('/sales/:id',(req,res)=>{
    let id = req.params.id
    
    connection.query(`SELECT * FROM invoice INNER JOIN customers on invoice.customer_id = customers.id WHERE id = ${id}`, id,(error,results)=>{
        if(error){
            console.log(error)
        } else {
            res.render('invoice',{items:results})
           
        }
    })
    
    
})
app.post('/sales/:id',(req,res)=>{
  
    let payment = Number(req.body.payment),
        paidDate = req.body.paidDate,
        invoiceNumber = Number(req.body.invoiceNumber);
    connection.query(`UPDATE invoice SET payment = payment +  ? ,date_paid = ? WHERE invoice_number = ?`,[payment,paidDate, invoiceNumber],(error,results)=>{
        if(error){
            console.log(error)
        } else {
           res.redirect('/sales')
        }
    })
})
app.post('/sales',(req,res)=>{
    let invoice = req.body.invoiceDate,
        dueDate = req.body.dueDate,
        customer = req.body.customer,
        item = req.body.item,
        quantity = req.body.quantity,
        amount = req.body.amount,
        payment = req.body.payment,
        balance = req.body.balance;
     const query = 'if '
    connection.query('INSERT INTO invoice (Dates,due_dates,customer_id,item,quantity,amount,balance) VALUES(?,?,?,?,?,?,?)',[invoice,dueDate,customer,item,quantity,amount,balance],(error,results)=>{
        if(error){
            console.log(error)
        } else {
            res.redirect('/sales')
        }
    })

})

app.get('/customers',(req,res)=>{
    connection.query('SELECT * FROM customers',(error,results)=>{
        res.render('customers',{customers:results})
    })
    
})

app.post('/customers',(req,res)=>{
    let name = req.body.name,
        phoneNumber = req.body.phoneNumber,
        email = req.body.email;

    connection.query('INSERT INTO customers (name,phone_number,email) VALUES (?,?,?)',[name,phoneNumber,email],(error,results)=>{
        res.redirect("/customers")
    })
})

//signup
app.get('/signup',(req,res)=>{
    res.render('signup')
})


app.post('/signup',(req,res)=>{
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
app.get('/signin',(req,res)=>{
    res.render('signin')
})
app.post('/signin',(req,res)=>{
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

app.get('/logout',(req,res)=>{
    req.session.destroy(function(err) {
        res.redirect('/signin')
      })
})
app.listen(3080, () => {
    console.log('Listening to port 3080')
});
