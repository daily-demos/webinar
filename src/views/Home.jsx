import React from "react";
import {
  HintList,
  HintListItem,
  Icon,
  SubContainer,
  InstructionText,
  FormHeader,
  HintListItemText,
} from "../components/List";
import { FlexContainer, RightPanel, Card } from "../components/Layout";
import HeaderText from "../components/text/HeaderText";
import BodyText from "../components/text/BodyText";
import checkmark from "../components/images/checkmark.svg";
import theme from "../theme";
import Anchor from "../components/Anchor";

const Home = () => {
  return (
    <FlexContainer>
      <SubContainer>
        <HeaderText>Welcome to Daily!</HeaderText>
        <InstructionText>
          We host regular webinars throughout the month to help answer any
          questions about:
        </InstructionText>
        <HintList>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              The multiple ways you can quickly integrate Daily's video call
              APIs into your app
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              How to use our dashboard to understand your call metrics, interact
              with our APIs, and more!
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              Any other topics you might be curious about
            </HintListItemText>
          </HintListItem>
        </HintList>
      </SubContainer>
      <RightPanel>
        <Card>
          <FormHeader>
            To sign up for one of our upcoming webinars, please contact our team
            at{" "}
            <Anchor href="mailto:help@daily.co" color={theme.colors.orange}>
              help@daily.co
            </Anchor>
          </FormHeader>
        </Card>
      </RightPanel>
    </FlexContainer>
  );
};

export default Home;
