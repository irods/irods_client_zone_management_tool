import React, { useState } from 'react';
import axios from 'axios';
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import '../App.css';

import { useNavigate } from '@reach/router';
import { useEnvironment } from '../contexts/EnvironmentContext';

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
    const [serverError, setServerError] = useState(false);
    const classes = useStyles();
    const navigate = useNavigate();
    const { restApiLocation, loginLogo, brandingName } = useEnvironment();
    const renderLogo = require(`../img/${loginLogo}`).default;


    const handleUsername = (event) => {
        setUsername(event.target.value);
    }

    const handlePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            handleAuthenticate();
        }
    }

    async function handleAuthenticate() {
        try {
            setServerError(false);
            setIncorrect(false);
            await axios({
                method: 'POST',
                url: `${restApiLocation}/auth`,
                headers: {
                    Authorization: `BASIC ${btoa(username + ":" + password)}`
                }
            }).then((res) => {
                if (res.status === 200) {
                    localStorage.setItem('zmt-token', res.data);
                    navigate('/home', { replace: true });
                }
            })
        } catch (err) {
            if (err.response.status >= 500) setServerError(true);
            else setIncorrect(true);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.mainForm}>
                <img alt="iRODS Logo" className={classes.logo} src={renderLogo}></img>
                <br />
                <Typography component="h4" variant="h5">{brandingName}</Typography>
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
                {serverError === false ? <br /> : <Typography className={classes.error}>Server error. Please check the Client REST API Connection.</Typography>}
                {incorrect === false ? <br /> : <Typography className={classes.error}>Incorrect username or password. Please try again.</Typography>}
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
