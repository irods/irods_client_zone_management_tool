import React, {
  useCallback,
  useState,
  Fragment,
  useEffect,
  useLayoutEffect,
} from "react";
import { useEnvironment, useServer } from "../contexts";
import { EditIcon, CloseIcon, CheckIcon, TableSortLabel } from "../components";
import {
  AddZoneController,
  DeleteZoneController,
  ModifyZoneController,
} from "../controllers/ZoneController";

const initialZoneState = {
  name: "",
  type: "remote",
  users: 0,
  hostname: "",
  port: "",
  comment: "",
};

const styles = {
  fontInherit: {
    font: "inherit",
  },
  table_cell: {
    wordWrap: "break-word",
  },
};

export const Zone = () => {
  const { zones, loadZones, isLoadingZones } = useServer();
  const [sortedZones, setSortedZones] = useState([]);
  const [status, setStatus] = useState("none");
  const [currZone, setCurrZone] = useState(initialZoneState);
  const [modifiedCurrZone, setModifiedCurrZone] = useState();
  const [confirmationDialog, setConfirmationDialog] = useState({
    state: "",
    visibility: false,
  });
  const [saveButtonIsDisabled, setSaveButtonIsDisabled] = useState(true);
  const [order, setOrder] = useState("");
  const [orderBy, setOrderBy] = useState("asc");
  const environment = useEnvironment();

  useEffect(() => {
    if (zones && zones.length > 0) {
      setSortedZones(zones);
    }
    environment.pageTitle = environment.zonesTitle;
    document.title = `${environment.titleFormat()}`;
  }, [zones, environment]);

  // sort rows if user clicks on the column arrows
  useEffect(() => {
    if (order !== "" && orderBy !== "") {
      const newSortedZone = [...sortedZones];
      newSortedZone.sort(
        (a, b) =>
          (order === "asc" ? 1 : -1) * a[orderBy].localeCompare(b[orderBy]),
      );
      setSortedZones(newSortedZone);
    }
  }, [order, orderBy, sortedZones]);

  const handleSort = (newOrderBy) => {
    const isAsc = orderBy === newOrderBy && order === "desc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(newOrderBy);
  };

  // insert new row into dom for zone creation
  const addNewZoneRow = () => {
    setCurrZone(initialZoneState);
    setStatus("creation");
  };

  const addZoneHandler = async () => {
    try {
      const res = await AddZoneController(
        currZone.name,
        currZone.type,
        currZone.hostname + ":" + currZone.port,
        currZone.comment,
        environment.httpApiLocation,
      );
      if (res.status === 200) {
        setStatus("add-success");
        loadZones();
      }
    } catch (e) {
      console.error(e, e.stack);
      setStatus("add-failed");
    }
  };

  // popup for delete zone confirmation
  const deleteZonePopupHandler = (zone) => {
    setCurrZone(zone);
    setConfirmationDialog({ state: "remove", visibility: true });
  };
  const deleteZoneHandler = async () => {
    const res = await DeleteZoneController(
      currZone.name,
      environment.httpApiLocation,
    );
    setConfirmationDialog({ state: "remove", visibility: false });
    if (res.status === 200) {
      setStatus("remove-success");
      loadZones();
    } else {
      setStatus("remove-error");
    }
  };

  const editZoneModeHandler = (zone) => {
    setCurrZone(zone);
    setModifiedCurrZone(zone);
    setStatus("edit-mode");
  };

  const editZoneHandler = async () => {
    const newZoneName = modifiedCurrZone.name;
    const newConnString = `${modifiedCurrZone.hostname}:${modifiedCurrZone.port}`;
    const newComment = modifiedCurrZone.comment;
    try {
      let updated = true;
      if (newZoneName !== currZone.name) {
        const nameModificationRes = await ModifyZoneController(
          currZone.name,
          "name",
          newZoneName,
          environment.httpApiLocation,
        );
        if (nameModificationRes.status !== 200) updated = false;
      }
      if (newConnString !== currZone.hostname + ":" + currZone.port) {
        const hostModificationRes = await ModifyZoneController(
          newZoneName,
          "connection_info",
          newConnString,
          environment.httpApiLocation,
        );
        if (hostModificationRes.status !== 200) updated = false;
      }
      if (newComment !== currZone.comment) {
        const commentModificationRes = await ModifyZoneController(
          newZoneName,
          "comment",
          newComment,
          environment.httpApiLocation,
        );
        if (commentModificationRes.status !== 200) updated = false;
      }
      if (updated) {
        loadZones();
        setStatus("edit-success");
      }
    } catch (e) {
      console.error(e, e.stack);
      setStatus("edit-failed");
    } finally {
      setConfirmationDialog({ state: "modify", visibility: false });
    }
  };

  // return true if inputs are valid and not empty, return false otherwise
  const validateEditModeInput = useCallback(() => {
    return (
      modifiedCurrZone.name !== "" &&
      modifiedCurrZone.hostname !== "" &&
      parseInt(modifiedCurrZone.port) > 0
    );
  }, [modifiedCurrZone]);

  // return true if any edit input has changed, return false otherwise
  const checkIfChanged = useCallback(() => {
    return !(
      modifiedCurrZone.name === currZone.name &&
      modifiedCurrZone.hostname === currZone.hostname &&
      modifiedCurrZone.port === currZone.port &&
      modifiedCurrZone.comment === currZone.comment
    );
  }, [modifiedCurrZone, currZone]);

  const keyEventHandler = (event) => {
    // check if enter is pressed
    if (event.keyCode === 13) {
      if (status === "creation") {
        addZoneHandler();
      } else {
        setConfirmationDialog({ state: "modify", visibility: true });
      }
    }
  };

  // validate input and check if any inputs are changed
  useEffect(() => {
    if (status === "edit-mode") {
      setSaveButtonIsDisabled(!(validateEditModeInput() && checkIfChanged()));
    } else {
      setSaveButtonIsDisabled(
        currZone.name === "" ||
          currZone.hostname === "" ||
          currZone.port === "",
      );
    }
  }, [
    currZone,
    modifiedCurrZone,
    status,
    checkIfChanged,
    validateEditModeInput,
  ]);

  useLayoutEffect(() => {
    if (confirmationDialog.visibility)
      document.getElementById("modal").showModal();
    if (!confirmationDialog.visibility && document.getElementById("modal").open)
      document.getElementById("modal").close();
  }, [confirmationDialog]);

  // validate input and check if any inputs are changed
  useEffect(() => {
    if (status === "edit-mode") {
      setSaveButtonIsDisabled(!(validateEditModeInput() && checkIfChanged()));
    } else {
      setSaveButtonIsDisabled(
        currZone.name === "" ||
          currZone.hostname === "" ||
          currZone.port === "",
      );
    }
  }, [
    currZone,
    modifiedCurrZone,
    status,
    checkIfChanged,
    validateEditModeInput,
  ]);

  useEffect(() => {
    if (status !== "none" && status !== "edit-mode" && status !== "creation") {
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
      {zones !== undefined && !isLoadingZones && (
        <div className="table_view_spinner_holder" />
      )}
      <button className="outlined_button" onClick={() => addNewZoneRow()}>
        Add new Zone
      </button>
      <br />
      <br />
      <div className="outlined_paper">
        <table style={{ width: "100%", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <td style={styles.table_cell}>
                <TableSortLabel
                  active={orderBy === "name"}
                  direction={orderBy === "name" ? order : "asc"}
                  onClick={() => handleSort("name")}
                >
                  <b>Zone Name</b>
                </TableSortLabel>
              </td>
              <td style={styles.table_cell}>
                <TableSortLabel
                  active={orderBy === "type"}
                  direction={orderBy === "type" ? order : "asc"}
                  onClick={() => handleSort("type")}
                >
                  <b>Type</b>
                </TableSortLabel>
              </td>
              <td style={styles.table_cell}>
                <TableSortLabel
                  active={orderBy === "users"}
                  direction={orderBy === "users" ? order : "asc"}
                  onClick={() => handleSort("users")}
                >
                  <b>Users</b>
                </TableSortLabel>
              </td>
              <td style={styles.table_cell}>
                <TableSortLabel
                  active={orderBy === "hostname"}
                  direction={orderBy === "hostname" ? order : "asc"}
                  onClick={() => handleSort("hostname")}
                >
                  <b>Hostname</b>
                </TableSortLabel>
              </td>
              <td style={styles.table_cell}>
                <TableSortLabel
                  active={orderBy === "port"}
                  direction={orderBy === "port" ? order : "asc"}
                  onClick={() => handleSort("port")}
                >
                  <b>Port</b>
                </TableSortLabel>
              </td>
              <td style={styles.table_cell}>
                <TableSortLabel
                  active={orderBy === "comment"}
                  direction={orderBy === "comment" ? order : "asc"}
                  onClick={() => handleSort("comment")}
                >
                  <b>Comment</b>
                </TableSortLabel>
              </td>
              <td style={styles.table_cell}>
                <b>Actions</b>
              </td>
            </tr>
          </thead>
          <tbody>
            {status === "creation" && (
              <tr id="add_zone_newrow">
                <td>
                  <input
                    style={styles.fontInherit}
                    id="new_zone_name_input"
                    onKeyDown={(e) => keyEventHandler(e)}
                    onChange={(e) =>
                      setCurrZone({ ...currZone, name: e.target.value })
                    }
                  />
                </td>
                <td>
                  <select
                    style={styles.fontInherit}
                    id="new_zone_type"
                    value="remote"
                    onKeyDown={(e) => keyEventHandler(e)}
                  >
                    <option value="remote">remote</option>
                  </select>
                </td>
                <td></td>
                <td>
                  <input
                    id="new_zone_host_input"
                    style={styles.fontInherit}
                    onKeyDown={(e) => keyEventHandler(e)}
                    onChange={(e) =>
                      setCurrZone({ ...currZone, hostname: e.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    id="new_zone_port_input"
                    type="number"
                    min="1"
                    max="65535"
                    style={styles.fontInherit}
                    onKeyDown={(e) => keyEventHandler(e)}
                    onChange={(e) =>
                      setCurrZone({ ...currZone, port: e.target.value })
                    }
                  />
                </td>
                <td>
                  <input
                    id="new_zone_comment_input"
                    style={styles.fontInherit}
                    onKeyDown={(e) => keyEventHandler(e)}
                    onChange={(e) =>
                      setCurrZone({ ...currZone, comment: e.target.value })
                    }
                  />
                </td>
                <td>
                  <Fragment>
                    <button
                      className="icon_button"
                      aria-label="make-new-zone"
                      value="save"
                      disabled={saveButtonIsDisabled}
                      onClick={() => {
                        setCurrZone(initialZoneState);
                        addZoneHandler();
                      }}
                    >
                      <CheckIcon />
                    </button>
                    <button
                      className="icon_button"
                      aria-label="close-new-zone-row"
                      value="close"
                      onClick={() => setStatus("none")}
                    >
                      <CloseIcon />
                    </button>
                  </Fragment>
                </td>
              </tr>
            )}
            {sortedZones &&
              sortedZones.map((zone) => (
                <tr key={`zone-${zone.name}`}>
                  <td
                    style={{
                      ...styles.table_cell,
                      borderLeft: `25px solid ${zone.type === "local" ? "#04d1c2" : "#808080"}`,
                    }}
                  >
                    {(status === "edit-mode" || isLoadingZones) &&
                    currZone.name === zone.name ? (
                      <input
                        id="edit-zone-name-input"
                        style={styles.fontInherit}
                        defaultValue={currZone.name}
                        onKeyDown={(e) => keyEventHandler(e)}
                        onChange={(e) =>
                          setModifiedCurrZone({
                            ...modifiedCurrZone,
                            name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      zone.name
                    )}
                  </td>
                  <td style={styles.table_cell}>{zone.type}</td>
                  <td style={styles.table_cell}>{zone.users}</td>
                  <td style={styles.table_cell}>
                    {(status === "edit-mode" || isLoadingZones) &&
                    currZone.name === zone.name ? (
                      <input
                        id="edit-zone-host-input"
                        style={styles.fontInherit}
                        defaultValue={currZone.hostname}
                        onKeyDown={(e) => keyEventHandler(e)}
                        onChange={(e) =>
                          setModifiedCurrZone({
                            ...modifiedCurrZone,
                            hostname: e.target.value,
                          })
                        }
                      />
                    ) : (
                      zone.hostname
                    )}
                  </td>
                  <td style={styles.table_cell}>
                    {(status === "edit-mode" || isLoadingZones) &&
                    currZone.name === zone.name ? (
                      <input
                        id="edit-zone-port-input"
                        type="number"
                        min="1"
                        max="65535"
                        style={styles.fontInherit}
                        defaultValue={currZone.port}
                        onKeyDown={(e) => keyEventHandler(e)}
                        onChange={(e) =>
                          setModifiedCurrZone({
                            ...modifiedCurrZone,
                            port: e.target.value,
                          })
                        }
                      />
                    ) : (
                      zone.port
                    )}
                  </td>
                  <td style={styles.table_cell}>
                    {(status === "edit-mode" || isLoadingZones) &&
                    currZone.name === zone.name ? (
                      <input
                        id="edit-zone-comment-input"
                        style={styles.fontInherit}
                        defaultValue={currZone.comment}
                        onKeyDown={(e) => keyEventHandler(e)}
                        onChange={(e) =>
                          setModifiedCurrZone({
                            ...modifiedCurrZone,
                            comment: e.target.value,
                          })
                        }
                      />
                    ) : (
                      zone.comment
                    )}
                  </td>
                  <td>
                    <Fragment>
                      {(status === "edit-mode" || status === "editing") &&
                      currZone.name === zone.name ? (
                        <Fragment>
                          <button
                            className="icon_button"
                            aria-label="zone-edit-confirm"
                            disabled={saveButtonIsDisabled}
                            onClick={() =>
                              setConfirmationDialog({
                                state: "modify",
                                visibility: true,
                              })
                            }
                          >
                            <CheckIcon />
                          </button>
                          <button
                            className="icon_button"
                            aria-label="zone-edit-close"
                            onClick={() => setStatus("none")}
                          >
                            <CloseIcon />
                          </button>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <button
                            className="icon_button"
                            aria-label="zone-edit"
                            disabled={zone.type === "local" || zone.users > 0}
                            onClick={() => editZoneModeHandler(zone)}
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="icon_button"
                            aria-label="zone-remove"
                            disabled={zone.type === "local" || zone.users > 0}
                            onClick={() => deleteZonePopupHandler(zone)}
                          >
                            <CloseIcon />
                          </button>
                        </Fragment>
                      )}
                    </Fragment>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <dialog
        id="modal"
        onClose={() => setConfirmationDialog({ state: "", visibility: false })}
        aria-labelledby="form-dialog-title"
      >
        <h2>Confirmation</h2>
        <div>
          {confirmationDialog.state === "remove" ? "Removing" : "Modifying"}{" "}
          zone <b>{currZone.name}</b>?
        </div>
        <div>
          <button
            onClick={() => {
              confirmationDialog.state === "remove"
                ? deleteZoneHandler()
                : editZoneHandler();
            }}
          >
            {confirmationDialog.state === "remove" ? "Remove" : "Modify"}
          </button>
          <button
            onClick={() =>
              setConfirmationDialog({ state: "", visibility: false })
            }
            color="primary"
          >
            Cancel
          </button>
        </div>
      </dialog>
      <dialog className="alert success" open={status === "edit-success"}>
        Success! Zone {currZone.name} is updated.
      </dialog>
      <dialog className="alert error" open={status === "edit-failed"}>
        Failed to modify zone {currZone.name}.
      </dialog>
      <dialog className="alert success" open={status === "remove-success"}>
        Success! Zone {currZone.name} is removed.
      </dialog>
      <dialog className="alert error" open={status === "remove-failed"}>
        Failed to remove zone {currZone.name}.
      </dialog>
      <dialog className="alert success" open={status === "add-success"}>
        Success! Zone {currZone.name} is created.
      </dialog>
      <dialog className="alert error" open={status === "add-failed"}>
        Failed to create zone {currZone.name}.
      </dialog>
    </Fragment>
  );
};
