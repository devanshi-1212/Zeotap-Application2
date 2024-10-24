const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");

require("dotenv").config();

const app = express();
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rashmisharma",
  database: "application2",
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/test", (req, res) => {
  res.send("testing");
});

app.get("/chk", (req, res) => {
  const location = req.query.city;
  const api =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    location +
    "&appid=" +
    process.env.API_KEY;

  request(api, (err, response, body) => {
    if (err) {
      console.log("error");
      res.send("Server error.");
    } else {
      let data = JSON.parse(body);

      if (data.main == undefined) {
        console.log("undefined");
        res.send("Invalid City.");
      } else {
        const main = data.weather[0].main;
        const temp = data.main.temp;
        const feels_like = data.main.feels_like;
        const dt = data.dt;
        const time = new Date()
          .toLocaleTimeString()
          .replace(" am", "")
          .replace(" pm", "");
        const date = new Date().toLocaleDateString();

        const details = {
          location,
          main,
          temp,
          feels_like,
          dt,
          time,
        };

        // query to insert data to db
        const q =
          "insert into application2.weatherdata (`City`, `Date_Added`, `Temperature_Celsius`, `Main`, `Feels_Like`, `DT`, `Time_Added`) values (?)";
        const values = [location, date, temp, main, feels_like, dt, time];

        db.query(q, [values], (err, data) => {
          if (err)
            console.log("error inserting data in weatherdata table.", err);
          else console.log("data inserted in weatherdata table.");
        });

        res.send(details);
      }
    }
  });
});

app.get("/avg_temp", (req, res) => {
  const city = req.query.city;
  const date = req.query.date;

  try {
    const q = `select avg(Temperature_Celsius) as "Avg_Temp" from application2.weatherdata where City="${city}" group by City`;

    const a =
      `insert ignore application2.weatherdata2` +
      "(`City`, `Date`, `Avg_Temp`, `Min_Temp`, `Max_Temp`, `Dominant_Weather`) values" +
      `("${city}", "${date}", 0, 0, 0, "unknown")`;

    const b = `update application2.weatherdata2 set Avg_Temp=(select avg(Temperature_Celsius) as "Avg_Temp" from application2.weatherdata where City="${city}" group by City) where City="${city}" and Date="${date}"`;

    db.query(a, (err, result) => {
      if (err) console.log("error inserting data in weatherdata2 table.", err);
      else console.log("data inserted in weatherdata2 table.");
    });

    db.query(b, (err, results) => {
      if (err) console.log("error updating data in weatherdata2 table.", err);
      else console.log("data updated in weatherdata2 table.");
    });

    db.query(q, (err, result) => {
      if (err) res.send("error fetching data", err);
      else res.send(result);
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/min_temp", (req, res) => {
  const city = req.query.city;
  const date = req.query.date;

  try {
    const q = `select min(Temperature_Celsius) as "Min_Temp" from application2.weatherdata where City="${city}" group by City`;

    const b = `update application2.weatherdata2 set Min_Temp=(select min(Temperature_Celsius) as "Min_Temp" from application2.weatherdata where City="${city}" group by City) where City="${city}" and Date="${date}"`;

    db.query(b, (err, results) => {
      if (err) console.log("error updating data in weatherdata2 table.", err);
      else console.log("data updated in weatherdata2 table.");
    });

    db.query(q, (err, result) => {
      if (err) res.send("error fetching data", err);
      else res.send(result);
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/max_temp", (req, res) => {
  const city = req.query.city;
  const date = req.query.date;

  try {
    const q = `select max(Temperature_Celsius) as "Max_Temp" from application2.weatherdata where City="${city}" group by City`;

    const b = `update application2.weatherdata2 set Max_Temp=(select max(Temperature_Celsius) as "Max_Temp" from application2.weatherdata where City="${city}" group by City) where City="${city}" and Date="${date}"`;

    db.query(b, (err, results) => {
      if (err) console.log("error updating data in weatherdata2 table.", err);
      else console.log("data updated in weatherdata2 table.");
    });

    db.query(q, (err, result) => {
      if (err) res.send("error fetching data", err);
      else res.send(result);
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/dominant_weather", (req, res) => {
  const city = req.query.city;
  const date = req.query.date;

  try {
    // return most frequent weather condition appearing as dominant weather condition
    const q = `select Main from (select Main from application2.weatherdata where City="${city}") p group by Main order by Count(*) desc limit 1;`;

    const b = `update application2.weatherdata2 set Dominant_Weather=(select Main from (select Main from application2.weatherdata where City="${city}") p group by Main order by Count(*) desc limit 1) where City="${city}" and Date="${date}"`;

    db.query(b, (err, results) => {
      if (err) console.log("error updating data in weatherdata2 table.", err);
      else console.log("data updated in weatherdata2 table.");
    });

    db.query(q, (err, result) => {
      if (err) {
        console.log(err);
        res.send("error fetching data", err);
      } else res.send(result);
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Connected to backend on port " + process.env.PORT + ".");
});
