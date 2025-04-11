// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Homepage from "./components/Pages/Homepage.jsx"
import LandingPage from "./components/Pages/LandingPage.jsx"
import ProfilePage from "./components/Pages/ProfilePage.jsx";
//import HomePage from "./components/HomePage.jsx"; // Import HomePage

import Layout from "./components/Pages/Layout.jsx"

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route element={currentUser ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/profilepage" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
