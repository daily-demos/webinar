import React from "react";
import styled from "styled-components";
import Anchor from "./Anchor";
import BodyText from "./text/BodyText";
import HeaderText from "./text/HeaderText";

const ErrorMessage = ({ isAdmin }) => {
  return (
    <Container>
      <HeaderText>Uh oh, this is embarrassing!</HeaderText>
      <BodyText>
        Please try refreshing the page, checking the URL you're trying to visit,
        or <Anchor href="mailto:help@daily.co">contact support</Anchor> and
        we'll get back to you right away.
      </BodyText>
      <BodyText>
        In the meantime, here is a{" "}
        <Anchor href="mailto:help@daily.co">help center article</Anchor> that
        has some common issues that come up.
      </BodyText>
      {isAdmin && (
        <BodyText>
          (Psst... It looks like you're an admin trying to join your webinar
          call. Make sure the room name is right and your meeting token is
          valid, or generate a new meeting token.)
        </BodyText>
      )}
    </Container>
  );
};

const Container = styled.div``;

export default ErrorMessage;
