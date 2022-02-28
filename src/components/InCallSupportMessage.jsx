import Anchor from "../components/Anchor";
import BodyText from "../components/text/BodyText";
import styled from "styled-components";
import theme from "../theme";

const InCallSupportMessage = () => (
  <FlexRow>
    <HelpText>
      Having trouble connecting?{" "}
      <Anchor
        href="https://help.daily.co/en/articles/2303117-top-troubleshooting-5-tips-that-solve-99-of-issues"
        color={theme.colors.orange}
      >
        Try these fast tips
      </Anchor>
      , or{" "}
      <Anchor
        href="https://www.daily.co/contact/support?utm_source=webinar"
        color={theme.colors.orange}
      >
        contact our support
      </Anchor>{" "}
      via chat or email.
    </HelpText>
    <Flex1>_</Flex1>
  </FlexRow>
);

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;

  @media (max-width: 996px) {
    flex-direction: column;
  }
`;
const HelpText = styled(BodyText)`
  flex: 1.7;
  margin: 1rem;
`;
const Flex1 = styled.div`
  flex: 1;
  font-size: 0;
  color: transparent;
`;

export default InCallSupportMessage;
