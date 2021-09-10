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

router.get('/aggregation',(req, res) => {
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

router.get('/aggregation.json',(req,res)=>{
    const query = `SELECT farmers.groupName AS groupName, production.commodity, production.quality, SUM(production.expectedYield) AS quantity
    FROM farmers
    INNER JOIN production ON production.id = farmers.id
    GROUP BY  groupName, commodity, quality;`
    
    connection.query(query,(error, results) => {
        res.json(results);
        }
    );
})


module.exports = router;