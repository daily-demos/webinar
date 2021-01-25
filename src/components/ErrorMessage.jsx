import React from "react";
import Anchor from "./Anchor";
import BodyText from "./text/BodyText";
import HeaderText from "./text/HeaderText";
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
import xIcon from "../components/images/xIcon.svg";
import rightArrow from "../components/images/right-arrow.svg";
import theme from "../theme";
import styled from "styled-components";

const ErrorMessage = ({ isAdmin, error, goBack }) => {
  console.log(error);
  return (
    <div>
      <FlexContainer>
        <SubContainer>
          <HeaderText>Uh oh! This is embarrassing!</HeaderText>

          <InstructionText>
            It looks like you're trying to join a room that isn't available.
            This can happen if:
          </InstructionText>
          <HintList>
            <HintListItem>
              <Icon src={xIcon} alt="x icon" />
              <HintListItemText>
                The room doesn't exist. Please double check the link you're
                trying to visit.
              </HintListItemText>
            </HintListItem>
            <HintListItem>
              <Icon src={xIcon} alt="x icon" />
              <HintListItemText>
                There was a problem connecting to the call. Please check your
                Internet connection or refresh the page
              </HintListItemText>
            </HintListItem>
            <HintListItem>
              <Icon src={xIcon} alt="x icon" />
              <HintListItemText>
                Additional issues have occurred. Get fast troubleshooting tips{" "}
                <Anchor
                  href="https://help.daily.co/en/articles/2303117-top-troubleshooting-5-tips-that-solve-99-of-issues"
                  color={theme.colors.orange}
                >
                  here
                </Anchor>
                .
              </HintListItemText>
            </HintListItem>
          </HintList>
          {isAdmin && (
            <BodyText>
              (Psst... It looks like you're an admin trying to join your webinar
              call. Make sure the room name is right and your meeting token is
              valid, or generate a new meeting token{" "}
              <Anchor
                href="https://admin-daily-webinar.netlify.app/"
                color={theme.colors.orange}
              >
                here
              </Anchor>
              .)
            </BodyText>
          )}
        </SubContainer>
        <RightPanel>
          <Card>
            <FormHeader>
              For more help,{" "}
              <Anchor
                href="https://www.daily.co/contact/support?utm_source=webinar"
                color={theme.colors.orange}
              >
                contact our support
              </Anchor>{" "}
              via chat or email.
            </FormHeader>
            <FormHeader>
              We respond quickly, especially during webinar times.
            </FormHeader>
          </Card>
        </RightPanel>
      </FlexContainer>
      {error && <ErrorText>Error: {error}</ErrorText>}
      <IconContainer onClick={goBack}>
        <ArrowIcon src={rightArrow} alt=" " />
        <BodyText>Go back</BodyText>
      </IconContainer>
    </div>
  );
};

const ErrorText = styled(InstructionText)`
  color: ${theme.colors.red};
  margin: 0 1rem;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 1rem;
  cursor: pointer;
`;

const ArrowIcon = styled.img`
  width: 16px;
  transform: rotate(180deg);
  margin-right: 0.25rem;
`;

export default ErrorMessage;
