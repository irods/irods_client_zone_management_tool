import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import { Link } from '@reach/router';
import BlockIcon from '@material-ui/icons/Block';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Appbar from '../components/Appbar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Sidebar from '../components/Sidebar';
import { FormControl, InputLabel, Select, TextField, Typography } from '@material-ui/core';

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
        width: '70%'
    },
    form_control: {
        width: 250,
        margin: theme.spacing(2)
    },
    save_button: {
        marginTop: 50
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
        let list = [];
        if (rescType !== undefined && rescType !== currentResc[1]) {
            list.push([setType, rescType])
        }
        if (rescVaultPath !== undefined && rescVaultPath !== currentResc[3]) {
            list.push([setVaultPath, rescVaultPath])
        }
        if (rescLoc !== undefined && rescLoc !== currentResc[4]) {
            list.push([setLoc, rescLoc]);
        }
        if (rescInfo !== undefined && rescInfo !== currentResc[5]) {
            list.push([setInfoString, rescInfo]);
        }
        if (rescFreeSpace !== undefined && rescFreeSpace !== currentResc[6]) {
            list.push([setFreeSpace, rescFreeSpace]);
        }
        if (rescComment !== undefined && rescComment !== currentResc[7]) {
            list.push([setComment, rescComment]);
        }
        if (rescStatus !== undefined && rescStatus !== currentResc[8]) {
            list.push([setStatus, rescStatus]);
        }
        if (rescContext !== undefined && rescContext !== currentResc[9]) {
            list.push([setContext, rescContext]);
        }
        for (const handler of list) {
            await setInfoString(handler[1]);
        }
    }

    function setInfoString(info) {
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
            alert("Resource information updated.");
            <Redirect to="http://localhost:3000/resource" push={true} />;
            console.log(res);
        })
    }

    function setType(type) {
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
                arg3: 'type',
                arg4: type
            }
        }).then(res => {
            alert("Resource type updated.");
            console.log(res);
        })
    }

    function setLoc(loc) {
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
                arg3: 'host',
                arg4: loc
            }
        }).then(res => {
            console.log(res);
        })
    }

    function setFreeSpace(free_space) {
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
            alert("Resource Freespace updated.");
            console.log(res);
        })
    }

    function setVaultPath(path) {
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
            alert("Resource Vault Path updated.");
            console.log(res);
        })
    }

    function setStatus(status) {
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
            alert("Resource status updated.");
            console.log(res);
        })
    }

    function setComment(comment) {
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
                arg3: 'comment',
                arg4: comment
            }
        }).then(res => {
            alert("Resource comment updated.");
            console.log(res);
        })
    }

    function setContext(context) {
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
                arg3: 'context',
                arg4: context
            }
        }).then(res => {
            alert("Resource context updated.");
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
                            <div className={classes.root}>
                                <div className={classes.form_control}>
                                    <InputLabel htmlFor="user-type-select">Type</InputLabel>
                                    <Select
                                        native
                                        id="resc-type-select"
                                        defaultValue={currentRescBasics[1]}
                                        onChange={(event) => { setRescType(event.target.value) }}
                                    >
                                        <option aria-label="None" value="" />
                                        <option value="compound">Compound</option>
                                        <option value="load_balance">Load Balance</option>
                                        <option value="passthru">Passthru</option>
                                        <option value="random">Random</option>
                                        <option value="replication">Replication</option>
                                        <option value="round_robin">Round Robin</option>
                                        <option value="deferred">Deferred</option>
                                        <option value="emc_ecs">EMC ECS</option>
                                        <option value="emc_isilon">EMC Isilon</option>
                                        <option value="mockarchive">Mockarchive</option>
                                        <option value="mso">MSO</option>
                                        <option value="mssofile">MSSOFile</option>
                                        <option value="non_blocking">Non-blocking</option>
                                        <option value="struct_file">Struct file</option>
                                        <option value="universal_mass_storage">Universal Mass Storage</option>
                                        <option value="unixfilesystem">Unix File System</option>
                                        <option value="wos">WOS</option>
                                    </Select>
                                    {rescType !== undefined && rescType !== currentRescBasics[1] ? <span><Button color="primary" onClick={() => { setType(rescType); }}>Save</Button><Button color="secondary" onClick={() => { setRescType(currentRescBasics[1]); document.getElementById('resc-type-select').value = currentRescBasics[1]; }}>Reset</Button></span> : <span className={classes.span}></span>}
                                </div>
                                <div className={classes.form_control}>
                                    <Typography>Resource Status</Typography>
                                    <Select
                                        native
                                        id="resc-status-select"
                                        defaultValue={currentRescBasics[8]}
                                        onChange={(event) => { setRescStatus(event.target.value) }}
                                    >
                                        <option value="" selected disabled></option>
                                        <option value="up">Up</option>
                                        <option value="down">Down</option>
                                    </Select>
                                    {rescStatus !== undefined && rescStatus !== currentRescBasics[8] ? <span><Button color="primary" onClick={() => { setStatus(rescStatus); }}>Save</Button><Button color="secondary" onClick={() => { setRescStatus(currentRescBasics[8]); document.getElementById('resc-status-select').value = currentRescBasics[8]; }}>Reset</Button></span> : <span className={classes.span}></span>}
                                </div>
                            </div>
                            <div className={classes.root}>
                                <div className={classes.form_control}>
                                    <Typography>Resource Hostname</Typography>
                                    <TextField
                                        native
                                        variant="outlined"
                                        id="resc-loc-textfield"
                                        defaultValue={currentRescBasics[4]}
                                        onChange={(event) => { setRescLoc(event.target.value) }}
                                    />
                                    {rescLoc !== undefined && rescLoc !== currentRescBasics[4] ? <span><Button color="primary" onClick={() => { setLoc(rescLoc); }}>Save</Button><Button color="secondary" onClick={() => { setRescLoc(currentRescBasics[4]); document.getElementById('resc-loc-textfield').value = currentRescBasics[4]; }}>Reset</Button></span> : <span className={classes.span}></span>}
                                </div>
                                <div className={classes.form_control}>
                                    <Typography>Resource Vault Path</Typography>
                                    <TextField
                                        native
                                        variant="outlined"
                                        id="resc-path-textfield"
                                        defaultValue={decodeURIComponent(currentRescBasics[3])}
                                        onChange={(event) => { setRescPath(event.target.value) }}
                                    />
                                    {rescVaultPath !== undefined && rescVaultPath !== currentRescBasics[3] ? <span><Button color="primary" onClick={() => { setVaultPath(rescVaultPath); }}>Save</Button><Button color="secondary" onClick={() => { setRescPath(currentRescBasics[3]); document.getElementById('resc-path-textfield').value = currentRescBasics[3]; }}>Reset</Button></span> : <span className={classes.span}></span>}
                                </div>
                            </div>
                            <div>
                                <div className={classes.form_control}>
                                    <Typography>Resource Information</Typography>
                                    <TextField
                                        native
                                        variant="outlined"
                                        id="resc-info-textfield"
                                        defaultValue={decodeURIComponent(currentRescBasics[5])}
                                        onChange={(event) => { setRescInfo(event.target.value) }}
                                    />
                                    {rescInfo !== undefined && rescInfo !== currentRescBasics[5] ? <span><Button color="primary" onClick={() => { setInfoString(rescInfo); }}>Save</Button><Button color="secondary" onClick={() => { setRescInfo(currentRescBasics[5]); document.getElementById('resc-info-textfield').value = currentRescBasics[5]; }}>Reset</Button></span> : <span className={classes.span}></span>}
                                </div>
                                <div className={classes.form_control}>
                                    <Typography>Resource Freespace</Typography>
                                    <TextField
                                        native
                                        variant="outlined"
                                        id="resc-freespace-textfield"
                                        defaultValue={currentRescBasics[6]}
                                        onChange={(event) => { setRescFreeSpace(event.target.value) }}
                                    />
                                    {rescFreeSpace !== undefined && rescFreeSpace !== currentRescBasics[6] ? <span><Button color="primary" onClick={() => { setFreeSpace(rescFreeSpace); }}>Save</Button><Button color="secondary" onClick={() => { setRescFreeSpace(currentRescBasics[6]); document.getElementById('resc-freespace-textfield').value = currentRescBasics[6]; }}>Reset</Button></span> : <span className={classes.span}></span>}
                                </div>
                            </div>
                            <div>
                                <div className={classes.form_control}>
                                    <Typography>Resource Comment</Typography>
                                    <TextField
                                        native
                                        variant="outlined"
                                        id="resc-comment-textfield"
                                        defaultValue={currentRescBasics[7]}
                                        onChange={(event) => { setRescComment(event.target.value) }}
                                    />
                                    {rescComment !== undefined && rescComment !== currentRescBasics[7] ? <span><Button color="primary" onClick={() => { setComment(rescComment); }}>Save</Button><Button color="secondary" onClick={() => { setRescComment(currentRescBasics[7]); document.getElementById('resc-comment-textfield').value = currentRescBasics[7]; }}>Reset</Button></span> : <span className={classes.span}></span>}
                                </div>
                                <div className={classes.form_control}>
                                    <Typography>Resource Context</Typography>
                                    <TextField
                                        native
                                        variant="outlined"
                                        id="resc-context-textfield"
                                        defaultValue={currentRescBasics[9]}
                                        onChange={(event) => { setRescContext(event.target.value) }}
                                    />
                                    {rescContext !== undefined && rescContext !== currentRescBasics[9] ? <span><Button color="primary" onClick={() => { setContext(rescContext); }}>Save</Button><Button color="secondary" onClick={() => { setRescComment(currentRescBasics[9]); document.getElementById('resc-context-textfield').value = currentRescBasics[9]; }}>Reset</Button></span> : <span className={classes.span}></span>}                              
                                </div>
                            </div>
                        </Box>
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>
            }
        </div >
    );
}

export default EditResource;