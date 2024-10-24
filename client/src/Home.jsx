import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  // bool variable to display result for 6 cities when website is loaded.
  const [init, setInit] = useState(0);

  // array of string to maintain which cities' result is being displayed.
  const [city, setCity] = useState("");

  // array of object to store result received from server about each city.
  const [result, setResult] = useState([]);

  // array of integer to maintain temperature of each city because user can do temperature conversions,
  // so temp. conversions are also updated here.
  const [temp, setTemp] = useState([]);

  // array of string to maintain which unit user wants to change temp. to.
  const [selectedTempOption, setSelectedTempOption] = useState([]);
  const [showTempOption, setShowTempOption] = useState([]);

  // array of string to maintain temp. threshold options (1. Below threshold 2. Above threshold).
  const [tempThresOption, setTempThresOption] = useState([]);

  // array of integer to maintain what temp. threshold user entered
  const [tempThres, setTempThres] = useState([]);

  // array of object with attributes (1. threshold 2. option) to maintain alerts set by user for each city
  // when clicked on Set Alert button.
  const [tempAlert, setTempAlert] = useState([]);

  // array of strings whose results we always want on screen.
  const cities = [
    "Delhi",
    "Mumbai",
    "Chennai",
    "Bangalore",
    "Kolkata",
    "Hyderabad",
  ];

  // options for user to choose from to convert temperature.
  const options = [
    { value: "Choose", label: "Choose" },
    { value: "Fahrenheit", label: "Fahrenheit" },
    { value: "Celcius", label: "Celcius" },
    { value: "Kelvin", label: "Kelvin" },
  ];

  // this function is called only once to display weather details on the screen for the 6 cities mentioned
  // in the assignment. user can add more cities apart from these 6 cities.
  const initialise = async () => {
    for (let i = 0; i < cities.length; i++) {
      const c = cities[i];

      try {
        const response = await axios.get(`http://localhost:5000/chk?city=${c}`);

        setResult((result) => [...result, response.data]);
        setTemp((temp) => [...temp, response.data.temp]);
        setCity("");
        setSelectedTempOption((selectedTempOption) => [
          ...selectedTempOption,
          "Kelvin",
        ]);
        setShowTempOption((showTempOption) => [...showTempOption, "Choose"]);
        setTempAlert((tempAlert) => [
          ...tempAlert,
          { threshold: 0, option: "Below threshold" },
        ]);
      } catch (err) {
        console.log("error fetching data.", err);
      }
    }

    setInit(1);
  };

  // initialise() function is called only once by setting setInit to 1.
  if (init === 0) {
    initialise();
    setInit(1);
  }

  // function to display weather details for user entered city.
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!city) return;

    const existIndex = result.findIndex((data) => data.location === city);
    if (existIndex !== -1) {
      console.log("city exists");
      alert("City already exists.");
      setCity("");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/chk?city=${city}`
      );

      setResult((result) => [...result, response.data]);
      setTemp((temp) => [...temp, response.data.temp]);
      setCity("");
      setSelectedTempOption((selectedTempOption) => [
        ...selectedTempOption,
        "Kelvin",
      ]);
      setShowTempOption((showTempOption) => [...showTempOption, "Choose"]);
      setTempAlert([...tempAlert, { threshold: 0, option: "Below threshold" }]);
    } catch (err) {
      console.log("error fetching data.", err);
    }
  };

  // fetch real-time data every 5 minutes.
  useEffect(() => {
    const realTimeData = async () => {
      if (result.length === 0) return;

      const weatherPromises = result.map(async (data) => {
        try {
          const response = await axios.get(
            `http://localhost:5000/chk?city=${data.location}`
          );
          return response.data;
        } catch (err) {
          console.error("Error fetching weather for", data.location, err);
          return null;
        }
      });

      const updatedResult = await Promise.all(weatherPromises);

      for (let i = 0; i < updatedResult.length; i++) {
        const currentTemp = (updatedResult[i].temp - 273.15).toFixed(2);
        const prevTemp = (Number(result[i].temp) - 273.15).toFixed(2);

        if (
          tempAlert[i].option === "Below threshold" &&
          currentTemp < tempAlert[i].threshold &&
          prevTemp < tempAlert[i].threshold
        )
          console.log(
            "Temperature went below threshold for city " +
              updatedResult[i].location
          );
        else if (
          tempAlert[i].option === "Above threshold" &&
          currentTemp > tempAlert[i].threshold &&
          prevTemp > tempAlert[i].threshold
        )
          console.log(
            "Temperature went above threshold for city " +
              updatedResult[i].location
          );
      }

      setResult(updatedResult.filter((data) => data));
      setSelectedTempOption(Array(updatedResult.length).fill("Kelvin"));
      setShowTempOption(Array(updatedResult.length).fill("Choose"));
      setTemp(
        updatedResult.map((data) => {
          return data.temp;
        })
      );
    };

    const intervalId = setInterval(realTimeData, 60 * 5 * 1000);
    return () => clearInterval(intervalId);
  }, [result]);

  // function for temperature conversion.
  const handleTempOptionChange = (e, index) => {
    if (e.target.value === "Celcius") {
      if (selectedTempOption[index] === "Kelvin")
        temp[index] = Number(temp[index] - 273.15).toFixed(2);
      else if (selectedTempOption[index] === "Fahrenheit")
        temp[index] = Number(((temp[index] - 32) * 5) / 9).toFixed(2);
    } else if (e.target.value === "Fahrenheit") {
      if (selectedTempOption[index] === "Kelvin")
        temp[index] = Number(((temp[index] - 273.15) * 9) / 5 + 32).toFixed(2);
      else if (selectedTempOption[index] === "Celcius")
        temp[index] = Number((temp[index] * 9) / 5 + 32).toFixed(2);
    } else if (e.target.value === "Kelvin") {
      if (selectedTempOption[index] === "Fahrenheit")
        temp[index] = Number(((temp[index] - 32) * 5) / 9 + 273.15).toFixed(2);
      else if (selectedTempOption[index] === "Celcius")
        temp[index] = Number(temp[index]) + 273.15;
    }

    if (e.target.value !== selectedTempOption[index]) {
      const p = [...selectedTempOption];
      p[index] = e.target.value;
      setSelectedTempOption(p);

      const q = [...showTempOption];
      q[index] = e.target.value;
      setShowTempOption(q);
    }
  };

  // function to handle change in temperature threshold input.
  const handleTempThres = (e, index) => {
    const updatedResult = [...tempThres];
    updatedResult[index] = e.target.value;
    setTempThres(updatedResult);
  };

  // function to handle change in temperature threshold option.
  const handleTempThresOption = (e, index) => {
    const updatedResult = [...tempThresOption];
    updatedResult[index] = e.target.value;
    setTempThresOption(updatedResult);
  };

  // function to direct user to summary page for the clicked city.
  const handleShowSummary = (index) => {
    navigate(`/summary/${result[index].location}`);
  };

  // function to maintain alerts for each city.
  const handleSetAlert = (index) => {
    if (tempThresOption[index] === undefined || tempThres[index] === undefined)
      return;

    const updatedResult = [...tempAlert];
    updatedResult[index].threshold = tempThres[index];
    updatedResult[index].option = tempThresOption[index];
    setTempAlert(updatedResult);
  };

  return (
    <div>
      <p>Enter city name</p>

      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <p>{city}</p>

      <button onClick={(e) => handleSubmit(e)}>Submit</button>

      {result.length > 0 &&
        result.map((data, index) => {
          return (
            <div key={index}>
              <p>
                {index + 1}. showing this result after submitting{" "}
                {data.location} to server:
              </p>

              <ul>
                <li>location = {data.location}</li>
                <li>main = {data.main}</li>
                <li>
                  <p>
                    temp = {temp[index]} {selectedTempOption[index]}
                  </p>

                  <p>Change temperature to: </p>

                  <select
                    value={showTempOption[index]}
                    onChange={(e) => handleTempOptionChange(e, index)}
                  >
                    {options.map((option, opindex) => (
                      <option key={opindex} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </li>
                <li>feels_like = {data.feels_like}</li>
                <li>dt = {data.dt}</li>
                <li>time={data.time}</li>
              </ul>

              <button onClick={() => handleShowSummary(index)}>
                Show daily summary
              </button>

              <div>
                <p>
                  Receive temperature alerts for this city by entering
                  temperature threshold (in Degree Celsius):
                </p>

                <input
                  type="text"
                  placeholder="Threshold"
                  onChange={(e) => handleTempThres(e, index)}
                />

                <select
                  value={tempThresOption[index]}
                  onChange={(e) => handleTempThresOption(e, index)}
                >
                  <option>Choose</option>
                  <option>Below threshold</option>
                  <option>Above threshold</option>
                </select>

                <button onClick={() => handleSetAlert(index)}>Set alert</button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Home;
