import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend as PieLegend, Tooltip as PieTooltip } from 'recharts';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ClassIcon from "@mui/icons-material/Class";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import SchoolIcon from "@mui/icons-material/School";
import DashboardIcon from "@mui/icons-material/Dashboard";
import axios from "axios";
import API from "../../api";
import { jwtDecode } from "jwt-decode";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [classroomData, setClassroomData] = useState([]); 
  const [newClassroomName, setNewClassroomName] = useState("");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    userId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: null,
  });
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [concurrentUsers, setConcurrentUsers] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [studentsRegistered, setStudentsRegistered] = useState(0);
  const [teachersRegistered, setTeachersRegistered] = useState(0);
  const [classroomName, setClassroomName] = useState("");
  const [classrooms, setClassrooms] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState("users"); 
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState([currentYear]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

   const [monthlyData, setMonthlyData] = useState([
    { name: 'Jan', users: 0, students: 0, teachers: 0 },
    { name: 'Feb', users: 0, students: 0, teachers: 0 },
    { name: 'Mar', users: 0, students: 0, teachers: 0 },
    { name: 'Apr', users: 0, students: 0, teachers: 0 },
    { name: 'May', users: 0, students: 0, teachers: 0 },
    { name: 'Jun', users: 0, students: 0, teachers: 0 },
    { name: 'Jul', users: 0, students: 0, teachers: 0 },
    { name: 'Aug', users: 0, students: 0, teachers: 0 },
    { name: 'Sep', users: 0, students: 0, teachers: 0 },
    { name: 'Oct', users: 0, students: 0, teachers: 0 },
    { name: 'Nov', users: 0, students: 0, teachers: 0 },
    { name: 'Dec', users: 0, students: 0, teachers: 0 },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded Token:", decoded);
        const fetchUser = async () => {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setUsers(response.data);
            // setConcurrentUsers(1); // This will be updated by the new API call
            setRegisteredUsers(response.data.length);
            let studentCount = 0;
            let teacherCount = 0;
            response.data.forEach((user) => {
              if (user.role === "USER") {
                studentCount++;
              } else if (user.role === "TEACHER") {
                teacherCount++;
              }
            });
            setStudentsRegistered(studentCount);
            setTeachersRegistered(teacherCount);

            const yearsSet = new Set();
            response.data.forEach(user => {
              if (user.createdAt) {
                const year = new Date(user.createdAt).getFullYear();
                yearsSet.add(year);
              }
            });
            const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);
            setAvailableYears(sortedYears);
            if (!sortedYears.includes(selectedYear)) {
              setSelectedYear(sortedYears[0] || currentYear);
            }

            const updatedMonthlyData = monthlyData.map((month, idx) => {
              const startOfMonth = new Date(new Date().getFullYear(), idx, 1, 0, 0, 0, 0);
              const endOfMonth = new Date(new Date().getFullYear(), idx + 1, 0, 23, 59, 59, 999);

              const usersInMonth = response.data.filter(user => {
                if (!user.createdAt) return false;
                const created = new Date(user.createdAt);
                return created >= startOfMonth && created <= endOfMonth;
              });
              const studentsInMonth = usersInMonth.filter(user => user.role === "USER");
              const teachersInMonth = usersInMonth.filter(user => user.role === "TEACHER");
              return {
                name: month.name,
                users: usersInMonth.length,
                students: studentsInMonth.length,
                teachers: teachersInMonth.length,
              };
            });

            setMonthlyData(updatedMonthlyData);
          } catch (err) {
            console.error("Failed to fetch user:", err);
            setError("Failed to fetch users. Please try again later.");
          }
        };

        // New function to fetch concurrent users
        const fetchActiveTokenCount = async () => {
          try {
            const response = await API.get(`/users/analytics/active-token-count`); 
            console.log("For token",response);             
            setConcurrentUsers(response.data);
          } catch (err) {
            console.error("Failed to fetch active token count:", err);
            // Handle error or set to 0 if API call fails
            setConcurrentUsers(0);
          }
        };

        fetchUser();
        fetchActiveTokenCount(); // Call the new function
      } catch (err) {
        console.error("Failed to decode token:", err);
        setError("Failed to decode token. Please try again later.");
      }
    }
  }, []);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Classroom API response:", response.data);

        setClassrooms(
          response.data.map((classroom) => ({
            ...classroom,
            name: classroom.name || classroom.classroomName || "Unnamed Classroom", 
            id: classroom.classroomID,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch classrooms:", error);
        setClassrooms([]); 
      }
    };

    fetchClassrooms();
  }, []);

  useEffect(() => {
  const updatedMonthlyData = monthlyData.map((month, idx) => {
    const startOfMonth = new Date(selectedYear, idx, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(selectedYear, idx + 1, 0, 23, 59, 59, 999);
    const usersInMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const created = new Date(user.createdAt);
      return created >= startOfMonth && created <= endOfMonth;
    });
    const studentsInMonth = usersInMonth.filter(user => user.role === "USER");
    const teachersInMonth = usersInMonth.filter(user => user.role === "TEACHER");
    return {
      name: month.name,
      users: usersInMonth.length,
      students: studentsInMonth.length,
      teachers: teachersInMonth.length,
    };
  });
  setMonthlyData(updatedMonthlyData);
}, [users, selectedYear]);

  const getYAxisMax = () => {
    const data = getFilteredChartData();
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return Math.ceil(Math.max(maxValue, 10) / 10) * 10;
  };

  const statsCards = [
    { label: "Concurrent Users", count: concurrentUsers, color: "#ff9800", icon: <VisibilityIcon />, clickable: false },
    { label: "Users", count: registeredUsers, color: "#f44336", icon: <PersonIcon />, clickable: true },
    { label: "Students", count: studentsRegistered, color: "#2196f3", icon: <SchoolIcon />, clickable: true },
    { label: "Teachers", count: teachersRegistered, color: "#4caf50", icon: <MenuBookIcon />, clickable: true },
  ];

  const handleClassroomClick = async (classroom) => {
    setSelectedClassroom(classroom);
    setOpen(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities/${classroom.id}/activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedClassroom({ ...classroom, activities: response.data });
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setSelectedClassroom({ ...classroom, activities: [] });
    }
  };

  const handleCloseModal = () => setOpen(false);

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `application/json`
        },
      });
      setUsers((prev) => prev.filter((user) => user.userId !== userId)); 
      alert("User deleted successfully.");
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities/${activityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedClassroom((prev) => ({
        ...prev,
        activities: prev.activities.filter((activity) => activity.activityId !== activityId),
      })); 
      alert("Activity deleted successfully.");
    } catch (error) {
      console.error("Failed to delete activity:", error);
      alert("Failed to delete activity. Please try again.");
    }
  };

  const handleOpenDialog = () => setOpenCreateDialog(true);
  const handleCloseDialog = () => setOpenCreateDialog(false);

  const getFilteredChartData = () => {
    let key = "users";
    if (activeFilter === "students") key = "students";
    if (activeFilter === "teachers") key = "teachers";
    return monthlyData.map((item) => ({
      name: item.name,
      value: item[key] ?? 0,
    }));
  };

  const GAME_LABELS = {
  GAME1: "One Pic Four Words",
  GAME2: "Phrase Translation",
  GAME3: "Word Translation"
};
const GAME_COLORS = ["#42a5f5", "#66bb6a", "#ffa726"];

