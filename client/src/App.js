import { Route, Routes, BrowserRouter } from "react-router-dom";
import Home from "./Home";
import Summary from "./Summary";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/summary/:city" element={<Summary />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
