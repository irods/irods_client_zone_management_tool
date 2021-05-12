import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, TreeView } from '@material-ui/lab';
import { StyledTreeItem } from './tree-item';
import { Badge, Button, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo';
import ReplayIcon from '@material-ui/icons/Replay';
import SaveIcon from '@material-ui/icons/Save';
import LowPriorityIcon from '@material-ui/icons/LowPriority';
import { useEnvironment } from '../../contexts/EnvironmentContext';
import { AddChildRescourceController, RemoveChildRescourceController } from '../../controllers/ResourceController';
import { MinusSquare, PlusSquare } from '../../icons';
import { replacer, reviver } from '../../utils';

const checkIfDescendent = (node, target, map) => {
    const nodeId = node[11];
    let isDescendent = false;
    console.log("checking " + node[0])
    if (!map.has(nodeId)) return isDescendent;
    else {
        const descendents = map.get(nodeId);
        for (let i = 0; i < descendents.length; i++) {
            console.log("checking " + descendents[i][0])
            if (descendents[i][11] == target[11]) {
                return true;
            }
            if (map.has(descendents[i][11])) {
                isDescendent = isDescendent || checkIfDescendent(descendents[i], target, map)
            }
        }
    }
    return isDescendent;
}

export const Tree = (props) => {
    let childrenMap = props.children;
    let dataMap = props.data;
    let originalChildrenMap = JSON.stringify(childrenMap, replacer);
    let originalDataMap = JSON.stringify(dataMap, replacer);
    const { restApiLocation } = useEnvironment();
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
    let expanded = [];

    const dragndropController = async (curr, prev) => {
        setAlertOpen(false);
        let new_tasks = tasks;
        let currNode = curr;
        let prevParentNode = prev;
        if (newParentNode[11] !== prevParentNode[11]) {
            if (!checkIfDescendent(currNode, newParentNode, stagedChildrenMap)) {
                updateParentID(currNode, newParentNode);
                removeChild(prevParentNode, currNode);
                addChild(newParentNode, currNode);
                new_tasks.push([currNode, prevParentNode, newParentNode, 'pending', 'pending']);
            }
            else {
                setAlertOpen(true);
            }
        }
    }

    const runTask = () => {
        const tasks_copy = [...tasks];
        (async function asyncProcessTask() {
            for (let task of tasks_copy) {
                try {
                    if (task[1][0] !== 'tempZone') {
                        const remove_child_result = await RemoveChildRescourceController(task[1][0], task[0][0], restApiLocation);
                        console.log(remove_child_result);
                        task[3] = 'success'
                    }
                    else {
                        task[3] = 'success'
                    }
                }
                catch (e) {
                    task[3] = 'failed'
                    setHasError(true)
                    break;
                }
                setTasks(tasks_copy)
                try {
                    if (task[2][0] !== 'tempZone') {
                        const add_child_result = await AddChildRescourceController(task[2][0], task[0][0], restApiLocation);
                        console.log(add_child_result);
                        task[4] = 'success'
                    }
                    else {
                        task[4] = 'success'
                    }
                } catch (e) {
                    task[4] = 'failed'
                    setHasError(true)
                    break;
                }
                setTasks(tasks_copy)
            }
            setIsComplete(true)
        })()
    }

    const updateParentID = (node, parent) => {
        let new_stagedDataMap = new Map(stagedDataMap);
        node[10] = parent[11];
        new_stagedDataMap.set(node[11], node);
        setStagedDataMap(new_stagedDataMap);
    }

    const addChild = (parent, child) => {
        let new_stagedChildrenMap = new Map(stagedChildrenMap);
        let stagedNewParentList = stagedChildrenMap.has(parent[11]) ? stagedChildrenMap.get(parent[11]) : [];
        stagedNewParentList.push(child)
        new_stagedChildrenMap.set(parent[11], stagedNewParentList);
        setStagedChildrenMap(new_stagedChildrenMap);
    }

    const removeChild = (parent, child) => {
        let new_stagedChildrenMap = new Map(stagedChildrenMap);
        let stagedPrevParentList = stagedChildrenMap.get(parent[11]);
        for (let i = stagedPrevParentList.length - 1; i >= 0; i--) {
            if (stagedPrevParentList[i][11] == child[11]) {
                stagedPrevParentList.splice(i, 1);
            }
        }
        new_stagedChildrenMap.set(parent[11], stagedPrevParentList)
        setStagedChildrenMap(new_stagedChildrenMap);
    }

    const undoTask = () => {
        setAlertOpen(false);
        let lastTask = tasks[tasks.length - 1];
        addChild(lastTask[1], lastTask[0])
        removeChild(lastTask[2], lastTask[0]);
        setRedo([...redo, lastTask]);
        setTasks(tasks.filter((task, i) => i !== tasks.length - 1))
    }

    const redoTask = () => {
        let lastUndoTask = redo[redo.length - 1];
        addChild(lastUndoTask[2], lastUndoTask[0]);
        removeChild(lastUndoTask[1], lastUndoTask[0]);
        setTasks([...tasks, lastUndoTask]);
        setRedo(redo.filter(task => task !== lastUndoTask))
    }

    const resetTree = () => {
        setAlertOpen(false);
        setStagedDataMap(JSON.parse(originalDataMap, reviver));
        setStagedChildrenMap(JSON.parse(originalChildrenMap, reviver));
        setRedo([]);
        setTasks([]);
    }

    const renderTreeNode = (node) => {
        const nodeId = node[0] === 'tempZone' ? "" : node[11];
        expanded.push(nodeId)
        const handleDragEnd = (e) => {
            if (newParentNode !== undefined && e.target !== undefined && e.target.children[0] !== undefined && e.target.children[0].children[1] !== undefined && node[0] === e.target.children[0].children[1].innerHTML && node[11] !== newParentNode[11]) {
                dragndropController(node, stagedDataMap.get(node[10]));
            }
        }

        const handleDragStart = (e) => {
            if (e.target !== undefined && e.target.children[0] !== undefined && e.target.children[0].children[1] !== undefined && e.target.children[0].children[1].innerHTML === node[0]) {
                setCurrNode(node);
            }
        }

        const handleDragOver = (e) => {
            e.preventDefault();
            if (e.target.innerHTML === node[0]) {
                setTargetNode(node);
            }
        }

        const handleDragEnter = (e) => {
            e.target.style.background = "#CDCDCD";
        }

        const handleDragLeave = (e) => {
            e.target.style.background = "";
        }

        const handleDrop = (e) => {
            if (e.target !== undefined && e.target.innerHTML === node[0]) {
                setNewParentNode(node);
                e.target.style.background = "";
                setCurrNode();
                setTargetNode();
            }
        }

        return (
            <StyledTreeItem
                nodeId={nodeId}
                label={node[0]}
                draggable={node[11] === '' ? false : true}
                onDragEnter={e => handleDragEnter(e)}
                onDragEnd={e => handleDragEnd(e)}
                onDragOver={e => handleDragOver(e)}
                onDragStart={e => handleDragStart(e)}
                onDragLeave={e => handleDragLeave(e)}
                onDrop={(e) => handleDrop(e)}>
                {stagedChildrenMap.has(nodeId) && stagedChildrenMap.get(nodeId).map(children => renderTreeNode(children))}
            </StyledTreeItem>
        )
    }

    useEffect(() => {
        renderTreeNode(stagedDataMap.get(""))
    }, [stagedChildrenMap])

    return (
        <div>
            <div className="resource_tree_header">
                <div className="resource_tree_header_left">
                    <Button disabled={tasks.length === 0} startIcon={<UndoIcon />} onClick={undoTask}>Undo</Button>
                    <Button disabled={redo.length === 0} startIcon={<RedoIcon />} onClick={redoTask}>Redo</Button>
                </div><div className="resource_tree_header_right">
                    <Button color="secondary" startIcon={<ReplayIcon />} onClick={resetTree}>Reset</Button>
                    <Button color="primary" disabled={tasks.length === 0} startIcon={<SaveIcon />} onClick={() => setConfirmDialog(true)}>Save</Button>
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
                        defaultCollapseIcon={<MinusSquare />}
                        defaultExpandIcon={<PlusSquare />}
                        defaultEndIcon={<MinusSquare className="grey_out" />}
                    >{renderTreeNode(stagedDataMap.get(""))}
                    </TreeView>
                </div>
                <div className="resource_tree_notifcations">
                    <h3>Staged Changes <Badge badgeContent={tasks.length} color="primary"><LowPriorityIcon /></Badge></h3>
                    <div>
                        {tasks.map(task => <div>
                            {task[0][0]} parent: {task[1][0]} -> {task[2][0]}
                        </div>)}
                    </div>
                    <Dialog open={confirmDialog}>
                        <DialogTitle>Are these changes correct?</DialogTitle>
                        <DialogContent>
                            {tasks.map((task, index) => <div style={{ padding: '5px 0px' }}><b>{task[0][0]}</b>
                                <div className="resource_tree_parent_info">
                                    <span> Remove previous parent: {task[1][0]}</span>
                                    {task[3] === 'pending' ? <span className="resource_tree_status">Awaiting</span> : (task[3] === 'success' ? <span className="green resource_tree_status">Complete</span> : <span className="red resource_tree_status">Failed</span>)}
                                </div>
                                <div className="resource_tree_parent_info">
                                    <span> Add new parent: {task[2][0]}</span>
                                    {task[4] === 'pending' ? <span className="resource_tree_status">Awaiting</span> : (task[4] === 'success' ? <span className="green resource_tree_status">Complete</span> : <span className="red resource_tree_status">Failed</span>)}
                                </div>
                            </div>
                            )}
                        </DialogContent>
                        <br />
                        {!hasError && isComplete ? <span className="resource_tree_status">Operation success. </span> : ""}
                        {hasError && isComplete ? <span className="resource_tree_status">Operation failed. Please see the error message above.</span> : ""}
                        {isComplete ? <DialogActions><Button color="primary" onClick={() => { setConfirmDialog(false); window.location.reload(); }}>Close</Button></DialogActions> : <DialogActions style={{ justifyContent: 'space-around'}}><Button color="secondary" onClick={() => setConfirmDialog(false)}>No</Button><Button color="primary" onClick={runTask}>Yes</Button></DialogActions>}
                    </Dialog>
                </div>
            </div>
        </div >
    )
}