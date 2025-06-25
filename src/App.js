import React from "react";
import { Footer, Layout } from "./components";
import { Routes, Route, Navigate } from "react-router";
import {
  Home,
  NotFound,
  Resource,
  Server,
  Zone,
  User,
  EditUser,
  Group,
  EditGroup,
  SpecificQuery,
  DebugInfo,
} from "./views";

import {
  AuthHookProvider,
  EnvironmentProvider,
  ServerProvider,
  CheckProvider,
} from "./contexts";

import "./App.css";

const withMainAppWrapper = (elem) => {
  return (
    <ServerProvider>
      <Layout>
        <CheckProvider>{elem}</CheckProvider>
      </Layout>
    </ServerProvider>
  );
};

const App = () => {
  return (
    <div className="app_body">
      <div className="app_wrap">
        <EnvironmentProvider>
          <AuthHookProvider>
            <Routes>
              <Route path="/home" element={withMainAppWrapper(<Home />)} />
              <Route path="/zones" element={withMainAppWrapper(<Zone />)} />
              <Route path="/servers" element={withMainAppWrapper(<Server />)} />
              <Route
                path="/resources"
                element={withMainAppWrapper(<Resource />)}
              />
              <Route path="/users" element={withMainAppWrapper(<User />)} />
              <Route
                path="/users/edit"
                element={withMainAppWrapper(<EditUser />)}
              />
              <Route path="/groups" element={withMainAppWrapper(<Group />)} />
              <Route
                path="/groups/edit"
                element={withMainAppWrapper(<EditGroup />)}
              />
              <Route
                path="/specific-query"
                element={withMainAppWrapper(<SpecificQuery />)}
              />
              <Route
                path="/debug"
                element={withMainAppWrapper(<DebugInfo />)}
              />
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/login" element={<Navigate to="/home" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthHookProvider>
          <Footer />
        </EnvironmentProvider>
      </div>
    </div>
  );
};

export default App;
