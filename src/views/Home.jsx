import React from "react";
import { SubContainer, InstructionText, FormHeader } from "../components/List";
import { FlexContainer, RightPanel, Card } from "../components/Layout";
import HeaderText from "../components/text/HeaderText";
import theme from "../theme";
import Anchor from "../components/Anchor";
import BodyText from "../components/text/BodyText";

const Home = () => {
  return (
    <FlexContainer>
      <SubContainer>
        <HeaderText>Welcome!</HeaderText>
        <InstructionText>
          Thank you for checkout out our webinar demo.
        </InstructionText>
        <BodyText>
          This demo uses both an "admin" view and an "attendee" view. In order
          to join as an admin, and use this demo to it's full capabilities, you
          will need to run this demo locally and create an "owner" meeting
          token. Check out our{" "}
          <Anchor href="https://github.com/daily-demos/webinar">
            Github repository
          </Anchor>{" "}
          to learn more.
        </BodyText>
        <BodyText>
          In the meantime, you can test the attendee view by adding a room name
          at the end of the URL. For example,{" "}
          <Anchor href="/webinar">{window.location.origin}/webinar</Anchor>.
        </BodyText>
      </SubContainer>
      <RightPanel>
        <Card>
          <FormHeader>
            To learn about how to use the admin view, or how to run this
            locally, check out our{" "}
            <Anchor
              href="https://github.com/daily-demos/webinar"
              color={theme.colors.orange}
            >
              Github repository
            </Anchor>
            !
          </FormHeader>
        </Card>
      </RightPanel>
    </FlexContainer>
  );
};

export default Home;
