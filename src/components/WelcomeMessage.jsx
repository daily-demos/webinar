import React from "react";
import styled from "styled-components";
import theme from "../theme";

const WelcomeMessage = () => {
  return <Container>{/* <Title>Welcome!</Title> */}</Container>;
};

const Container = styled.div``;

const Title = styled.h2`
  color: ${theme.colors.orange};
  font-size: ${theme.fontSize.base};
  margin-bottom: 2rem;
`;

export default WelcomeMessage;
