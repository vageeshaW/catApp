// const { Client } = require('pg');
// var connectionString = "postgres://postgres:root@localhost:5432/database";

// const client = new Client({
//     connectionString: connectionString
// });

// client.connect();

require('dotenv').config()

const { Pool } = require('pg')

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const pool = new Pool({
  connectionString :connectionString,

})

pool.connect();

const PAGE = 1;
const PAGE_SIZE = 10;



exports.list =  function (req, res) {

   let page = req.params.page ? req.params.page : PAGE;
   let pageSize = req.params.pageSize ? req.params.pageSize : PAGE_SIZE;
   let pgQuery = '';
   let query = req.query.q;
  
   if (query){
      pgQuery = `SELECT * FROM breeds WHERE name = '${query}' `
   }else{
      pgQuery = `SELECT * FROM breeds `
   }

   let totalNumbers 
   executeQuery(pgQuery).then((to)=>{
       totalNumbers=to;
       return executeQuery(pgQuery);
   }).then((as)=>{
       console.log(as);
       return res.status(200).json({pagination:{pageSize:1,page:1,total:totalNumbers.data.length},data:as.data})
   }).
   catch((err)=>{
    res.status(400).send(err);
   });
   

};


const executeQuery = async function (query) {
    let response;
    try{
        response = await pool.query(query);
        return {success:true , data: response.rows}
    }catch{
        return { success:false}
    }
}

exports.add = function (req, res) {
    res.render('breeds/add', { title: "Add breeds"  });
};

exports.edit = function (req, res) {

    var id = req.params.id;

    pool.query('SELECT * FROM breeds WHERE id=$1', [id], function (err, result) {
        if (err) {
            console.log(err);
            res.status(400).send(err);
        }
        console.log("200")
    });

};

exports.save = function (req, res) {
console.log(req.body)
   // var cols = [req.body.adaptability, req.body.affection_level, req.body.child_friendly, req.body.description,req.body.energy_level,req.body.name, req.body.weight, req.body.stranger_friendly];
    const {adaptability,affection_level,child_friendly,description,energy_level, name, weight, stranger_friendly} = req.body
    console.log(adaptability,affection_level,child_friendly)
    pool.query('INSERT INTO breeds(adaptability, affection_level, child_friendly, description, energy_level, name, weight, stranger_friendly) VALUES($1, $2, $3, $4, $5, $6, $7, $8)',[adaptability,affection_level,child_friendly,description,energy_level, name, weight, stranger_friendly], function (err, result) {
        if (err) {
            console.log("Error Saving : %s ", err);
        }
      
        res.status(200).json(result)
        console.log('added')
    });

};

exports.update = function (req, res) {

    var cols = [req.body.name, req.body.address, req.body.email, req.body.phone, req.params.id];

    pool.query('UPDATE breeds SET name=$1, address=$2,email=$3, phone=$4 WHERE id=$5', cols, function (err, result) {
        if (err) {
            console.log("Error Updating : %s ", err);
        }
        console.log("200")
    });

};

exports.delete = function (req, res) {

    var id = req.params.id;

    pool.query("DELETE FROM breeds WHERE id=$1", [id], function (err, rows) {
        if (err) {
            console.log("Error deleting : %s ", err);
        }
        console.log("deleted")
    });

};


