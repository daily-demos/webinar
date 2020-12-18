import React from "react";
import styled from "styled-components";
import BodyText from "./text/BodyText";
import HeaderText from "./text/HeaderText";
import theme from "../theme";
import Anchor from "./Anchor";
import { FlexContainer, RightPanel, Card } from "./Layout";
import {
  HintList,
  HintListItem,
  Icon,
  SubContainer,
  InstructionText,
  FormHeader,
  HintListItemText,
} from "./List";
import checkmark from "../components/images/checkmark.svg";

const AuRevoir: React.FC = () => {
  return (
    <FlexContainer>
      <SubContainer>
        <HeaderText>Thanks for joining us! 👋</HeaderText>
        <HintList>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              <Anchor
                color={theme.colors.orange}
                href="https://www.daily.co/contact?utm_source=webinar"
              >
                Contact our Daily team anytime!
              </Anchor>{" "}
              We're glad to help.
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              <Anchor
                color={theme.colors.orange}
                href="https://dashboard.daily.co/signup?utm_source=webinar/"
              >
                Try the API free
              </Anchor>{" "}
              for yourself! No credit card required for our free tier.
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              Check out{" "}
              <Anchor
                href="https://docs.daily.co/docs?utm_source=webinar"
                color={theme.colors.orange}
              >
                Daily developer guide
              </Anchor>{" "}
              and{" "}
              <Anchor
                href="https://docs.daily.co/reference?utm_source=webinar"
                color={theme.colors.orange}
              >
                reference docs
              </Anchor>{" "}
              to learn more.
            </HintListItemText>
          </HintListItem>
        </HintList>
      </SubContainer>
    </FlexContainer>
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
