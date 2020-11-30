import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BlockIcon from '@material-ui/icons/Block';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Appbar from '../components/Appbar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Sidebar from '../components/Sidebar';
import { FormControl, Select, TextField, Typography } from '@material-ui/core';

import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    main: {
        whiteSpace: "pre-wrap",
        fontSize: 20
    },
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    },
    link_button: {
        textDecoration: 'none'
    },
    box: {
        padding: theme.spacing(2),
        width: '40%'
    },
    form_control: {
        margin: theme.spacing(2)
    }
}));

function EditResource(props) {
    const currentRescBasics = props.location.resourceInfo;
    const [currentResc, setCurrResc] = useState([]);

    const [rescType, setRescType] = useState();
    const [rescVaultPath, setRescPath] = useState();
    const [rescLoc, setRescLoc] = useState();
    const [rescStatus, setRescStatus] = useState();
    const [rescComment, setRescComment] = useState();
    const [rescInfo, setRescInfo] = useState();
    const [rescFreeSpace, setRescFreeSpace] = useState();
    const [rescContext, setRescContext] = useState();

    const classes = useStyles();
    const token = Cookies.get('token');
    const isAuthenticated = token != null ? true : false;

    useEffect(() => {
        const result = axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/query',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                query_string: `SELECT RESC_NAME,RESC_TYPE_NAME,RESC_ZONE_NAME,RESC_VAULT_PATH,RESC_LOC,RESC_INFO, RESC_FREE_SPACE, RESC_COMMENT,RESC_STATUS,RESC_CONTEXT WHERE RESC_NAME = '${currentRescBasics[0]}'`,
                query_limit: 100,
                row_offset: 0,
                query_type: 'general'
            }
        }).then(res => {
            console.log(res.data._embedded[0])
            setCurrResc(res.data._embedded[0]);
        })
    }, [isAuthenticated])

    async function updateResc() {
        if (rescInfo !== currentResc[5]) {
            setInfoString(rescInfo);
        }
        if (rescFreeSpace !== currentResc[6]){
            setFreeSpace(rescFreeSpace);
        }
        if (rescVaultPath !== currentResc[3]){
            setVaultPath(rescVaultPath);
        }
        if (rescStatus !== currentResc[8]){
            setStatus(rescStatus);
        }
    }

    async function setInfoString(info) {
        const result = axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                action: 'modify',
                target: 'resource',
                arg2: currentResc[0],
                arg3: 'info',
                arg4: info
            }
        }).then(res => {
            console.log(res);
        })
    }

    async function setFreeSpace(free_space) {
        const result = axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                action: 'modify',
                target: 'resource',
                arg2: currentResc[0],
                arg3: 'free_space',
                arg4: free_space
            }
        }).then(res => {
            console.log(res);
        })
    }

    async function setVaultPath(path) {
        const result = axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                action: 'modify',
                target: 'resource',
                arg2: currentResc[0],
                arg3: 'path',
                arg4: path
            }
        }).then(res => {
            console.log(res);
        })
    }

    async function setStatus(status) {
        const result = axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/admin',
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            },
            params: {
                action: 'modify',
                target: 'resource',
                arg2: currentResc[0],
                arg3: 'status',
                arg4: status
            }
        }).then(res => {
            console.log(res);
        })
    }

    return (
            <div>
                {isAuthenticated == true ? <div className={classes.root}>
                    <Appbar />
                    <Sidebar />
                    <main className={classes.content}>
                        <div className={classes.toolbar} />
                        <div className={classes.main}>
                            <Link to="/resource" className={classes.link_button}><Button><ArrowBackIcon /></Button></Link>
                        Edit Resource: {currentRescBasics[0]}
                            <br />
                            <Box className={classes.box} display="flex" flexDirection="column" borderColor="grey.500" border={1}>
                            <div>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Type</Typography>
                                        <TextField
                                            native
                                            defaultValue={currentRescBasics[1]}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Hostname</Typography>
                                        <TextField
                                            native
                                            defaultValue={currentRescBasics[4]}
                                            onChange={(event) => { setRescLoc(event.target.value) }}
                                        />
                                    </FormControl>
                                </div>
                                <div>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Vault Path</Typography>
                                        <TextField
                                            native
                                            defaultValue={decodeURIComponent(currentRescBasics[3])}
                                            onChange={(event) => { setRescPath(event.target.value) }}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Information</Typography>
                                        <TextField
                                            native
                                            defaultValue={decodeURIComponent(currentRescBasics[5])}
                                            onChange={(event) => { setRescInfo(event.target.value) }}
                                        />
                                    </FormControl>
                                </div>
                                <div>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Freespace</Typography>
                                        <TextField
                                            native
                                            defaultValue={currentRescBasics[6]}
                                            onChange={(event) => { setRescFreeSpace(event.target.value) }}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Comment</Typography>
                                        <TextField
                                            native
                                            defaultValue={currentRescBasics[7]}
                                            onChange={(event) => { setRescComment(event.target.value) }}
                                        />
                                    </FormControl>
                                </div>
                                <div>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Status</Typography>
                                        <Select
                                            native
                                            defaultValue={currentRescBasics[8]}
                                            onChange={(event) => { setRescStatus(event.target.value) }}
                                        >
                                            <option value="" selected disabled></option>
                                            <option value="up">Up</option>
                                            <option value="down">Down</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl className={classes.form_control}>
                                        <Typography>Resource Context</Typography>
                                        <TextField
                                            native
                                            defaultValue={currentRescBasics[9]}
                                            onChange={(event) => { setRescContext(event.target.value) }}
                                        />
                                    </FormControl>
                                </div>
                                <div><Button color="primary" onClick={updateResc}>Save</Button><Button>Cancel</Button></div>
                            </Box>
                        </div>
                    </main>
                </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
            </div>
        );
    }

    export default EditResource;