import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authenticate from './components/Authenticate';
import Access from './components/Access';
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
            <Route path="/user" component={user} />
            <Route path="/home" component={Home} />
            <Route path="/" component={Authenticate} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
