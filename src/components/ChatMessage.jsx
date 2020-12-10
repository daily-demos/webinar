import React from "react";
import styled from "styled-components";
import theme from "../theme";
import spyIcon from "./images/user-secret-solid.svg";

const ChatMessage = ({ chat }) => {
  // chat.type = broadcast | toAdmin | toMember | info | spy
  console.log(chat);
  return (
    <Container type={chat.type} from={chat.username}>
      {chat.type !== "info" && (
        <FlexRow>
          {chat.type === "spy" && <Icon src={spyIcon} />}
          <Username>{`${chat.username} to ${chat.to}`}</Username>
        </FlexRow>
      )}
      <Message type={chat.type}>{chat.message}</Message>
    </Container>
  );
};

const FlexRow = styled.div`
  display: flex;
`;

const Container = styled.div`
  background-color: ${(props) =>
    props.type === "info"
      ? `${theme.colors.white}50`
      : props.from === "Me"
      ? theme.colors.greyLight
      : theme.colors.cyanLight};
  border-radius: 6px;
  padding: ${(props) => (props.type === "info" ? "0" : "0.5rem 1rem")};
  margin: 0.5rem
    ${(props) =>
      props.type === "info" ? "0" : props.from === "Me" ? "2rem" : "0"}
    0.5rem
    ${(props) =>
      props.type === "info" ? "0" : props.from !== "Me" ? "2rem" : "0"};
`;

const Username = styled.p`
  color: ${theme.colors.blueDark};
  font-size: ${theme.fontSize.small};
  font-weight: 900;
  margin: 0.2rem 0;
  font-family: Graphik Medium, Arial, sans-serif;
`;

const Icon = styled.img`
  width: 0.5rem;
  margin-right: 0.2rem;
`;

const Message = styled.p`
  color: ${(props) =>
    props.type === "info" ? theme.colors.greyDark : theme.colors.blueDark};
  font-size: ${theme.fontSize.base};
  margin: 0.2rem 0;
  word-break: break-word;
`;

export default ChatMessage;
