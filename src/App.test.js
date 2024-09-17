import React from 'react';
import { ReactDOM } from 'react-dom';
import App from './App';
import it from "react-timeago/lib/language-strings/it";

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.createRoot(<App />, div);
});