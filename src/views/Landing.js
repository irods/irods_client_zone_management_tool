import { Redirect } from 'gatsby';
import React from 'react';
import { Authenticate } from './';

export const Landing = () => {
    const auth = localStorage.getItem('zmt-token');
    if (auth !== null) {
        return <Redirect to='/home' noThrow />;
    }
    else return (
        <Authenticate />
    );
};