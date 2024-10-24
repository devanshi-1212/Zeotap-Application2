import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";

const Summary = () => {
  // extracting city name from URL.
  const { city } = useParams();

  // array to store details for the city.
  const [details, setDetails] = useState([]);

  // fetching real-time data every 5 minutes.
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const curdate = new Date().toLocaleDateString();
        const date = format(new Date(curdate), "dd/MM/yyyy");

        await axios
          .get(`http://localhost:5000/avg_temp?city=${city}&date=${date}`)
          .then((response) => {
            const updatedDetails = [...details];
            details[0] = response.data[0].Avg_Temp;
            setDetails(updatedDetails);
          })
          .catch((err) => console.log(err));

        await axios
          .get(`http://localhost:5000/min_temp?city=${city}&date=${date}`)
          .then((response) => {
            const updatedDetails = [...details];
            details[1] = response.data[0].Min_Temp;
            setDetails(updatedDetails);
          })
          .catch((err) => console.log(err));

        await axios
          .get(`http://localhost:5000/max_temp?city=${city}&date=${date}`)
          .then((response) => {
            const updatedDetails = [...details];
            details[2] = response.data[0].Max_Temp;
            setDetails(updatedDetails);
          })
          .catch((err) => console.log(err));

        await axios
          .get(
            `http://localhost:5000/dominant_weather?city=${city}&date=${date}`
          )
          .then((response) => {
            const updatedDetails = [...details];
            details[3] = response.data[0].Main;
            setDetails(updatedDetails);
          })
          .catch((err) => console.log(err));
      } catch (err) {
        console.log(err);
      }
    };

    fetchSummary();

    const intervalId = setInterval(fetchSummary, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <p>Today's summary of {city}:</p>

      <div>
        <ol>
          <li>Average Temperature: {details[0]}</li>
          <li>Minimum Temperature: {details[1]}</li>
          <li>Maximum Temperature: {details[2]}</li>
          <li>Dominant Weather: {details[3]}</li>
        </ol>
      </div>
    </div>
  );
};

export default Summary;
