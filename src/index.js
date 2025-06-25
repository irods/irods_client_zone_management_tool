import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router";
import App from "./App";
import "./index.css";

const app = ReactDOM.createRoot(document.getElementById("app"));

app.render(
  <Router>
    <App />
  </Router>,
);
