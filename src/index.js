import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import { ServerProvider } from './contexts/ServerContext';
import { EnvironmentProvider } from './contexts/EnvironmentContext';

ReactDOM.render(
    <EnvironmentProvider>
      <ServerProvider>
        <App />
      </ServerProvider>
    </EnvironmentProvider>
,
  document.getElementById('root')
);
