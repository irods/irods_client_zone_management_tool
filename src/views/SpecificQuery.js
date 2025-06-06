import React, { Fragment, useEffect, useState, useLayoutEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useEnvironment, useServer } from "../contexts";
import {
  CloseIcon,
  CheckIcon,
  CancelIcon,
  TableSortLabel,
} from "../components";
import { format } from "sql-formatter";
import {
  AddSpecificQueryController,
  DeleteSpecificQueryController,
} from "../controllers/SpecificQueryController";

const styles = {
  fontInherit: {
    font: "inherit",
  },
  table_cell: {
    wordWrap: "break-word",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "row",
    margin: 8,
    justifyContent: "center",
  },
  add_button: {
    marginLeft: 30,
  },
  filter: {
    marginLeft: 30,
    width: 300,
  },
  sql_str: {
    whiteSpace: "pre-wrap",
    backgroundColor: "rgb(239, 239, 239)",
    padding: "2px",
    border: "1px solid rgb(150, 150, 150)",
    borderRadius: "3px",
    marginTop: 0,
    marginBottom: 0,
    display: "flex",
    textAlign: "left",
    position: "relative",
  },
  sql_str_button: {
    cursor: "pointer",
    padding: 0,
    backgroundColor: "transparent",
    border: "none",
    width: "100%",
  },
  sql_str_collapsed: {
    maxHeight: "5em",
    overflow: "hidden",
  },
};

