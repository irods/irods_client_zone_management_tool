import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SimpleTreeView as TreeView } from '@mui/x-tree-view';
import { StyledTreeItem } from './tree-item';
import { Alert, Badge, Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Close as CloseIcon, Undo as UndoIcon, Redo as RedoIcon, Replay as ReplayIcon, Save as SaveIcon, LowPriority as LowPriorityIcon } from '@mui/icons-material';
import { useEnvironment, useServer } from '../../contexts';
import { AddChildResourceController, RemoveChildResourceController } from '../../controllers/ResourceController';
import { MinusSquare, PlusSquare } from '../../icons';
import { replacer, reviver } from '../../utils';

const checkIfDescendent = (node, target, map) => {
    const nodeId = node[11];
    let isDescendent = false;
    if (!map.has(nodeId)) return isDescendent;
    else {
        const descendents = map.get(nodeId);
        for (let i = 0; i < descendents.length; i++) {
            console.log("checking " + descendents[i][0]);
            if (descendents[i][11] === target[11]) {
                return true;
            }
            if (map.has(descendents[i][11])) {
                isDescendent = isDescendent || checkIfDescendent(descendents[i], target, map);
            }
        }
    }
    return isDescendent;
};

export const Tree = (props) => {
    const childrenMap = props.childrenMap;
    const dataMap = props.dataMap;
    const originalChildrenMap = JSON.stringify(childrenMap, replacer);
    const originalDataMap = JSON.stringify(dataMap, replacer);
    const { httpApiLocation } = useEnvironment();
    const { localZoneName } = useServer();
    const [stagedChildrenMap, setStagedChildrenMap] = useState(JSON.parse(originalChildrenMap, reviver));
    const [stagedDataMap, setStagedDataMap] = useState(JSON.parse(originalDataMap, reviver));
    const [redo, setRedo] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [newParentNode, setNewParentNode] = useState();
    const [targetNode, setTargetNode] = useState();
    const [currNode, setCurrNode] = useState();
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [alertOpen, setAlertOpen] = useState(false);
    const [currExpanded, setExpanded] = useState([]);
    const expanded = [];

    const dragndropController = async (curr, prev) => {
        setAlertOpen(false);
        const new_tasks = tasks;
        const currNode = curr;
        const prevParentNode = prev;
        if (newParentNode[11] !== prevParentNode[11]) {
            if (!checkIfDescendent(currNode, newParentNode, stagedChildrenMap)) {
                updateParentID(currNode, newParentNode);
                removeChild(prevParentNode, currNode);
                addChild(newParentNode, currNode);
                // pass in default parent context string for each dnd operation
                // 'cache' for compound child resource, empty string for the rest
                setTasks([...new_tasks, [currNode, prevParentNode, newParentNode, 'pending', 'pending', newParentNode[1] === 'compound' ? 'cache' : '']]);
            }
            else {
                setAlertOpen(true);
            }
        }
    };

    const runTask = () => {
        const tasks_copy = [...tasks];
        (async function asyncProcessTask() {
            for (const task of tasks_copy) {
                try {
                    if (task[1][0] !== localZoneName) {
                        await RemoveChildResourceController(task[1][0], task[0][0], httpApiLocation);
                        task[3] = 'success';
                    }
                    else {
                        task[3] = 'success';
                    }
                }
                catch (e) {
                    console.error(e, e.stack);
                    task[3] = 'failed';
                    setHasError(true);
                    break;
                }
                setTasks(tasks_copy);
                try {
                    if (task[2][0] !== localZoneName) {
                        await AddChildResourceController(task[2][0], task[0][0], httpApiLocation, task[5]);
                        task[4] = 'success';
                    }
                    else {
                        task[4] = 'success';
                    }
                }
                catch (e) {
                    console.error(e, e.stack);
                    task[4] = 'failed';
                    setHasError(true);
                    break;
                }
                setTasks(tasks_copy);
            }
            setIsComplete(true);
        })();
    };

    const updateParentID = (node, parent) => {
        const new_stagedDataMap = new Map(stagedDataMap);
        node[10] = parent[11];
        new_stagedDataMap.set(node[11], node);
        setStagedDataMap(new_stagedDataMap);
    };

    const addChild = (parent, child) => {
        const new_stagedChildrenMap = new Map(stagedChildrenMap);
        const stagedNewParentList = stagedChildrenMap.has(parent[11]) ? stagedChildrenMap.get(parent[11]) : [];
        stagedNewParentList.push(child);
        new_stagedChildrenMap.set(parent[11], stagedNewParentList);
        setStagedChildrenMap(new_stagedChildrenMap);
    };

    const removeChild = (parent, child) => {
        const new_stagedChildrenMap = new Map(stagedChildrenMap);
        const stagedPrevParentList = stagedChildrenMap.get(parent[11]);
        for (let i = stagedPrevParentList.length - 1; i >= 0; i--) {
            if (stagedPrevParentList[i][11] === child[11]) {
                stagedPrevParentList.splice(i, 1);
            }
        }
        new_stagedChildrenMap.set(parent[11], stagedPrevParentList);
        setStagedChildrenMap(new_stagedChildrenMap);
    };

    const undoTask = () => {
        setAlertOpen(false);
        const lastTask = tasks[tasks.length - 1];
        addChild(lastTask[1], lastTask[0]);
        removeChild(lastTask[2], lastTask[0]);
        setRedo([...redo, lastTask]);
        setTasks(tasks.filter((task, i) => i !== tasks.length - 1));
    };

    const redoTask = () => {
        const lastUndoTask = redo[redo.length - 1];
        addChild(lastUndoTask[2], lastUndoTask[0]);
        removeChild(lastUndoTask[1], lastUndoTask[0]);
        setTasks([...tasks, lastUndoTask]);
        setRedo(redo.filter(task => task !== lastUndoTask));
    };

    const resetTree = () => {
        setAlertOpen(false);
        setStagedDataMap(JSON.parse(originalDataMap, reviver));
        setStagedChildrenMap(JSON.parse(originalChildrenMap, reviver));
        setRedo([]);
        setTasks([]);
    };

    const handleToggle = (event, nodeIds) => {
        setExpanded(nodeIds);
    };

    const renderTreeNode = (node) => {
        const nodeName = `${node[0]}${node[0] !== localZoneName ? `:${node[1]}` : ''}`;
        const nodeId = node[0] === localZoneName ? "" : node[11];
        expanded.push(nodeId);
        const handleDragEnd = (e) => {
            if (newParentNode !== undefined && e.target !== undefined && e.target.children[0] !== undefined && e.target.children[0].children[1] !== undefined && nodeName === e.target.children[0].children[1].innerHTML && node[11] !== newParentNode[11]) {
                dragndropController(node, stagedDataMap.get(node[10])).then();
            }
        };

        const handleDragStart = (e) => {
            if (e.target !== undefined && e.target.children[0] !== undefined && e.target.children[0].children[1] !== undefined && e.target.children[0].children[1].innerHTML === nodeName) {
                setCurrNode(node);
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            if (e.target.innerHTML === nodeName) {
                setTargetNode(node);
            }
        };

        const handleDragEnter = (e) => {
            e.target.style.background = "#CDCDCD";
        };

        const handleDragLeave = (e) => {
            e.target.style.background = "";
        };

        const handleDrop = (e) => {
            if (e.target !== undefined && e.target.innerHTML === nodeName) {
                setNewParentNode(node);
                e.target.style.background = "";
                setCurrNode();
                setTargetNode();
            }
        };

        return (
            <StyledTreeItem
                key={`tree-item-${nodeId}`}
                nodeId={nodeId}
                label={nodeName}
                draggable={(node[11] !== '')}
                onDragEnter={e => handleDragEnter(e)}
                onDragEnd={e => handleDragEnd(e)}
                onDragOver={e => handleDragOver(e)}
                onDragStart={e => handleDragStart(e)}
                onDragLeave={e => handleDragLeave(e)}
                onDrop={(e) => handleDrop(e)}>
                {stagedChildrenMap.has(nodeId) && stagedChildrenMap.get(nodeId).map(children => renderTreeNode(children))}
            </StyledTreeItem>
        );
    };

    useEffect(() => {
        renderTreeNode(stagedDataMap.get(""));
    }, [stagedChildrenMap]);

    return (
        <div>
            <div className="resource_tree_header">
                <div className="resource_tree_header_left">
                    <Button key={`undo-${tasks.length === 0}`} disabled={tasks.length === 0} startIcon={<UndoIcon />} onClick={undoTask}>Undo</Button>
                    <Button key={`redo-${tasks.length === 0}`} disabled={redo.length === 0} startIcon={<RedoIcon />} onClick={redoTask}>Redo</Button>
                </div><div className="resource_tree_header_right">
                    <Button color="secondary" startIcon={<ReplayIcon />} onClick={resetTree}>Reset</Button>
                    <Button key={`save-${tasks.length === 0}`} color="primary" disabled={tasks.length === 0} startIcon={<SaveIcon />} onClick={() => setConfirmDialog(true)}>Save</Button>
                </div>
            </div>
            <hr />
            <Collapse in={alertOpen}>
                <Alert
                    severity="error"
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setAlertOpen(false)}
                        ><CloseIcon /></IconButton>
                    }
                >Your move is invalid.</Alert>
            </Collapse>
            {currNode && targetNode ? <div>Dragging {currNode[0]} over {targetNode[0]}</div> : <div>Resource Hierachy</div>}
            <div className="resource_tree_container">
                <div className="resource_tree">
                    <TreeView
                        defaultExpanded={expanded}
                        expanded={currExpanded.length === 0 ? expanded : currExpanded}
                        defaultCollapseIcon={<MinusSquare />}
                        defaultExpandIcon={<PlusSquare />}
                        defaultEndIcon={<MinusSquare className="grey_out" />}
                        onNodeToggle={handleToggle}
                    >{renderTreeNode(stagedDataMap.get(""))}
                    </TreeView>
                </div>
                <div className="resource_tree_notifcations">
                    <h3>Staged Changes <Badge badgeContent={tasks.length} color="primary"><LowPriorityIcon /></Badge></h3>
                    <div>
                        {tasks.map(task => <div key={`task-${task[0][0]}-${task[1][0]}`}>
                            {task[0][0]} parent: {task[1][0]} &gt; {task[2][0]}
                        </div>)}
                    </div>
                    <Dialog open={confirmDialog}>
                        <DialogTitle>Are these changes correct?</DialogTitle>
                        <DialogContent>
                            {tasks.map((task) => <div key={`display-task-${task[0][0]}-${task[1][0]}`} style={{ padding: '5px 0px' }}><b>{task[0][0]}</b>
                                <div className="resource_tree_parent_info">
                                    <span> Remove previous parent: {task[1][0]}</span>
                                    {task[3] === 'pending' ? <span className="resource_tree_status">Awaiting</span> : (task[3] === 'success' ? <span className="green resource_tree_status">Complete</span> : <span className="red resource_tree_status">Failed</span>)}
                                </div>
                                <div className="resource_tree_parent_info">
                                    <span> Add new parent: {task[2][0]}</span>
                                    {task[4] === 'pending' ? <span className="resource_tree_status">Awaiting</span> : (task[4] === 'success' ? <span className="green resource_tree_status">Complete</span> : <span className="red resource_tree_status">Failed</span>)}
                                </div>
                                {task[2][1] === 'compound' &&
                                    <div className="resource_tree_parent_info">
                                        { console.log(task) }
                                        <span> Parent Context: <select defaultValue={task[5]} onChange={(e) => task[5] = e.target.value}><option value='cache'>Cache</option><option value='archive'>Archive</option></select></span>
                                        {task[4] === 'pending' ? <span className="resource_tree_status">Awaiting</span> : (task[4] === 'success' ? <span className="green resource_tree_status">Complete</span> : <span className="red resource_tree_status">Failed</span>)}
                                    </div>
                                }
                            </div>
                            )}
                        </DialogContent>
                        <br />
                        {!hasError && isComplete ? <span className="resource_tree_status">Operation success. </span> : ""}
                        {hasError && isComplete ? <span className="resource_tree_status">Operation failed. Please see the error message above.</span> : ""}
                        {isComplete ? <DialogActions><Button color="primary" onClick={() => { setConfirmDialog(false); window.location.reload(); }}>Close</Button></DialogActions> : <DialogActions style={{ justifyContent: 'space-around' }}><Button color="secondary" onClick={() => setConfirmDialog(false)}>No</Button><Button color="primary" onClick={runTask}>Yes</Button></DialogActions>}
                    </Dialog>
                </div>
            </div>
        </div >
    );
};

Tree.propTypes = {
    childrenMap: PropTypes.node,
    dataMap: PropTypes.node
};
