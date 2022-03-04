import Anchor from "../components/Anchor";
import BodyText from "../components/text/BodyText";
import styled from "styled-components";
import theme from "../theme";

const InCallSupportMessage = () => (
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
);

const HelpText = styled(BodyText)`
  margin: 1rem;
`;

export default InCallSupportMessage;
