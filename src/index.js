import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './App';
import './index.css';

import { ServerProvider, EnvironmentProvider, CheckProvider } from './contexts';

const app = ReactDOM.createRoot(document.getElementById('app'));

app.render(
  <Router>
    <App />
  </Router>
);