const [gameUsageData, setGameUsageData] = useState([
  { name: "One Pic Four Words", value: 0 },
  { name: "Phrase Translation", value: 0 },
  { name: "Word Translation", value: 0 }
]);

// Fetch classrooms and count game usage
useEffect(() => {
  const fetchClassroomsAndGames = async () => {
    try {
      const token = localStorage.getItem("token");
      const classroomsRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/classrooms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const classroomsArr = classroomsRes.data || [];
      let gameClassroomSet = {
        GAME1: new Set(),
        GAME2: new Set(),
        GAME3: new Set()
      };

      // For each classroom, fetch its activities and check which game types are present
      await Promise.all(
        classroomsArr.map(async (classroom) => {
          const activitiesRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/activities/${classroom.classroomID}/activities`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const activities = activitiesRes.data || [];
          // For each game type, if at least one activity of that type exists in this classroom, count it
          ["GAME1", "GAME2", "GAME3"].forEach(gameType => {
            if (activities.some(a => a.gameType === gameType)) {
              gameClassroomSet[gameType].add(classroom.classroomID);
            }
          });
        })
      );

      setGameUsageData([
        { name: GAME_LABELS.GAME1, value: gameClassroomSet.GAME1.size },
        { name: GAME_LABELS.GAME2, value: gameClassroomSet.GAME2.size },
        { name: GAME_LABELS.GAME3, value: gameClassroomSet.GAME3.size }
      ]);
    } catch (err) {
      // fallback: zero data
      setGameUsageData([
        { name: GAME_LABELS.GAME1, value: 0 },
        { name: GAME_LABELS.GAME2, value: 0 },
        { name: GAME_LABELS.GAME3, value: 0 }
      ]);
    }
  };
  fetchClassroomsAndGames();
}, []);

  // Small derived variable to keep UI rendering clean (precompute filtered users)
const filteredUsers = users
  .filter((user) =>
    `${(user.firstName || "")} ${(user.lastName || "")}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )
  .filter((user) =>
    roleFilter === "ALL" ? true : user.role === roleFilter
  );

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", pb: 5 }}>
      {/* Header */}
      <Box 
        sx={{ 
          backgroundColor: "#fff", 
          py: 2, 
          px: 3, 
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          mb: 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: 2
        }}
      >
        <DashboardIcon sx={{ color: "#3f51b5", fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "#3f51b5", lineHeight: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: "#757575" }}>
            LingguaHey Learning Platform Management
          </Typography>
        </Box>

        <Box sx={{ ml: "auto", display: "flex", gap: 2 }}>
          <Button sx={{borderRadius: 6, backgroundColor: "#3f51b5", color: "#fff"}} onClick={() => navigate(`/activities`)}>
            <Typography variant="body1" sx={{ color: "white" }}>
              Game Editor
            </Typography>
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: "auto", px: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={2} mb={4}>
          {statsCards.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card
                elevation={activeFilter === item.label.toLowerCase().split(" ")[0] && item.clickable ? 8 : 2}
                sx={{
                  width: 250,
                  height: 128,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 2,
                  px: 2,
                  backgroundColor: "#fff",
                  transition: "transform 0.12s ease, box-shadow 0.12s ease",
                  cursor: item.clickable ? "pointer" : "default",
                  "&:hover": item.clickable ? { transform: "translateY(-3px)" } : {}
                }}
                onClick={() => { if (item.clickable) setActiveFilter(item.label.toLowerCase().split(" ")[0]); }}
              >
                <Avatar sx={{ bgcolor: item.color, width: 48, height: 48, mr: 2 }}>
                  {item.icon}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: "#666", fontWeight: 600 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h5" sx={{ color: item.color, fontWeight: 700 }}>
                    {item.count}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
         

        {/* Line Chart and Users List Side-by-Side */}
        <Grid container spacing={3} mb={4}>
          {/* Line Chart */}
          <Grid item xs={12} md={9}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                p: 2,
                height: 485,
                width: "96%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: "#3f51b5" }}>
                  User Growth Trends
                </Typography>
                <TextField
                  select
                  size="small"
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  SelectProps={{ native: true }}
                  sx={{ width: 120 }}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </TextField>
              </Box>
              <Box sx={{ flex: 1, width: "100%", mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getFilteredChartData()}
                    margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      domain={[0, getYAxisMax()]}
                      interval={0}
                    />
                    <RechartsTooltip />
                    <Legend verticalAlign="top" align="right" />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={
                        activeFilter === "users"
                          ? "#f44336"
                          : activeFilter === "students"
                          ? "#2196f3"
                          : activeFilter === "teachers"
                          ? "#4caf50"
                          : "#f44336"
                      }
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                      name={activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* Users List with Search */}
          <Grid item xs={12} md={3}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                height: 515,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  backgroundColor: "#f44336",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Users</Typography>
                <Typography variant="body2" sx={{ ml: "auto", opacity: 0.9 }}>
                  {filteredUsers.length}
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ p: 2, display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Box>

              <Box sx={{ px: 2, display: "flex", gap: 1, flexWrap: "wrap", pb: 1 }}>
                {[
                  { label: "All Roles", value: "ALL", color: "default" },
                  { label: "User", value: "USER", color: "primary" },
                  { label: "Teacher", value: "TEACHER", color: "success" },
                  { label: "Admin", value: "ADMIN", color: "warning" },
                ].map((role) => (
                  <Chip
                    key={role.value}
                    label={role.label}
                    clickable
                    color={roleFilter === role.value ? role.color : "default"}
                    variant={roleFilter === role.value ? "filled" : "outlined"}
                    onClick={() => setRoleFilter(role.value)}
                    sx={{ fontWeight: 500 }}
                    size="small"
                  />
                ))}
              </Box>

              {error && (
                <Box sx={{ p: 2, backgroundColor: "#ffebee" }}>
                  <Typography color="error">{error}</Typography>
                </Box>
              )}
              <Box sx={{ flex: 1, overflowY: "auto", px: 2 }}>
                <List sx={{ width: "100%" }}>
                  {filteredUsers.length === 0 && (
                    <Box sx={{ py: 6, textAlign: "center" }}>
                      <Typography color="text.secondary">No users match your filters</Typography>
                    </Box>
                  )}
                  {filteredUsers.map((user, index) => (
                    <React.Fragment key={user.userId || index}>
                      <ListItem sx={{ py: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor:
                              user.role === "USER"
                                ? "#2196f3"
                                : user.role === "TEACHER"
                                ? "#4caf50"
                                : user.role === "ADMIN"
                                ? "#ff9800"
                                : "#2196f3",
                            mr: 2,
                            color: "#fff",
                          }}
                        >
                          {(user.firstName && user.firstName.charAt(0)) || (user.email && user.email.charAt(0)) || "?"}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.firstName} {user.lastName}
                            </Typography>
                          }
                          secondary={
                            <Chip
                              size="small"
                              label={user.role}
                              sx={{
                                backgroundColor:
                                  user.role === "USER"
                                    ? "#e3f2fd"
                                    : user.role === "TEACHER"
                                    ? "#e8f5e9"
                                    : user.role === "ADMIN"
                                    ? "#fff3e0"
                                    : "#e3f2fd",
                                color:
                                  user.role === "USER"
                                    ? "#1976d2"
                                    : user.role === "TEACHER"
                                    ? "#388e3c"
                                    : user.role === "ADMIN"
                                    ? "#ff9800"
                                    : "#1976d2",
                                height: 26,
                              }}
                            />
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            sx={{
                              color: "#f44336",
                              "&:hover": {
                                backgroundColor: "#ffebee",
                              },
                            }}
                            onClick={() => handleDelete(user.userId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredUsers.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </Card>
          </Grid>
        </Grid>


        {/* Main Content */}
        <Grid container spacing={3}>          {/* Classroom Data */}          
        </Grid>
      </Box>

      {/* Activities Modal */}
      <Modal open={open} onClose={handleCloseModal}>
        <Card
          sx={{
            width: 640,
            maxWidth: "95%",
            maxHeight: "80vh",
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
          }}
        >
          <Box sx={{ bgcolor: "#3f51b5", color: "#fff", px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Lessons for {selectedClassroom?.name}
            </Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
            <List>
              {selectedClassroom?.activities?.length > 0 ? (
                selectedClassroom.activities.map((activity) => (
                  <React.Fragment key={activity.activityId}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {activity.activityName}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            size="small"
                            label={
                              activity.gameType === "GAME1"
                                ? "One Pic Four Words"
                                : activity.gameType === "GAME2"
                                ? "Phrase Translation"
                                : activity.gameType === "GAME3"
                                ? "Word Translation"
                                : activity.activityName
                            }
                            sx={{
                              backgroundColor: "#e8eaf6",
                              color: "#3f51b5",
                              height: 24,
                              mt: 0.5
                            }}
                          />
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="delete" 
                          onClick={() => handleDeleteActivity(activity.activityId)}
                          sx={{ 
                            color: "#f44336",
                            "&:hover": {
                              backgroundColor: "#ffebee"
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No activities found for this classroom.
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};

export default Dashboard;