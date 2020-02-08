require("dotenv").config();

const { Pool } = require("pg");

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
  connectionString: connectionString
});

pool.connect();

const PAGE = 1;
const PAGE_SIZE = 10;

exports.list = function(req, res) {
  let page = req.query.page ? req.query.page : PAGE;
  let pageSize = req.query.pageSize ? req.query.pageSize : PAGE_SIZE;
  let sortByName = req.query.sortBy ? req.query.sortBy : "id";
  let sortOrder = req.query.sortOrder ? req.query.sortOrder : "ASC";
  let dataQuery = "";
  let countQuery = "";
  let query = req.query.q;

  if (query) {
    dataQuery = `SELECT * FROM breeds WHERE name LIKE '${query}%' ORDER BY ${sortByName} ${sortOrder} LIMIT '${pageSize}' OFFSET '${(page -
      1) *
      pageSize}' `;
    countQuery = `SELECT COUNT(*) FROM breeds WHERE name LIKE '${query}%' `;
  } else {
    dataQuery = `SELECT * FROM breeds ORDER BY ${sortByName} ${sortOrder} LIMIT '${pageSize}' OFFSET '${(page -
      1) *
      pageSize}' `;
    countQuery = `SELECT COUNT(*) FROM breeds `;
  }

  let totalNumbers;
  executeQuery(countQuery)
    .then(countResult => {
      if (!countResult.success) {
        throw { error: "Invalid Query in getting count" };
      }
      totalNumbers = Number(countResult.data[0].count);
      return executeQuery(dataQuery);
    })
    .then(data => {
      if (!data.success) {
        throw { error: "Invalid Query in getting data" };
      }
      return res.status(200).json({
        success: true,
        pagination: { pageSize, page, total: totalNumbers },
        data: data.data
      });
    })
    .catch(err => {
      res.status(400).send({ success: false, ...err });
    });
};

const executeQuery = async function(query) {
  let response;
  try {
    response = await pool.query(query);
    return { success: true, data: response.rows };
  } catch {
    return { success: false };
  }
};


exports.edit = function(req, res) {
  var id = req.params.id;

  pool.query("SELECT * FROM breeds WHERE id=$1", [id], function(err, result) {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    }
    console.log("200");
  });
};

exports.save = function(req, res) {
  console.log(req.body);
  // var cols = [req.body.adaptability, req.body.affection_level, req.body.child_friendly, req.body.description,req.body.energy_level,req.body.name, req.body.weight, req.body.stranger_friendly];
  const {
    adaptability,
    affection_level,
    child_friendly,
    description,
    energy_level,
    name,
    weight,
    stranger_friendly
  } = req.body;
  console.log(adaptability, affection_level, child_friendly);
  pool.query(
    "INSERT INTO breeds(adaptability, affection_level, child_friendly, description, energy_level, name, weight, stranger_friendly) VALUES($1, $2, $3, $4, $5, $6, $7, $8)",
    [
      adaptability,
      affection_level,
      child_friendly,
      description,
      energy_level,
      name,
      weight,
      stranger_friendly
    ],
    function(err, result) {
      if (err) {
        console.log("Error Saving : %s ", err);
      }

      res.status(200).json(result);
      console.log("added");
    }
  );
};

exports.update = function(req, res) {
  var cols = [
    req.body.name,
    req.body.address,
    req.body.email,
    req.body.phone,
    req.params.id
  ];

  pool.query(
    "UPDATE breeds SET name=$1, address=$2,email=$3, phone=$4 WHERE id=$5",
    cols,
    function(err, result) {
      if (err) {
        console.log("Error Updating : %s ", err);
      }
      console.log("200");
    }
  );
};

exports.delete = function(req, res) {
  var id = req.params.id;

  pool.query("DELETE FROM breeds WHERE id=$1", [id], function(err, rows) {
    if (err) {
      console.log("Error deleting : %s ", err);
    }
    console.log("deleted");
  });
};
