import React from 'react';
import logo from '../img/iRODS-logo.png';
import { version } from '../../package.json';

export const Footer = () => {

    return (
        <div className="app_footer">
            <div className="app_footer_item"><img alt="iRODS Icon" className="app_footer_logo" src={logo}></img><a href="https://irods.org" className="app_footer_text">iRODS Consortium © 2021</a></div>
            <div className="app_footer_item">Zone Management Tool Version: {version}, {process.env.REACT_APP_GIT_SHA.substring(0, 7)}</div>
        </div>
    )
}