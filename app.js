const express = require("express");
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const multer = require('multer');
const uuid = require('uuid').v4;

const app = express();
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './farmshare/public/uploads');
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
    database: 'farmshare'

});
connection.connect()

app.get('/', (req,res) => {
  connection.query('SELECT * FROM farmers', (error, results) => {
    res.render('index',{items:results})
  }) 
});

app.get('/register', (req,res) => {
      res.render('register');
  });

app.post('/farmer/new', (req, res) => {
    let id = req.body.id;
    let group = req.body.group;
    connection.query('INSERT INTO farmers (groupName, fname, lname, tel, plotSize, plotNature, valueChain, investement, harvest, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [group, req.body.fname, req.body.lname, req.body.tel, req.body.plot, req.body.plot_nature, req.body.valueChain, req.body.investment, req.body.harvest, req.body.weight],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            res.redirect('/');
            // console.log('inserted into db')
        }   
    });
});

// edit farmers records
app.get('/farmers/:id',(req,res) => {
    // get route parameter (id)
    let id = Number(req.params.id);

    // if(res.locals.isLoggedIn){
        connection.query(        
        'SELECT * FROM farmers WHERE id = ?',[id] ,
        (error,results) => {
            if(results.length === 1){
                res.render ('editfarmer' , {item : results[0]});
            }else{
                res.render ('error');
            }
        }
    );
    // }else{
    //     res.redirect('/login');
    // }
    
})

//update farmer record
app.post('/update/farmer/:id', (req, res) => {
    let id = Number(req.params.id);
    let group = req.body.group;
    connection.query('UPDATE blog SET groupName = ?, name = ?, tel = ?, plotSize = ?, plotNature = ?, valueChain = ?, investement = ?, harvest = ?, weight = ? WHERE id = ? ',
        [group, req.body.fname, req.body.lname, req.body.tel, req.body.plot, req.body.plot_nature, req.body.valueChain, req.body.investment, req.body.harvest, req.body.weight],
        (error, results) => {
            if(error){
                console.log(error)
            } else {
                res.redirect('/blog');
            } 
        }
    );
});

//delete farmer
app.post('/delete/:id', (req ,res) => {
    const id = Number(req.params.id);
    connection.query('DELETE FROM farmers WHERE id = ?',[id], 
        (error, results) => {
            res.redirect('/');
        }
    );
})

app.get('/aggregation',(req, res) => {
    const query = `SELECT farmers.groupName , production.commodity, production.quality, SUM(production.expectedYield) AS quantity
    FROM farmers
    INNER JOIN production ON production.id = farmers.id
    GROUP BY  groupName, commodity, quality;`
    connection.query(
        query,
        (error, results) => {
            console.log(results);
            res.render('aggregation' , {
                data:results
            });
        }
    );
});

app.get('/value_addition',(req, res) => {
    const query = `SELECT * FROM value_addition`
    connection.query(
        query,
        (error, results) => {
            res.render('value_addition', {item:results});
        }
    ); 
})

app.post('/value/store', (req, res) => {
    connection.query('INSERT INTO value_addition (commodity, quality, amount, final_product, valueAddedWeight) VALUES (?, ?, ?, ?, ?)',
    [req.body.product, req.body.quality, req.body.amount, req.body.final_product, req.body.valueAddedWeight],
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            res.redirect('/value_addition');
        }  
    }); 
});

// edit value added records
app.get('/value_addition/:id',(req,res) => {
    // get route parameter (id)
    let id = Number(req.params.id);
    // if(res.locals.isLoggedIn){
        connection.query(        
        'SELECT * FROM value_addition WHERE id = ?',[id] ,
        (error,results) => {
            console.log(results);
            if(results.length === 1){
                res.render ('editValueAddition' , {item : results[0]});
               
            }else{
                // res.send ('error');
                res.render ('editValueAddition' , {item : results[0]});
            }
        }
    );
    // }else{
    //     res.redirect('/login');
    // }
    
})

//update value addition table
app.post('/update/value_addition/:id', (req, res) => {
    let id = Number(req.params.id);
    connection.query('UPDATE value_addition SET  id = ?, commodity = ?, quality = ?, amount = ?, stage = ?, final_product = ?, valueAddedWeight = ? ',
        [ req.body.id, req.body.commodity, req.body.quality, req.body.amount,req.body.stage, req.body.final_product, req.body.valueAddedWeight, req.body.quantity],
        (error, results) => {
            if(error){
                console.log(error)
            } else {
                res.redirect('/value_addition');
            } 
        }
    );
});

//delete value addition
app.post('/remove/value_addition/:id', (req ,res) => {
    const id = Number(req.params.id);
    connection.query('DELETE FROM value_addition WHERE id = ?',[id], 
        (error, results) => {
            res.redirect('/value_addition');
        }
    );
})

