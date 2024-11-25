import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import Owner from "./Components/Owner";  
import Customer from "./Components/Customer"
import "./App.css"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/owner" element={<Owner />} />
        <Route path="/customer" element={<Customer />} />

      </Routes>
    </Router>
  );
}

export default App;
