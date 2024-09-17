import { Navigate } from 'react-router-dom';
import React from 'react';
import { Authenticate } from './';

export const Landing = () => {
    const auth =localStorage.getItem('zmt-token');

    if (auth) {
        return <Navigate to='/home' noThrow />;
    }
    else return (
        <Authenticate />
    );
};