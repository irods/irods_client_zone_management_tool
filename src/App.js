import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authenticate from './components/Authenticate';
import User from './views/User';
import Group from './views/Group';
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
            <Route path="/user" component={User} />
            <Route path="/resource" component={Resource} />
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
