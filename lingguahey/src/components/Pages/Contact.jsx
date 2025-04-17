import React, { useState } from 'react';
import { TextField, Button, Typography, Grid, Stack} from '@mui/material';

//Hypothetical stuff ra ni if unsay sud di na sya final
const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <Grid
            container
            sx={{
                position: 'relative',
                backgroundSize: 'cover',
                backgroundColor: '#FFCBE1',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100%',
                minWidth: '100%',
                display: 'flex',
                alignContent: 'center'
            }}
        >
            <Grid
                container
                sx={{
                    position: 'relative',
                    backgroundSize: 'cover',
                    backgroundColor: '#C9E4DE',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '70vh',
                    minWidth: '70vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 4,
                    borderRadius: 4
                }}
            >
            
                <Stack spacing={3}>
                    <Typography variant="h4" textAlign="center">
                        Send us an Email for questions or inquiries
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={4}
                            />
                            <Button type="submit" variant="contained" color="primary">
                                Submit
                            </Button>
                        </Stack>
                    </form>
                    <Typography variant="h5" textAlign="center"> or Call us at +63 969 559 4519</Typography>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default Contact;
