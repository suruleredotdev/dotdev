import * as React from "react";

export const ExternalLinkIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <span
    className={className}
    style={{
      display: "inline",
      marginLeft: "0.3rem",
      fontSize: "0.75em",
      verticalAlign: "super",
    }}
  >
    ↗
  </span>
);
