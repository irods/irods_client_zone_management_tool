import React from 'react';
import Authenticate from '../components/Authenticate';
import Home from '../views/Home';
import Cookies from 'js-cookie';

function Landing() {
    const token = Cookies.get('token');
    if (token !== undefined) {
        return (
            <Home />
        )
    }
    else return (
        <Authenticate />
    )
}

export default Landing;