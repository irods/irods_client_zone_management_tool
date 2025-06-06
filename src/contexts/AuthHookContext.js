import { useEffect, useState, createContext, useContext } from "react";
import { Authenticate } from "../views";
import PropTypes from "prop-types";

const AuthHookContext = createContext();

export const AuthHookProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("zmt-token"),
    username: localStorage.getItem("zmt-username"),
  });

  useEffect(() => {
    localStorage.setItem("zmt-username", auth.username);
    localStorage.setItem("zmt-token", auth.token);
  }, [auth]);

  const logout = () => {
    localStorage.removeItem("zmt-username");
    localStorage.removeItem("zmt-token");
    localStorage.removeItem("zmt-inactiveChecks");
    localStorage.removeItem("zmt-checkIntervals");
    setAuth({ username: null, token: null });
  };

  if (!auth.token || auth.token === "null") {
    window.history.pushState(null, null, "/");
  }

  return (
    <AuthHookContext.Provider
      value={{
        auth: auth,
        setAuth: setAuth,
        logout: logout,
      }}
    >
      {!auth.token || auth.token === "null" ? <Authenticate /> : children}
    </AuthHookContext.Provider>
  );
};

AuthHookProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthHook = () => useContext(AuthHookContext);
