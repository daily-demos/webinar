import React from "react";
import styled from "styled-components";
import theme from "../theme";
import { ChatInfo, MessageType } from "./Chat";
import spyIcon from "./images/user-secret-solid.svg";

type Props = {
  chat: ChatInfo;
  localParticipant: string;
};

const ChatMessage: React.FC<Props> = ({ chat, localParticipant }) => {
  return (
    <Container
      type={chat.type}
      isLocalParticipant={chat.from === localParticipant}
    >
      {chat.type !== "info" && chat.type !== "error" && (
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

const Container = styled.div<{
  type: MessageType;
  isLocalParticipant: boolean;
}>`
  background-color: ${(props) =>
    props.type === "info" || props.type === "error"
      ? `${theme.colors.white}`
      : props.isLocalParticipant
      ? theme.colors.greyLight
      : theme.colors.cyanLight};
  border-radius: 6px;
  padding: ${(props) =>
    ["info", "error"].includes(props.type) ? "0" : "0.5rem 1rem"};
  margin: 0.5rem
    ${(props) =>
      ["info", "error"].includes(props.type)
        ? "0"
        : props.isLocalParticipant
        ? "2rem"
        : "0"}
    0.5rem
    ${(props) =>
      ["info", "error"].includes(props.type)
        ? "0"
        : props.isLocalParticipant
        ? "0"
        : "2rem"};
`;

const Username = styled.p`
  color: ${theme.colors.blueDark};
  font-size: ${theme.fontSize.small};
  margin: 0.2rem 0;
  font-family: ${theme.fontFamily.bold};
`;

const Icon = styled.img`
  width: 0.5rem;
  margin-right: 0.2rem;
`;

const Message = styled.p<{ type: MessageType }>`
  color: ${(props) =>
    props.type === "info"
      ? theme.colors.greyDark
      : props.type === "error"
      ? theme.colors.redDark
      : theme.colors.blueDark};
  font-size: ${theme.fontSize.base};
  margin: 0.2rem 0;
  word-break: break-word;
`;

export default ChatMessage;
