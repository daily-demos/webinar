import React from "react";
import styled from "styled-components";
import theme from "../theme";

const Anchor = ({ children, href, underline = true }) => {
  return (
    <A
      underline={underline}
      href={href}
      target="_blank"
      rel="noreferrer nooppener"
    >
      {children}
    </A>
  );
};

const A = styled.a`
  text-decoration: none;
  color: ${theme.colors.blueDark};
  &:hover {
    text-decoration: ${(props) => (props.underline ? "underline" : "none")};
  }
`;

export default Anchor;
