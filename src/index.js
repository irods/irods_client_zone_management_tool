import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import { AuthProvider } from './contexts/AuthContext';
import { ServerProvider } from './contexts/ServerContext';
import { EnvironmentProvider } from './contexts/EnvironmentContext';

ReactDOM.render(
  <AuthProvider>
    <EnvironmentProvider>
      <ServerProvider>
        <App />
      </ServerProvider>
    </EnvironmentProvider>
  </AuthProvider>,
  document.getElementById('root')
);
