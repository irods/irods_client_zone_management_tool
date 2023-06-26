import React, { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { useEnvironment, useServer } from '../contexts';
import { Button, TextField, Box, makeStyles, Snackbar, Chip, LinearProgress, FormControl, Select } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
    inputBox: {
        marginRight: theme.spacing(1),
        minWidth: 300
    }
}))

export const DelayServer = () => {
    const noDelayServerValue = "nodelayserver.com"
    const [hostname, setHostname] = useState(noDelayServerValue)
    const [customHostname, setCustomHostname] = useState("")
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const [customFieldOpen, setCustomFieldOpen] = useState(false)
    const environment = useEnvironment();
    const auth = localStorage.getItem('zmt-token')
    const classes = useStyles()
    const { isLoadingZoneContext, zoneContext, filteredServers, loadCurrServers } = useServer();
    

    useEffect(() => {
        loadCurrServers(0, 999999, "asc", "role");
        environment.pageTitle = environment.delayServerTitle;
        document.title = environment.titleFormat();
    }, []);

    const saveServerHostname = async () => {
        let useHostname = "";

        if (hostname === "custom_hostname" && customFieldOpen) {
            if (customHostname === "") {
                setError("Custom hostname cannot be empty. If you want to remove the delay server, select \"No Delay Server\".")
                return;
            }
            useHostname = customHostname;
            console.log('using custom hostname: ' + useHostname)
        } else {
            useHostname = hostname;
        }

        await axios({
            url: `${environment.restApiLocation}/admin`,
            method: 'POST',
            headers: {
                'Authorization': auth
            },
            params: {
                'action': 'set_delay_server',
                'target': useHostname
            }
        }).then(() => {
            setSuccess(true)
        }).catch((e) => {
            setError(e.message)
        })


    }

    const getUseHostname = () => {
        if (hostname === "custom_hostname" && customFieldOpen) {
            return customHostname;
        } else {
            return hostname;
        }
    }

    const handleSelectChange = (event) => {
        console.log('setting hostname as: ' + event.target.value)
        if (event.target.value === "custom_hostname") {
            setCustomFieldOpen(true)
        }
        setHostname(event.target.value);
    };

    if (isLoadingZoneContext) {
        return <LinearProgress />
    }
    return (
        <Fragment>
          
            <Box >
                <Box variant="h4" fontWeight="fontWeightBold" fontSize='h6.fontSize'>
                    Change the delay server hostname (equivalent of <Chip label="iadmin set_delay_server" />):
                </Box>

                <Box marginY={'16px'}>
                    Currently, the Zone Management Tool cannot show if you already have a delay server. This page is just to modify it.
                </Box>

                <Box display='flex' alignItems="center">
                    {/* <FormControl>
                        <TextField
                        className={classes.inputBox}
                        id="delay_server"
                        label="example.org"
                        variant="outlined"
                        margin="dense"
                        required
                        autoFocus
                        size='medium'
                        value={hostname}
                        onChange={(e) => setHostname(e.target.value)}
                        />  
                    </FormControl> */}

                    <FormControl>
                        <Select
                            native
                            onChange={handleSelectChange}
                            value={hostname}
                            >
                                <option value={noDelayServerValue}>No Delay Server</option>
                                {
                                    filteredServers && filteredServers.map((server, index) => {
                                        return <option value={server.host_system_information.hostname} key={index}>{server.host_system_information.hostname}</option>
                                    })
                                }

                                <option value='custom_hostname'>Custom hostname</option>

                                
                            </Select>

                            {
                                customFieldOpen && <TextField
                                className={classes.inputBox}
                                id="delay_server"
                                label="example.org"
                                variant="outlined"
                                margin="dense"
                                required
                                autoFocus
                                size='medium'
                                value={customHostname}
                                onChange={(e) => setCustomHostname(e.target.value)}
                                />
                            }

                    </FormControl>

                    <Button variant="outlined" color="primary" onClick={saveServerHostname}>
                        Save
                    </Button>
                </Box>
            </Box>


            <Snackbar open={success} autoHideDuration={5000} onClose={() => { setSuccess(false); }}><MuiAlert elevation={6} variant="filled" severity="success">Success! Delay server &quot;{getUseHostname()}&quot; was saved.</MuiAlert></Snackbar>
            

            <Snackbar open={error !== ""} autoHideDuration={5000} onClose={() => { setError(""); }}><MuiAlert elevation={6} variant="filled" severity="error">An error occured with saving &quot;{getUseHostname()}&quot;: {error}
            </MuiAlert></Snackbar>
           


        </Fragment>
    );
}