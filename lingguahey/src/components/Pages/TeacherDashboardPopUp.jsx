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


const TeacherDashboardPopUp = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [roomDetails, setRoomDetails] = useState(null);
  const [selectedRoomStudents, setSelectedRoomStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [openStudentListModal, setOpenStudentListModal] = useState(false);

  // const [selectedWeek, setSelectedWeek] = useState("Week 1"); // Removed
  const [activityStatus, setActivityStatus] = useState("Undeployed");

  const [activityStats, setActivityStats] = useState({
    averageScore: 0,
    lowestScore: 0,
    highestScore: 0,
    studentsReachedGoal: 0,
    studentsFailed: 0,
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
 
  const API = React.useMemo(() => {
    if (!token) return null;
    return axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded = jwtDecode(storedToken);
        const fetchUser = async () => {
          if (!API) return;
          try {
            const response = await API.get(`/api/lingguahey/users/${decoded.userId}`);
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
      const roomDetailsResponse = await API.get(`/api/lingguahey/classrooms/${roomId}`);
      setRoomDetails(roomDetailsResponse.data);

      const enrolledStudentsResponse = await API.get(`/api/lingguahey/classrooms/${roomId}/students`);
      setSelectedRoomStudents(enrolledStudentsResponse.data || []);

      const allStudentsResponse = await API.get('/api/lingguahey/users?role=USER');
      if (Array.isArray(allStudentsResponse.data)) {
        setAllStudents(allStudentsResponse.data.filter(student => student.role === "USER"));
      } else {
        setAllStudents([]);
      }

      const activityStatsResponse = await API.get(`/api/lingguahey/activities/${roomId}/activities`);
       setActivityStats(activityStatsResponse.data || { averageScore: 85, lowestScore: 60, highestScore: 95, studentsReachedGoal: 15, studentsFailed: 3 });


      const progressDataResponse = await API.get(`/api/lingguahey/activities/${roomId}/progress`);
      setProgressData(progressDataResponse.data || [
        { userId: '1', firstName: 'Jake', lastName: 'Hoker Aves', completedActivities: 20, totalActivities: 25 },
        { userId: '2', firstName: 'Jane', lastName: 'Doe', completedActivities: 22, totalActivities: 25 },
      ]);


    } catch (err) {
      console.error("Failed to fetch classroom data:", err);
      setError(`Failed to load classroom data: ${err.message || "Unknown error"}`);
      setActivityStats({ averageScore: 0, lowestScore: 0, highestScore: 0, studentsReachedGoal: 0, studentsFailed: 0 });
      setProgressData([]);
      setSelectedRoomStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, API]);

  const fetchActivities = async () => {
    if (!API || !roomId) return;
    try {
      const response = await API.get(`/api/lingguahey/live-activities/${roomId}/live-activities`);
      console.log('Fetched activities:', response.data);
      setActivities(response.data || []);
      
      if (selectedActivity) {
        const selectedAct = response.data.find(act => act.activity_ActivityId === selectedActivity);
        if (selectedAct) {
          setIsDeployed(selectedAct.deployed || false);
          setActivityStatus(selectedAct.deployed ? "Deployed" : "Undeployed");
        }
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setActivities([]);
    }
  };

  useEffect(() => {
    fetchRoomData();
    fetchActivities();
  }, [fetchRoomData]);

  const handleOpenStudentListModal = () => setOpenStudentListModal(true);
  const handleCloseStudentListModal = () => setOpenStudentListModal(false);

  const handleAddStudentToClassroom = async (student) => {
    if (!API) return;
    try {
      const response = await API.post(`/api/lingguahey/classrooms/${roomId}/students/${student.userId}`, {});
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
      await API.delete(`/api/lingguahey/classrooms/${roomId}/students/${studentId}`);
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

  // const handleWeekChange = (event) => { // Removed
  //   setSelectedWeek(event.target.value);
  // };

  const handleGoBack = () => {
    navigate("/teacherdashboard");
  };

  const handleActivityChange = (event) => {
    const activityId = event.target.value;
    setSelectedActivity(activityId);
    const activity = activities.find(a => a.activity_ActivityId === activityId);
    setSelectedActivityName(activity ? activity.activity_ActivityName : '');
    setIsDeployed(activity ? activity.deployed : false);
    setActivityStatus(activity?.deployed ? "Deployed" : "Undeployed");
  };

  const handleDeploy = async () => {
    if (!API || !selectedActivity) {
      alert('Please select an activity first');
      return;
    }

    try {
      const response = await API.put(`/api/lingguahey/live-activities/${selectedActivity}/set-deployed/true`);
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
      const response = await API.put(`/api/lingguahey/live-activities/${selectedActivity}/set-deployed/false`);
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

  const currentRoomName = roomDetails?.classroomName || roomDetails?.name || (isLoading ? "Loading..." : "Classroom Details");

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
      count: activityStats.averageScore,
      color: "#424242",
      icon: <TrendingUpIcon />,
    },
    {
      label: "Lowest Score",
      count: activityStats.lowestScore,
      color: "#f44336",
      icon: <ArrowDownwardIcon />,
    },
    {
      label: "Highest Score",
      count: activityStats.highestScore,
      color: "#4caf50",
      icon: <ArrowUpwardIcon />,
    },
  ];

  const progressSummaryCards = [
    {
      label: "Students Failed to Reach Goal",
      count: activityStats.studentsFailed,
      color: "#f44336",
      icon: <CancelIcon />,
    },
    {
      label: "Students Reached Goal",
      count: activityStats.studentsReachedGoal,
      color: "#4caf50",
      icon: <SchoolIcon />,
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
              justifyContent: 'flex-start',
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0',
              bgcolor: '#f5f5f5',
              borderRadius: '8px 8px 0 0',
              pt:{md:0}
            }}
          >
            <Button sx={{borderRadius: 6, ml: "20px", mr:"20px",backgroundColor: "#3f51b5", color: "#fff"}} onClick={() => navigate(`/teacherdashboard`)}>
            <Typography variant="body1" sx={{ color: "white" }}>
            Back to Dashboard
            </Typography>
            </Button>  
            <Typography variant="h4" component="h1" sx={{
              color: '#3f51b5',
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, pl: 65, flexGrow: 1 }}>
              {currentRoomName}
            </Typography>

        <Button sx={{borderRadius: 6, ml: "auto", mr:"20px",backgroundColor: "#3f51b5", color: "#fff"}} onClick={() => navigate(`/teacher/live-activities/${roomId}`)}>
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

              <Box sx={{ mb: 4, p: 2, borderRadius: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
                <Typography variant="body2" color="text.secondary" id="select-activity-label" mb={1}>
                  Select Activity
                </Typography>
                <FormControl fullWidth>
                  <Select
                    labelId="select-activity-label"
                    value={selectedActivity}
                    onChange={(e) => {
                      const activity = activities.find(a => a.activity_ActivityId === e.target.value);
                      setSelectedActivity(e.target.value);
                      setSelectedActivityName(activity ? activity.activity_ActivityName : '');
                      console.log('Selected activity:', activity);
                    }}
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
                  disabled={!selectedActivity}
                >
                  View Scores
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#9e9e9e', '&:hover': {bgcolor: '#757575'}, flexGrow: {xs: 1, sm:0} }}
                  disabled={!selectedActivity}
                >
                  Delete
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#ff9800', '&:hover': {bgcolor: '#fb8c00'}, flexGrow: {xs: 1, sm:0} }}
                  disabled={!selectedActivity}
                >
                  Edit
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

              <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
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
            </Grid>

            <Grid item xs={12} md={6} sx={{ pl: { md: 21} }}>
              <Typography variant="h6" sx={{ mb: 3, color: '#3f51b5', fontWeight: 600 }}>Activity Progress</Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {progressSummaryCards.map((item, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Card
                      elevation={2}
                      sx={{
                        width: "100%",
                        minWidth: 220,
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
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#444", mb: 0.5, textAlign: "center" }}>
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

              <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, bgcolor: '#e0e0e0', p: 1.5, borderRadius: '4px 4px 0 0' }}>
                  <Typography variant="subtitle1" fontWeight={600}>Student Name</Typography>
                  <Typography variant="subtitle1" fontWeight={600}>Progress Tracker</Typography>
                </Box>
                <Box sx={{ bgcolor: '#f5f5f5', borderRadius: '0 0 4px 4px', maxHeight: 300, overflowY: 'auto', border: '1px solid #e0e0e0', borderTop: 'none' }}>
                  {progressData.length > 0 ? (
                    progressData.map((student) => (
                      <Box key={student.userId || student.id} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderBottom: '1px solid #e0e0e0', '&:last-child': { borderBottom: 0 } }}>
                        <Typography variant="body2">{`${student.firstName} ${student.lastName}`}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: student.totalActivities > 0 && (student.completedActivities / student.totalActivities) >= 0.7 ? '#4caf50' : '#f44336' }}>
                          {`${student.completedActivities || 0} / ${student.totalActivities || 0} Activities`}
                        </Typography>
                      </Box>
                    ))
                  ) : ( <Box sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No progress data available.</Typography></Box> )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        <StudentListModalContent />
      </Box>

  );
};

export default TeacherDashboardPopUp;