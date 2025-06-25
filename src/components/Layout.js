import { useEnvironment, useAuthHook, useServer } from "../contexts";
import { NavLink } from "react-router";
import PropTypes from "prop-types";

export const Layout = ({ children }) => {
  const environment = useEnvironment();
  const {
    userTotal,
    groupTotal,
    rescTotal,
    zoneContext,
    specificQueryTotal,
    localZoneName,
    zones,
  } = useServer();
  const { logout } = useAuthHook();

  const styles = {
    root: {
      width: "100vw",
      height: "100%",
      overflow: "hidden",
    },
    appBar: {
      width: "CALC(100vw - 36px)",
      height: environment.appBarHeight,
      backgroundColor: environment.primaryColor,
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: "24px",
      paddingRight: "12px",
      display: "flex",
      flexDirection: "row",
      color: "white",
      boxShadow: `${environment.sidebarWidth} 4px 8px rgba(0, 0, 0, 0.2)`,
    },
    logo: {
      width: "70px",
      height: "64px",
      marginRight: "20px",
    },
    branding: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textDecoration: "none",
      height: environment.appBarHeight,
    },
    appBarText: {
      fontSize: "1.25rem",
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 500,
      whiteSpace: "nowrap",
    },
    body: {
      display: "flex",
      flexDirection: "row",
      width: "100vw",
      height: `calc(100vh - ${environment.footerHeight} - ${environment.appBarHeight})`,
    },
    sidebar: {
      width: environment.sidebarWidth,
      minWidth: environment.sidebarWidth,
      height: `calc(100vh - ${environment.footerHeight} - ${environment.appBarHeight})`,
      overflow: "auto",
      borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      borderRight: "1px solid rgba(0, 0, 0, 0.1)",
      borderTop: "1px solid rgba(0, 0, 0, 0.1)",
    },
    sidebarMain: {
      padding: "8px 0",
      margin: "0px",
      width: environment.sidebarWidth,
    },
    sidebarList: {
      listStyle: "none",
      paddingLeft: 0,
    },
    navItem: {
      display: "block",
      lineHeight: 1,
      paddingLeft: "16px",
      paddingTop: "10px",
      paddingBottom: "10px",
      cursor: "pointer",
      textDecoration: "none",
      color: "black",
      width: `calc(${environment.sidebarWidth} - 16px)`,
    },
    sidebarDivider: {
      border: "none",
      borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
    },
  };

  const NavItemDynamicStyling = () => (
    <style>{`
      .navItem:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    .navItem.active {
      background-color: rgba(0, 0, 0, 0.2);
}
    `}</style>
  );

  // TODO add title formatting (#)
  const Sidebar = () => {
    return (
      <nav id="zmt-sidebar" style={styles.sidebar}>
        <NavItemDynamicStyling />
        <div style={styles.sidebarMain}>
          <NavLink className="navItem" style={styles.navItem} to="/home">
            {environment.homeTitle}
          </NavLink>
          <NavLink className="navItem" style={styles.navItem} to="/zones">
            {environment.zonesTitle} ({!zones ? 0 : zones.length})
          </NavLink>
          <NavLink className="navItem" style={styles.navItem} to="/servers">
            {environment.serversTitle} ({!zoneContext ? 0 : zoneContext.length})
          </NavLink>
          <NavLink className="navItem" style={styles.navItem} to="/resources">
            {environment.resourcesTitle} ({rescTotal})
          </NavLink>
          <NavLink className="navItem" style={styles.navItem} to="/users">
            {environment.usersTitle} ({userTotal})
          </NavLink>
          <NavLink className="navItem" style={styles.navItem} to="/groups">
            {environment.groupsTitle} ({groupTotal})
          </NavLink>
          <NavLink
            className="navItem"
            style={styles.navItem}
            to="/specific-query"
          >
            {environment.specificQueriesTitle} ({specificQueryTotal})
          </NavLink>
        </div>
        <hr style={styles.sidebarDivider} />
        <NavLink
          className="navItem"
          style={styles.navItem}
          to="/login"
          onClick={logout}
        >
          Logout
        </NavLink>
      </nav>
    );
  };

  return (
    <div id="zmt-layout" style={styles.root}>
      <header id="zmt-appbar" style={styles.appBar}>
        <span style={styles.branding}>
          <a href="/">
            <img
              alt="Branding Icon"
              style={styles.logo}
              src={environment.appBarLogo}
            ></img>
          </a>
          <h6 style={styles.appBarText}>{environment.brandingName}</h6>
        </span>
        <div>
          <h6 style={styles.appBarText}>{localZoneName}</h6>
        </div>
      </header>
      <div style={styles.body}>
        <Sidebar />
        <div className="main_wrapper">{children}</div>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
