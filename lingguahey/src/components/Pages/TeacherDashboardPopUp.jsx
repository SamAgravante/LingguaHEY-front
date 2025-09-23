import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Modal,
  Chip,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  Menu,            // added
  Dialog,          // added
  DialogTitle,     // added
  DialogContent,   // added
  DialogActions,   // added
  TextField,       // added
  DialogContentText
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InputLabel from '@mui/material/InputLabel';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SchoolIcon from "@mui/icons-material/School";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import API from "../../api"; // Adjust the import path as necessary

// Background assets
import LandingBackgroundPic from "../../assets/images/backgrounds/CrystalOnly.png";
import MenuBoxHor from "../../assets/images/backgrounds/MenuBox1var.png";
import GameTextFieldLong from "../../assets/images/backgrounds/GameTextFieldLong.png";
import GameTextField from "../../assets/images/backgrounds/GameTextField.png";
import GameTextBoxLong from "../../assets/images/backgrounds/GameTextBoxLong.png";
import GameTextBox from "../../assets/images/backgrounds/GameTextBox.png";
import GameTextBoxBig from "../../assets/images/backgrounds/GameTextBoxBig.png";
import GameTextFieldBig from "../../assets/images/backgrounds/GameTextFieldBig.png";
import GameTextFieldBigger from "../../assets/images/backgrounds/GameTextFieldBigger.png";
import GameTextFieldMedium from "../../assets/images/backgrounds/GameTextFieldMedium.png";
import MonsterEditUIOuter from "../../assets/images/backgrounds/MonsterEditUIOuter.png";
import MonsterEditUIOuterLight from "../../assets/images/backgrounds/MonsterEditUIOuterLight.png";
import ForestwithShops from "../../assets/images/backgrounds/ForestwithShops.png";
import ShopUI from "../../assets/images/backgrounds/ShopUI.png";
import GameShopField from "../../assets/images/backgrounds/GameShopField.png";
import GameShopBoxSmall from "../../assets/images/backgrounds/GameShopBoxSmall.png";
import SummonUI from "../../assets/images/backgrounds/SummonUI.png";
import DungeonOpen from "../../assets/images/backgrounds/DungeonOpen.png";
import DungeonClosed from "../../assets/images/backgrounds/DungeonClosed.png";
import NameTab from "../../assets/images/backgrounds/NameTab.png";
import ItemBox from "../../assets/images/backgrounds/ItemBox.png";
import HealthPotion from "../../assets/images/objects/HealthPotion.png";
import ShieldPotion from "../../assets/images/objects/ShieldPotion.png";
import SkipPotion from "../../assets/images/objects/SkipPotion.png";
import GoldCoins from "../../assets/images/objects/GoldCoins.png";
import Tablet from "../../assets/images/objects/Tablet.png";
import GameTextBoxMediumLong from '../../assets/images/ui-assets/GameTextBoxMediumLong.png'
import MCHeadshot from "../../assets/images/objects/MCHeadshot.png";
import Gems from "../../assets/images/objects/Gems.png";
import Gears from "../../assets/images/objects/gears.png";
import MenuBoxVert from '../../assets/images/backgrounds/MenuBox1varVert.png';
import MCNoWeapon from '../../assets/images/characters/MCNoWeapon.png';
import WeaponBasicStaff from '../../assets/images/weapons/WeaponBasicStaff.png';
import SettingsIcon from '@mui/icons-material/Settings';

// Import game components
import LiveActOnePicFourWords from "../../components/pages/Live-Activity-Classroom/LiveActOnePicFourWords";
import LiveActPhraseTranslation from "../../components/pages/Live-Activity-Classroom/LiveActPhraseTranslation";
import LiveActWordTranslation from "../../components/pages/Live-Activity-Classroom/LiveActWordTranslation";


