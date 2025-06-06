export const WrenchIcon = ({ style }) => {
  if (style && style.fontSize)
    style.fontSize = `CALC(24 / 29.9375 * ${style.fontSize})`;
  return (
    <span style={{ fontSize: "CALC(24 / 29.9375 * 24px)", ...style }}>
      &#x1f527;
    </span>
  );
};

export const WarningIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x26A0;</span>
);

export const CheckIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x2713;</span>
);

export const ErrorIcon = ({ style }) => {
  if (style && style.fontSize)
    style.fontSize = `CALC(24 / 29.9375 * ${style.fontSize})`;
  return (
    <span style={{ fontSize: "CALC(24 / 29.9375 * 24px)", ...style }}>
      &#x1f6d1;
    </span>
  );
};

export const BlockIcon = ({ style }) => {
  if (style && style.fontSize)
    style.fontSize = `CALC(24 / 29.9375 * ${style.fontSize})`;
  return (
    <span style={{ fontSize: "CALC(24 / 29.9375 * 24px)", ...style }}>
      &#x1F6AB;
    </span>
  );
};

export const CancelIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x24e7;</span>
);

export const HighlightOffIcon = ({ style }) => {
  if (style && style.fontSize)
    style.fontSize = `CALC(24 / 29.9375 * ${style.fontSize})`;
  return (
    <span style={{ fontSize: "CALC(24 / 29.9375 * 24px)", ...style }}>
      &#x1f526;
    </span>
  );
};

export const CircularLoadingIndicator = ({ style }) => (
  <span className="infinite_spinning" style={{ fontSize: "24px", ...style }}>
    &#x25cc;
  </span>
);

export const CircleArrowIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x21bb;</span>
);

export const CloseIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x2a2f;</span>
);

export const EditIcon = ({ style }) => (
  <span className="rotate_180" style={{ fontSize: "24px", ...style }}>
    &#x2710;
  </span>
);

export const DoubleArrowRightIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#xbb;</span>
);

export const DoubleArrowDownIcon = ({ style }) => (
  <span className="rotate_90" style={{ fontSize: "24px", ...style }}>
    &#xbb;
  </span>
);

export const DoubleArrowUpIcon = ({ style }) => (
  <span className="rotate_270" style={{ fontSize: "24px", ...style }}>
    &#xbb;
  </span>
);

export const ArrowDownIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x2193;</span>
);

export const ArrowUpIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x2191;</span>
);

export const ArrowLeftIcon = ({ style }) => (
  <span style={{ fontSize: "24px", ...style }}>&#x2190;</span>
);
