import React from 'react';
import createRoot from 'react-dom';
import App from './App.js';
import './index.css';

import { ServerProvider, EnvironmentProvider, CheckProvider } from './contexts';

createRoot.render(
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
