import React, { useEffect, useState } from 'react';
import Logout from '../../views/Logout';
import Appbar from '../../components/Appbar';
import Sidebar from '../../components/Sidebar';
import { makeStyles } from '@material-ui/core';
import { useServer } from '../../contexts/ServerContext';
import { Tree } from '../../components/draggable-tree/tree';
import { navigate } from '@reach/router';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import ListIcon from '@material-ui/icons/List';
import AccountTreeIcon from '@material-ui/icons/AccountTree';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    main: {
        whiteSpace: "pre-wrap",
        fontSize: 20
    }
}))

function ResourceTreeView() {
    const auth = localStorage.getItem('zmt-token');
    if (auth === null) {
        return <Logout />
    }
    const classes = useStyles();
    const [tab, setTab] = useState('tree');
    const { zoneName, rescContext, loadResource } = useServer();
    const [childrenMap, setChildrenMap] = useState();
    const [dataMap, setDataMap] = useState();

    useEffect(() => {
        if (rescContext.total !== 0) {
            let childrenMap = new Map();
            let dataMap = new Map();
            let tempZoneData = ['tempZone'];
            for (let i = 0; i < 11; i++) {
                tempZoneData.push('')
            }
            dataMap.set("", tempZoneData)

            rescContext._embedded.forEach(resc => {
                dataMap.set(resc[11], resc);
                if (!childrenMap.has(resc[10])) {
                    childrenMap.set(resc[10], []);
                }
                let childrens = childrenMap.get(resc[10]);
                childrens.push(resc);
                childrenMap.set(resc[10], childrens);
            })
            setChildrenMap(childrenMap);
            setDataMap(dataMap);
        }
    }, [rescContext])

    return (
        <div className={classes.root}>
            <Appbar />
            <Sidebar menu_id="3" />
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <div className={classes.main}>
                    <ToggleButtonGroup className={classes.tabGroup} size="small" value={tab}>
                        <ToggleButton value="list" aria-label="list" onClick={() => navigate('/resources')}><ListIcon /></ToggleButton>
                        <ToggleButton value="tree" aria-label="tree" onClick={() => navigate('/resources/tree')}><AccountTreeIcon /></ToggleButton>
                    </ToggleButtonGroup>
                    {dataMap !== undefined && <Tree data={dataMap} children={childrenMap} />}
                </div>
            </main>
        </div>
    )
}

export default ResourceTreeView;