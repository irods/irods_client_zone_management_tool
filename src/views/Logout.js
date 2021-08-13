import React, { useEffect } from 'react';
import BlockIcon from '@material-ui/icons/Block';
import { Link } from '@reach/router';
import { makeStyles } from '@material-ui/core/styles';
import { hideLayout } from '../utils';

const useStyles = makeStyles((theme) => ({
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    }
}))

export const Logout = () => {
    const classes = useStyles();
    localStorage.removeItem('zmt-token');

    useEffect(() => {
        hideLayout();
    },[])

    return (
        <div className={classes.logout}>
            <BlockIcon /><br /><div>Please <Link to="/" replace>login</Link> to use the administration dashboard.</div>
        </div>
    )
};