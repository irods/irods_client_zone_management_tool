import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  DoubleArrowDownIcon,
  DoubleArrowUpIcon,
  WarningIcon,
  EditIcon,
  CloseIcon,
  CancelIcon,
  CheckIcon,
  CircularLoadingIndicator,
} from ".";
import { useEnvironment, useServer } from "../contexts";
import {
  ModifyResourceController,
  RemoveResourceController,
} from "../controllers/ResourceController";

const styles = {
  link_button: {
    textDecoration: "none",
  },
  row: {
    paddingTop: 10,
    margin: 0,
  },
  toggle_group: {
    marginLeft: 20,
  },
  table_cell: {
    padding: 0,
    width: "50%",
    fontSize: 15,
    wordWrap: "break-word",
    height: 40,
  },
  remove_button: {
    float: "right",
  },
  dialog_content: {
    paddingLeft: 20,
    fontSize: 14,
  },
  remove_result: {
    textAlign: "center",
    color: "red",
  },
  dialog_contenttext: {
    padding: 24,
    fontSize: 15,
  },
  cell: {
    wordWrap: "break-word",
  },
  resource_container: {
    display: "flex",
    flexDirection: "column",
    padding: "10px 0",
  },
  resource_textfield: {
    width: "50%",
  },
};

function ResourceRows({ row, validServerHosts }) {
  const { httpApiLocation } = useEnvironment();
  const {
    rescTypes,
    rescPanelStatus,
    updatingRescPanelStatus,
    isLoadingZoneContext,
  } = useServer();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState(false);
  const [failNotification, setFailNotification] = useState(false);
  const [resc, setResc] = useState(row);
  const [currentResc, setCurrentResc] = useState(row);
  const [removeFormOpen, setRemoveForm] = useState(false);
  const [removeErrorMsg, setRemoveErrorMsg] = useState();

  useEffect(() => {
    if (rescPanelStatus === `editing-${resc[11]}`) setIsEditing(true);
    else {
      setCurrentResc(resc);
      setIsEditing(false);
    }
  }, [isEditing, resc, rescPanelStatus]);

  const handleKeyDown = (event) => {
    // support key event if any field has been changed
    if (event.keyCode === 13 && checkIfChanged()) {
      saveResource();
    }
  };

  const saveResource = async () => {
    setIsUpdating(true);
    const updatedResc = [...resc];
    try {
      if (currentResc[0] !== resc[0]) {
        await ModifyResourceController(
          resc[0],
          "name",
          currentResc[0],
          httpApiLocation,
        );
        updatedResc[0] = currentResc[0];
      }
      if (currentResc[1] !== resc[1]) {
        await ModifyResourceController(
          currentResc[0],
          "type",
          currentResc[1],
          httpApiLocation,
        );
        updatedResc[1] = currentResc[1];
      }
      if (currentResc[3] !== resc[3]) {
        await ModifyResourceController(
          currentResc[0],
          "path",
          currentResc[3],
          httpApiLocation,
        );
        updatedResc[3] = currentResc[3];
      }
      if (currentResc[4] !== resc[4]) {
        await ModifyResourceController(
          currentResc[0],
          "host",
          currentResc[4],
          httpApiLocation,
        );
        updatedResc[4] = currentResc[4];
      }
      if (currentResc[5] !== resc[5]) {
        await ModifyResourceController(
          currentResc[0],
          "info",
          currentResc[5],
          httpApiLocation,
        );
        updatedResc[5] = currentResc[5];
      }
      if (currentResc[6] !== resc[6]) {
        await ModifyResourceController(
          currentResc[0],
          "free_space",
          currentResc[6],
          httpApiLocation,
        );
        updatedResc[6] = currentResc[6];
      }
      if (currentResc[7] !== resc[7]) {
        await ModifyResourceController(
          currentResc[0],
          "comment",
          currentResc[7],
          httpApiLocation,
        );
        updatedResc[7] = currentResc[7];
      }
      if (currentResc[9] !== resc[9]) {
        await ModifyResourceController(
          currentResc[0],
          "context",
          currentResc[9],
          httpApiLocation,
        );
        updatedResc[9] = currentResc[9];
      }
      setIsUpdating(false);
      setResc(updatedResc);
      setSuccessNotification(true);
      closeEditFormHandler();
    } catch {
      setIsUpdating(false);
      setResc(updatedResc);
      setCurrentResc(updatedResc);
      setFailNotification(true);
    }
  };

  const checkIfChanged = () => {
    return !(
      currentResc[0] === resc[0] &&
      currentResc[1] === resc[1] &&
      currentResc[3] === resc[3] &&
      currentResc[4] === resc[4] &&
      currentResc[5] === resc[5] &&
      currentResc[6] === resc[6] &&
      currentResc[7] === resc[7] &&
      currentResc[9] === resc[9]
    );
  };

  const removeResource = async (name) => {
    try {
      await RemoveResourceController(name, httpApiLocation);
      window.location.reload();
    } catch (e) {
      setRemoveErrorMsg("Error: " + e.message);
    }
  };

  const removeFormClose = () => {
    setRemoveForm(false);
    setRemoveErrorMsg();
  };

  const updateCurrentRescHandler = (index, value) => {
    const newCurrResc = [...currentResc];
    newCurrResc[index] = value;
    setCurrentResc(newCurrResc);
  };

  const closeEditFormHandler = () => {
    updatingRescPanelStatus("idle");
  };

  useEffect(() => {
    if (open && removeFormOpen)
      document.getElementById(`${resc[0]}-modal`).showModal();
    if (
      open &&
      !removeFormOpen &&
      document.getElementById(`${resc[0]}-modal`).open
    )
      document.getElementById(`${resc[0]}-modal`).close();
  }, [removeFormOpen, open, resc]);

  useEffect(() => {
    if (failNotification) {
      const id = setTimeout(() => {
        setFailNotification(false);
      }, 2000);
      return () => {
        clearTimeout(id);
      };
    }
  }, [failNotification]);

  useEffect(() => {
    if (successNotification) {
      const id = setTimeout(() => {
        setSuccessNotification(false);
      }, 2000);
      return () => {
        clearTimeout(id);
      };
    }
  }, [successNotification]);

  return (
    <React.Fragment>
      <tr className="hoverableTableRow" onClick={() => setOpen(!open)}>
        <td style={styles.cell} align="left">
          {resc[0]}
        </td>
        <td style={styles.cell} align="left">
          {resc[1]}
        </td>
        <td style={styles.cell} align="left">
          {!isLoadingZoneContext && !validServerHosts.has(resc[4]) && (
            <WarningIcon style={{ color: "orange", fontSize: 22 }} />
          )}
          {resc[4]}
        </td>
        <td style={styles.cell} align="left">
          {resc[3]}
        </td>
        <td style={styles.cell} align="right">
          <button className="icon_button">
            {open ? <DoubleArrowUpIcon /> : <DoubleArrowDownIcon />}
          </button>
        </td>
      </tr>
      <tr className="hoverableTableRow">
        <td style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          {open && (
            <React.Fragment>
              <div style={styles.resource_container}>
                <h2 style={styles.row}>
                  Resource Details
                  <span style={styles.remove_button}>
                    {isEditing ? (
                      <Fragment>
                        <span>
                          <button
                            className="icon_button"
                            disabled={!checkIfChanged() || isUpdating}
                            onClick={saveResource}
                          >
                            {isUpdating ? (
                              <CircularLoadingIndicator
                                style={{ fontSize: 20 }}
                              />
                            ) : (
                              <CheckIcon style={{ fontSize: 20 }} />
                            )}
                          </button>
                        </span>
                        <button
                          className="icon_button"
                          onClick={closeEditFormHandler}
                        >
                          <CancelIcon style={{ fontSize: 20 }} />
                        </button>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <button
                          className="icon_button"
                          onClick={() =>
                            updatingRescPanelStatus(`editing-${resc[11]}`)
                          }
                        >
                          <EditIcon style={{ fontSize: 20 }} />
                        </button>
                        <span>
                          <button
                            className="icon_button"
                            disabled={isEditing}
                            onClick={() => setRemoveForm(true)}
                          >
                            <CloseIcon style={{ fontSize: 20 }} />
                          </button>
                        </span>
                      </Fragment>
                    )}
                  </span>
                </h2>
                <table
                  style={{ width: "100%", tableLayout: "fixed" }}
                  size="small"
                  aria-label="purchases"
                >
                  <tbody>
                    <tr>
                      <td style={styles.table_cell}>
                        <span>
                          Name:{" "}
                          {isEditing ? (
                            <input
                              type="text"
                              style={styles.resource_textfield}
                              defaultValue={currentResc[0]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(0, event.target.value);
                              }}
                            />
                          ) : (
                            resc[0]
                          )}
                        </span>
                      </td>
                      <td style={styles.table_cell}>
                        <span>
                          Type:{" "}
                          {isEditing ? (
                            <select
                              style={styles.resource_textfield}
                              defaultValue={currentResc[1]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(1, event.target.value);
                              }}
                            >
                              {rescTypes.map((type) => (
                                <option
                                  key={`resource-type-${type}`}
                                  value={type}
                                >
                                  {type}
                                </option>
                              ))}
                            </select>
                          ) : (
                            resc[1]
                          )}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.table_cell}>
                        <span>
                          Hostname:{" "}
                          {isEditing ? (
                            <input
                              type="text"
                              style={styles.resource_textfield}
                              defaultValue={currentResc[4]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(
                                  4,
                                  event.target.value === ""
                                    ? "EMPTY_RESC_HOST"
                                    : event.target.value,
                                );
                              }}
                            />
                          ) : (
                            resc[4]
                          )}
                        </span>
                      </td>
                      <td style={styles.table_cell}>
                        <span>
                          Vault Path:{" "}
                          {isEditing ? (
                            <input
                              type="text"
                              style={styles.resource_textfield}
                              defaultValue={currentResc[3]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(
                                  3,
                                  event.target.value === ""
                                    ? "EMPTY_RESC_PATH"
                                    : event.target.value,
                                );
                              }}
                            />
                          ) : (
                            resc[3]
                          )}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.table_cell}>
                        <span>
                          Information:{" "}
                          {isEditing ? (
                            <input
                              type="text"
                              style={styles.resource_textfield}
                              defaultValue={currentResc[5]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(5, event.target.value);
                              }}
                            />
                          ) : (
                            resc[5]
                          )}
                        </span>
                      </td>
                      <td style={styles.table_cell}>
                        <span>
                          Free space:{" "}
                          {isEditing ? (
                            <input
                              type="text"
                              style={styles.resource_textfield}
                              defaultValue={currentResc[6]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(6, event.target.value);
                              }}
                            />
                          ) : (
                            resc[6]
                          )}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={styles.table_cell}>
                        <span>
                          Comment:{" "}
                          {isEditing ? (
                            <input
                              type="text"
                              style={styles.resource_textfield}
                              defaultValue={currentResc[7]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(7, event.target.value);
                              }}
                            />
                          ) : (
                            resc[7]
                          )}
                        </span>
                      </td>
                      <td style={styles.table_cell}>
                        <span>
                          Context:{" "}
                          {isEditing ? (
                            <input
                              type="text"
                              style={styles.resource_textfield}
                              defaultValue={currentResc[9]}
                              onKeyDown={handleKeyDown}
                              onChange={(event) => {
                                updateCurrentRescHandler(9, event.target.value);
                              }}
                            />
                          ) : (
                            resc[9]
                          )}
                        </span>
                      </td>
                    </tr>
                    {currentResc[10] !== "" && (
                      <tr>
                        <td style={styles.table_cell}>
                          Parent Context: {currentResc[12]}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <dialog
                id={`${resc[0]}-modal`}
                onClose={removeFormClose}
                aria-labelledby="form-dialog-title"
              >
                <div style={styles.dialog_content}>
                  Are you sure to remove resource <b>{row[0]}</b>?{" "}
                </div>
                <div style={styles.remove_result}>{removeErrorMsg}</div>
                <div>
                  <button
                    color="secondary"
                    onClick={() => {
                      removeResource(row[0]);
                    }}
                  >
                    Remove
                  </button>
                  <button onClick={removeFormClose}>Cancel</button>
                </div>
              </dialog>
              <dialog
                className="alert success"
                open={successNotification}
                onClose={() => setSuccessNotification(false)}
              >
                Success! Resource {row[0]} updated.
              </dialog>
              <dialog
                className="alert error"
                open={failNotification}
                onClose={() => setFailNotification(false)}
              >
                Failed to edit resource {row[0]}.
              </dialog>
            </React.Fragment>
          )}
        </td>
      </tr>
    </React.Fragment>
  );
}

export default ResourceRows;

ResourceRows.propTypes = {
  row: PropTypes.array,
  validServerHosts: PropTypes.object,
};
