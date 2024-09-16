import React from 'react';
import { Route, Routes } from "react-router-dom";
import { Layout, Footer } from './components';
import { Landing, Home, NotFound, EditGroup, EditUser, Group,
        ResourceListView, ResourceTreeView, Server, SpecificQuery, User, Zone
} from './views';

import {ServerProvider, EnvironmentProvider, CheckProvider} from './contexts';

import { createTheme } from '@mui/material';
import { ThemeProvider } from '@mui/styles';

import './App.css';

const App = () => {
    const theme = createTheme();

    return (
        <div className="app_body">
            <div className="app_wrap">

                <EnvironmentProvider>
                    <ServerProvider>
                        <CheckProvider>
                            <ThemeProvider theme={theme}>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<Landing/>}/>
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
                                        <Route default element={ <NotFound /> }/>
                                    </Routes>
                                </Layout>

                                <Footer />
                            </ThemeProvider>
                        </CheckProvider>
                    </ServerProvider>
                </EnvironmentProvider>

            </div>
        </div>
    );
};

export default App;

