import React, { Component } from 'react';
import { LocationProvider, Router } from '@reach/router';
import User from './views/User';
import EditUser from './views/EditUser';
import Group from './views/Group';
import EditGroup from './views/EditGroup';
import ResourceListView from './views/resources/ResourceListView';
import ResourceTreeView from './views/resources/ResourceTreeView';
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
              <LocationProvider>
                <Router>
                  <Home path="/home" />
                  <EditUser path='/users/edit' />
                  <User path="/users" />
                  <EditGroup path='groups/edit' />
                  <Group path='/groups' />
                  <ResourceListView path='/resources' />
                  <ResourceTreeView path='/resources/tree' />
                  <Server path='/servers' />
                  <Landing path="/" />
                  <Logout default />
                </Router>
              </LocationProvider>
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

