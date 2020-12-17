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
import theme from "../theme";

type Props = {
  isAdmin: RegExpMatchArray | null;
};

const ErrorMessage: React.FC<Props> = ({ isAdmin }) => {
  return (
    <FlexContainer>
      <SubContainer>
        <HeaderText>Uh oh, this is embarrassing!</HeaderText>
        <InstructionText>
          It looks like you're trying to join a room that isn't available. This
          can happen if:
        </InstructionText>
        <HintList>
          <HintListItem>
            <Icon src={xIcon} alt="x icon" />
            <HintListItemText>
              The room doesn't exist. Please double check the link you're trying
              to visit.
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={xIcon} alt="x icon" />
            <HintListItemText>
              There was a problem connecting to the call. Please check your
              internet connection or refresh the page to try again.
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={xIcon} alt="x icon" />
            <HintListItemText>
              Additional issues that may have occured. Please consult our{" "}
              <Anchor
                href="https://help.daily.co/en/articles/2303117-top-troubleshooting-5-tips-that-solve-99-of-issues"
                color={theme.colors.orange}
              >
                help center article
              </Anchor>{" "}
              for more details.
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
            For more help, please contact our support team at{" "}
            <Anchor href="mailto:help@daily.co" color={theme.colors.orange}>
              help@daily.co
            </Anchor>
            .
          </FormHeader>
          <FormHeader>
            We ensure to respond quickly, especially during webinar times.
          </FormHeader>
        </Card>
      </RightPanel>
    </FlexContainer>
  );
};

export default ErrorMessage;
