import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import './index.css'; 


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        {/* Redirect any unknown route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
