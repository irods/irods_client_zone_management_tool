import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import { AuthProvider } from './contents/AuthContent';
import { ServerProvider } from './contents/ServerContent';

ReactDOM.render(
  <AuthProvider>
    <ServerProvider>
      <App />
    </ServerProvider>
  </AuthProvider>,
  document.getElementById('root')
);
