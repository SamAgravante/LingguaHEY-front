// src/App.jsx
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
import Activities from "./components/Pages/Activities";
import OnePicFourWords from "./components/Pages/Games/GameCreation/OnePicFourWords";
import PhraseTranslation from "./components/Pages/Games/GameCreation/PhraseTranslation";
import WordTranslation from "./components/Pages/Games/GameCreation/WordTranslation";
import DungeonGame from './components/Pages/DungeonGame';

import LiveActClassroom from "./components/Pages/Live-Activity-Classroom/LiveActClassroom";
import LiveActOnePicFourWords from "./components/Pages/Live-Activity-Classroom/LiveActOnePicFourWords";
import LiveActPhraseTranslation from "./components/Pages/Live-Activity-Classroom/LiveActPhraseTranslation";
import LiveActWordTranslation from "./components/Pages/Live-Activity-Classroom/LiveActWordTranslation";
import ResendVerification from "./components/ResendVerificationPage";
import VerificationStatusPage from "./components/VerificationStatusPage";
import LiveActivityGame from "./components/Pages/LiveActivityGame";
import TeacherDashboardPopUp from "./components/Pages/TeacherDashboardPopUp";
import MultiplayerGameRoom from "./components/Pages/MultiplayerGameRoom";

import LevelEditor from "./components/Pages/Editors/LevelEditor";
import MonsterEditor from "./components/Pages/Editors/MonsterEditor";
import AddLevelForm from "./components/Pages/Editors/AddLevelForm";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/roleselect" element={<RoleSelect />} />
      <Route path="/verify-status" element={<VerificationStatusPage />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
    

      {/* Protected routes */}
      <Route element={token ? <Layout /> : <Navigate to="/login" replace />}>
        {/* --- Live Lobby → Game flow --- */}
        {/* 1) Lobby screen takes the activityId param */}
        <Route
          path="/liveactivity/:activityId"
          element={<LiveActivityGame />}
        />

        {/* 2) Multiplayer room reads activityId from navigation state */}
        <Route
          path="/multiplayer"
          element={<MultiplayerGameRoom />}
        />

        {/* --- Your existing protected pages --- */}
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subscriptions" element={<Subscription />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/teacherdashboard" element={<TeacherDashboard />} />
        <Route path="/teacherdashboard/classroom/:roomId" element={<TeacherDashboardPopUp />} />
        <Route path="/teacher/live-activities/:roomId" element={<LiveActClassroom />} />
        <Route path="/classroom/:classroomId" element={<Classroom />} />

        {/* Game Editors */}
        {/* Change Name Later */}
        <Route path="/activities" element={<Activities />} />
        <Route path="/leveleditor" element={<LevelEditor />} />
        <Route path="/add-level" element={<AddLevelForm />} />
        <Route path="/monstereditor" element={<MonsterEditor />} />

        {/* Game */}
        <Route path="/dungeon" element={<DungeonGame />} />

        {/* Live Activities under a classroom context */}
        <Route
          path="/classroom/:classroomId/live-activities"
          element={<LiveActClassroom />}
        />
        <Route
          path="/classroom/:classroomId/live-activities/:activityId/live-act-one-pic-four-words"
          element={<LiveActOnePicFourWords />}
        />
        <Route
          path="/classroom/:classroomId/live-activities/:activityId/live-act-phrase-translation"
          element={<LiveActPhraseTranslation />}
        />
        <Route
          path="/classroom/:classroomId/live-activities/:activityId/live-act-word-translation"
          element={<LiveActWordTranslation />}
        />
      </Route>
    </Routes>
  );
}

export default App;
