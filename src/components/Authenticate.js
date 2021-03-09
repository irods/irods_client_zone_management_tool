import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

import '../App.css';

import { useNavigate } from '@reach/router';
import { useServer } from '../contexts/ServerContext';
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
    const [connection, setConnection] = useState(true);
    const [authConnection, setAuthConnection] = useState(true);
    const [zoneReportConnection, setZoneReportConnection] = useState(true);
    const [adminConnection, setAdminConnection] = useState(true);
    const [queryConnection, setQueryConnection] = useState(true);
    const [connectionForm, setConnectionForm] = useState(false);
    const classes = useStyles();
    const navigate = useNavigate();
    const server = useServer();
    const token = Cookies.get('token');
    const environment = useEnvironment();

    if (token != null) {
        navigate('/home', { replace: true });
    }

    // test each endpoint connection, show error if a 500 status code is returned

    const testAuthConnection = async () => {
        await axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/auth`,
            method: 'POST',
            params: {
                user_name: 'test',
                password: 'test',
                auth_type: 'native'
            }
        }).catch(e => {
            if (e.response.status >= 500) {
                setAuthConnection(false);
                setConnection(false);
            }
        })
    }

    const testZoneReportConnection = async () => {
        await axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/zone_report`,
            method: 'POST'
        }).catch(e => {
            if (e.response.status >= 500) {
                setZoneReportConnection(false);
                setConnection(false);
            }
        })
    }

    const testAdminConnection = async () => {
        await axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
            method: 'POST'
        }).catch(e => {
            if (e.response.status >= 500) {
                setAdminConnection(false);
                setConnection(false);
            }
        })
    }

    const testQueryConnection = async () => {
        await axios({
            url: `${environment.restApiLocation}/irods-rest/1.0.0/query`,
            method: 'GET'
        }).catch(e => {
            if (e.response.status >= 500) {
                setQueryConnection(false);
                setConnection(false);
            }
        })
    }

    // check each endpoint per render
    useEffect(() => {
        testAuthConnection();
        testZoneReportConnection();
        testAdminConnection();
        testQueryConnection();
    }, [])
    
    const handleUsername = (event) => {
        setUsername(event.target.value);
    }

    const handlePassword = (event) => {
        setPassword(event.target.value);
    }

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) handleAuthenticate();
    }

    async function handleAuthenticate() {
        try {
            const authResult = await axios({
                method: 'POST',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/auth`,
                params: {
                    user_name: username,
                    password: password,
                    auth_type: 'native'
                }
            }).then((res) => {
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
                <Dialog open={connectionForm} onClose={() => setConnectionForm(false)}>
                    <DialogTitle>
                        Endpoint Connection
                    </DialogTitle>
                    <DialogContent>
                        <div className="connection_container">
                            <div>/auth: {authConnection ? <div className="green_dot"></div> : <div className="red_dot"></div>}<Button variant="outlined" color="primary" onClick={testAuthConnection}>Retry</Button></div>
                            <div>/zone_report: {zoneReportConnection ? <div className="green_dot"></div> : <div className="red_dot"></div>}<Button variant="outlined" color="primary" onClick={testZoneReportConnection}>Retry</Button></div>
                            <div>/admin: {adminConnection ? <div className="green_dot"></div> : <div className="red_dot"></div>}<Button variant="outlined" color="primary" onClick={testAdminConnection}>Retry</Button></div>
                            <div>/query: {queryConnection ? <div className="green_dot"></div> : <div className="red_dot"></div>}<Button variant="outlined" color="primary" onClick={testQueryConnection}>Retry</Button></div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Box mt={8}>
                    {connection ? <div className="green_dot"></div> : <div className="red_dot"></div>} <a className="pointer" onClick={() => setConnectionForm(true)}>iRODS Client REST API Connection</a>
                </Box>
            </div>
        </Container>
    );
}

export default Authenticate;
