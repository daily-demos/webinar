import React from "react";
import styled from "styled-components";
import { Card } from "./Layout";
import BodyText from "./text/BodyText";
import HeaderText from "./text/HeaderText";
import theme from "../theme";
import Anchor from "./Anchor";

const AuRevoir = () => {
  return (
    <Container>
      <HeaderText>Thanks for joining us! 👋</HeaderText>
      <CardReducedMarginTop>
        <BodyText>
          For more information, please feel free to contact us{" "}
          <Anchor href="mailto:help@daily.co" color={theme.colors.orange}>
            help@daily.co
          </Anchor>
          .
        </BodyText>

        <BodyText>
          Sign up for a free account at{" "}
          <Anchor href="https://dashboard.daily.co" color={theme.colors.orange}>
            dashboard.daily.co
          </Anchor>{" "}
          and check out our{" "}
          <Anchor
            href="https://docs.daily.co/docs/reference-docs"
            color={theme.colors.orange}
          >
            docs
          </Anchor>{" "}
          a more detailed explanation of our APIs.
        </BodyText>
      </CardReducedMarginTop>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin-top: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const CardReducedMarginTop = styled(Card)`
  margin-top: 2rem;
  max-width: 800px;
  box-sizing: border-box;
`;

export default AuRevoir;
