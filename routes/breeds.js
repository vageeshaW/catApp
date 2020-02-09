require("dotenv").config();
const axios = require("axios");
const pgp = require("pg-promise")({
  capSQL: true
});
const { Pool } = require("pg");

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};
const db = pgp(cn);
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
        pagination: {
          pageSize: Number(pageSize),
          page: Number(page),
          total: totalNumbers
        },
        data: data.data
      });
    })
    .catch(err => {
      res.status(400).send({ success: false, ...err });
    });
};

const executeQuery = async query => {
  let response;
  try {
    response = await pool.query(query);
    return { success: true, data: response.rows };
  } catch (err) {
    return { success: false };
  }
};
const executeAddQuery = async (query, params) => {
  let response;
  try {
    response = await pool.query(query, params);
    return { success: true, data: response.rows };
  } catch (err) {
    return { success: false };
  }
};

exports.add = function(req, res) {
  let addQuery = "";
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
  addQuery = `INSERT INTO breeds(adaptability, affection_level, child_friendly, description, energy_level, name, weight, stranger_friendly) VALUES($1, $2, $3, $4, $5, $6, $7, $8) `;

  let dataArray = [
    adaptability,
    affection_level,
    child_friendly,
    description,
    energy_level,
    name,
    weight,
    stranger_friendly
  ];
  executeAddQuery(addQuery, dataArray)
    .then(addResult => {
      if (!addResult.success) {
        throw { error: " Error in  add query " };
      }
      return res.status(200).json({
        success: true,
        data: addResult.data
      });
    })
    .catch(err => {
      res.status(400).send({ success: false, ...err });
    });
};

exports.feedData = (req, res) => {
  axios({
    url: "https://api.thecatapi.com/v1/breeds",
    method: "get",
    headers: { "x-api-key": process.env.API_KEY }
  })
    .then(response => {
      let newArray = response.data.map(obj => {
        let newObj = {
          adaptability: obj.adaptability,
          affection_level: obj.affection_level,
          child_friendly: obj.child_friendly,
          description: obj.description,
          energy_level: obj.energy_level,
          name: obj.name,
          weight: obj.weight,
          stranger_friendly: obj.stranger_friendly
        };

        return newObj;
      });

      return executeAddManyQuery(newArray);
    })
    .then(result => {
      return res.status(200).json({
        success: true,
        data: { message: "data populated" }
      });
    })
    .catch(error => {
      return { success: false };
    });
};

const executeAddManyQuery = async data => {
  const cs = new pgp.helpers.ColumnSet(
    [
      "adaptability",
      "affection_level",
      "child_friendly",
      "description",
      "energy_level",
      "name",
      "weight",
      "stranger_friendly"
    ],
    { table: "breeds" }
  );
  const values = data;
  try {
    const query = pgp.helpers.insert(values, cs);
    response = await db.none(query);
    return { success: true, data: data };
  } catch (err) {
    return { success: false };
  }
};
