import React, { useEffect, useState, useRef } from "react";
import { useEnvironment, useAuthHook } from "../contexts";

export const Authenticate = ({ onAuthenticated }) => {
  const {
    httpApiLocation,
    loginLogo,
    brandingName,
    primaryColor,
    footerHeight,
  } = useEnvironment();

  const { setAuth } = useAuthHook();

  const [incorrect, setIncorrect] = useState(false);
  const [serverError, setServerError] = useState(false);

  const styles = {
    container: {
      maxWidth: "CALC(444em / 14)",
      padding: "0 CALC(24em / 14)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      margin: "0 auto",
      minHeight: `CALC(100vh - ${footerHeight})`,
    },

    main: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },

    logo: {
      maxWidth: "20em",
      marginBottom: "CALC(40em / 14)",
    },

    brandingName: {
      fontSize: "1.5rem",
      fontFamily: '"Roboto", "Helvetica", "Arial", "sans-serif"',
      fontWeight: "400",
      margin: 0,
    },

    form: {
      width: "100%",
    },

    input: {
      width: "100%",
      margin: "CALC(16em/14) 0 CALC(8em/14) 0",
      padding: "CALC(18.5em/14) 1em",
      boxSizing: "border-box",
      border: "1px solid rgba(0, 0, 0, 0.25)",
      borderRadius: "4px",
    },

    error: {
      color: "red",
      fontSize: 13,
    },

    warningsArea: {
      flexGrow: 1,
      paddingTop: `${((incorrect === false ? 1 : 0) + (serverError === false ? 1 : 0)) * 1.25}em`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: ".75em",
    },
  };

  const LoginButtonStyling = () => {
    return (
      <style>
        {`
.loginButton {
  width: 100%;
  box-sizing: border-box;
  background-color: ${primaryColor};
  padding: CALC(8em/14) CALC(22em/14);
  line-height: 1.75;
  border: 1px solid white;
  color: white;
  border-radius: 4px;
  }
.loginButton:hover {
  background-color: color-mix(in srgb, black, ${primaryColor} 90%);
}
.loginButton:active {
  background-color: color-mix(in srgb, black, ${primaryColor} 80%);
}
.loginButtonStyling {
  marginTop: 2.5em;
}
      `}
      </style>
    );
  };

  const usernameRef = React.useRef();
  const passwordRef = React.useRef();

  async function handleAuthenticate(e) {
    e.preventDefault();
    setServerError(false);
    setIncorrect(false);

    let resStatus = 0;
    fetch(`${httpApiLocation}/authenticate`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(usernameRef.current.value + ":" + passwordRef.current.value)}`,
      },
    })
      .then((res) => {
        if (res.ok && res.status === 200) {
          res.text().then((token) => {
            setAuth({
              username: usernameRef.current.value,
              token: token,
            });
          });
        } else if (res.status === 401) {
          setIncorrect(true);
        }
      })
      .catch((err) => {
        setServerError(true);
      });
  }

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <img alt="iRODS Logo" style={styles.logo} src={loginLogo} />
        <h4 style={styles.brandingName}>{brandingName}</h4>
        <form style={styles.form} onSubmit={handleAuthenticate}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username *"
            ref={usernameRef}
            autoComplete="username"
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password *"
            ref={passwordRef}
            autoComplete="current-password"
            required
          />

          <div style={styles.warningsArea}>
            {serverError === false ? null : (
              <span style={styles.error}>
                Server error. Please check the Client HTTP API Connection.
              </span>
            )}
            {incorrect === false ? null : (
              <span style={styles.error}>
                Incorrect username or password. Please try again.
              </span>
            )}
          </div>

          <LoginButtonStyling />
          <button className="loginButton" type="submit">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
};
