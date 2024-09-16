import React, { useEffect, useState } from "react";
import { useCheck, useServer, useEnvironment } from "../contexts";
import { navigate } from "gatsby";
import { Check } from "../components";
import { makeStyles, CircularProgress, Fade, Paper } from "@mui/material";
import { Build as BuildIcon, Check as CheckIcon, Error as ErrorIcon, Block as BlockIcon, Warning as WarningIcon, Highlight as HighlightOffIcon, Cancel as CancelIcon } from "@mui/icons-material";

const useStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		padding: "10px",
	},
	paperContainer: {
		display: "flex",
		flexDirection: "row",
		padding: "10px",
		height: "100px",
		width: "100%",
		maxWidth: "350px",
		cursor: "pointer",
	},
	paperTitle: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		alignItems: "center",
		justifyContent: "space-around",
	},
	paperDetail: {
		display: "flex",
		justifyContent: "space-around",
	},
	paperStatus: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		margin: "0 5px",
	},
});

export const Home = () => {
	if (!localStorage.getItem("zmt-token")) navigate("/");
	const classes = useStyles();
	const { statusResult } = useCheck();
	const { loadData } = useServer();
	const [open, setOpen] = useState("none");
	const environment = useEnvironment();

	useEffect(() => {
		// load data every time the user visits /home, so all checks can get access to the latest server data
		loadData();
		environment.pageTitle = environment.homeTitle;
		document.title = environment.titleFormat();
	}, []);

	useEffect(() => {
		// check if there are any warnings or errors, if yes, health check dashboard will be open by default
		if (
			open === "none" &&
			(statusResult["warning"] > 0 || statusResult["error"] > 0)
		) {
			setOpen("check");
		}
	}, [statusResult]);

	return (
		<div className={classes.root}>
			<Paper
				className={classes.paperContainer}
				square
				onClick={() =>
					setOpen(
						open !== "check" && Object.keys(statusResult).length > 0
							? "check"
							: "none"
					)
				}
			>
				<div className={classes.paperStatus}>
					<BuildIcon style={{ fontSize: 50 }} />
				</div>
				<div className={classes.paperTitle}>
					<span style={{ fontSize: 18 }}>Health Check</span>
					<div className={classes.paperDetail}>
						{Object.keys(statusResult).length === 0 ? (
							<CircularProgress size="1.5rem" />
						) : (
							Object.keys(statusResult)
								.filter((status) => statusResult[status] > 0)
								.map((status) =>
									status === "healthy" ? (
										<span
											key={`status-${status}`}
											className={classes.paperStatus}
										>
											<CheckIcon
												style={{ color: "green" }}
											/>
											{statusResult[status]}
										</span>
									) : status === "error" ? (
										<span
											key={`status-${status}`}
											className={classes.paperStatus}
										>
											<ErrorIcon
												style={{ color: "red" }}
											/>
											{statusResult[status]}
										</span>
									) : status === "warning" ? (
										<span
											key={`status-${status}`}
											className={classes.paperStatus}
										>
											<WarningIcon
												style={{ color: "orange" }}
											/>
											{statusResult[status]}
										</span>
									) : status === "unavailable" ? (
										<span
											key={`status-${status}`}
											className={classes.paperStatus}
										>
											<HighlightOffIcon />
											{statusResult[status]}
										</span>
									) : status === "invalid" ? (
										<span
											key={`status-${status}`}
											className={classes.paperStatus}
										>
											<CancelIcon
												style={{ color: "red" }}
											/>
											{statusResult[status]}
										</span>
									) : (
										<span
											key={`status-${status}`}
											className={classes.paperStatus}
										>
											<BlockIcon />
											{statusResult[status]}
										</span>
									)
								)
						)}
					</div>
				</div>
			</Paper>
			<br />
			<div>
				<Fade in={open === "check"}>
					<div>
						<Check />
					</div>
				</Fade>
			</div>
		</div>
	);
};
