import { Redirect } from '@reach/router';
import React from 'react';
import Authenticate from '../views/Authenticate';

function Landing() {
    const auth = localStorage.getItem('zmt-token');
    if (auth !== null) {
        return <Redirect to='/home' noThrow />
    }
    else return (
        <Authenticate />
    )
}

export default Landing;