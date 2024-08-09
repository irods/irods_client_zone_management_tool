import React, { Fragment, useState, useEffect } from "react";
import { Link, navigate, useLocation } from "@reach/router";
import { useEnvironment, useServer } from "../contexts";
import {
	makeStyles,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	Input,
	Typography,
	LinearProgress,
} from "@material-ui/core";
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	Paper,
} from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";
import { AddGroupController, RemoveGroupController } from "../controllers/GroupController";

const useStyles = makeStyles((theme) => ({
	link_button: {
		textDecoration: "none",
	},
	tableContainer: {
		marginTop: 20,
	},
	errorMsg: {
		color: "red",
	},
	filterGroup: {
		display: "flex",
		flexDirection: "row",
		margin: theme.spacing(1),
		justifyContent: "center",
	},
	pagination: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	filter: {
		marginLeft: 30,
		width: 300,
	},
	add_group_name: {
		width: 200,
	},
	add_button: {
		marginLeft: 30,
	},
}));

export const Group = () => {
	if (!localStorage.getItem("zmt-token")) navigate("/");

	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const environment = useEnvironment();
	const groupsPerPageKey = environment.groupsPerPageKey;
	const classes = useStyles();
	const { isLoadingGroupContext, localZoneName, groupContext, loadGroups } = useServer();
	const [addErrorMsg, setAddErrorMsg] = useState();
	const [removeErrorMsg, setRemoveErrorMsg] = useState();
	const [addFormOpen, setAddFormOpen] = useState(false);
	const [removeFormOpen, setRemoveFormOpen] = useState(false);
	const [currGroup, setCurrGroup] = useState([]);
	const [filterGroupName, setFilterName] = useState(
		params.get("filter") ? decodeURIComponent(params.get("filter")) : ""
	);
	const [currPage, setCurrPage] = useState(1);
	const [perPage, setPerPage] = useState(
		parseInt(localStorage.getItem(groupsPerPageKey), 10)
	);
	const [order, setOrder] = useState("asc");
	const [orderBy, setOrderBy] = useState("USER_NAME");
	let group_id = 0;

	useEffect(() => {
		// runs on initial render
		const groupsPerPage = localStorage.getItem(groupsPerPageKey);
		if (!groupsPerPage) {
			localStorage.setItem(
				groupsPerPageKey,
				environment.defaultItemsPerPage
			);
			setPerPage(environment.defaultItemsPerPage);
		}
	}, []);

	// load group from context provider,
	// pass in perPage, currentPage, filtername('' by default), order, orderBy

	useEffect(() => {
		if (localZoneName && !isLoadingGroupContext)
			loadGroups(
				(currPage - 1) * perPage,
				perPage,
				filterGroupName,
				order,
				orderBy
			);
		environment.pageTitle = environment.groupsTitle;
		document.title = `${environment.titleFormat()}`;
	}, [currPage, perPage, filterGroupName, order, orderBy]);

	async function addGroup() {
		try {
			await AddGroupController(
				document.getElementById("add-group-name").value,
				environment.httpApiLocation
			)
			.then(() => {
				window.location.reload();
			});
		} catch (e) {
			setAddFormOpen(true);
			setAddErrorMsg(
				"Failed to add group " +
					e.response.data.error_code +
					": " +
					e.response.data.error_message
			);
		}
	}

	async function removeGroup() {
		try {
			await RemoveGroupController(
				currGroup[0],
				environment.httpApiLocation
			)
			.then(() => {
				window.location.reload();
			});
		} catch (e) {
			console.log(e);
			setRemoveErrorMsg(
				"Failed to remove group " +
					e.response.error +
					":" +
					e.response.data.error_message
			);
		}
	}

	const handleKeyDown = (e) => {
		if (e.keyCode === 13) addGroup();
	};

	const handleAddRowOpen = () => {
		document.getElementById("add-group-row").style["display"] = "contents";
	};

	const handleAddRowClose = () => {
		document.getElementById("add-group-row").style["display"] = "none";
		document.getElementById("add-group-name").value = "";
	};

	const handleAddFormClose = () => {
		handleAddRowClose();
		setAddFormOpen(false);
	};

	const handlePageChange = (event, value) => {
		setCurrPage(value + 1);
	};

	const handleSort = (props) => {
		const isAsc = orderBy === props && order === "desc";
		setOrder(isAsc ? "asc" : "desc");
		setOrderBy(props);
	};

	const handleRemoveAction = (group) => {
		setCurrGroup(group);
		setRemoveFormOpen(true);
	};

	const handleRemoveFormClose = () => {
		setRemoveFormOpen(false);
		setRemoveErrorMsg();
	};

	const handleFilterChange = (e) => {
		setFilterName(e.target.value);
		// update the path without reload, filter is also encoded
		if (e.target.value === "")
			window.history.replaceState("", "", "/groups");
		else
			window.history.replaceState(
				"",
				"",
				`/groups?filter=${encodeURIComponent(e.target.value)}`
			);
	};

	return (
		<Fragment>
			{isLoadingGroupContext ? (
				<LinearProgress />
			) : (
				<div className="table_view_spinner_holder" />
			)}
			<br />
			{groupContext === undefined ? (
				<div>
					Cannot load group data. Please check your iRODS Client HTTP
					API endpoint connection.
				</div>
			) : (
				<Fragment>
					<div className={classes.filterGroup}>
						<TextField
							className={classes.filter}
							id="filter-term"
							label="Filter"
							placeholder="Filter by Group Name"
							onChange={handleFilterChange}
						/>
						<Button
							className={classes.add_button}
							variant="outlined"
							color="primary"
							onClick={handleAddRowOpen}
						>
							Add New Group
						</Button>
					</div>
					<Fragment>
						<TablePagination
							component="div"
							className={classes.pagination}
							page={currPage - 1}
							count={parseInt(groupContext.total)}
							rowsPerPage={perPage}
							onChangePage={handlePageChange}
							onChangeRowsPerPage={(e) => {
								setPerPage(e.target.value);
								setCurrPage(1);
								localStorage.setItem(
									groupsPerPageKey,
									e.target.value
								);
							}}
						/>
						<TableContainer
							className={classes.tableContainer}
							component={Paper}
						>
							<Table aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell style={{ width: "30%" }}>
											<TableSortLabel
												active={orderBy === "USER_NAME"}
												direction={
													orderBy === "USER_NAME"
														? order
														: "asc"
												}
												onClick={() => {
													handleSort("USER_NAME");
												}}
											>
												<b>Group Name</b>
											</TableSortLabel>
										</TableCell>
										<TableCell style={{ width: "30%" }}>
											<TableSortLabel
												active={
													orderBy === "USER_COUNT"
												}
												direction={
													orderBy === "USER_COUNT"
														? order
														: "asc"
												}
												onClick={() => {
													handleSort("USER_COUNT");
												}}
											>
												<b>Users</b>
											</TableSortLabel>
										</TableCell>
										<TableCell
											style={{ width: "30%" }}
											align="right"
										>
											<b>Action</b>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow
										id="add-group-row"
										style={{ display: "none" }}
									>
										<TableCell>
											<Input
												className={
													classes.add_group_name
												}
												placeholder="Enter new Group Name"
												id="add-group-name"
												onKeyDown={(event) =>
													handleKeyDown(event)
												}
											/>
										</TableCell>
										<TableCell></TableCell>
										<TableCell align="right">
											<ToggleButtonGroup size="small">
												<ToggleButton
													value="add"
													onClick={addGroup}
												>
													<SaveIcon />
												</ToggleButton>
												<ToggleButton
													value="close"
													onClick={handleAddRowClose}
												>
													<CloseIcon />
												</ToggleButton>
											</ToggleButtonGroup>
										</TableCell>
									</TableRow>
									{!isLoadingGroupContext &&
										(groupContext.rows.length === 0 ? (
											<TableRow>
												<TableCell colSpan={3}>
													<div className="table_view_no_results_container">
														No results found for [
														{filterGroupName}].
													</div>
												</TableCell>
											</TableRow>
										) : (
											groupContext.rows.map((group) => (
												<TableRow key={group_id}>
													<TableCell
														style={{
															width: "30%",
														}}
														component="th"
														scope="row"
													>
														{group[0]}
													</TableCell>
													<TableCell
														style={{
															width: "30%",
														}}
														component="th"
														scope="row"
													>
														{group[1]}
													</TableCell>
													<TableCell
														style={{
															width: "30%",
														}}
														align="right"
													>
														<Link
															className={
																classes.link_button
															}
															to="/groups/edit"
															state={{
																groupInfo:
																	group,
															}}
														>
															<Button color="primary">
																Edit
															</Button>
														</Link>{" "}
														{group[0] ===
														"public" ? (
															<span
																id={group_id++}
															></span>
														) : (
															<Button
																id={group_id++}
																color="secondary"
																onClick={() =>
																	handleRemoveAction(
																		group
																	)
																}
															>
																Remove
															</Button>
														)}
													</TableCell>
												</TableRow>
											))
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</Fragment>
					<Dialog
						open={addFormOpen}
						className={classes.formContainer}
						onClick={handleAddFormClose}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle>Adding New Group</DialogTitle>
						<DialogContent>
							<DialogContentText>
								Error Message:
							</DialogContentText>
							<p className={classes.errorMsg}>{addErrorMsg}</p>
						</DialogContent>
						<DialogActions>
							<Button
								onClick={handleAddFormClose}
								color="primary"
							>
								Close
							</Button>
						</DialogActions>
					</Dialog>
					<Dialog
						open={removeFormOpen}
						className={classes.formContainer}
						onClose={handleRemoveFormClose}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle>Warning</DialogTitle>
						<DialogContent>
							<Typography>
								Are you sure to remove <b>{currGroup[0]}</b>?
							</Typography>
							<p className={classes.errorMsg}>{removeErrorMsg}</p>
						</DialogContent>
						<DialogActions>
							<Button onClick={removeGroup} color="secondary">
								Remove
							</Button>
							<Button
								onClick={handleRemoveFormClose}
								color="primary"
							>
								Cancel
							</Button>
						</DialogActions>
					</Dialog>
				</Fragment>
			)}
		</Fragment>
	);
};
