import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { collection, getDocs } from 'firebase/firestore';
import { db } from "./firebase";

import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminPolicies from "./pages/AdminPolicies";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  async function testFirestore() {
  try {
    const snapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Firestore connected, docs:', snapshot.size);
  } catch (err) {
    console.error('❌ Firestore connection error:', err);
  }
}

testFirestore();

  // Watch for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Home />} />

        {/* Login page (only show if logged out) */}
        <Route
          path="/login"
          element={user ? <Navigate to="/admin" /> : <Login />}
        />

        {/* Protected admin route */}
        <Route
          path="/admin"
          element={user ? <AdminPolicies /> : <Navigate to="/login" />}
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
