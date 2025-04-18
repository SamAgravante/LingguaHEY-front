import { Grid, Stack, Box, Typography, Button, Select, MenuItem, FormControl, InputLabel, Paper, Divider, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';


export default function AdminDashboard() {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState('');
    const [status, setStatus] = useState('');
    const [averageScore, setAverageScore] = useState(null);
    const [lowestScore, setLowestScore] = useState({});
    const [highestScore, setHighestScore] = useState({});
    const [users, setUsers] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("Topic 1");
    const navigate = useNavigate();
    

    //Place holder pani diri || static
    useEffect(() => {
      async function fetchDashboardData() {
        try {
          setActivities(['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4']);
          setSelectedActivity('Topic 1');
          setStatus('Deployed');
          setAverageScore(18);
          setLowestScore({ score: 16, count: 3 });
          setHighestScore({ score: 20, count: 2 });
          setUsers([
            'Hanz harbi',
            'sammy wammy',
            'Samson da grit',
            'agawn amigo',
            'ASdfasf',
            'asdsafac',
          ]);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      }
      fetchDashboardData();
    }, []);
  
    return (
      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Admin Dashboard
            </Typography>
  
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Select Activity</Typography>
                <Select
                  fullWidth
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  {activities.map((topic) => (
                    <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                  ))}
                </Select>
              </Grid>
  
              <Grid item xs={12} sm={3}>
                <Paper elevation={2} sx={{ p: 2, bgcolor: "#3a5aff", color: "white", height: "100%" }}>
                  <Typography variant="subtitle2">Status:</Typography>
                  <Typography variant="body1">{status}</Typography>
                </Paper>
              </Grid>
  
              <Grid item xs={12} sm={3}>
                <Button variant="outlined" fullWidth
                    onClick={() => navigate('/activities')}
                >
                  Add New Activity +
                </Button>
              </Grid>
            </Grid>
            
            {/*Ave score*/}
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 3, bgcolor: "#000", color: "#fff", minHeight: 120 }}>
                  <Typography variant="subtitle2">Average Score</Typography>
                  <Typography variant="h4">{averageScore}</Typography>
                  <Typography variant="body2">over 25</Typography>
                </Paper>
              </Grid>

              {/*Lowest score*/}
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 3, bgcolor: "#f44336", color: "#fff", minHeight: 120 }}>
                  <Typography variant="subtitle2">Lowest Score</Typography>
                  <Typography variant="h4">{lowestScore.score}</Typography>
                  <Typography variant="body2">
                    {lowestScore.count} student{lowestScore.count !== 1 ? 's' : ''} got this score
                  </Typography>
                </Paper>
              </Grid>

              {/*High score*/}
              <Grid item xs={12} sm={4}>
                <Paper elevation={3} sx={{ p: 3, bgcolor: "#4caf50", color: "#fff", minHeight: 120 }}>
                  <Typography variant="subtitle2">Highest Score</Typography>
                  <Typography variant="h4">{highestScore.score}</Typography>
                  <Typography variant="body2">
                    {highestScore.count} student{highestScore.count !== 1 ? 's' : ''} got this score
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
  

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button fullWidth variant="contained" color="inherit">Delete</Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button fullWidth variant="contained" color="warning">Edit</Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button fullWidth variant="contained" color="error">Undeploy</Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button fullWidth variant="contained" color="success">Deploy</Button>
              </Grid>
            </Grid>
          </Grid>
  
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1">Users</Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{ textDecoration: "underline", cursor: "pointer", p:1 }}
                >
                  Edit User List
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {users.map((user, idx) => (
                  <ListItem key={idx} disablePadding>
                    <ListItemText primary={user} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }