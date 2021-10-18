import React, { useState } from 'react';
import { useCheck } from '../contexts';
import { navigate } from '@reach/router';
import { Check } from '../components/checks/check';
import { makeStyles, CircularProgress, Fade, Paper } from '@material-ui/core';
import BuildIcon from '@material-ui/icons/Build'
import CheckIcon from '@material-ui/icons/Check'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
    },
    paperContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: '10px',
        height: '100px',
        width: '250px',
        cursor: 'pointer'
    },
    paperTitle: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    paperDetail: {
        display: 'flex',
        justifyContent: 'space-around'
    },
    paperStatus: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 5px'
    }
});

export const Home = () => {
    if (!localStorage.getItem('zmt-token')) navigate('/')
    const classes = useStyles()
    const { statusResult } = useCheck()
    const [open, setOpen] = useState('warning' in statusResult || 'critical' in statusResult ? 'check' : '') // check if there are any warnings or errors, if yes, health check dashboard will be open by default

    return (
        <div className={classes.root}>
            <Paper className={classes.paperContainer} square onClick={() => setOpen(open !== 'check' && Object.keys(statusResult).length > 0 ? 'check' : '')}>
                <div className={classes.paperStatus}><BuildIcon style={{ fontSize: 50 }} /></div>
                <div className={classes.paperTitle}>
                    <span style={{ fontSize: 18 }}>Health Check</span>
                    <div className={classes.paperDetail}>{Object.keys(statusResult).length === 0 ? <CircularProgress size="1.5rem" /> : Object.keys(statusResult).map(status => status === 'healthy' ? <span key={`status-${status}`} className={classes.paperStatus}><CheckIcon style={{ color: 'green' }} />{statusResult[status]}</span> : (status === 'error' ? <span key={`status-${status}`} className={classes.paperStatus}><ErrorIcon style={{ color: 'red' }} />{statusResult[status]}</span> : <span key={`status-${status}`} className={classes.paperStatus}><WarningIcon style={{ color: 'orange' }} />{statusResult[status]}</span>))}</div>
                </div>
            </Paper>
            <br />
            <div>
                <Fade in={open === 'check'}><div><Check /></div></Fade>
            </div>
        </div>
    );
};