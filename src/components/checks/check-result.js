import React, { useState, Fragment } from "react";
import { useCheck } from "../../contexts";
import {
  CircleArrowIcon,
  CheckIcon,
  ErrorIcon,
  BlockIcon,
  WarningIcon,
  HighlightOffIcon,
  CancelIcon,
  CloseIcon,
  EditIcon,
  DoubleArrowRightIcon,
  DoubleArrowDownIcon,
} from "..";
import PropTypes from "prop-types";
import TimeAgo from "react-timeago";

const rootStyle = {
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
};

export const CheckResult = ({ status, check, result }) => {
  const {
    runOneCheck,
    checkIntervals,
    inactiveChecks,
    modifyCheckActivity,
    modifyCheckInterval,
  } = useCheck();
  const [expanded, setExpanded] = useState(false);
  const [interval, setInterval] = useState(checkIntervals[check.id]);
  const [isEditingInterval, setIsEditingInterval] = useState(false);

  const intervalHandler = () => {
    setIsEditingInterval(false);
    modifyCheckInterval(check.id, interval);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) intervalHandler();
  };

  return (
    <Fragment>
      <tr className="hoverableTableRow" style={rootStyle}>
        <td>
          <button
            className="icon_button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <DoubleArrowDownIcon /> : <DoubleArrowRightIcon />}
          </button>
        </td>
        <td
          style={{ cursor: "pointer" }}
          onClick={() => setExpanded(!expanded)}
        >
          {result[0].name}
        </td>
        <td>
          <i>
            {result[1].timestamp === "N/A" ? (
              "N/A"
            ) : (
              <TimeAgo date={result[1].timestamp} />
            )}
          </i>
        </td>
        <td align="center">
          <input
            style={{ cursor: "pointer" }}
            defaultChecked={!inactiveChecks.has(result[0].id)}
            disabled={!check.isValid}
            type="checkbox"
            onClick={() => modifyCheckActivity(result[0].id)}
          />
        </td>
        <td align="center">
          {checkIntervals[check.id]}{" "}
          {checkIntervals[check.id] !== "N/A" && "seconds"}
        </td>
        <td align="center">
          <span>
            <button
              className="icon_button"
              disabled={inactiveChecks.has(result[0].id) || !check.isValid}
              onClick={() => runOneCheck(check)}
            >
              <CircleArrowIcon />
            </button>
          </span>
        </td>
        <td align="center" style={{ paddingLeft: "20px" }}>
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
        </td>
      </tr>
      {expanded && (
        <tr className="dropdown">
          <td style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <div style={{ padding: "10px 0" }}>
              <div>
                <b>Interval:</b>{" "}
                {isEditingInterval ? (
                  <Fragment>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      onKeyDown={(event) => handleKeyDown(event)}
                      style={{ width: "50px" }}
                      onChange={(e) => setInterval(e.target.value)}
                    />{" "}
                    seconds
                    <button
                      className="icon_button"
                      onClick={() => intervalHandler()}
                    >
                      <CheckIcon />
                    </button>
                    <button
                      className="icon_button"
                      onClick={() => setIsEditingInterval(false)}
                    >
                      <CloseIcon />
                    </button>
                  </Fragment>
                ) : (
                  <span>
                    {interval} seconds{" "}
                    <button
                      className="icon_button"
                      disabled={!check.active || !check.isValid}
                      onClick={() => setIsEditingInterval(true)}
                    >
                      <EditIcon />
                    </button>
                  </span>
                )}
              </div>
              <div>
                <b>Description:</b> {result[0].description}
              </div>
              <div>
                <b>Result:</b> {result[1].message}
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
};

CheckResult.propTypes = {
  status: PropTypes.string.isRequired,
  check: PropTypes.object.isRequired,
  result: PropTypes.any.isRequired,
};
