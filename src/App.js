import React, { Component } from 'react';
import { Router } from '@reach/router';
import Appbar from './components/Appbar';
import Authenticate from './components/Authenticate';
import User from './views/User';
import EditUser from './views/EditUser';
import Group from './views/Group';
import EditGroup from './views/EditGroup';
import Resource from './views/Resource';
import Logout from './views/Logout';
import Home from './views/Home';
import './App.css';
import logo from './img/iRODS-logo.png';

class App extends Component {
  render() {
    return (
      <div className="app_body">
        <div className="app_wrap">
          <Router>
            <Home path="/home" />
            <EditUser path='/user/edit' />
            <User path="/user" />
            <EditGroup path='group/edit' />
            <Group path='/group' />
            <Resource path='/resource' />
            <Logout path='/logout' />
            <Authenticate path="/" />
          </Router>
        </div>
        <hr />
        <div className="app_footer"><div><img className="app_footer_logo" src={logo}></img>iRODS Consortium © 2021</div><div>Zone Management Tool Version: 0.1.0, {process.env.REACT_APP_GIT_SHA.substring(0,7)}</div></div>
      </div>
    );
  }
}

export default App;

