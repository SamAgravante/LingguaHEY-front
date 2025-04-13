import { Grid, Stack} from "@mui/material";
import { useNavigate } from "react-router-dom";


const drawerWidth = 240;

export default function Homepage(){
    

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
                <Stack direction="row">
                    <p>Hello WOrld</p>
                    <p>Hello WOrld</p>
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