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
import checkmark from "../components/images/checkmark.svg";
import theme from "../theme";
import Anchor from "../components/Anchor";

const Home = () => {
  return (
    <FlexContainer>
      <SubContainer>
        <HeaderText>Welcome!</HeaderText>
        <InstructionText>
          We host regular webinars to help answer questions about:
        </InstructionText>
        <HintList>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              Different ways to integrate video quickly with Daily APIs
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              Using your dashboard or /logs endpoint to get call logs and call
              quality data
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} alt="checkmark" />
            <HintListItemText>
              Anything you’d like to ask about!
            </HintListItemText>
          </HintListItem>
        </HintList>
      </SubContainer>
      <RightPanel>
        <Card>
          <FormHeader>
            To learn about upcoming webinars,{" "}
            <Anchor
              href="https://www.daily.co/contact/support?utm_source=webinar"
              color={theme.colors.orange}
            >
              contact us!
            </Anchor>
          </FormHeader>
        </Card>
      </RightPanel>
    </FlexContainer>
  );
};

export default Home;
