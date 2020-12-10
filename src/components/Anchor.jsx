import React from "react";
import styled from "styled-components";
import theme from "../theme";

const Anchor = ({ children, href, underline = true, color }) => {
  return (
    <A
      underline={underline}
      href={href}
      target="_blank"
      rel="noreferrer nooppener"
      color={color || theme.colors.blueDark}
    >
      {children}
    </A>
  );
};

const A = styled.a`
  text-decoration: none;
  color: ${(props) => props.color};
  &:hover {
    text-decoration: ${(props) => (props.underline ? "underline" : "none")};
  }
`;

export default Anchor;
