import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authenticate from './components/Authenticate';
import Home from './components/Home';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/home" component={Home} />
            <Route path="/" component={Authenticate} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
