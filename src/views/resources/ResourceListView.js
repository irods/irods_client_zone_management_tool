import React, { Fragment, useEffect, useState } from "react";
import {
	makeStyles,
	Button,
	CircularProgress,
	Input,
	Select,
	TextField,
	LinearProgress,
	Tooltip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TablePagination,
	TableHead,
	TableRow,
	TableSortLabel,
	Paper,
	IconButton,
	ToggleButton,
	ToggleButtonGroup } from "@mui/material";
import { useEnvironment, useServer } from "../../contexts";
import "../../App.css";
import ResourceRows from "../../components/ResourceRows";
import { Save as SaveIcon ,Close as CloseIcon, List as ListIcon, AccountTree as AccountTreeIcon } from "@mui/icons-material";
import { Navigate, useLocation } from "react-router-dom";

import { 
	AddResourceController,
 } from "../../controllers/ResourceController";

const useStyles = makeStyles((theme) => ({
	dialog_action: {
		margin: theme.spacing(1),
	},
	tableContainer: {
		marginTop: 20,
	},
	add_hidden: {
		display: "none",
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
	add_button: {
		marginLeft: 30,
	},
}));

export const ResourceListView = () => {
	if (!localStorage.getItem("zmt-token")) Navigate("/");

	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const classes = useStyles();
	const tab = "list";
	const [isLoading, setLoading] = useState(false);
	const [addFormOpen, setAddFormOpen] = useState(false);
	const [addResult, setAddResult] = useState();
	const [rescName, setRescName] = useState("");
	const [rescType, setRescType] = useState("");
	const [rescLocation, setRescLocation] = useState("");
	const [rescVaultPath, setRescVaultPath] = useState("");
	const [order, setOrder] = useState("asc");
	const [orderBy, setOrderBy] = useState("RESC_NAME");
	const [currPage, setCurrPage] = useState(1);
	const environment = useEnvironment();
	const resourcesPageKey = environment.resourcesPageKey;
	const [perPage, setPerPage] = useState(
		parseInt(localStorage.getItem(resourcesPageKey), 10)
	);
	const [filterRescName, setFilterName] = useState(
		params.get("filter") ? decodeURIComponent(params.get("filter")) : ""
	);
	const {
		isLoadingRescContext,
		localZoneName,
		validServerHosts,
		rescContext,
		rescTypes,
		loadResources,
		rescPanelStatus,
		updatingRescPanelStatus,
	} = useServer();

	useEffect(() => {
		// runs on initial render
		const resourcesPerPage = localStorage.getItem(resourcesPageKey);
		if (!resourcesPerPage) {
			localStorage.setItem(
				resourcesPageKey,
				environment.defaultItemsPerPage
			);
			setPerPage(environment.defaultItemsPerPage);
		}
	}, []);

	useEffect(() => {
		if (localZoneName) {
			loadResources(
				(currPage - 1) * perPage,
				perPage,
				filterRescName,
				order,
				orderBy
			);
		}
		environment.pageTitle = environment.resourcesTitle;
		document.title = `${environment.titleFormat()}`;
	}, [currPage, perPage, filterRescName, order, orderBy]);

	useEffect(() => {
		if (rescPanelStatus !== "creation") {
			setRescName("");
			setRescType("");
			setRescLocation("");
			setRescVaultPath("");
		}
	}, [rescPanelStatus]);

	// validate resource hostname and vault path
	// return FALSE if one of two attributes is an empty string
	const rescInputValidator = () => {
		return !((rescLocation === "") ^ (rescVaultPath === ""));
	};

	const addResource = async () => {
        setAddFormOpen(true);
		setLoading(true);
        await AddResourceController(
			rescName, 
			rescType, 
			rescLocation, 
			rescVaultPath, 
			environment.httpApiLocation
		)
        .then(res => {
			if (res.status === 200) {
				window.location.reload();
				setAddResult("Resource created.");
				setLoading(false);
			}
		})
		.catch((e) => {
			setAddResult(
				`Error Code ${e.response.data.error_code}: ${e.response.data.error_message}`
			);
			setLoading(false);
		});
	};

	const handleKeyDown = (e) => {
		if (e.keyCode === 13) addResource();
	};

	const handleAddFormClose = () => {
		setAddFormOpen(false);
	};

	const handleAddRowClose = () => {
		setRescName("");
		setRescType("");
		setRescLocation("");
		setRescVaultPath("");
		updatingRescPanelStatus("idle");
	};

	const handleRemoveFormOpen = (resc) => {
		setRescName(resc[0]);
	};

	const handleRescNameChange = (event) => {
		// trim all whitespaces in the resource name
		setRescName(event.target.value.trim());
	};

	const handleRescTypeChange = (event) => {
		setRescType(event.target.value.trim());
	};

	const handleRescLocationChange = (event) => {
		setRescLocation(encodeURI(event.target.value.trim()));
	};
	const handleRescVaultPathChange = (event) => {
		setRescVaultPath(event.target.value.trim());
	};

	const handleSort = (props) => {
		const isAsc = orderBy === props && order === "desc";
		setOrder(isAsc ? "asc" : "desc");
		setOrderBy(props);
	};

	const handlePageChange = (event, value) => {
		setCurrPage(value + 1);
	};

	const handleFilterChange = (e) => {
		setFilterName(e.target.value);
		// update the path without reload, filter is also encoded
		if (e.target.value === "")
			window.history.replaceState("", "", "/resources");
		else
			window.history.replaceState(
				"",
				"",
				`/resources?filter=${encodeURIComponent(e.target.value)}`
			);
	};

	return (
		<Fragment>
			{isLoadingRescContext ? (
				<LinearProgress />
			) : (
				<div className="table_view_spinner_holder" />
			)}
			<br />
			{!rescContext ? (
				<div>
					Cannot load resource data. Please check iRODS Client Rest
					API.
				</div>
			) : (
				<Fragment>
					<ToggleButtonGroup
						className={classes.tabGroup}
						size="small"
						value={tab}
					>
						<ToggleButton
							value="list"
							aria-label="list"
							onClick={() => Navigate("/resources")}
						>
							<ListIcon />
						</ToggleButton>
						<ToggleButton
							value="tree"
							aria-label="tree"
							onClick={() => Navigate("/resources/tree")}
						>
							<AccountTreeIcon />
						</ToggleButton>
					</ToggleButtonGroup>
					<div className={classes.filterGroup}>
						<TextField
							className={classes.filter}
							id="filter-term"
							label="Filter"
							value={filterRescName}
							placeholder="Filter by Name or Hostname"
							onChange={handleFilterChange}
						/>
						<Button
							className={classes.add_button}
							variant="outlined"
							color="primary"
							onClick={() => updatingRescPanelStatus("creation")}
						>
							Add New Resource
						</Button>
					</div>
					<Fragment>
						<TablePagination
							component="div"
							className={classes.pagination}
							page={currPage - 1}
							count={parseInt(rescContext.total)}
							rowsPerPage={perPage}
							onChangePage={handlePageChange}
							onChangeRowsPerPage={(e) => {
								setPerPage(e.target.value);
								setCurrPage(1);
								localStorage.setItem(
									resourcesPageKey,
									e.target.value
								);
							}}
						/>
						<TableContainer
							className={classes.tableContainer}
							component={Paper}
						>
							<Table
								style={{ width: "100%", tableLayout: "fixed" }}
								aria-label="simple table"
							>
								<TableHead>
									<TableRow>
										<TableCell
											style={{ width: "25%" }}
											key="0"
										>
											<TableSortLabel
												active={orderBy === "RESC_NAME"}
												direction={
													orderBy === "RESC_NAME"
														? order
														: "asc"
												}
												onClick={() => {
													handleSort("RESC_NAME");
												}}
											>
												<b>Name</b>
											</TableSortLabel>
										</TableCell>
										<TableCell
											style={{ width: "25%" }}
											key="1"
											align="left"
										>
											<TableSortLabel
												active={
													orderBy === "RESC_TYPE_NAME"
												}
												direction={
													orderBy === "RESC_TYPE_NAME"
														? order
														: "asc"
												}
												onClick={() => {
													handleSort(
														"RESC_TYPE_NAME"
													);
												}}
											>
												<b>Type</b>
											</TableSortLabel>
										</TableCell>
										<TableCell
											style={{ width: "25%" }}
											key="8"
											align="left"
										>
											<TableSortLabel
												active={orderBy === "RESC_LOC"}
												direction={
													orderBy === "RESC_LOC"
														? order
														: "asc"
												}
												onClick={() => {
													handleSort("RESC_LOC");
												}}
											>
												<b>Hostname</b>
											</TableSortLabel>
										</TableCell>
										<TableCell
											style={{ width: "20%" }}
											key="3"
											align="left"
										>
											<TableSortLabel
												active={
													orderBy ===
													"RESC_VAULT_PATH"
												}
												direction={
													orderBy ===
													"RESC_VAULT_PATH"
														? order
														: "asc"
												}
												onClick={() => {
													handleSort(
														"RESC_VAULT_PATH"
													);
												}}
											>
												<b>Vault Path</b>
											</TableSortLabel>
										</TableCell>
										<TableCell
											style={{ width: "5%" }}
											align="right"
										></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									<TableRow
										id="add_resc_newrow"
										style={{
											display:
												rescPanelStatus === "creation"
													? "contents"
													: "none",
										}}
										className={classes.add_hidden}
									>
										<TableCell>
											<Input
												id="new_resc_name"
												value={rescName}
												onKeyDown={(event) =>
													handleKeyDown(event)
												}
												onChange={handleRescNameChange}
											></Input>
										</TableCell>
										<TableCell>
											<Select
												native
												id="new_resc_type"
												placeholder="Resource Type"
												value={rescType}
												onKeyDown={(event) =>
													handleKeyDown(event)
												}
												onChange={handleRescTypeChange}
											>
												<option
													aria-label="None"
													value=""
												/>
												{rescTypes &&
													rescTypes.length &&
													rescTypes.map((type) => (
														<option
															key={`resource-type-${type}`}
															value={type}
														>
															{type}
														</option>
													))}
											</Select>
										</TableCell>
										<TableCell>
											<Input
												id="new_resc_loc"
												value={rescLocation}
												onKeyDown={(event) =>
													handleKeyDown(event)
												}
												onChange={
													handleRescLocationChange
												}
											></Input>
										</TableCell>
										<TableCell>
											<Input
												id="new_resc_name_path"
												value={rescVaultPath}
												onKeyDown={(event) =>
													handleKeyDown(event)
												}
												onChange={
													handleRescVaultPathChange
												}
											></Input>
										</TableCell>
										<TableCell>
											<ToggleButtonGroup size="small">
												<Tooltip
													title={
														rescInputValidator()
															? ""
															: "Hostname or Vault Path is not valid. Please check and try again."
													}
												>
													<span>
														<IconButton
															value="save"
															disabled={
																!rescInputValidator()
															}
															onClick={
																addResource
															}
														>
															<SaveIcon />
														</IconButton>
													</span>
												</Tooltip>
												<span>
													<IconButton
														value="close"
														onClick={
															handleAddRowClose
														}
													>
														<CloseIcon />
													</IconButton>
												</span>
											</ToggleButtonGroup>
										</TableCell>
									</TableRow>
									{!isLoadingRescContext &&
										(rescContext.rows &&
										rescContext.rows.length === 0 ? (
											<TableRow>
												<TableCell colSpan={4}>
													<div className="table_view_no_results_container">
														No results found for [
														{filterRescName}].
													</div>
												</TableCell>
											</TableRow>
										) : (
											rescContext.rows &&
											rescContext.rows.map(
												(this_resc) => (
													<ResourceRows
														key={this_resc[0]}
														row={this_resc}
														validServerHosts={
															validServerHosts
														}
														handleRemoveFormOpen={
															handleRemoveFormOpen
														}
													/>
												)
											)
										))}
								</TableBody>
							</Table>
						</TableContainer>
					</Fragment>
					<Dialog
						open={addFormOpen}
						onClose={handleAddFormClose}
						aria-labelledby="form-dialog-title"
					>
						<DialogTitle>Add New Resource</DialogTitle>
						<DialogContent>
							<DialogContentText>
								Resource Name: {rescName}
								<br />
								Type: {rescType}
								<br />
								Hostname: {rescLocation}
								<br />
								Vault Path: {rescVaultPath}
							</DialogContentText>
							{isLoading === true ? (
								<div className={classes.progress}>
									Creating in progress...
									<CircularProgress />
								</div>
							) : (
								<p>{addResult}</p>
							)}
						</DialogContent>
						<DialogActions
							className={classes.dialog_action}
						></DialogActions>
					</Dialog>
				</Fragment>
			)}
		</Fragment>
	);
};
