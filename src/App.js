import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Layout, Footer } from './components';
import { EditGroup, EditUser, Group, Home, NotFound, Landing, ResourceListView, ResourceTreeView, Server, SpecificQuery, User, Zone } from './views';
import './App.css';

const App = () => {
    return (
      <Route>
        <div className="App">
          <div className="app_wrap">
            <Layout>
              <Routes>
                <Route path="/home" element={ <Home timeStamp={new Date()} /> }/>
                <Route path='/users/edit' element={ <EditUser /> }/>
                <Route path="/users" element={ <User /> }/>
                <Route path='groups/edit' element={ <EditGroup /> }/>
                <Route path='/groups' element={ <Group /> }/>
                <Route path='/resources' element={ <ResourceListView /> }/>
                <Route path='/resources/tree' element={ <ResourceTreeView /> }/>
                <Route path='/servers' element={ <Server /> }/>
                <Route path='/specific-query' element={ <SpecificQuery /> }/>
                <Route path='/zones' element={ <Zone /> }/>
                <Route path="/" element={ <Landing /> }/>
                <Route default element={ <NotFound /> }/>
              </Routes>
            </Layout>
          </div>
          <Footer />
        </div>
      </Route>
    );
  };

export default App;

