import React, { Fragment, useEffect, useState } from "react";
import { useCheck } from "../../contexts";
import { CheckResult } from ".";
import {
  TableSortLabel,
  CircularLoadingIndicator,
  CheckIcon,
  ErrorIcon,
  WarningIcon,
  BlockIcon,
  HighlightOffIcon,
  CancelIcon,
} from "../";

export const Check = () => {
  const {
    isChecking,
    checks,
    runAllCheck,
    checkObject,
    checkResults,
    statusResult,
    timeStamp,
  } = useCheck();
  const [statusFilter, setStatusFilter] = useState("All");
  const [titleFilter, setTitleFilter] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("CHECK_NAME");

  const handleSort = (props) => {
    const isAsc = orderBy === props && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(props);
  };

  useEffect(() => {
    if (Object.keys(checkResults).length > 0) {
      let newFilteredResults = [];
      if (statusFilter === "All" && titleFilter === "")
        newFilteredResults = Object.entries(checkResults);
      else {
        // case-insensitive filtering
        for (const [id, details] of Object.entries(checkResults)) {
          if (
            (details[1]["status"] === statusFilter || statusFilter === "All") &&
            details[0]["name"].toLowerCase().includes(titleFilter.toLowerCase())
          )
            newFilteredResults.push([id, details]);
        }
      }
      // sorting by column name
      newFilteredResults.sort((a, b) => {
        return (
          (order === "asc" ? 1 : -1) *
          (orderBy === "CHECK_NAME"
            ? a[1][0].name.localeCompare(b[1][0].name)
            : orderBy === "LAST_CHECKED"
              ? a[1][1]["timestamp"] - b[1][1]["timestamp"]
              : a[1][1]["status"].localeCompare(b[1][1]["status"]))
        );
      });
      setFilteredResults(newFilteredResults);
    }
  }, [timeStamp, checkResults, statusFilter, titleFilter, order, orderBy]);

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ display: "flex", flexDirection: "row", height: "32px" }}>
          <button
            disabled={statusFilter === "All"}
            className={`chip ${statusFilter === "All" && "selected"}`}
            onClick={() => setStatusFilter("All")}
          >
            {`All (${checks.length})`}
          </button>
          {Object.keys(statusResult).length > 0 &&
            [...Object.keys(statusResult)]
              .filter((status) => statusResult[status] !== 0)
              .map((status) => (
                <button
                  key={status}
                  className={`chip ${statusFilter === status && "selected"}`}
                  disabled={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                >
                  {status === "healthy" ? (
                    <CheckIcon style={{ color: "green" }} />
                  ) : status === "error" ? (
                    <ErrorIcon style={{ color: "red" }} />
                  ) : status === "warning" ? (
                    <WarningIcon style={{ color: "orange" }} />
                  ) : status === "unavailable" ? (
                    <HighlightOffIcon />
                  ) : status === "invalid" ? (
                    <CancelIcon style={{ color: "red" }} />
                  ) : (
                    <BlockIcon />
                  )}
                  {` ${status} (${statusResult[status]})`}
                </button>
              ))}
        </span>
        <input
          type="text"
          style={{ width: "200px" }}
          value={titleFilter}
          placeholder="Filter by title..."
          onChange={(e) => setTitleFilter(e.target.value)}
        />
      </div>
      <br />
      <div className="outlined_paper">
        <table>
          <thead>
            <tr>
              <td style={{ width: "5%" }}></td>
              <td style={{ width: "40%" }}>
                <TableSortLabel
                  active={orderBy === "CHECK_NAME"}
                  direction={orderBy === "CHECK_NAME" ? order : "asc"}
                  onClick={() => handleSort("CHECK_NAME")}
                >
                  <b>Health Check</b>
                </TableSortLabel>
              </td>
              <td style={{ width: "15%" }}>
                <TableSortLabel
                  active={orderBy === "LAST_CHECKED"}
                  direction={orderBy === "LAST_CHECKED" ? order : "asc"}
                  onClick={() => handleSort("LAST_CHECKED")}
                >
                  <b>Last Checked</b>
                </TableSortLabel>
              </td>
              <td style={{ width: "5%" }}>
                <b>Active</b>
              </td>
              <td align="center" style={{ width: "10%" }}>
                <b>Interval</b>
              </td>
              <td align="center" style={{ width: "10%" }}>
                <button onClick={() => runAllCheck()}>Check All</button>
              </td>
              <td style={{ width: "5%" }}>
                <TableSortLabel
                  active={orderBy === "CHECK_STATUS"}
                  direction={orderBy === "CHECK_STATUS" ? order : "asc"}
                  onClick={() => handleSort("CHECK_STATUS")}
                >
                  <b>Status</b>
                </TableSortLabel>
              </td>
            </tr>
          </thead>
          <tbody>
            {isChecking ? (
              <tr>
                <td colSpan={4}>
                  <CircularLoadingIndicator />
                </td>
              </tr>
            ) : Object.keys(checkResults).length === 0 ? (
              <tr>
                <td colSpan={4}>No results.</td>
              </tr>
            ) : (
              filteredResults.map((result) => (
                <CheckResult
                  key={result[0]}
                  status={result[1][1]["status"]}
                  check={checkObject[result[0]]}
                  result={result[1]}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};
