import React, { useState } from 'react';
import '../App.css';

function Authenticate() {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');

    const handleUsername = event => {
        setUsername(event.target.value);
    }

    const handlePassword = event => {
        setPassword(event.target.value);
    }

    const handleAuthenticate = event => {
        fetch('http://54.210.60.122:80/irods-rest/1.0.0/auth', {
            method: 'POST',
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            withCredentials: true,
            data: {
                userName: username,
                password: password,
                authType: 'STANDARD'
            }
        })
            .then(res => {
                console.log(res);
            })
            .then(data => {
                console.log(data);
            })
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
        </div>
    );
}

export default Authenticate;