const TeacherDashboardPopUp = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [roomDetails, setRoomDetails] = useState(null);
  const [selectedRoomStudents, setSelectedRoomStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [openStudentListModal, setOpenStudentListModal] = useState(false);
  const [activityStatus, setActivityStatus] = useState("Undeployed");
  const [openScoresModal, setOpenScoresModal] = useState(false);
  const [studentScores, setStudentScores] = useState([]);
  const [scoreSort, setScoreSort] = useState("highest");

  const [activityStats, setActivityStats] = useState({
    averag: 0,
    lowest: 0,
    highest: 0,
  });
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    role: null,
  });
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityName, setSelectedActivityName] = useState('');
  const [isDeployed, setIsDeployed] = useState(false);
  const [openActivityCreateModal, setOpenActivityCreateModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState("");
  

  // Menu / edit / delete states
  const [menuAnchor, setMenuAnchor] = useState(null);
  const isMenuOpen = Boolean(menuAnchor);
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editRoomName, setEditRoomName] = useState("");

  const [activityToDelete, setActivityToDelete] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteDialogMessage, setDeleteDialogMessage] = useState("");

  // question delete confirmation state / message
  const [questionToDeleteId, setQuestionToDeleteId] = useState(null);
  const [openQuestionDeleteDialog, setOpenQuestionDeleteDialog] = useState(false);
  const [deleteLiveActivityDialogMessage, setDeleteLiveActivityDialogMessage] = useState("");

  // Activity deployment states
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [openActivityEditModal, setOpenActivityEditModal] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  const [activityQuestions, setActivityQuestions] = useState([]);
  const [questionToEdit, setQuestionToEdit] = useState(null);

  const [imageUrls, setImageUrls] = useState({});

  const getSortedScores = () => {
    if (scoreSort === "highest") {
      return [...studentScores].sort((a, b) => b.score - a.score);
    } else if (scoreSort === "lowest") {
      return [...studentScores].sort((a, b) => a.score - b.score);
    }
    return studentScores;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        const fetchUser = async () => {
          if (!API) return;
          try {
            const response = await API.get(`/users/${decoded.userId}`);
            setUserData({
              userId: response.data.userId,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              role: response.data.role,
            });
          } catch (err) {
            console.error("Failed to fetch user:", err);
          }
        };
        fetchUser();
      } catch (err) {
        console.error("Failed to decode token:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate, API]);

  const fetchRoomData = useCallback(async () => {
    if (!roomId || !API) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const roomDetailsResponse = await API.get(`/classrooms/${roomId}`);
      setRoomDetails(roomDetailsResponse.data);

      const allStudentsResponse = await API.get('/users?role=USER');
      if (Array.isArray(allStudentsResponse.data)) {
        setAllStudents(allStudentsResponse.data.filter(student => student.role === "USER"));
      } else {
        setAllStudents([]);
      }
    } catch (err) {
      console.error("Failed to fetch classroom data:", err);
      setError(`Failed to load classroom data: ${err.message || "Unknown error"}`);
      setActivityStats({ average: 0, lowest: 0, highest: 0 });
      setProgressData([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, API]);
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!roomId || !API) return;
      try {
        const enrolledStudentsResponse = await API.get(`/classrooms/${roomId}/students`);
        setSelectedRoomStudents(enrolledStudentsResponse.data || []);
        console.log('Enrolled Students:', enrolledStudentsResponse.data);
      } catch (err) {
        console.error("Failed to fetch enrolled students:", err);
        setSelectedRoomStudents([]);
      }
    };

    fetchEnrolledStudents();
  }, [roomId, API]);

  const fetchStudentScores = async (activityId) => {
    if (!API || !activityId || !selectedRoomStudents.length) return;
    try {
      // Add admin token to the request
      const adminToken = localStorage.getItem('token');
      API.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

      // First, get the total possible score for the activity
      const totalScoreResponse = await API.get(`/scores/live-activities/${activityId}/total-score`);
      const totalPossibleScore = totalScoreResponse.data;

      // Fetch scores for each enrolled student
      const scores = await Promise.all(
        selectedRoomStudents.map(async (student) => {
          try {
            const response = await API.get(`/scores/users/${student.userId}/total-live`);
            const studentScore = response.data || 0;
            // Calculate percentage
            const percentage = totalPossibleScore > 0
              ? Math.round((studentScore / totalPossibleScore) * 100)
              : 0;

            return {
              userId: student.userId,
              firstName: student.firstName,
              lastName: student.lastName,
              score: percentage
            };
          } catch (err) {
            console.error(`Failed to fetch score for student ${student.firstName}:`, err);
            return {
              userId: student.userId,
              firstName: student.firstName,
              lastName: student.lastName,
              score: 0
            };
          }
        })
      );

      const sortedScores = scores.sort((a, b) => b.score - a.score);
      setStudentScores(sortedScores);
    } catch (err) {
      console.error("Failed to fetch student scores:", err);
      setStudentScores([]);
    }
  };

  // update fetchActivities to work with selectedActivity as object
  const fetchActivities = async () => {
    if (!API || !roomId) return;
    try {
      const response = await API.get(`/live-activities/${roomId}/live-activities`);
      setActivities(response.data || []);

      if (selectedActivity) {
        const selectedId = typeof selectedActivity === "string"
          ? selectedActivity
          : selectedActivity?.activity_ActivityId;
        const selectedAct = response.data.find(act => act.activity_ActivityId === selectedId);
        if (selectedAct) {
          setSelectedActivity(selectedAct);
          setIsDeployed(!!selectedAct.deployed);
          setActivityStatus(selectedAct.deployed ? "Deployed" : "Undeployed");
        } else {
          // if not found, clear selection
          setSelectedActivity(null);
          setIsDeployed(false);
          setActivityStatus("Undeployed");
        }
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setActivities([]);
    }
  };

  // New useEffect to fetch activity statistics
  useEffect(() => {
    const fetchActivityStatistics = async () => {
      // normalize selectedActivity to an id string
      const selectedId = typeof selectedActivity === "string"
        ? selectedActivity
        : selectedActivity?.activity_ActivityId;

      if (!API || !selectedId) {
        setActivityStats({ average: 0, lowest: 0, highest: 0 });
        return;
      }

      try {
        // ensure auth header present
        const adminToken = localStorage.getItem("token");
        if (adminToken) API.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

        const url = `/scores/live-activities/${selectedId}/stats`;
        console.log("Fetching activity stats from:", url);
        const response = await API.get(url);
        setActivityStats({
          average: response.data.average || 0,
          lowest: response.data.lowest || 0,
          highest: response.data.highest || 0,
        });
      } catch (err) {
        console.error("Failed to fetch activity statistics:", err, "selectedId:", selectedId);
        setActivityStats({ average: 0, lowest: 0, highest: 0 });
      }
    };

    fetchActivityStatistics();
  }, [selectedActivity, API]); // Re-run when selectedActivity or API changes

  useEffect(() => {
    fetchRoomData();
    fetchActivities();
  }, [fetchRoomData]);

  const handleOpenStudentListModal = () => setOpenStudentListModal(true);
  const handleCloseStudentListModal = () => setOpenStudentListModal(false);

  const handleAddStudentToClassroom = async (student) => {
    if (!API) return;
    try {
      const response = await API.post(`/classrooms/${roomId}/students/${student.userId}`, {});
      if (response.status === 200 || response.status === 201) {
        setSelectedRoomStudents(prev => [...prev, student]);
        setAllStudents(prev => prev.filter(s => s.userId !== student.userId));
      }
    } catch (err) {
      console.error("Failed to add student:", err);
    }
  };

  const handleRemoveStudentFromClassroom = async (studentId) => {
    if (!API) return;
    try {
      const studentToRemove = selectedRoomStudents.find(s => s.userId === studentId);
      await API.delete(`/classrooms/${roomId}/students/${studentId}`);
      setSelectedRoomStudents(prev => prev.filter(student => student.userId !== studentId));
      if (studentToRemove) {
        const studentExistsInAll = allStudents.find(s => s.userId === studentToRemove.userId);
        if (!studentExistsInAll) {
          setAllStudents(prev => [...prev, studentToRemove]);
        }
      }
    } catch (err) {
      console.error("Failed to remove student:", err);
    }
  };

  const handleMenuOpen = (e) => setMenuAnchor(e.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleGoBack = () => {
    handleMenuClose();
    navigate("/teacherdashboard");
  };

  const handleOpenEdit = () => {
    handleMenuClose();
    setEditRoomName(roomDetails?.classroomName || roomDetails?.name || "");
    setEditRoomDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!API || !roomId) return;
    try {
      const resp = await API.put(`/classrooms/${roomId}`, { classroomName: editRoomName });
      // update local state to reflect new name
      setRoomDetails(prev => ({ ...(prev || {}), classroomName: editRoomName }));
      setEditRoomDialogOpen(false);
    } catch (err) {
      console.error("Failed to update classroom name:", err);
      // optionally show feedback
    }
  };

  const handleOpenDelete = () => {
    handleMenuClose();
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!API || !roomId) return;
    try {
      await API.delete(`/classrooms/${roomId}`);
      setDeleteConfirmOpen(false);
      navigate("/teacherdashboard");
    } catch (err) {
      console.error("Failed to delete classroom:", err);
      // optionally show feedback
    }
  };

  const handleActivityChange = async (e) => {
    const activityId = e.target.value;
    const activityObj = activities.find(a => a.activity_ActivityId === activityId) || null;
    setSelectedActivity(activityObj);
    setSelectedActivityName(activityObj?.activity_ActivityName || "");
    setIsDeployed(!!activityObj?.deployed);
    setActivityStatus(activityObj?.deployed ? "Deployed" : "Undeployed");
  };

  const handleDeploy = async () => {
    if (!API || !selectedActivity) {
      alert('Please select an activity first');
      return;
    }

    try {
      const response = await API.put(`/live-activities/${selectedActivity}/set-deployed/true`);
      if (response.status === 200) {
        setIsDeployed(true);
        setActivityStatus("Deployed");
        console.log('Activity deployed successfully');
      }
    } catch (err) {
      console.error("Failed to deploy activity:", err);
      alert('Failed to deploy activity');
    }
  };

  const handleUndeploy = async () => {
    if (!API || !selectedActivity) {
      alert('Please select an activity first');
      return;
    }

    try {
      const response = await API.put(`/live-activities/${selectedActivity}/set-deployed/false`);
      if (response.status === 200) {
        setIsDeployed(false);
        setActivityStatus("Undeployed");
        console.log('Activity undeployed successfully');
      }
    } catch (err) {
      console.error("Failed to undeploy activity:", err);
      alert('Failed to undeploy activity');
    }
  };

  const openDeleteActivityDialog = async (activity) => {
    await fetchActivities();
    const activityToDeleteWithId = activities.find(
      (act) => act.activity_ActivityId === activity
    );

    if (activityToDeleteWithId) {
      setActivityToDelete(activityToDeleteWithId);
      setDeleteDialogMessage(
        `Are you sure you want to delete ${activityToDeleteWithId.activity_ActivityName}?`
      );
      setOpenDeleteDialog(true);
    } else {
      console.error("Activity not found for deletion.");
      alert("Activity not found. Please refresh the page.");
    }
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteDialogMessage("");
    setActivityToDelete(null);
  };

  const handleConfirmDeleteActivity = async () => {
    if (!API || !activityToDelete) return;
    try {
      await API.delete(`/live-activities/${activityToDelete?.activity_ActivityId}`);
      setActivities(prevActivities => prevActivities.filter(activity => activity.activity_ActivityId !== activityToDelete.activity_ActivityId));
      closeDeleteDialog();
    } catch (err) {
      console.error("Failed to delete activity:", err);
      alert("Failed to delete activity. Please try again.");
    }
  };

  //Activity Functions
    const handleOpenActivityEdit = async (activityOrId) => {
    const activityObj = typeof activityOrId === "string"
      ? activities.find(a => a.activity_ActivityId === activityOrId)
      : activityOrId;

    if (!activityObj) {
      console.error("Activity not found when opening edit modal", activityOrId);
      return;
    }

    setSelectedActivity(activityObj);
    setOpenActivityDialog(true);
    // ensure questions are fetched for the real id
    await fetchActivityQuestions(activityObj.activity_ActivityId);
  };

  const closeActivityDialog = () => {
    setOpenActivityDialog(false);
    setSelectedActivity(null);
    setSelectedQuestionType(null);
    setActivityQuestions([]);
  };

  const handleQuestionTypeSelect = (questionType) => {
    setSelectedQuestionType(questionType);
  };

  const resetSelectedQuestionType = () => {
    setSelectedQuestionType(null);
  };

  const fetchActivityQuestions = async (activityId) => {
    if (!API || !activityId) return;
    try {
      const response = await API.get(`/questions/liveactivities/${activityId}`);
      setActivityQuestions(response.data);
    } catch (err) {
      console.error("Error fetching activity questions:", err);
      setActivityQuestions([]);
    }
  };

  const handleEditQuestion = (question) => {
    setQuestionToEdit(question);
    // You might want to open a different modal for editing questions
    // For now, let's just log the question to edit
    console.log("Editing question:", question);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!API || !selectedActivity) return;
    try {
      await API.delete(`/questions/${questionId}`);
      setActivityQuestions(prevQuestions => prevQuestions.filter(question => question.questionId !== questionId));
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };

  const openDeleteQuestionDialog = (questionId, questionText) => {
   setQuestionToDeleteId(questionId);
   setDeleteLiveActivityDialogMessage(
     questionText
       ? `Are you sure you want to delete this question: "${questionText}"?`
       : "Are you sure you want to delete this question?"
   );
   setOpenQuestionDeleteDialog(true);
  };

 const closeDeleteQuestionDialog = () => {
   setOpenQuestionDeleteDialog(false);
   setQuestionToDeleteId(null);
   setDeleteLiveActivityDialogMessage("");
  };

 const confirmDeleteQuestion = async () => {
   if (!questionToDeleteId || !API) return;
   try {
     await API.delete(`/questions/${questionToDeleteId}`);
     setActivityQuestions(prev => prev.filter(q => q.questionId !== questionToDeleteId));
   } catch (err) {
     console.error("Error deleting question:", err);
   } finally {
     closeDeleteQuestionDialog();
   }
  };






  /**
 * Create object URLs for any Blob / ArrayBuffer image fields found on questions.
 * Cleans up (revokeObjectURL) when activityQuestions change or component unmounts.
 */
