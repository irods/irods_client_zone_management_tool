import React from "react";
import { useEnvironment, useAuthHook } from "../contexts";

const InfoListItem = (props) => {
  const { name, value } = props;
  return (
    <li>
      <span
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {name + ": "}

        {/^\/static\/media\//.test(value) ? (
          <img
            style={{
              height: "2em",
              width: "auto",
              marginLeft: "0.25em",
            }}
            alt="appbarLogo"
            src={value}
          ></img>
        ) : /^\#[0-9a-fA-F]{6}/.test(value) ? (
          <span
            style={{
              aspectRatio: 1,
              backgroundColor: `${value}`,
              height: "1em",
              marginLeft: "0.25em",
            }}
          />
        ) : typeof value == "undefined" ? (
          "undefined"
        ) : typeof value == "number" ? (
          value.toString()
        ) : value == "" ? (
          '""'
        ) : !Number.isNaN(Number(value)) ? (
          value
        ) : typeof value == "function" ? (
          <i style={{ marginLeft: "0.25em" }}>func</i>
        ) : (
          `"${value.toString()}"`
        )}
      </span>
    </li>
  );
};

const ContextInfoList = (props) => {
  const { context, headingText } = props;
  return (
    <ul>
      <li>
        <h2>{`${headingText}:`}</h2>
      </li>
      {context &&
        Object.keys(context).map((key, index) => (
          <InfoListItem name={key} value={context[key]} />
        ))}
    </ul>
  );
};

export const DebugInfo = () => {
  const environment = useEnvironment();
  const authHook = useAuthHook();
  return (
    <div>
      <ContextInfoList headingText={"Environment"} context={environment} />
      <ContextInfoList headingText={"Auth Hook"} context={authHook} />
    </div>
  );
};
