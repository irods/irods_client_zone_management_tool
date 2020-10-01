import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function Authenticate() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');

    const handleUsername = event => {
        setUsername(event.target.value);
    }

    const handlePassword = event => {
        setPassword(event.target.value);
    }

    async function handleAuthenticate() {
        const authResult = await axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/auth',
            params: {
                userName: username,
                password: password,
                authType: 'STANDARD'
            }
        }).then(res => setToken(res.data))
    }

    async function handleZoneReport(){
        const zoneResult = await axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/zone_report',
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => console.log(res))
    }

    return (
        <div className="login">
            <div>
                Username: <input onChange={handleUsername}></input>
            </div>
            <br />
            <div>
                Password: <input onChange={handlePassword}></input>
            </div>
            <br />
            <button className="login-button" onClick={handleAuthenticate}>Login</button>
            <button className="login-button" onClick={handleZoneReport}>ZoneReport</button>
        </div>
    );
}

export default Authenticate;
