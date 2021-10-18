import React, { Component } from 'react';
import { LocationProvider, Router } from '@reach/router';
import { Layout, Footer } from './components';
import { EditGroup, EditUser, Group, Home, NotFound, Landing, ResourceListView, ResourceTreeView, Server, User } from './views';
import { CheckProvider, EnvironmentProvider, ServerProvider } from './contexts';
import './App.css';

class App extends Component {
  render() {
    return (
      <EnvironmentProvider>
        <ServerProvider>
            <CheckProvider>
              <LocationProvider>
                <div className="app_body">
                  <div className="app_wrap">
                    <Layout>
                      <Router primary={false}>
                        <Home path="/home" />
                        <EditUser path='/users/edit' />
                        <User path="/users" />
                        <EditGroup path='groups/edit' />
                        <Group path='/groups' />
                        <ResourceListView path='/resources' />
                        <ResourceTreeView path='/resources/tree' />
                        <Server path='/servers' />
                        <Landing path="/" />
                        <NotFound default />
                      </Router>
                    </Layout>
                  </div>
                  <Footer />
                </div>
              </LocationProvider>
            </CheckProvider>
        </ServerProvider>
      </EnvironmentProvider>
    );
  }
}

export default App;

