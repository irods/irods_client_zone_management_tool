import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function Authenticate() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [logged, setLoggin] = useState(false);

    const handleUsername = event => {
        setUsername(event.target.value);
    }

    const handlePassword = event => {
        setPassword(event.target.value);
    }

    function logOut(){
        setToken('');
        setLoggin(false);
    }

    async function handleAuthenticate() {
        const authResult = await axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/auth',
            params: {
                userName: username,
                password: password,
                authType: 'native'
            }
        }).then(res => {
            if (res.status == 200) {
                setLoggin(true);
                setToken(res.data)
            };
        })
    }

    async function handleZoneReport() {
        console.log(token);
        const zoneResult = await axios({
            method: 'POST',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/zone_report',
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => console.log(res))
    }

    async function handleList() {
        console.log(token);
        const listResult = await axios({
            method: 'GET',
            url: 'http://54.210.60.122:80/irods-rest/1.0.0/list',
            params: {
                'path': '/tempZone/home/rods',
                'stat': 'False',
                'permissions': 'False',
                'offset': '0',
                'limit': '100'
            },
            headers: {
                'Accept': 'application/json',
                'Authorization': `${token}`
            }
        }).then(res => console.log(res))
    }

    return (
        <div>
            {logged ? <div><p>You are logged in</p><button>log out</button></div> : <div className="login">
                <b>iRODS Administrator Dashboard</b>
                <hr />
                <p>Username: <input onChange={handleUsername}></input></p>
                <p>Password: <input onChange={handlePassword}></input></p>
                <br />
                <button className="login-button" onClick={handleAuthenticate}>Login</button>
            </div>}
        </div>
    );
}

export default Authenticate;
