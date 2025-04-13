import { Typography, Grid, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserFromToken } from "../../utils/auth";
import axios from "axios";

export default function ProfilePage(){

    const userID = getUserFromToken().userId;
    const [userDetails,setUserDetails] = useState({});
    const token = localStorage.getItem("token");

    const API = axios.create({
        baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/lingguahey/users`,
        timeout: 1000,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    

    useEffect(()=>{
        console.log(userID);
        const fetchUser = async (userID) =>{
            try{
                const response = await API.get(`/${userID}`);
                const responseData= response.data;
                console.log(response.data)
                setUserDetails(responseData);
            }catch(error){
                console.error('Failed to get data', error);
            }
        }

        fetchUser(userID);
    },[userID]);


    

    return(
        <Grid
            container
            sx={{
                position: 'relative',
                    backgroundSize: 'cover',
                    backgroundColor: '#FFCBE1',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    //minHeight: '89vh',
                    //minWidth: '100vw',
                    minHeight: '100%',
                    minWidth: '100%',
                    display: 'flex',
                    //padding: '20px',
                    //justifyContent: 'center',
                    alignContent: 'center'
            }}
        >
            <Grid container sx={{
               position: 'relative',
               backgroundSize: 'cover',
               backgroundColor: '#C9E4DE',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat',
               minHeight: '70vh',
               minWidth: '70vw',
               display: 'flex', 
            }}>
                <Stack direction="column">
                    <Typography variant="h4">Profile Information</Typography>
                    <Typography variant="body1">First Name: {userDetails.firstName}</Typography>
                    <Typography variant="body1">Middle Name: {userDetails.middleName}</Typography>
                    <Typography variant="body1">Last Name: {userDetails.lastName}</Typography>
                    <Typography variant="body1">Email: {userDetails.email}</Typography>
                </Stack>
            </Grid>
            {/*
            <Stack direction="row">
                <p>Hello WOrld</p>
                <p>Hello WOrld</p>
            </Stack>*/
            }
        </Grid>
    );
}