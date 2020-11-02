import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authenticate from './components/Authenticate';
import User from './components/User';
import Group from './components/Group';
import Session from './components/Session';
import Home from './components/Home';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/session" component={Session} />
            <Route path="/user" component={User} />
            <Route path="/home" component={Home} />
            <Route path="/group" component={Group} />
            <Route path="/" component={Authenticate} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
