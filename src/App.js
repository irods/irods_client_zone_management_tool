import React, { Component } from 'react';
import { Router } from '@reach/router';
import User from './views/User';
import EditUser from './views/EditUser';
import Group from './views/Group';
import EditGroup from './views/EditGroup';
import Resource from './views/Resource';
import Logout from './views/Logout';
import Home from './views/Home';
import Landing from './views/Landing';
import Server from './views/Server';
import './App.css';
import Footer from './components/Footer';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { ConnectionProvider } from './contexts/ConnectionContext';

class App extends Component {
  render() {
    return (
      <EnvironmentProvider>
        <ConnectionProvider>
          <div className="app_body">
            <div className="app_wrap">
              <Router>
                <Home path="/home" />
                <EditUser path='/users/edit' />
                <User path="/users" />
                <EditGroup path='groups/edit' />
                <Group path='/groups' />
                <Resource path='/resources' />
                <Server path='/servers' />
                <Landing path="/" />
                <Logout default />
              </Router>
            </div>
            <hr />
            <Footer />
          </div>
        </ConnectionProvider>
      </EnvironmentProvider>
    );
  }
}

export default App;