app.get('/marketing', (req, res) => {
    const query = `SELECT * FROM orders `
    connection.query(
        query,
        (error, results) => {
            res.render('marketing' , {
                item:results
            });
        }
    );
});

// edit order records
app.get('/order/:id',(req,res) => {
    // get route parameter (id)
    let id = Number(req.params.id);
    // if(res.locals.isLoggedIn){
        connection.query(        
        'SELECT * FROM orders WHERE id = ?',[id] ,
        (error,results) => {
            if(results.length === 1){
                res.render ('edit_order' , {data : results[0]});
               
            }else{
                res.send ('error');
            }
        }
    );
    // }else{
    //     res.redirect('/login');
    // }
    
})

app.post('/order/store', (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    connection.query('INSERT INTO orders (customer_id, customer_name, commodity, quality, quantity, collection_point) VALUES (?, ?, ?, ?, ?, ?)',
    [id, name, req.body.product, req.body.quality, req.body.quantity, req.body.collection],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            res.redirect('/marketing');
            // console.log('inserted into db')
        }   
    }); 
});

//update order table
app.post('/update/order/:id', (req, res) => {
    let id = Number(req.params.id);
    connection.query('UPDATE orders SET  customer_id = ?, commodity = ?, quality = ?, quantity = ? ',
        [ req.body.customer_id, req.body.commodity, req.body.quality, req.body.quantity],
        (error, results) => {
            if(error){
                console.log(error)
            } else {
                res.redirect('/marketing');
            } 
        }
    );
});

//delete order
app.post('/remove/order/:id', (req ,res) => {
    const id = Number(req.params.id);
    connection.query('DELETE FROM orders WHERE id = ?',[id], 
        (error, results) => {
            res.redirect('/marketing');
        }
    );
})

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
//create blog post
app.get('/blog/new', (req, res) => {
    res.render('create')
});

//view page
app.get('/post/:id',(req,res) => {
    // get route parameter (id)
    let id = Number(req.params.id);
        connection.query(        
            'SELECT * FROM blog WHERE id = ? ',[id] ,
            (error,results) => {
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

//delete blog
app.post('/delete/:id', (req ,res) => {
    const id = Number(req.params.id);
    connection.query('DELETE FROM blog WHERE id = ?',[id], 
        (error, results) => {
            res.redirect('/blog');
        }
    );
})

app.get('/production',(req,res)=>{
    connection.query('SELECT farmers.name,farmers.groupName,farmers.valueChain,production.expectedYield,production.commodity FROM farmers INNER JOIN production ON farmers.id = production.farmer_id',(error,results)=>{
        
        if(error){
            console.log(error)
        } else {
           res.render('production',{items:results})
        }
    })
})

app.post('/product/new',(req,res)=>{ 
    let id = req.body.id
    let farmer_id = req.body.farmerId
    let commodity = req.body.commodity.toLowerCase();
    let yield = req.body.yield
    let collection = req.body.collection
    let region = req.body.region
    let harvest = req.body.harvest;
    let quality = req.body.quality;

    // const query = `SELECT production.commodity, production.quality, SUM(production.expectedYield) AS quantity
    // FROM farmers
    // INNER JOIN production ON production.id = farmers.id
    // GROUP BY  groupName, commodity, quality;`
  
    connection.query('INSERT INTO production (id, farmer_id, commodity, quality, expectedYield, collectionCenter, region) VALUES(?, ?, ?, ?, ?, ?, ?)',[id, farmer_id, commodity, quality, yield, collection, region],
    (error, results) => {
        if(error){
            console.log(error)
        } else {
            console.log('values inserted successfully')
            res.redirect('/production')
        }
    })
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

//Distribution store form
app.post('/distribution/store/form',(req,res)=>{
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
            // function stock(){
                console.log( results);
            // }
        } 
    }); 
    // console.log(stock());
    // _____________________________________________________________________________________________________________________________________
    connection.query('INSERT INTO distribution ( product, quality, quantity, payment, collection_point, expected_date, actual_date, delivery_status, groupName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [ product, req.body.quality, req.body.quantity, req.body.payment, req.body.collection_point, req.body.expected_date, req.body.actual_date, delivery, groupName],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            res.redirect('/distribution');
            // console.log('inserted into db')
        }
        
    }); 
    // __________________________________________________________________________________________________________________________________
    if(delivery === 'Delivered'){
        connection.query('UPDATE stock SET quantity = quantity - ? WHERE groupName= ? AND commodity = ? AND quality = ?',[quantity, groupName, product, quality],  
            (error,results) => { 
            if(error){
                console.log(error)
            } else {
                // res.redirect('/distribution');
                // console.log('inserted into db')
            }     
        }); 
    } 
});

//edit distribution data
app.get('/distribution/:id', (req,res) => {
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

app.listen(3080 , () => {
    console.log('App listening on port 3080');
});