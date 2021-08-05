import React, { Component } from 'react';
import { LocationProvider, Router } from '@reach/router';
import Footer from './components/Footer';
import { EditGroup, EditUser, Group, Home, NotFound, Landing, Logout, ResourceListView, ResourceTreeView, Server, User } from './views';
import { EnvironmentProvider } from './contexts/EnvironmentContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import './App.css';

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
                  <Logout path="/logout" />
                  <Landing path="/" />
                  <NotFound default />
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

