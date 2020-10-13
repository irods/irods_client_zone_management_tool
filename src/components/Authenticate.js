import React, { useState } from 'react';

import Cookies from 'js-cookie';

import axios from 'axios';

import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import logo from '../iRODS-logo.png';
import '../App.css';

const useStyles = makeStyles((theme) => ({
    mainForm: {
        marginTop: theme.spacing(15),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

    },
    logo: {
        marginBottom: theme.spacing(6)
    }
}))

function Authenticate() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [logged, setLoggin] = useState(false);

    const classes = useStyles();

    const handleUsername = event => {
        setUsername(event.target.value);
    }

    const handlePassword = event => {
        setPassword(event.target.value);
    }

    async function handleAuthenticate() {
        const authResult = await axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/auth',
            params: {
                user_name: username,
                password: password,
                auth_type: 'native'
            }
        }).then(res => {
            if (res.status == 200) {
                console.log(token)
                Cookies.set('token', res.data, { expires: new Date().getTime() + 60 * 60 * 1000 });
                Cookies.set('username', username, { expires: new Date().getTime() + 60 * 60 * 1000 });
                setToken(res.data)
                window.location.replace(window.location.href + 'home');
            }
        })
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.mainForm}>
                <img className={classes.logo} src={logo}></img>
                <br />
                <Typography component="h1" variant="h4">Administrator Dashboard</Typography>
                <TextField
                    variant="outlined"
                    margin="normal"
                    label="Username"
                    fullWidth
                    required
                    onChange={handleUsername} />
                <TextField
                    variant="outlined"
                    margin="normal"
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    onChange={handlePassword} />
                <br />
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleAuthenticate}>Login</Button>
                <br />
                <Grid container>
                    <Grid item xs>
                        <Link href="#" variant="body2">
                            Forgot password?
                        </Link>
                    </Grid>
                    <Grid item>
                        <Link href="#" variant="body2">
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </Grid>
                </Grid>
                <br/>
                <Box mt={8}>
                    Copyright © iRODS Consortium 2020
            </Box>
            </div>
        </Container>
    );
}

export default Authenticate;
