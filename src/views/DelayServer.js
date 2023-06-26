import React, { Fragment, useState } from 'react';
import axios from 'axios';
import { useEnvironment } from '../contexts';
import { Button, TextField, Typography, Box, Snackbar, Chip } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

export const DelayServer = () => {

    const [hostname, setHostname] = useState('')
    const [success, setSuccess] = useState(false)
    const environment = useEnvironment();
    const auth = localStorage.getItem('zmt-token')

    const saveServerHostname = async () => {

        await axios({
            url: `${environment.restApiLocation}/admin`,
            method: 'POST',
            headers: {
                'Authorization': auth
            },
            params: {
                'action': 'set_delay_server',
                'target': hostname
            }
        }).then((res) => {
            
            console.log('res', res)
            setSuccess(true)
            
        }).catch((e) => {
            console.log('error', e)
        })


    }
    return (
        <Fragment>
            <Typography variant="h4" gutterBottom>
                Delay Server
            </Typography>
            <Box variant="h4" fontWeight="fontWeightBold" fontSize='h6.fontSize' >
                <Box>
                    Set the delay server hostname (equivalent of <Chip label="iadmin set_delay_server" />):
                </Box>

                <Box display='flex' alignItems="center" >
                    <TextField
                    id="delay_server"
                    label="Delay Server Hostname"
                    variant="outlined"
                    margin="dense"
                    required
                    autoFocus
                    size='medium'
                    width='50%'
                    sx={{
                        width: '300px',
                        marginRight: 4
                    }}
                    value = {hostname}
                    onChange = {(e) => setHostname(e.target.value)}
                    />  

                    <Button variant="contained" color="primary" onClick={saveServerHostname}>
                        Save
                    </Button>
                </Box>
            </Box>


            <Snackbar open={success} autoHideDuration={5000} onClose={() => { setSuccess(false); }}><MuiAlert elevation={6} variant="filled" severity="success">Success! Delay server &quot;{hostname}&quot; was saved.</MuiAlert></Snackbar>
           


        </Fragment>
    );
}