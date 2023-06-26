import React, { Fragment, useState } from 'react';
import axios from 'axios';
import { useEnvironment } from '../contexts';
import { Button, TextField, Box, makeStyles, Snackbar, Chip, FormControl } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
    inputBox: {
        marginRight: theme.spacing(1),
        minWidth: 300
    }
}))

export const DelayServer = () => {
    const [hostname, setHostname] = useState('')
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState("")
    const environment = useEnvironment();
    const auth = localStorage.getItem('zmt-token')
    const classes = useStyles()

    const saveServerHostname = async () => {
        if (hostname === "") {
            setError("Hostname cannot be empty.")
            return
        }

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
        }).then(() => {
            setSuccess(true)
        }).catch((e) => {
            setError(e.message)
        })


    }
    return (
        <Fragment>
            <Box variant="h4" fontWeight="fontWeightBold" fontSize='h6.fontSize' >
                <Box>
                    Change the delay server hostname (equivalent of <Chip label="iadmin set_delay_server" />):
                </Box>

                <Box display='flex' alignItems="center">
                    <FormControl>
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
                    </FormControl>

                    <Button variant="contained" color="primary" onClick={saveServerHostname}>
                        Save
                    </Button>
                </Box>
            </Box>


            <Snackbar open={success} autoHideDuration={5000} onClose={() => { setSuccess(false); }}><MuiAlert elevation={6} variant="filled" severity="success">Success! Delay server &quot;{hostname}&quot; was saved.</MuiAlert></Snackbar>
            

            <Snackbar open={error !== ""} autoHideDuration={5000} onClose={() => { setError(""); }}><MuiAlert elevation={6} variant="filled" severity="error">An error occured with saving &quot;{hostname}&quot;: {error}
            </MuiAlert></Snackbar>
           


        </Fragment>
    );
}