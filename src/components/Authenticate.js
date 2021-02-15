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

import '../App.css';
import { red } from '@material-ui/core/colors';

import { useNavigate } from '@reach/router';
import { useServer } from '../contexts/ServerContext';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { requirePropFactory } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    mainForm: {
        marginTop: theme.spacing(15),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',

    },
    logo: {
        maxWidth: theme.spacing(35),
        marginBottom: theme.spacing(5)
    },
    error: {
        color: 'red',
        fontSize: 15,
        padding: '10px 10px',
    },
    login_button: {
        background: '#18bc9c'
    }
}))

function Authenticate() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [incorrect, setIncorrect] = useState(false);
    const classes = useStyles();
    const navigate = useNavigate();
    const server = useServer();
    const token = Cookies.get('token');
    const environment = useEnvironment();

    if (token != null) {
        navigate('/home', { replace: true });
    }

    const handleUsername = event => {
        setUsername(event.target.value);
    }

    const handlePassword = event => {
        setPassword(event.target.value);
    }

    const handleKeyDown = event => {
        if (event.keyCode == 13) handleAuthenticate();
    }

    async function handleAuthenticate() {
        try {
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
                    Cookies.set('token', res.data, { expires: new Date().getTime() + 60 * 60 * 1000 });
                    server.updateZone();
                    server.updateUser();
                    server.updateGroup();
                    server.updateResource();
                    navigate('/home', { replace: true });
                }
            })
        } catch (err) {
            console.log(err)
            setIncorrect(true);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.mainForm}>
                <img className={classes.logo} src={require(`../img/${environment.loginLogo}`)}></img>
                <br />
                <Typography component="h4" variant="h5">{environment.brandingName}</Typography>
                <TextField
                    variant="outlined"
                    margin="normal"
                    label="Username"
                    fullWidth
                    required
                    onKeyDown={handleKeyDown}
                    onChange={handleUsername} />
                <TextField
                    variant="outlined"
                    margin="normal"
                    label="Password"
                    type="password"
                    fullWidth
                    required
                    onKeyDown={handleKeyDown}
                    onChange={handlePassword} />
                {incorrect == false ? <br /> : <Typography className={classes.error}>Incorrect username or password. Please try again.</Typography>}
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    className={classes.login_button}
                    onClick={handleAuthenticate}>Login</Button>
                <br />
                <Box mt={8}>
                    Copyright © iRODS Consortium 2021
            </Box>
            </div>
        </Container>
    );
}

export default Authenticate;
