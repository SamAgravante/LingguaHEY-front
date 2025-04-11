import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Divider, Modal, Button } from "@mui/material";
import { Home, Settings, Payment, Subscriptions, ContactSupport, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [open, setOpen] = useState(false); // Modal state
  const [selectedClassroom, setSelectedClassroom] = useState(null); // Selected classroom
  const navigate = useNavigate();

  // Handle Classroom Click to Open Modal
  const handleClassroomClick = (classroom) => {
    setSelectedClassroom(classroom);
    setOpen(true); // Open modal
  };

  // Handle Modal Close
  const handleCloseModal = () => setOpen(false);

  // Handle Subject Selection from Modal (redirect to Activities page)
  const handleSubjectSelect = (subject) => {
    navigate(`/activities/${selectedClassroom}/${subject}`); // Navigate to the activities page
    setOpen(false); // Close modal
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#1E1E1E" }}>
      <Box
        sx={{
          width: "260px",
          bgcolor: "#121212",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 4,
        }}
      >
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              bgcolor: "#ccc",
              mb: 1,
            }}
          />
          <Typography fontWeight="bold">Sample name</Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "#10B981",
            px: 3,
            py: 1,
            borderRadius: 2,
            mb: 3,
            cursor: "pointer",
          }}
        >
          <Typography>Edit Details</Typography>
        </Box>

        {[{ label: "Home", icon: <Home /> }, { label: "Settings", icon: <Settings /> }, { label: "Payment Method", icon: <Payment /> }, { label: "Subscriptions", icon: <Subscriptions /> }, { label: "Contact Us", icon: <ContactSupport /> }, { label: "Log Out", icon: <Logout /> }].map((item, index) => (
          <Box
            key={index}
            sx={{
              width: "100%",
              px: 3,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: "white",
              cursor: "pointer",
              ":hover": { bgcolor: "#2A2A2A" },
            }}
          >
            {item.icon}
            <Typography>{item.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Main Dashboard Content */}
      <Box sx={{ flexGrow: 1, bgcolor: "#2B2B2B", p: 4 }}>
        <Typography variant="h5" fontWeight="bold" color="white" mb={3}>
          Admin Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Classroom Data */}
          <Grid item xs={12} md={6}>
            <Typography color="white" mb={1}>
              Classroom Data
            </Typography>
            <Grid container spacing={2}>
              {[{ label: "Classrooms in total", count: 4, color: "#262626" }, { label: "Filipino 1 Classrooms", count: 2, color: "#F87171" }, { label: "Filipino 2 Classrooms", count: 2, color: "#6EE7B7" }].map((item, i) => (
                <Grid item xs={4} key={i}>
                  <Paper sx={{ bgcolor: item.color, p: 2, textAlign: "center", color: "white" }}>
                    <Typography variant="caption">There are</Typography>
                    <Typography fontWeight="bold" variant="h5">
                      {item.count}
                    </Typography>
                    <Typography variant="body2">{item.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Box mt={4}>
              <Typography color="white" mb={1}>
                View Classroom
              </Typography>
              <Paper sx={{ bgcolor: "#FF7D7D", p: 2, mb: 2, cursor: "pointer" }} onClick={() => handleClassroomClick("Classroom 1")}>
                <Typography textAlign="center" color="white">
                  📚 Class 1 - Filipino 1
                </Typography>
              </Paper>
              <Paper sx={{ bgcolor: "#D1FAE5", p: 2, cursor: "pointer" }} onClick={() => handleClassroomClick("Classroom 2")}>
                <Typography textAlign="center">📚 Class 2 - Filipino 2</Typography>
              </Paper>
            </Box>
          </Grid>

          {/*User Data*/}
          <Grid item xs={12} md={6}>
            <Typography color="white" mb={1}>
              Users Data
            </Typography>
            <Grid container spacing={2}>
              {[{ label: "Concurrent users", count: 50, color: "#262626" }, { label: "Registered users", count: 60, color: "#3B82F6" }, { label: "Students Registered", count: 40, color: "#FBBF24" }, { label: "Teachers Registered", count: 20, color: "#34D399" }].map((item, i) => (
                <Grid item xs={6} key={i}>
                  <Paper sx={{ bgcolor: item.color, p: 2, textAlign: "center", color: "white" }}>
                    <Typography variant="caption">There are</Typography>
                    <Typography fontWeight="bold" variant="h5">
                      {item.count}
                    </Typography>
                    <Typography variant="body2">{item.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography color="white" mb={1}>
            Recent Users
          </Typography>
          <Paper sx={{ bgcolor: "#1F1F1F", p: 2, color: "white" }}>
            <Grid container spacing={2} fontWeight="bold">
              <Grid item xs={3}>User Name</Grid>
              <Grid item xs={3}>Role</Grid>
              <Grid item xs={3}>Action</Grid>
              <Grid item xs={3}>Time</Grid>
            </Grid>
            {[["Maria Christina Falls", "Teacher", "Login", "04/23/25-11:00"], ["Juan Dela Cruz", "Teacher", "Activity", "04/23/25-10:20"], ["Jose Rizz All", "Student", "Logout", "04/23/25-08:37"]].map(([user, role, action, time], i) => (
              <Grid container spacing={2} key={i}>
                <Grid item xs={3}>{user}</Grid>
                <Grid item xs={3}>{role}</Grid>
                <Grid item xs={3}>{action}</Grid>
                <Grid item xs={3}>{time}</Grid>
              </Grid>
            ))}
          </Paper>
        </Box>
      </Box>

      <Modal open={open} onClose={handleCloseModal}>
        <Paper sx={{ width: 400, margin: 'auto', marginTop: '10vh', padding: 3 }}>
          <Typography variant="h6">Select an Activity for {selectedClassroom}</Typography>
          <Box sx={{ mt: 2 }}>
            <Button fullWidth variant="contained" sx={{ mb: 2 }} onClick={() => handleSubjectSelect('Math')}>
              Draggable
            </Button>
            <Button fullWidth variant="contained" sx={{ mb: 2 }} onClick={() => handleSubjectSelect('Science')}>
              4 pics one word
            </Button>
            <Button fullWidth variant="contained" onClick={() => handleSubjectSelect('English')}>
              Translation
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default Dashboard;
