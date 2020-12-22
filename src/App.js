import React, { Component } from 'react';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Router } from '@reach/router';
import Authenticate from './components/Authenticate';
import User from './views/User';
import EditUser from './views/EditUser';
import Group from './views/Group';
import EditGroup from './views/EditGroup';
import Session from './views/Session';
import Resource from './views/Resource';
import EditResource from './views/EditResource';
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
        {/* <div>
          <Switch>
            <Route path="/session" component={Session} />
            <Route exact path="/user" component={User} />
            <Route path="/user/edit" component={EditUser} />
            <Route exact path="/resource" component={Resource} />
            <Route path="/resource/edit" component={EditResource} />
            <Route path="/home" component={Home} />
            <Route path="/group/edit" component={EditGroup} />
            <Route exact path="/group" component={Group} />
            <Route path="/" component={Authenticate} />
          </Switch>
        </div> */}
      </Router>
    );
  }
}

export default App;

