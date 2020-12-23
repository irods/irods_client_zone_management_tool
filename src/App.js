import React, { Component } from 'react';
import { Router } from '@reach/router';
import Authenticate from './components/Authenticate';
import User from './views/User';
import EditUser from './views/EditUser';
import Group from './views/Group';
import EditGroup from './views/EditGroup';
import Resource from './views/Resource';
import Home from './views/Home';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <Home path="/home" />
        <EditUser path='/user/edit' />
        <User path="/user" />
        <EditGroup path='group/edit' />
        <Group path='/group' />
        <Resource path='/resource' />
        <Authenticate path="/" />
      </Router>
    );
  }
}

export default App;

