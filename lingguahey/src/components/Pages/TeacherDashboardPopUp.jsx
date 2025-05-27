import React, { useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import API from "../../api"; // Adjust the import path as necessary


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
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedActivityName, setSelectedActivityName] = useState('');
  const [isDeployed, setIsDeployed] = useState(false);

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
      setActivityStats({ average: 0, lowest: 0, highest: 0});
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

  const fetchActivities = async () => {
    if (!API || !roomId) return;
    try {
      const response = await API.get(`/live-activities/${roomId}/live-activities`);
      console.log('Fetched activities:', response.data);
      setActivities(response.data || []);
      
      // If we have a selected activity, update its deployment status
      if (selectedActivity) {
        const selectedAct = response.data.find(act => act.activity_ActivityId === selectedActivity);
        if (selectedAct) {
          console.log('Updating deployment status for:', selectedAct);
          setIsDeployed(!!selectedAct.deployed); // Ensure boolean value with !!
          setActivityStatus(selectedAct.deployed ? "Deployed" : "Undeployed");
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
      if (!API || !selectedActivity) {
        setActivityStats({
          average: 0,
          lowest: 0,
          highest: 0,
        });
        return;
      }

      try {
        const response = await API.get(`/scores/live-activities/${selectedActivity}/stats`);
        console.log("Acitivity Stats  :", response.data);
        setActivityStats({
          average: response.data.average || 0,
          lowest: response.data.lowest || 0,
          highest: response.data.highest || 0,
        });
      } catch (err) {
        console.error("Failed to fetch activity statistics:", err);
        setActivityStats({
          average: 0,
          lowest: 0,
          highest: 0,
        });
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
        if(!studentExistsInAll) {
            setAllStudents(prev => [...prev, studentToRemove]);
        }
      }
    } catch (err) {
      console.error("Failed to remove student:", err);
    }
  };


  const handleGoBack = () => {
    navigate("/teacherdashboard");
  };
  

  const handleActivityChange = async (e) => {
      const activityId = e.target.value;
      setSelectedActivity(activityId);

      // Find the selected activity from the activities array
      const activity = activities.find(a => a.activity_ActivityId === activityId);
      
      if (activity) {
        setSelectedActivityName(activity.activity_ActivityName);
        setIsDeployed(!!activity.deployed);
        setActivityStatus(activity.deployed ? "Deployed" : "Undeployed");     

      }
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default', p:3 }}>
        <CircularProgress />
        <Typography sx={{ml: 2}}>Loading Classroom Data...</Typography>
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
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 24,
      p: 0,
    }}>
      <Box sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        bgcolor: '#f5f5f5',
      }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
          Student Scores - {selectedActivityName}
        </Typography>
        <IconButton onClick={() => setOpenScoresModal(false)} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, display: 'flex', gap: 1, borderBottom: '1px solid #e0e0e0' }}>
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
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white',
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
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{
          p: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#f5f5f5',
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
            borderRight: { md: '1px solid #e0e0e0' },
            borderBottom: { xs: '1px solid #e0e0e0', md: 'none' },
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3f51b5', fontWeight: 500 }}>
              Enrolled Students ({selectedRoomStudents.length})
            </Typography>
            <Box sx={{
              bgcolor: '#ffffff',
              borderRadius: 1,
              border: '1px solid #e0e0e0',
              maxHeight: 350,
              overflowY: 'auto',
              minHeight: 120,
              width:300
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
                      borderBottom: '1px solid #eeeeee',
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

          <Grid item xs={12} md={6} sx={{ p: {xs:2, md:3},pl: { md: 15} }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#3f51b5', fontWeight: 500 }}>
              Add Students from School
            </Typography>
            <Box sx={{
              bgcolor: '#ffffff',
              borderRadius: 1,
              border: '1px solid #e0e0e0',
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
                            sx={{ minWidth: 60, whiteSpace: 'nowrap',marginLeft: 20 }}
                         >
                           Add
                         </Button>
                      }
                       sx={{
                         py: 1.5,
                         px: 2,
                         borderBottom: '1px solid #eeeeee',
                         '&:last-child': { borderBottom: 'none' },
                         '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.05)'}
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
      color: "#424242",
      icon: <TrendingUpIcon />,
    },
    {
      label: "Lowest Score",
      count: activityStats.lowest,
      color: "#f44336",
      icon: <ArrowDownwardIcon />,
    },
    {
      label: "Highest Score",
      count: activityStats.highest,
      color: "#4caf50",
      icon: <ArrowUpwardIcon />,
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
      <Box
        sx={{
          backgroundColor: "#fff",
          py: 2,
          px: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          mb: 4,
          display: "flex",
          alignItems: "center"
        }}
      >
        <DashboardIcon sx={{ mr: 2, color: "#3f51b5", fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#3f51b5" }}>
            Teacher Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: "#757575" }}>
            {userData.firstName ? `Welcome, ${userData.firstName} ${userData.lastName}` : "LingguaHey Learning Platform"}
          </Typography>
        </Box>
      </Box>


          <Box
            sx={{
              py: 0,
              px: 0,
              display: 'flex',
              justifyContent: 'space-between', // Changed from 'flex-start' to 'space-between'
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0',
              bgcolor: '#f5f5f5',
              borderRadius: '8px 8px 0 0',
              pt:{md:0}
            }}
          >
            <Button 
              sx={{
                borderRadius: 6, 
                ml: "20px",
                backgroundColor: "#3f51b5", 
                color: "#fff"
              }} 
              onClick={() => navigate(`/teacherdashboard`)}
            >
              <Typography variant="body1" sx={{ color: "white" }}>
                Back to Dashboard
              </Typography>
            </Button>  
            
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{
                color: '#3f51b5',
                fontWeight: 700,
                letterSpacing: '0.02em',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                textAlign: 'center', // Added textAlign center
                flex: 1, // Added flex 1 to ensure it takes available space
                mx: 2 // Added horizontal margin for spacing
              }}
            >
              {currentRoomName}
            </Typography>

            <Button 
              sx={{
                borderRadius: 6, 
                mr:"20px",
                backgroundColor: "#3f51b5", 
                color: "#fff"
              }} 
              onClick={() => navigate(`/teacher/live-activities/${roomId}`)}
            >
              <Typography variant="body1" sx={{ color: "white" }}>
                Activity Creation
              </Typography>
            </Button>         
          </Box>
            <Box sx={{ width: '100%', textAlign: 'center', my: 3 }}>


          </Box>
          
          <Grid container sx={{flexGrow: 1, p: {xs:2, sm:3, md:4},pt:{md:0}}}>

            <Grid item xs={12} md={6} sx={{ pr: { md: 6 }, mb: {xs: 4, md: 0}, pl: { md: 10} }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#3f51b5', fontWeight: 600 }}>Activity Data</Typography>
              <Stack direction="row" spacing={30} sx={{ mb: 4, justifyContent: 'center' }}> 
              <Box>
              <Box sx={{ mb: 4, p: 2, borderRadius: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
                <Typography variant="body2" color="text.secondary" id="select-activity-label" mb={1}>
                  Select Activity
                </Typography>
                <FormControl fullWidth>                  <Select
                    labelId="select-activity-label"
                    value={selectedActivity}
                    onChange={handleActivityChange}
                    displayEmpty
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <MenuItem value="" disabled>
                      <em>Select an activity</em>
                    </MenuItem>
                    {activities && activities.map((activity) => (
                      <MenuItem key={activity.activity_ActivityId} value={activity.activity_ActivityId}>
                        {activity.activity_ActivityName || 'Untitled Activity'}
                      </MenuItem>
                    ))}
                    {(!activities || activities.length === 0) && (
                      <MenuItem value="" disabled>
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
                  borderRadius: 3,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  backgroundColor: "#fff",
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

              
                <Stack direction="column" spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
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
                        borderRadius: 3,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        backgroundColor: "#fff",
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
                        <Typography variant="caption" sx={{ opacity: 0.8, textAlign: 'center' }}>{item.description}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>    
             

              <Box sx={{ display: 'flex', gap: 2.4, mb: 4, paddingTop:0.1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#9e9e9e', '&:hover': {bgcolor: '#757575'}, flexGrow: {xs: 1, sm:0} }}
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
                  sx={{ bgcolor: '#f44336', '&:hover': {bgcolor: '#d32f2f'}, flexGrow: {xs: 1, sm:0} }}
                  onClick={handleUndeploy}
                  disabled={!selectedActivity || !isDeployed}
                >
                  Undeploy
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#4caf50', '&:hover': {bgcolor: '#388e3c'}, flexGrow: {xs: 1, sm:0} }}
                  onClick={handleDeploy}
                  disabled={!selectedActivity || isDeployed}
                >
                  Deploy
                </Button>
                
              </Box>
               </Stack>          
              </Box>
              
              
                  
              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1,height: 300, overflowY: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Enrolled Students ({selectedRoomStudents.length})</Typography>
                  <Button startIcon={<EditIcon />} size="small" sx={{ color: '#3f51b5', textTransform: 'none' }} onClick={handleOpenStudentListModal}>
                    Edit Student List
                  </Button>
                </Box>
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, minHeight: 150, maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0' }}>
                  {selectedRoomStudents.length > 0 ? selectedRoomStudents.map((student) => (
                    <Typography key={student.userId} variant="body2" sx={{ mb: 0.5 }}>{`${student.firstName} ${student.lastName}`}</Typography>
                  )) : <Typography variant="body2" color="text.secondary">No students enrolled.</Typography>}
                </Box>
              </Box>
              </Stack>
            </Grid>
          </Grid>
        <StudentListModalContent />
        <ScoresModalContent /> 
      </Box>

  );
};

export default TeacherDashboardPopUp;