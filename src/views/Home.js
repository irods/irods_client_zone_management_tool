import React, { useEffect, useState } from "react";
import { useCheck, useServer, useEnvironment } from "../contexts";
import { Navigate } from "react-router-dom";
import {
  Check,
  WrenchIcon,
  WarningIcon,
  CheckIcon,
  ErrorIcon,
  BlockIcon,
  CancelIcon,
  HighlightOffIcon,
  CircularLoadingIndicator,
} from "../components";

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
  },
  paperContainer: {
    display: "flex",
    flexDirection: "row",
    height: "100px",
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
};

export const Home = () => {
  const { statusResult } = useCheck();
  const { loadData } = useServer();
  const [open, setOpen] = useState("none");
  const environment = useEnvironment();

  useEffect(() => {
    // load data every time the user visits /home, so all checks can get access to the latest server data
    loadData();
    environment.pageTitle = environment.homeTitle;
    document.title = environment.titleFormat();
  }, [loadData, environment]);

  useEffect(() => {
    // check if there are any warnings or errors, if yes, health check dashboard will be open by default
    if (
      open === "none" &&
      (statusResult["warning"] > 0 || statusResult["error"] > 0)
    ) {
      setOpen("check");
    }
  }, [statusResult, open]);

  return (
    <div style={styles.root}>
      <div
        className="paper"
        style={styles.paperContainer}
        onClick={() => {
          setOpen(
            open !== "check" && Object.keys(statusResult).length > 0
              ? "check"
              : "none",
          );
        }}
      >
        <div style={styles.paperStatus}>
          <WrenchIcon style={{ fontSize: "50px" }} />
        </div>
        <div style={styles.paperTitle}>
          <span style={{ fontSize: "18px" }}>Health Check</span>
          <div style={styles.paperDetail}>
            {Object.keys(statusResult).length === 0 ? (
              <CircularLoadingIndicator style={{ fontSize: "1.5rem" }} />
            ) : (
              Object.keys(statusResult)
                .filter((status) => statusResult[status] > 0)
                .map((status) =>
                  status === "healthy" ? (
                    <span key={`status-${status}`} style={styles.paperStatus}>
                      <CheckIcon style={{ color: "green" }} />
                      {statusResult[status]}
                    </span>
                  ) : status === "error" ? (
                    <span key={`status-${status}`} style={styles.paperStatus}>
                      <ErrorIcon style={{ color: "red" }} />
                      {statusResult[status]}
                    </span>
                  ) : status === "warning" ? (
                    <span key={`status-${status}`} style={styles.paperStatus}>
                      <WarningIcon style={{ color: "orange" }} />
                      {statusResult[status]}
                    </span>
                  ) : status === "unavailable" ? (
                    <span key={`status-${status}`} style={styles.paperStatus}>
                      <HighlightOffIcon />
                      {statusResult[status]}
                    </span>
                  ) : status === "invalid" ? (
                    <span key={`status-${status}`} style={styles.paperStatus}>
                      <CancelIcon style={{ color: "red" }} />
                      {statusResult[status]}
                    </span>
                  ) : (
                    <span key={`status-${status}`} style={styles.paperStatus}>
                      <BlockIcon />
                      {statusResult[status]}
                    </span>
                  ),
                )
            )}
          </div>
        </div>
      </div>
      <br />
      <div>
        {open === "check" && (
          <div>
            <Check />
          </div>
        )}
      </div>
    </div>
  );
};
