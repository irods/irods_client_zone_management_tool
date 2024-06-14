import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import { ServerProvider, EnvironmentProvider, CheckProvider } from './contexts';

ReactDOM.render(
  <EnvironmentProvider>
      <ServerProvider>
        <CheckProvider>
          <App />
        </CheckProvider>
      </ServerProvider>
  </EnvironmentProvider>
  ,
  document.getElementById('root')
);
