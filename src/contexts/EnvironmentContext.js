import { useEffect, useState, createContext, useContext } from "react";
import PropTypes from "prop-types";

export const EnvironmentContext = createContext();

export const EnvironmentProvider = ({ children }) => {
  const [deviceType, setDeviceType] = useState("");

  // detect if mobile device
  useEffect(() => {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(
        navigator.userAgent,
      )
    ) {
      setDeviceType("Mobile");
    } else {
      setDeviceType("Desktop");
    }
  }, []);

  return (
    <EnvironmentContext.Provider
      value={{
        deviceType: deviceType,

        httpApiLocation: process.env.REACT_APP_HTTP_API_URL,
        httpApiTimeout:
          process.env.REACT_APP_HTTP_API_CONNECTION_TIMEOUT_SECOND,
        primaryColor: process.env.REACT_APP_PRIMARY_COLOR,
        filterTimeInMilliseconds:
          process.env.REACT_APP_FILTER_TIME_IN_MILLISECONDS,

        appBarLogo: require(`../img/${process.env.REACT_APP_APPBAR_LOGO}`),
        loginLogo: require(`../img/${process.env.REACT_APP_LOGIN_LOGO}`),
        footerLogo: require(`../img/${process.env.REACT_APP_FOOTER_LOGO}`),

        brandingName: process.env.REACT_APP_BRANDING_NAME,
        appVersion: process.env.REACT_APP_VERSION,
        appGitSha: process.env.REACT_APP_GIT_SHA,

        footerHeight: "50px",
        appBarHeight: "64px",
        sidebarWidth: "200px",

        homeTitle: "Home",
        zonesTitle: "Zones",
        groupsTitle: "Groups",
        serversTitle: "Servers",
        resourcesTitle: "Resources",
        specificQueriesTitle: "Specific Queries",
        usersTitle: "Users",

        groupsPerPageKey: "zmt-perpage-groups",
        resourcesPerPageKey: "zmt-perpage-resources",
        serversPerPageKey: "zmt-perpage-servers",
        usersPerPageKey: "zmt-perpage-users",
        defaultItemsPerPage: 25,

        pageTitle: "", // placeholder that gets filled on each page
        titleFormat: function () {
          return `${this.pageTitle} - ${this.brandingName}`;
        },
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
};

EnvironmentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useEnvironment = () => useContext(EnvironmentContext);
