import React from "react";
import styled from "styled-components";
import Anchor from "./Anchor";
import BodyText from "./text/BodyText";
import HeaderText from "./text/HeaderText";

const ErrorMessage = () => {
  return (
    <Container>
      <HeaderText>Uh oh, something went wrong!</HeaderText>
      <BodyText>
        Please try refreshing the page or{" "}
        <Anchor href="mailto:help@daily.co">contact support</Anchor> and we'll
        get back to you right away.
      </BodyText>
    </Container>
  );
};

const Container = styled.div``;

export default ErrorMessage;