export const SpecificQuery = () => {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = useState("none");
  const [newAlias, setNewAlias] = useState("");
  const [newSqlStr, setNewSqlStr] = useState("");
  const [aliasToDelete, setAliasToDelete] = useState(-1);
  const [filterInput, setFilterInput] = useState("");
  const [confirmationVisibility, setConfirmationVisibility] = useState(false);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("alias");
  const [expandedSqlStrings, setExpandedSqlStrings] = useState([]);
  const [sortedSpecificQueryContext, setSortedSpecificQueryContext] =
    useState();
  const environment = useEnvironment();
  const {
    specificQueryContext,
    isLoadingSpecificQueryContext,
    loadSpecificQueries,
  } = useServer();

  useEffect(() => {
    if (params.has("sqlStr") && params.has("alias")) {
      setNewAlias(params.get("alias"));
      setNewSqlStr(params.get("sqlStr"));
      setConfirmationVisibility(true);
      setParams();
    }
  }, []);

  const addButtonEventHandler = () => {
    setStatus("Adding");
    setNewAlias("");
    setNewSqlStr("");
  };

  // Format: http://localhost:9000/specific-query?add=SELECT%20*%20FROM%20R_USER_MAIN&alias=selectAll
  // everything after ? needs to be URL encoded

  useEffect(() => {
    if (newAlias || newSqlStr) {
      setStatus("Adding");
    }
  }, [newAlias, newSqlStr]);

  const addSpecificQueryHandler = async () => {
    setConfirmationVisibility(false);
    setStatus("");
    await AddSpecificQueryController(
      newAlias,
      newSqlStr,
      environment.httpApiLocation,
    )
      .then((res) => {
        if (res.status === 200) {
          loadSpecificQueries();
          setNewAlias("");
          setNewSqlStr("");
          setStatus("add-success");
        } else setStatus("add-failed");
      })
      .catch(() => {
        setStatus("add-failed");
      });
  };

  const deleteButtonEventHandler = (alias) => {
    setAliasToDelete(alias);
    setStatus("Deleting");
    setConfirmationVisibility(true);
  };

  const deleteSpecificQueryHandler = async () => {
    setConfirmationVisibility(false);
    await DeleteSpecificQueryController(
      sortedSpecificQueryContext[aliasToDelete][0],
      environment.httpApiLocation,
    )
      .then((res) => {
        if (res.status === 200) {
          let newExpandedSqlStrings = [];
          expandedSqlStrings.forEach((value) => {
            if (value > index) newExpandedSqlStrings.push(value - 1);
          });
          setExpandedSqlStrings(newExpandedSqlStrings);
          setAliasToDelete(-1);
          loadSpecificQueries();
          setStatus("delete-success");
        } else setStatus("delete-failed");
      })
      .catch(() => {
        setStatus("delete-failed");
      });
  };

  const handleSort = (newOrderBy) => {
    const isAsc = orderBy === newOrderBy && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(newOrderBy);
  };

  const keyEventHandler = (event) => {
    // check if enter is pressed
    if (event.keyCode === 13 && status === "Adding") {
      setConfirmationVisibility(true);
    }
  };

  const handleToggleExpanded = (index) => {
    if (expandedSqlStrings.includes(index)) {
      let newExpandedSqlStrings = [];
      expandedSqlStrings.forEach((value) => {
        if (value !== index) newExpandedSqlStrings.push(value);
      });
      setExpandedSqlStrings(newExpandedSqlStrings);
    } else {
      let newExpandedSqlStrings = expandedSqlStrings.slice();
      newExpandedSqlStrings.push(index);
      setExpandedSqlStrings(newExpandedSqlStrings);
    }
  };

  useEffect(() => {
    if (specificQueryContext?.rows) {
      // sort by column
      const newSortedSpecificQueryContext = [...specificQueryContext.rows].sort(
        (a, b) => {
          return (
            (order === "asc" ? 1 : -1) *
            (orderBy === "alias"
              ? a[0].localeCompare(b[0])
              : a[1].localeCompare(b[1]))
          );
        },
      );
      // filter by input
      setSortedSpecificQueryContext(
        newSortedSpecificQueryContext.filter(
          (query) =>
            query[0].toLowerCase().includes(filterInput.toLowerCase()) ||
            query[1].toLowerCase().includes(filterInput.toLowerCase()),
        ),
      );
    }
    environment.pageTitle = environment.specificQueriesTitle;
    document.title = `${environment.titleFormat()}`;
  }, [filterInput, specificQueryContext, order, orderBy, environment]);

  const CollapsedSqlStrOverlayStyling = () => (
    <style>{`
.sql_str_collapsed::before {
  background: linear-gradient(transparent, 10%, rgba(220, 220, 220, 0.7), rgb(220, 220, 220));
  content: '';
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
  border-radius: ${styles.sql_str_borderRadius};
}
  `}</style>
  );

  useLayoutEffect(() => {
    if (confirmationVisibility) document.getElementById("modal").showModal();
    if (!confirmationVisibility && document.getElementById("modal").open)
      document.getElementById("modal").close();
  }, [confirmationVisibility]);

  useEffect(() => {
    if (status !== "none" && status !== "Adding") {
      const id = setTimeout(() => {
        setStatus("none");
      }, 2000);
      return () => {
        clearTimeout(id);
      };
    }
  }, [status]);

  return (
    <Fragment>
      <div style={styles.filterGroup}>
        <input
          type="text"
          placeholder="Filter by Alias or SQL String"
          style={styles.filter}
          onChange={(e) => setFilterInput(e.target.value)}
        />
        <button
          className="outlined_button"
          style={styles.add_button}
          onClick={addButtonEventHandler}
        >
          Add new Specific Query
        </button>
      </div>
      <br />
      <br />
      <div className="outlined_paper">
        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <td>
                <TableSortLabel
                  active={orderBy === "alias"}
                  direction={orderBy === "alias" ? order : "asc"}
                  onClick={() => handleSort("alias")}
                >
                  <b>Alias</b>
                </TableSortLabel>
              </td>
              <td>
                <TableSortLabel
                  active={orderBy === "sqlStr"}
                  direction={orderBy === "sqlStr" ? order : "asc"}
                  onClick={() => handleSort("sqlStr")}
                >
                  <b>SQL String</b>
                </TableSortLabel>
              </td>
              <td style={{ width: "80px" }} align="center">
                <b>Actions</b>
              </td>
            </tr>
          </thead>
          <tbody>
            {status === "Adding" && (
              <tr>
                <td>
                  <input
                    type="text"
                    style={styles.fontInherit}
                    onKeyDown={(e) => keyEventHandler(e)}
                    onChange={(e) => setNewAlias(e.target.value)}
                    value={newAlias}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    style={styles.fontInherit}
                    onKeyDown={(e) => keyEventHandler(e)}
                    onChange={(e) => setNewSqlStr(e.target.value)}
                    value={newSqlStr}
                  />
                </td>
                <td align="center">
                  <button
                    className="icon_button"
                    disabled={!newAlias || !newSqlStr}
                    onClick={() => setConfirmationVisibility(true)}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    className="icon_button"
                    onClick={() => {
                      setStatus("none");
                      setNewAlias("");
                      setNewSqlStr("");
                    }}
                  >
                    <CancelIcon />
                  </button>
                </td>
              </tr>
            )}
            <CollapsedSqlStrOverlayStyling />
            {!isLoadingSpecificQueryContext &&
              (sortedSpecificQueryContext &&
              sortedSpecificQueryContext.length > 0 ? (
                sortedSpecificQueryContext.map((specificQuery, index) => (
                  <tr key={`specific-query-${specificQuery[0]}`}>
                    <td style={{ width: "1em", whiteSpace: "nowrap" }}>
                      {specificQuery[0]}
                    </td>
                    <td style={styles.table_cell}>
                      <button
                        style={styles.sql_str_button}
                        onClick={() => handleToggleExpanded(index)}
                      >
                        <pre
                          className={
                            expandedSqlStrings.includes(index)
                              ? ""
                              : "sql_str_collapsed"
                          }
                          style={
                            expandedSqlStrings.includes(index)
                              ? styles.sql_str
                              : {
                                  ...styles.sql_str,
                                  ...styles.sql_str_collapsed,
                                }
                          }
                        >
                          {format(specificQuery[1])}
                        </pre>
                      </button>
                    </td>
                    <td align="right" style={styles.table_cell}>
                      <button
                        className="icon_button"
                        disabled={specificQuery[0] === "ls"}
                        onClick={() => deleteButtonEventHandler(index)}
                      >
                        <CloseIcon />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <div className="table_view_no_results_container">
                      No results found for [{filterInput}].
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <dialog id="modal">
        <h2>Confirmation</h2>
        <div>
          <p>
            {status} specific query &apos;
            {status === "Adding"
              ? newAlias
              : aliasToDelete >= 0 &&
                sortedSpecificQueryContext[aliasToDelete][0]}
            &apos;?
          </p>
        </div>
        <div>
          {status === "Adding" ? (
            <Fragment>
              <button onClick={() => setConfirmationVisibility(false)}>
                Cancel
              </button>
              <button onClick={addSpecificQueryHandler}>Confirm</button>
            </Fragment>
          ) : (
            <Fragment>
              <button onClick={deleteSpecificQueryHandler}>Confirm</button>
              <button onClick={() => setConfirmationVisibility(false)}>
                Cancel
              </button>
            </Fragment>
          )}
        </div>
      </dialog>
      <dialog
        className="alert success"
        open={status === "add-success"}
        onClose={() => {
          setStatus("none");
          setNewAlias("");
        }}
      >
        Success! Specific query &apos;{newAlias}&apos; is added.
      </dialog>
      <dialog
        className="alert error"
        open={status === "add-failed"}
        onClose={() => {
          setStatus("none");
        }}
      >
        Failed to add specific query &apos;{newAlias}&apos;.
      </dialog>
      <dialog
        className="alert success"
        open={status === "delete-success"}
        onClose={() => {
          setStatus("none");
        }}
      >
        Success! Specific query &apos;
        {aliasToDelete >= 0 && sortedSpecificQueryContext[aliasToDelete][0]}
        &apos; is deleted.
      </dialog>
      <dialog
        className="alert error"
        open={status === "delete-failed"}
        onClose={() => {
          setStatus("none");
        }}
      >
        Failed to delete specific query &apos;
        {aliasToDelete >= 0 && sortedSpecificQueryContext[aliasToDelete][0]}
        &apos;.
      </dialog>
    </Fragment>
  );
};
