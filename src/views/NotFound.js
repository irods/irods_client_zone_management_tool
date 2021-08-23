import React, { useEffect } from 'react'
import { Link } from '@reach/router';
import { Container, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { useLocation } from '@reach/router';
import { useEnvironment } from '../contexts/EnvironmentContext';
import { renderLayout, hideLayout } from '../utils';

const useStyles = makeStyles(() => ({
    notFoundContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: '7% auto 0',
        padding: '10px 25px',
        height: '30vh',
    },
    linkToHomePage: {
        textDecoration: 'none',
        color: '#04bdaf'
    },
    text: {
        fontSize: '1.2rem',
    },
    irodsLogo: {
        width: '200px',
        margin: '5% auto'
    }
}))

export const NotFound = () => {
    const classes = useStyles();
    const location = useLocation();
    const { loginLogo } = useEnvironment();
    const iRODSLogo = require(`../img/${loginLogo}`).default;

    useEffect(() => {
        hideLayout();
    },[])

    return (
        <Container className={classes.notFoundContainer}>
            <Link to='/' onClick={() => renderLayout()}><img className={classes.irodsLogo} src={iRODSLogo}></img></Link>
            <div>
                <br />
                <Typography className={classes.text}>ERROR 404</Typography>
                <br/>
                <Typography className={classes.text}>The requested URL was not found on this server:</Typography>
                <br />
                <Typography className={classes.text}>{location.pathname}</Typography>
            </div>
        </Container>
    )
}