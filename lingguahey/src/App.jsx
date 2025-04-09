// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Homepage from "./components/Pages/Homepage.jsx"
import LandingPage from "./components/Pages/LandingPage.jsx"
import ProfilePage from "./components/Profile/ProfilePage.jsx";
import HomePage from "./components/HomePage.jsx"; // Import HomePage

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Add HomePage route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={currentUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
//<Route path="/profile" element={currentUser ? <ProfilePage /> : <Navigate to="/login" />} />

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;