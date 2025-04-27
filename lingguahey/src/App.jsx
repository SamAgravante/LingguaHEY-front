import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import Homepage from "./components/Pages/Homepage.jsx";
import LandingPage from "./components/Pages/LandingPage.jsx";
import ProfilePage from "./components/Pages/ProfilePage.jsx";
import Layout from "./components/Pages/Layout.jsx";
import Contact from "./components/Pages/Contact.jsx";
import RoleSelect from "./components/Pages/RoleSelect.jsx";
import Subscription from "./components/Pages/Subscription.jsx";

function AppContent() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/roleselect" element={<RoleSelect />} />

        <Route element={token ? <Layout /> : <Navigate to="/login" />} >
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/profilepage" element={<ProfilePage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/subscriptions" element={<Subscription />} />
          
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
