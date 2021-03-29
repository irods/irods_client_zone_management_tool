import React from 'react';
import BlockIcon from '@material-ui/icons/Block';
import Cookies from 'js-cookie';
import { Link } from '@reach/router';
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    }
}))

function Logout() {
    const classes = useStyles();
    localStorage.removeItem('zmt-token');

    return (
        <div className={classes.logout}>
            <BlockIcon /><br /><div>Please <Link to="/" replace>login</Link> to use the administration dashboard.</div>
        </div>
    )
}

export default Logout;