import { useRef } from "react";
import styled from "styled-components";
import HeaderText from "../components/text/HeaderText";
import checkmark from "../components/images/checkmark.svg";
import {
  Icon,
  HintList,
  HintListItem,
  SubContainer,
  InstructionText,
  FormHeader,
  HintListItemText,
} from "../components/List";
import theme from "../theme";

const InCallWaitingRoom = ({ startTime, error, joinCall }) => {
  const inputRef = useRef(null);

  const handleSubmitNameForm = (e) => {
    e.preventDefault();
    if (!inputRef?.current) return;

    const username = inputRef.current.value?.trim();
    joinCall(username);
  };

  return (
    <Container>
      <SubContainer>
        <HeaderText>Welcome!</HeaderText>
        <InstructionText>
          Here are some things to know before we get started:
        </InstructionText>
        <HintList>
          {startTime && (
            <HintListItem>
              <Icon src={checkmark} />
              <HintListItemText>
                This call starts at: <StartTimeText>{startTime}</StartTimeText>
              </HintListItemText>
            </HintListItem>
          )}
          <HintListItem>
            <Icon src={checkmark} />
            <HintListItemText>
              Your camera and mic will be off during the entire call. (No one
              can see or hear you!)
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} />
            <HintListItemText>
              You can send chat messages to the Daily team during the call to
              ask questions
            </HintListItemText>
          </HintListItem>
          <HintListItem>
            <Icon src={checkmark} />
            <HintListItemText>
              We encourage you to use this call to clarify any questions you may
              have!
            </HintListItemText>
          </HintListItem>
        </HintList>
      </SubContainer>
      <Form onSubmit={handleSubmitNameForm}>
        <FormHeader>Before joining, please introduce yourself:</FormHeader>
        <Label htmlFor="username">Your name</Label>
        <Input ref={inputRef} id="username" type="text" required />
        <SubmitButton type="submit" value="Join our call" disabled={error} />
      </Form>
    </Container>
  );
};

const Container = styled.div`
  margin: 3rem 1rem 0;
  display: flex;

  @media (max-width: 996px) {
    flex-direction: column;
  }
`;
const Label = styled.label`
  font-size: ${theme.fontSize.base};
  color: ${theme.colors.greyDark};
  margin-top: 1rem;
  margin-bottom: 0.5rem;
`;
const Input = styled.input`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${theme.colors.grey};
  font-family: ${theme.fontFamily.regular};
`;
const SubmitButton = styled.input`
  padding: 0.4rem 1rem 0.5rem;
  border-radius: 6px;
  background-color: ${theme.colors.turquoise};
  border: 1px solid ${theme.colors.turquoise};
  color: ${theme.colors.blueDark};
  margin-top: 2rem;
  margin-left: auto;
  cursor: pointer;
  font-family: ${theme.fontFamily.bold};
  font-size: ${theme.fontSize.base};

  &:hover {
    border: 1px solid ${theme.colors.teal};
  }
  &:disabled {
    opacity: 0.5;
  }
`;
const StartTimeText = styled.span`
  color: ${theme.colors.green};
  font-family: ${theme.fontFamily.bold};
`;
const Form = styled.form`
  margin-top: 4rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 3rem;
  background-color: ${theme.colors.white};
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.06),
    0 16px 32px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;

  @media (max-width: 996px) {
    margin-left: 0rem;
  }
`;

export default InCallWaitingRoom;
