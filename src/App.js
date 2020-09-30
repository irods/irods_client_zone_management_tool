import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Authenticate from './components/Authenticate';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/" component={Authenticate} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
