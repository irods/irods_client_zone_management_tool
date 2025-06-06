import React from "react";
import { useEnvironment } from "../contexts";

export const Footer = () => {
  const { footerLogo, footerHeight, brandingName, appVersion, appGitSha } =
    useEnvironment();

  const styles = {
    footer: {
      position: "relative",
      borderTop: "1px solid rgba(0, 0, 0, 0.12)",
      height: footerHeight,
      color: "#224",
      backgroundColor: "white",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingBottom: "0.5vh",
      fontSize: "0.8rem",
      boxSizing: "border-box",
    },

    footerLogo: {
      maxWidth: "4vw",
      marginRight: "10px",
    },

    footerItem: {
      display: "flex",
      padding: "10px",
      alignItems: "center",
      textAlign: "center",
    },
  };

  const FooterTextStyling = () => {
    return (
      <style>
        {`
.footerText {
  text-decoration: none;
  text-align: center;
  }
.footerText:visited {
color: black;
  }
      `}
      </style>
    );
  };

  return (
    <div style={styles.footer}>
      <FooterTextStyling />
      <div style={styles.footerItem}>
        <img alt="iRODS Icon" style={styles.footerLogo} src={footerLogo}></img>
        <a href="https://irods.org" className="footerText">
          iRODS Consortium © {new Date().getFullYear()}
        </a>
      </div>
      <div style={styles.footerItem}>
        {`${brandingName} Version: ${appVersion}, ${appGitSha.substring(0, 7)}`}
      </div>
    </div>
  );
};
