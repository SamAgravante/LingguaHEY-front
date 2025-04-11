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
                    minHeight: '89vh',
                    minWidth: '100vw',
                    display: 'flex',
            }}
        >

            <Stack direction="row">
                <p>Hello WOrld</p>
                <p>Hello WOrld</p>
            </Stack>
        </Grid>
    );
}