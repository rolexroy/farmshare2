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

connection.connect(function(err) {
    if(err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
});

app.get('/', (req,res) => {
    res.render('index');
});

app.post('/farmer/new', (req, res) => {
    let id = req.body.id;
    let group = req.body.group;
    connection.query('INSERT INTO farmers (id, groupName, fname, lname, tel, plotSize, plotNature, valueChain, investment, harvest, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )',
    [id, group, req.body.fname, req.body.lname, req.body.email, req.body.tel, req.body.plot, req.body.plot_nature, req.body.valueChain, req.body.investment, req.body.harvest, req.body.weight],
    
    (error,results) => { 
        if(error){
            console.log(error)
        } else {
            res.redirect('/blog');
            // console.log('inserted into db')
        }
        
    });
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
    connection.query('SELECT * FROM  production',(error,results)=>{
        
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
    let commodity = req.body.commodity
    let yield = req.body.yield
    let collection = req.body.collection
    let region = req.body.region
    let harvest = req.body.harvest
    connection.query('INSERT INTO production (id,commodity,expectedYield,collectionCenter,region,expectedHarvest) VALUES(?,?,?,?,?,?)',[id,commodity,yield,collection,region,harvest],
    (error,results) =>{
        if(error){
            console.log(error)
        } else {
            console.log('values inserted successfully')
            document.reload()
        }
    }
    )

})

app.listen(3000 , () => {
    console.log('App listening on port 3000');
});