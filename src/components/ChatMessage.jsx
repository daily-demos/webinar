import React from "react";
import styled from "styled-components";
import theme from "../theme";

const ChatMessage = ({ chat }) => {
  // type = broadcast | toAdmin | toMember
  console.log(chat);
  return (
    <Container type={chat.type}>
      <Username>
        {chat.username}
        {chat.type === "toMember" || chat.type === "broadcast"
          ? " (Admin)"
          : ""}
      </Username>
      <Message>{chat.message}</Message>
    </Container>
  );
};

const Container = styled.div`
  background-color: ${(props) =>
    props.type === "broadcast"
      ? theme.colors.orangeLight
      : props.type === "toAdmin"
      ? theme.colors.cyanLight
      : theme.colors.greenLight};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin: 0.5rem
    ${(props) =>
      props.type === "broadcast" || props.type === "toMember" ? "2rem" : "0"}
    0.5rem ${(props) => (props.type === "toAdmin" ? "2rem" : "0")};
`;

const Username = styled.p`
  color: ${theme.colors.blueDark};
  font-size: ${theme.fontSize.small};
  font-weight: 600;
  margin: 0.2rem;
`;

const Message = styled.p`
  color: ${theme.colors.blueDark};
  font-size: ${theme.fontSize.base};
  margin: 0.2rem;
`;

export default ChatMessage;
