import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useEnvironment } from "../contexts";

export const NotFound = () => {
  const { loginLogo, footerHeight, sidebarWidth } = useEnvironment();

  const styles = {
    notFoundContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-around",
      padding: "150px 0",
      height: `CALC( 100vh - ${footerHeight} - 300px)`,
      width: "100vw",
      overflow: "hidden",
    },
    linkToHomePage: {
      textDecoration: "none",
      color: "#04bdaf",
    },
    text: {
      fontSize: "1.2rem",
      fontWeight: "normal",
    },
    irodsLogo: {
      width: "200px",
      margin: "5% auto",
    },
  };

  const location = useLocation();

  return (
    <div style={styles.notFoundContainer}>
      <Link to="/">
        <img alt="iRODS Logo" style={styles.irodsLogo} src={loginLogo}></img>
      </Link>
      <div>
        <br />
        <h2 style={styles.text}>ERROR 404</h2>
        <br />
        <h2 style={styles.text}>
          The requested URL was not found on this server:
        </h2>
        <br />
        <h2 style={styles.text}>{location.pathname}</h2>
      </div>
    </div>
  );
};