useEffect(() => {
  const created = {};
  try {
    (activityQuestions || []).forEach((q) => {
      const id = q.questionId;
      const imgCandidate = q.image || q.file || q.media?.[0] || q.imageData;
      if (!imgCandidate) return;

      // If it's already a string data URL or http(s) url, use it directly
      if (typeof imgCandidate === "string" && imgCandidate.trim()) {
        created[id] = imgCandidate.trim();
        return;
      }

      // If it's a Blob/File, create an object URL
      if (imgCandidate instanceof Blob) {
        created[id] = URL.createObjectURL(imgCandidate);
        return;
      }

      // If backend returned a binary array (Array or nested), convert to Blob then object URL
      const maybeArray = Array.isArray(imgCandidate)
        ? imgCandidate
        : (imgCandidate && Array.isArray(imgCandidate.data) ? imgCandidate.data : null);

      if (maybeArray) {
        const uint8 = new Uint8Array(maybeArray);
        const blob = new Blob([uint8], { type: "image/jpeg" });
        created[id] = URL.createObjectURL(blob);
        return;
      }
    });
  } catch (err) {
    console.warn("Error creating image object URLs", err);
  }

  // set urls and ensure previous created URLs are revoked by returning cleanup that revokes what we created
  // store previous to revoke on next effect run
  setImageUrls((prev) => {
    // revoke any prev URLs that we are replacing
    Object.keys(prev).forEach((k) => {
      if (created[k] !== prev[k] && prev[k] && prev[k].startsWith("blob:")) {
        URL.revokeObjectURL(prev[k]);
      }
    });
    return created;
  });

  return () => {
    Object.values(created).forEach((u) => {
      if (u && u.startsWith("blob:")) URL.revokeObjectURL(u);
    });
  };
}, [activityQuestions]);

  // helper: resolve common image shapes to a usable src (returns null when none)
  const getQuestionImageSrc = (q) => {
    if (!q) return null;

    // direct string fields
    const stringKeys = ["image", "imageUrl", "imagePath", "imageBase64", "photo", "url", "src", "fileUrl"];
    for (const k of stringKeys) {
      const v = q[k];
      if (typeof v === "string" && v.trim()) return v.trim();
      // nested object with url/src
      if (v && typeof v === "object") {
        if (typeof v.url === "string" && v.url.trim()) return v.url.trim();
        if (typeof v.src === "string" && v.src.trim()) return v.src.trim();
        if (typeof v.data === "string" && v.data.startsWith("data:")) return v.data;
      }
    }

    // media array (common shape)
    if (Array.isArray(q.media) && q.media.length > 0) {
      for (const m of q.media) {
        if (typeof m === "string" && m.trim()) return m.trim();
        if (m && typeof m === "object") {
          if (typeof m.url === "string" && m.url.trim()) return m.url.trim();
          if (typeof m.src === "string" && m.src.trim()) return m.src.trim();
          if (typeof m.data === "string" && m.data.startsWith("data:")) return m.data;
        }
      }
    }

    // buffer/byte-array -> data URL
    const maybeArray =
      (q.image && Array.isArray(q.image)) ? q.image :
      (q.image && q.image.data && Array.isArray(q.image.data)) ? q.image.data :
      (q.data && Array.isArray(q.data)) ? q.data : null;

    if (maybeArray) {
      try {
        const uint8 = new Uint8Array(maybeArray);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
        return `data:image/jpeg;base64,${btoa(binary)}`;
      } catch (err) {
        console.warn("Failed to convert binary image to data URL:", err);
      }
    }

    return null;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Classroom Data...</Typography>
      </Box>
    );
  }

  if (error && !roomDetails) {
    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchRoomData}>
            RETRY
          </Button>
        }>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} sx={{ mt: 2 }}>
          Go back to Dashboard
        </Button>
      </Box>
    );
  }

  const currentRoomName = roomDetails?.classroomName ||
    roomDetails?.name || (isLoading ? "Loading..." : "Classroom Details");


  const handleOpenActivityCreateModal = () => setOpenActivityCreateModal(true);
  const handleCloseActivityCreateModal = () => setOpenActivityCreateModal(false);

  const handleCreateActivity = async () => {
    if (!newActivityName.trim() || !API) return;

    try {
      const response = await API.post(`/live-activities/classrooms/${roomId}`, {
        activityIdd: "",
        activityName: newActivityName,
        completed: false,
        questions: [],
      });

      console.log("Activity created:", response.data);
      const newActivity = {
        ...response.data,
        activity_ActivityId:
          response.data.activity_ActivityId ||
          response.data.activityID ||
          response.data.activityId ||
          response.data.id,
        activity_ActivityName:
          response.data.activity_ActivityName ||
          response.data.activityName ||
          newActivityName,
      };
      setActivities((prevActivities) => [...prevActivities, newActivity]);
      setNewActivityName("");
      handleCloseActivityCreateModal(); // Close the modal after creating
    } catch (err) {
      console.error("Error creating activity:", err.response?.data || err.message);
      alert("Failed to create activity. Please try again.");
    }
  };

  //Edit Live-Act modal
  const handleOpenQuestionEdit = (question) => {
    if (!question) return;
    // set the question to edit, set game type so the correct game component renders,
    // and open the activity dialog if not already open
    setQuestionToEdit(question);
    setSelectedQuestionType(question.gameType || "GAME3");
    if (!openActivityDialog) setOpenActivityDialog(true);
  };

  const ScoresModalContent = () => (
    <Modal
      open={openScoresModal}
      onClose={() => setOpenScoresModal(false)}
      aria-labelledby="scores-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: '80%', md: '60%' },
        maxWidth: 600,
        maxHeight: '90vh',

        boxShadow: 24,
        p: 0,
      }}>
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Student Scores - {selectedActivityName}
          </Typography>
          <IconButton onClick={() => setOpenScoresModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, display: 'flex', gap: 1, }}>
          <Chip
            label="Highest First"
            clickable
            color={scoreSort === "highest" ? "primary" : "default"}
            variant={scoreSort === "highest" ? "filled" : "outlined"}
            onClick={() => setScoreSort("highest")}
          />
          <Chip
            label="Lowest First"
            clickable
            color={scoreSort === "lowest" ? "primary" : "default"}
            variant={scoreSort === "lowest" ? "filled" : "outlined"}
            onClick={() => setScoreSort("lowest")}
          />
        </Box>

        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {getSortedScores().length > 0 ? (
            <List disablePadding>
              {getSortedScores().map((score, index) => (
                <ListItem
                  key={score.userId}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    py: 1.5,

                  }}
                >
                  <ListItemText
                    primary={`${score.firstName} ${score.lastName}`}
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: score.score >= 70 ? '#4caf50' : '#f44336',
                          fontWeight: 500
                        }}
                      >
                        Score: {score.score}%
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No scores available for this activity.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );

  const StudentListModalContent = () => (
    <Modal
      open={openStudentListModal}
      onClose={handleCloseStudentListModal}
      aria-labelledby="student-list-modal-title"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: '80%', md: '70%' },
        maxWidth: 1000,
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: '#F7CB97',
        boxShadow: 24,
        display: 'flex',
        flexDirection: 'column',
        border: '5px solid #5D4037',
      }}>
        <Box sx={{
          p: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #F7CB97',
          bgcolor: '#F7CB97',
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
        }}>
          <Typography id="student-list-modal-title" variant="h5" component="h2" sx={{ fontWeight: 600, color: '#333' }}>
            Manage Student List
          </Typography>
          <IconButton
            onClick={handleCloseStudentListModal}
            sx={{ color: '#616161', '&:hover': { color: '#333', bgcolor: 'rgba(0,0,0,0.05)' } }}
            aria-label="Close student list"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Grid container sx={{ flexGrow: 1 }}>
          <Grid item xs={12} md={6} sx={{
            p: { xs: 2, md: 3 },
            mb: 5,
            borderRight: { md: '1px solid #5D4037' },
            borderBottom: { xs: '1px solid #5D4037', md: 'none' },
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#5D4037', fontWeight: 500 }}>
              Enrolled Students ({selectedRoomStudents.length})
            </Typography>
            <Box sx={{
              bgcolor: '#F7CB97',

              //border: '1px solid #e0e0e0',
              maxHeight: 350,
              overflowY: 'auto',
              minHeight: 120,
              width: 300
            }}>
              <List dense disablePadding>
                {selectedRoomStudents.length > 0 ? selectedRoomStudents.map((student) => (
                  <ListItem
                    key={student.userId}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveStudentFromClassroom(student.userId)}
                        sx={{ color: '#f44336', '&:hover': { color: '#d32f2f', bgcolor: 'rgba(244, 67, 54, 0.1)' } }}
                        aria-label={`Remove ${student.firstName} ${student.lastName}`}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderBottom: '1px solid #5D4037',
                      '&:last-child': { borderBottom: 'none' },
                      '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.03)' }
                    }}
                  >
                    <ListItemText
                      primary={<Typography variant="body1" fontWeight={500}>{`${student.firstName} ${student.lastName}`}</Typography>}
                      secondary={<Typography variant="body2" color="text.secondary">{student.email}</Typography>}
                    />
                  </ListItem>
                )) : (
                  <ListItem sx={{ py: 3, px: 2, textAlign: 'center' }}>
                    <ListItemText primary={<Typography color="text.secondary">No students enrolled yet.</Typography>} />
                  </ListItem>
                )}
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} sx={{ p: { xs: 2, md: 3 }, pl: { md: 15 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#5D4037', fontWeight: 500 }}>
              Add Students from School
            </Typography>
            <Box sx={{
              //bgcolor: '#ffffff',

              //border: '1px solid #e0e0e0',
              maxHeight: 350,
              width: 300,
              overflowY: 'auto',
              minHeight: 80,
            }}>
              <List dense disablePadding>
                {allStudents
                  .filter(student => !selectedRoomStudents.find(enrolled => enrolled.userId === student.userId))
                  .map((student) => (
                    <ListItem
                      key={student.userId}
                      secondaryAction={
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => handleAddStudentToClassroom(student)}
                          sx={{ minWidth: 60, whiteSpace: 'nowrap', marginLeft: 20 }}
                        >
                          Add
                        </Button>
                      }
                      sx={{
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid #5D4037',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.05)' }
                      }}
                    >
                      <ListItemText
                        primary={<Typography variant="body1" fontWeight={500}>{`${student.firstName} ${student.lastName}`}</Typography>}
                        secondary={<Typography variant="body2" color="text.secondary">{student.email}</Typography>}
                      />
                    </ListItem>
                  ))}
                {allStudents.filter(student => !selectedRoomStudents.find(enrolled => enrolled.userId === student.userId)).length === 0 &&
                  <ListItem sx={{ py: 3, px: 2, textAlign: 'center' }}>
                    <ListItemText primary={<Typography color="text.secondary">All available students are enrolled or no students found.</Typography>} />
                  </ListItem>
                }
              </List>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );

  const scoreStatsCards = [
    {
      label: "Average Score",
      count: activityStats.average,
      color: "#5D4037",
      icon: <TrendingUpIcon />,
    },
    {
      label: "Lowest Score",
      count: activityStats.lowest,
      color: "#5D4037",
      icon: <ArrowDownwardIcon />,
    },
    {
      label: "Highest Score",
      count: activityStats.highest,
      color: "#5D4037",
      icon: <ArrowUpwardIcon />,
    },
  ];

  // First, create a reusable button style object
  const commonButtonStyle = {
    backgroundImage: `url(${GameTextBox})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    color: "#5D4037",
    '&:hover': {
      backgroundImage: `url(${GameTextBox})`,
      opacity: 0.9
    },
    // Remove any existing backgroundColor
    backgroundColor: 'transparent',
    // Ensure text is visible
    textTransform: 'none',
    fontWeight: 'bold'
  };

  return (
    <Box
      sx={{
        minHeight: "96.5%",
        width: "98%",
        overflow: "hidden",
        backgroundImage: `url(${MonsterEditUIOuterLight})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        //alignItems: "center",
        p: 2,
      }}>
      {/* HEADER: left = title, middle = room name (centered), right = settings */}
      <Box
        sx={{
          py: 2,
          px: 3,
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: 'space-between' // This is key for distributing space
        }}
      >
        {/* left: icon + dashboard title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <DashboardIcon sx={{ color: "#5D4037", fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#5D4037" }}>
              Teacher Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: "#5D4037" }}>
              {userData.firstName ? `Welcome, ${userData.firstName} ${userData.lastName}` : "LingguaHey Learning Platform"}
            </Typography>
          </Box>
        </Box>

        {/* middle: centered room name */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: '#5D4037',
            fontWeight: 700,
            letterSpacing: '0.02em',
            fontSize: { xs: '1.6rem', sm: '2.2rem', md: '3rem' },
            textAlign: 'center',
            mb: 0,
            flexGrow: 1, 
            marginRight: '350px',
          }}
        >
          {currentRoomName}
        </Typography>

        {/* right: settings button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            sx={{ 
              borderRadius: 2,
              //border: "1px solid #5D4037",
              bgcolor: "transparent",
              height: 50,
              width: 50,
              p: 1,
              minWidth: 'auto',
            }}
            onClick={handleMenuOpen}
            aria-controls={isMenuOpen ? 'back-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? 'true' : undefined}
          >
            <SettingsIcon 
            sx={{
              height: 50,
              width: 50,
              color: "#5D4037"
            }}/>
          </Button>
        </Box>
      </Box>

      <Divider />

      <Box
        sx={{
          py: 0,
          px: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pt: { md: 0 }
        }}
      >
       
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 10 }}>
          {/*<Button
            sx={{ ...commonButtonStyle, ml: 100 }}
            onClick={handleMenuOpen}
            aria-controls={isMenuOpen ? 'back-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? 'true' : undefined}
          >
            <Typography variant="body1">settings</Typography>
          </Button>*/}

          <Menu
            id="back-menu"
            anchorEl={menuAnchor}
            open={isMenuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <MenuItem onClick={handleGoBack}>Go back to Dashboard</MenuItem>
            <MenuItem onClick={handleOpenEdit}>Edit current room</MenuItem>
            <MenuItem onClick={handleOpenDelete} sx={{ color: 'error.main' }}>Delete room</MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Edit Room Dialog */}
      <Dialog open={editRoomDialogOpen} onClose={() => setEditRoomDialogOpen(false)}>
        <DialogTitle 
          sx={{ 
            borderTop: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
            }}>
            Edit Classroom
          </DialogTitle>
        <DialogContent 
          sx={{ 
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
            }}>
          <TextField
            autoFocus
            margin="dense"
            label="Classroom name"
            fullWidth
            value={editRoomName}
            onChange={(e) => setEditRoomName(e.target.value)}
          />
        </DialogContent>
        <DialogActions 
          sx={{ 
            borderBottom: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
            }}>
          <Button onClick={() => setEditRoomDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} disabled={!editRoomName.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle  
          sx={{ 
            borderTop: '5px solid #5D4037', 
            borderLeft: '5px solid #5D4037', 
            borderRight: '5px solid #5D4037', 
            bgcolor: '#F7CB97' 
            }}>
            Delete Classroom?
          </DialogTitle>
        <DialogContent 
          sx={{ 
            borderLeft: '5px solid #5D4037', 
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97' 
            }}>
          <Typography>Are you sure you want to delete this classroom? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions  sx={{
            borderBottom: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Delete activity confirm dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" 
          sx={{ 
            borderTop: '5px solid #5D4037', 
            borderLeft: '5px solid #5D4037', 
            borderRight: '5px solid #5D4037', 
            bgcolor: '#F7CB97' 
            }}>
          {"Confirm Delete Activity"}
        </DialogTitle>
        <DialogContent sx={{ 
            borderLeft: '5px solid #5D4037', 
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97' 
            }}>
          <DialogContentText id="alert-dialog-description"
            sx={{
              bgcolor: '#F7CB97'
            }}>
            {deleteDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{
            borderBottom: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteActivity} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete question confirm dialog */}
      <Dialog
        open={openQuestionDeleteDialog}
        onClose={closeDeleteQuestionDialog}
        aria-labelledby="delete-question-dialog-title"
        aria-describedby="delete-question-dialog-description"
      >
        <DialogTitle id="delete-question-dialog-title"
          sx={{ borderTop: '5px solid #5D4037', borderLeft: '5px solid #5D4037', borderRight: '5px solid #5D4037', bgcolor: '#F7CB97' }}>
          {"Confirm Delete Question"}
        </DialogTitle>
        <DialogContent sx={{ borderLeft: '5px solid #5D4037', borderRight: '5px solid #5D4037', bgcolor: '#F7CB97' }}>
          <DialogContentText id="delete-question-dialog-description">{deleteLiveActivityDialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ borderBottom: '5px solid #5D4037', borderLeft: '5px solid #5D4037', borderRight: '5px solid #5D4037', bgcolor: '#F7CB97' }}>
          <Button onClick={closeDeleteQuestionDialog} color="primary">Cancel</Button>
          <Button onClick={confirmDeleteQuestion} color="primary" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
      {/* end delete question confirm dialog */}

      {/* "Go To Activity" Dialog */}
      <Dialog
        open={openActivityDialog}
        onClose={closeActivityDialog}
        aria-labelledby="activity-dialog-title"
        aria-describedby="activity-dialog-description"
        maxWidth="md"
        fullWidth={true}
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            overflowY: "auto",
            borderRadius: 2,
            bgcolor: '#F7CB97',
            border: '5px solid #5D4037',
          },
        }}
      >
        <DialogTitle id="activity-dialog-title"
          sx={{
            borderTop: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97'
          }}>
          {selectedActivity ? `Configure ${selectedActivity.activity_ActivityName}` : "Configure Activity"}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2,
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97' }}>
          {/* List of Questions */}
          {activityQuestions.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="text.primary" fontWeight="bold" mb={2}>
                Existing Questions:
              </Typography>
              <List sx={{ border: '3px solid #5D4037', borderRadius: 1, p: 2 }}>
                {activityQuestions.map((question, index) => {
                  const imgSrc = imageUrls[question.questionId] ?? getQuestionImageSrc(question); // getQuestionImageSrc = your existing resolver

                  // render image only when src exists
                  return (
                    <ListItem key={question.questionId} divider={index < activityQuestions.length - 1} sx={{ py: 1 }}>
                      {question.gameType === "GAME1" ? (
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body1" fontWeight="medium">{`Question ${index + 1}:`}</Typography>
                              {imgSrc ? (
                                <Box
                                  component="img"
                                  src={imgSrc}
                                  alt={question.questionText || `activity-img-${index}`}
                                  sx={{ maxWidth: 160, maxHeight: 90, objectFit: "cover", borderRadius: 1 }}
                                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                              ) : (
                                <Box sx={{
                                  width: 160, height: 90, borderRadius: 1, display: 'flex',
                                  alignItems: 'center', justifyContent: 'center',
                                  bgcolor: 'rgba(0,0,0,0.04)', color: '#5D4037', border: '1px dashed #ccc'
                                }}>
                                  <Typography variant="caption">No image</Typography>
                                </Box>
                              )}
                            </Box>
                          }
                          secondary="One Pic Four Words"
                        />
                      ) : question.gameType === "GAME2" ? (
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="medium">
                              {/* prefer explicit phrase field, fallback to questionText */}
                             {`Question ${index + 1}: ${question.phrase || question.questionText || question.question || "Untitled Phrase"}`}
                            </Typography>
                          }
                          secondary="Phrase Translation"
                        />
                      ) : (
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="medium">
                              {`Question ${index + 1}: ${question.questionText || question.question || "Untitled Question"}`}
                            </Typography>
                          }
                          secondary={`Game Type: ${
                            question.gameType === "GAME3" ? "Word Translation" : question.gameType
                          }`}
                        />
                      )}
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenQuestionEdit(question)} sx={{ mr: 1 }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => openDeleteQuestionDialog(question.questionId, question.questionText)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
          <Typography variant="subtitle1" color="text.secondary" mb={2}>
            Select the game type to add new questions to this activity.
          </Typography>
          {/* Game type selection */}
          {!selectedQuestionType && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", mt: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="game-type-select-label">Select Game Type</InputLabel>
                <Select
                  labelId="game-type-select-label"
                  id="game-type-select"
                  value={selectedQuestionType || ""}
                  label="Select Game Type"
                  onChange={(e) => handleQuestionTypeSelect(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="GAME1">One Pic Four Words</MenuItem>
                  <MenuItem value="GAME2">Phrase Translation</MenuItem>
                  <MenuItem value="GAME3">Word Translation</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
          {/* Render the appropriate game component based on the selected game type */}
          {selectedQuestionType === "GAME1" && (
            <Box mt={3}>
              <LiveActOnePicFourWords
                activityId={selectedActivity.activity_ActivityId}
                classroomId={roomId}
                onGameCreated={resetSelectedQuestionType}
                question={questionToEdit}                      // pass question to enter EDIT MODE
                onClose={() => { setQuestionToEdit(null); setSelectedQuestionType(null); }}
              />
            </Box>
          )}
          {selectedQuestionType === "GAME2" && (
            <Box mt={3}>
              <LiveActPhraseTranslation
                activityId={selectedActivity.activity_ActivityId}
                classroomId={roomId}
                onGameCreated={resetSelectedQuestionType}
                question={questionToEdit}                      // pass question to enter EDIT MODE
                onClose={() => { setQuestionToEdit(null); setSelectedQuestionType(null); }}
              />
            </Box>
          )}
          {selectedQuestionType === "GAME3" && selectedActivity?.activity_ActivityId && (
            <Box mt={3}>
              <LiveActWordTranslation
                activityId={selectedActivity.activity_ActivityId}
                classroomId={roomId}
                onGameCreated={resetSelectedQuestionType}
                question={questionToEdit}                      // pass question to enter EDIT MODE
                onClose={() => { setQuestionToEdit(null); setSelectedQuestionType(null); }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2,
            borderBottom: '5px solid #5D4037',
            borderLeft: '5px solid #5D4037',
            borderRight: '5px solid #5D4037',
            bgcolor: '#F7CB97' }}>
          <Button onClick={closeActivityDialog} color="secondary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Divider />

      <Grid container sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { md: 0 }, mt:3}}>

        <Grid item xs={12} md={6} sx={{ pr: { md: 6 }, mb: { xs: 4, md: 0 }, pl: { md: 10 } }}>
          <Stack direction="column" sx={{
            //borderStyle: "solid" 
          }}>
            <Stack direction="row" spacing={30} >
              <Stack direction="column" >
                <Box sx={{
                  mb: 4, justifyContent: 'center',
                  backgroundImage: `url(${GameTextFieldBigger})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width:600,
                  height:600,
                  pl: 5,
                  pr: 5,
                  pt: 8,
                  pb: 8,
                }}>


                  <Stack direction="row"
                    sx={{
                        width: "100%",
                        maxWidth: 600,
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: 60,
                        gap: 2,   // use gap for consistent spacing (theme spacing * 2 = 16px)
                        mb: 3
                      }}>
                    <Typography variant="h6" sx={{ mb: 0, color: '#5D4037', lineHeight: '1',display: 'flex',alignItems: 'center'}}>Activity Data</Typography>
                    <Button
                      sx={{
                        borderRadius: 2,
                        border: '1px solid #5D4037',
                        bgcolor: 'transparent',
                        height: 50,
                        width: 230,
                        p: 2
                      }}
                      onClick={handleOpenActivityCreateModal}
                    >
                      <Typography sx={{}}>
                        Add New Activity +
                      </Typography>
                    </Button>
                  </Stack>

                  <Divider sx={{mb:2,mt:2}}/>
                  <Box sx={{
                    //borderStyle: "solid" 
                  }}>
                    <Box sx={{ mb: 4, p: 2, bgcolor: 'rgba(185, 43, 174, 0)' }}>
                      <Typography variant="body2" color="text.secondary" id="select-activity-label" mb={1}>
                        Select Activity
                      </Typography>
                      <FormControl fullWidth>                  
                      <Select
                        labelId="select-activity-label"
                        value={selectedActivity?.activity_ActivityId || ""}
                        onChange={handleActivityChange}
                        displayEmpty
                        sx={{ bgcolor: 'rgba(185, 43, 174, 0)' }}
                      >
                        {activities && activities.map((activity) => (
                          <MenuItem key={activity.activity_ActivityId} value={activity.activity_ActivityId}>
                            {activity.activity_ActivityName || 'Untitled Activity'}
                          </MenuItem>
                        ))}
                        {(!activities || activities.length === 0) && (
                          <MenuItem value="" disabled >
                            No activities available
                          </MenuItem>
                        )}
                      </Select>
                      </FormControl>
                    </Box>

                    <Card
                      elevation={2}
                      sx={{
                        width: "100%",
                        minWidth: 150,
                        maxWidth: 260,
                        height: 140,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(255, 255, 255, 0)",
                        mb: 4,
                        mx: 'auto'
                      }}
                    >
                      <CardContent sx={{ width: "100%", p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Avatar sx={{ bgcolor: activityStatus === "Deployed" ? "#4caf50" : "#f44336", width: 44, height: 44, mb: 1 }}>
                          {activityStatus === "Deployed" ? <CheckCircleOutlineIcon /> : <BlockIcon />}
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#444", mb: 0.5, textAlign: "center" }}>
                          Activity Status
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: activityStatus === "Deployed" ? "#4caf50" : "#f44336", textAlign: "center" }}>
                          {activityStatus}
                        </Typography>
                      </CardContent>
                    </Card>


                    <Stack direction="column" spacing={2} sx={{ mb: 2, justifyContent: 'center', alignItems: "center" }}>
                      <Grid container spacing={3} mb={4}>
                        {scoreStatsCards.map((item, i) => (
                          <Grid item xs={12} sm={4} key={i}>
                            <Card
                              elevation={2}
                              sx={{
                                width: "100%",
                                minWidth: 150,
                                maxWidth: 260,
                                height: 140,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                                backgroundColor: "rgba(199, 162, 60, 0)",
                              }}
                            >
                              <CardContent sx={{ width: "100%", p: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <Avatar sx={{ bgcolor: item.color, width: 44, height: 44, mb: 1 }}>
                                  {item.icon}
                                </Avatar>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#444", mb: 0.5, textAlign: "center" }}>
                                  {item.label}
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: item.color, textAlign: "center" }}>
                                  {item.count}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#5D4037', opacity: 0.8, textAlign: 'center' }}>{item.description}</Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>


                      <Box sx={{ display: 'flex', gap: 2.4, mb: 4, paddingTop: 0.1, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          sx={{ 
                            bgcolor: 'transparent', 
                            flexGrow: { xs: 1, sm: 0 },
                            borderRadius: 2,
                            border: "1px solid #5D4037",
                            color: '#5D4037',
                          }}
                          disabled={!selectedActivity || selectedRoomStudents.length === 0}
                          onClick={() => {
                            fetchStudentScores(selectedActivity);
                            setOpenScoresModal(true);
                          }}
                        >
                          View Scores
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: 2,
                            border: "1px solid #5D4037",
                            bgcolor: "transparent",
                            color: '#5D4037',
                            flexGrow: { xs: 1, sm: 0 }
                          }}
                          onClick={() => openDeleteActivityDialog(selectedActivity?.activity_ActivityId)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: 2,
                            border: "1px solid #5D4037",
                            bgcolor: "transparent",
                            color: "#5D4037",
                            flexGrow: { xs: 1, sm: 0 }
                          }}
                          onClick={() => handleOpenActivityEdit(selectedActivity)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: 2,
                            border: "1px solid #5D4037",
                            bgcolor: "transparent",
                            color: "#5D4037",
                            flexGrow: { xs: 1, sm: 0 }
                          }}
                          onClick={handleUndeploy}
                          disabled={!selectedActivity || !isDeployed}
                        >
                          Undeploy
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: 2,
                            border: "1px solid #5D4037",
                            bgcolor: "transparent",
                            color: "#5D4037",
                            flexGrow: { xs: 1, sm: 0 }
                          }}
                          onClick={handleDeploy}
                          disabled={!selectedActivity || isDeployed}
                        >
                          Deploy
                        </Button>

                      </Box>
                    </Stack>
                  </Box>

                </Box>


              </Stack>

              <Box sx={{ 
                p: 10, justifyContent: 'center',
                bgcolor: 'rgba(185, 43, 174, 0)', 
                height: 300, 
                overflowY: 'auto',
                backgroundImage: `url(${GameTextFieldBig})`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 4 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Enrolled Students ({selectedRoomStudents.length})</Typography>
                  <Button  
                    sx={{ 
                      bgcolor: "transparent",
                      color: '#5D4037',
                    }} 
                      onClick={handleOpenStudentListModal}>

                    <EditIcon />
                  </Button>
                </Box>
                <Box sx={{ bgcolor: 'rgba(245, 245, 245, 0)', p: 2, borderRadius: 1, minHeight: 150, maxHeight: 200, overflowY: 'auto', boxShadow: 1 }}>
                  {selectedRoomStudents.length > 0 ? selectedRoomStudents.map((student) => (
                    <Typography key={student.userId} variant="body2" sx={{ mb: 0.5 }}>{`${student.firstName} ${student.lastName}`}</Typography>
                  )) : <Typography variant="body2" color="text.secondary">No students enrolled.</Typography>}
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <StudentListModalContent />
      <ScoresModalContent />

      {/* Activity Creation Modal */}
<Modal
  open={openActivityCreateModal}
  onClose={handleCloseActivityCreateModal}
  aria-labelledby="activity-create-modal-title"
  aria-describedby="activity-create-modal-description"
>
  <Box sx={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#F7CB97',
    border: '5px solid #5D4037',
    boxShadow: 24,
    p: 4,
  }}>
    <Typography id="activity-create-modal-title" variant="h6" component="h2">
      Create New Activity
    </Typography>
    <TextField
      autoFocus
      margin="dense"
      id="activity-name"
      label="Activity Name"
      type="text"
      fullWidth
      value={newActivityName}
      onChange={(e) => setNewActivityName(e.target.value)}
    />
    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
      <Button onClick={handleCloseActivityCreateModal} sx={{ mr: 1 }}>Cancel</Button>
      <Button variant="contained" onClick={handleCreateActivity} disabled={!newActivityName.trim()}>Create</Button>
    </Box>
  </Box>
</Modal>
    </Box>

  );
};

export default TeacherDashboardPopUp;