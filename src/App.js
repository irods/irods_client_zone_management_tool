import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authenticate from './components/Authenticate';
import User from './views/User';
import EditUser from './views/EditUser';
import Group from './views/Group';
import EditGroup from './views/EditGroup';
import Session from './views/Session';
import Resource from './views/Resource';
import Home from './views/Home';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/session" component={Session} />
            <Route exact path="/user" component={User} />
            <Route path="/user/edit" component={EditUser} />
            <Route path="/resource" component={Resource} />
            <Route path="/home" component={Home} />
            <Route path="/group/edit" component={EditGroup} />
            <Route exact path="/group" component={Group} />
            <Route path="/" component={Authenticate} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;

