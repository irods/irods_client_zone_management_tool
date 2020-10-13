import React, { useState } from 'react';

import Cookies from 'js-cookie';

import axios from 'axios';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import logo from '../iRODS-logo.png';
import '../App.css';

const useStyles = makeStyles((theme) => ({
    mainForm: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        
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
                setToken(res.data)
                window.location.replace(window.location.href + 'home');
            }
        })
    }

    async function handleList() {
        console.log(token);
        const listResult = await axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/list',
            params: {
                'path': '/tempZone/home/rods',
                'stat': 'False',
                'permissions': 'False',
                'offset': '0',
                'limit': '100'
            },
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => {
            console.log(res);
            console.log(Cookies.get('token'));
        })
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.mainForm}>
                <img src={logo}></img>
                <Typography component="h1" variant="h5">iRODS Administrator Dashboard</Typography>
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
            </div>
        </Container>
    );
}

export default Authenticate;
