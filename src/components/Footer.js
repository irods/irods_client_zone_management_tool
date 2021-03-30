import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import logo from '../img/iRODS-logo.png';
import { version } from '../../package.json';
import { useConnection } from '../contexts/ConnectionContext';
import { useEnvironment } from '../contexts/EnvironmentContext';

function Footer() {
    const [connectionForm, setConnectionForm] = useState(false);
    const connection = useConnection();
    const environment = useEnvironment();

    return (
        <div className="app_footer">
            <Dialog open={connectionForm} onClose={() => setConnectionForm(false)}>
                <DialogTitle>
                    Endpoint Connection
                    </DialogTitle>
                <DialogContent>
                    <div className="connection_container">
                        <div className="connection_title">Rest API URL: {environment.restApiLocation}</div>
                        <div className="connection_text_status">/admin: {connection.adminConnection === undefined ? <span>Loading</span> : <span>{connection.adminConnection ? <span><div className="green_dot" />OK</span> : <span><div className="red_dot"></div>ERROR</span>}</span>}</div>
                        <div className="connection_text_status">/auth: {connection.authConnection === undefined ? <span>Loading</span> : <span>{connection.authConnection ? <span><div className="green_dot" />OK</span> : <span><div className="red_dot"></div>ERROR</span>}</span>}</div>
                        <div className="connection_text_status">/query: {connection.queryConnection === undefined ? <span>Loading</span> : <span>{connection.queryConnection ? <span><div className="green_dot" />OK</span> : <span><div className="red_dot"></div>ERROR</span>}</span>}</div>
                        <div className="connection_text_status">/zone_report: {connection.zoneReportConnection === undefined ? <span>Loading</span> : <span>{connection.zoneReportConnection ? <span><div className="green_dot" />OK</span> : <span><div className="red_dot"></div>ERROR</span>}</span>}</div>
                    </div>
                    <div className="connection_timestamp">Last checked: {connection.timeStamp}</div>
                    <div className="connection_timestamp">
                        <Button variant="outlined" fullWidth color="primary" onClick={() => connection.testConnection()}>Test Connection</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div>{connection.connection ? <div className="green_dot"></div> : <div className="red_dot"></div>} <a className="pointer" onClick={() => setConnectionForm(true)}>iRODS Client REST API Connection</a></div>
            <div><img alt="iRODS Icon" className="app_footer_logo" src={logo}></img><a href="https://irods.org" className="app_footer_text">iRODS Consortium © 2021</a></div>
            <div>Zone Management Tool Version: {version}, {process.env.REACT_APP_GIT_SHA.substring(0, 7)}</div>
        </div>
    )
}

export default Footer;