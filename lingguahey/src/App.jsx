import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import LandingPage from "./components/Pages/LandingPage";
import Signup from "./components/Auth/Signup";
import Login from "./components/Auth/Login";
import RoleSelect from "./components/Pages/RoleSelect";
import Layout from "./components/Pages/Layout";
import Homepage from "./components/Pages/Homepage";
import ProfilePage from "./components/Pages/ProfilePage";
import Contact from "./components/Pages/Contact";
import Subscription from "./components/Pages/Subscription";
import AdminDashboard from "./components/Pages/AdminDashboard";
import TeacherDashboard from "./components/Pages/TeacherDashboard";
import Classroom from "./components/Pages/Classroom";
import OnePicFourWords from "./components/Pages/Games/Activities/OnePicFourWords";
import PhraseTranslation from "./components/Pages/Games/Activities/PhraseTranslation";
import WordTranslation from "./components/Pages/Games/Activities/WordTranslation";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/roleselect" element={<RoleSelect />} />

      {/* Protected routes */}
      <Route element={token ? <Layout /> : <Navigate to="/login" replace />}>
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subscriptions" element={<Subscription />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/teacherdashboard" element={<TeacherDashboard />} />
        <Route path="/classroom/:classroomId" element={<Classroom />} />
        <Route
          path="/classroom/:classroomId/activities/:activityId/one-pic-four-words"
          element={<OnePicFourWords />}
        />
        <Route
          path="/classroom/:classroomId/activities/:activityId/phrase-translation"
          element={<PhraseTranslation />}
        />
        <Route
          path="/classroom/:classroomId/activities/:activityId/word-translation"
          element={<WordTranslation />}
        />
      </Route>
    </Routes>
  );
}

export default App;