import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import theme from "../theme";
import HeaderText from "./text/HeaderText";
import BodyText from "./text/BodyText";
import ChatMessage from "./ChatMessage";

const Chat = ({ callFrame, accountType }) => {
  const welcomeMessage = {
    message:
      "Welcome! Please let us know if you have any questions through this chat. (Messages you send can only be seen by the host.)",
    type: "info",
    username: null,
  };
  const [chatHistory, _setChatHistory] = useState(
    accountType === "admin" ? [] : [welcomeMessage]
  );
  const [adminSendToType, _setAdminSendToType] = useState("*");
  const [appMessageHandlerAdded, setAppMessageHandlerAdded] = useState(false);
  const chatHistoryRef = useRef(chatHistory);
  const adminSendToTypeRef = useRef(adminSendToType);
  const inputRef = useRef();

  const updateChatHistory = (e) => {
    const participants = callFrame.participants();
    const username = participants[e.fromId].user_name;
    const { message, to } = e.data;
    console.log(to);
    setChatHistory([
      ...chatHistoryRef.current,
      {
        message,
        username,
        type:
          accountType === "admin"
            ? "toAdmin"
            : to === "*"
            ? "broadcast"
            : "toMember",
      },
    ]);
  };

  useEffect(() => {
    if (callFrame && !appMessageHandlerAdded) {
      callFrame.on("app-message", updateChatHistory);
      setAppMessageHandlerAdded(true);
    }
  }, [callFrame]);

  const setChatHistory = (history) => {
    // use ref to chat history so state values in event handlers are current
    chatHistoryRef.current = history;
    _setChatHistory(history);
  };
  const setAdminSendToType = (type) => {
    adminSendToTypeRef.current = type;
    _setAdminSendToType(type);
  };

  const submitMessage = (e) => {
    e.preventDefault();
    if (callFrame && inputRef.current) {
      let to = null;
      if (accountType === "admin") {
        to = accountType === "admin" ? adminSendToType : "toAdmin";
      } else {
        const participants = callFrame.participants();
        const ids = Object.keys(participants);
        ids.forEach((id) => {
          if (participants[id]?.owner) {
            console.log("in");
            to = participants[id].session_id;
          }
        });
      }
      callFrame.sendAppMessage(
        {
          message: inputRef.current.value,
        },
        to
      );
      setChatHistory([
        ...chatHistoryRef.current,
        {
          message: inputRef.current.value,
          username: "Me",
          type:
            accountType === "admin"
              ? adminSendToType === "*"
                ? "broadcast"
                : "toMember"
              : "toAdmin",
        },
      ]);
      inputRef.current.value = "";
    }
  };

  const adminMessageSelectOnChange = (e) => {
    setAdminSendToType(e.target.value);
  };

  return (
    <FlexContainer>
      <SubHeaderText>
        {accountType === "admin"
          ? "Hey, you're now hosting a Daily webinar"
          : "Have a question about Daily?"}
      </SubHeaderText>
      {accountType !== "admin" ? (
        <>
          <SubText>
            Message us here during the webinar and we'll answer during the Q&A
            period!
          </SubText>
        </>
      ) : (
        <>
          <BodyText>
            Remember, participants can message you directly but they can't see
            each other's messages.
          </BodyText>
          <BodyText>
            Use the dropdown below to choose to broadcast or directly message a
            participant. (Broadcast is the default!)
          </BodyText>
        </>
      )}
      <Container>
        <ChatBox>
          {chatHistory.map((chat, i) => (
            <ChatMessage key={`chat-message-${i}`} chat={chat} />
          ))}
        </ChatBox>
        <Form onSubmit={submitMessage}>
          <Label htmlFor="messageInput">
            Message {accountType !== "admin" ? "Daily admin" : ""}
          </Label>
          <ChatInputContainer>
            <Input ref={inputRef} id="messageInput" type="text" />
            <ButtonContainer>
              {accountType === "admin" && callFrame?.participants() && (
                <select onChange={adminMessageSelectOnChange}>
                  <option value="*">Everyone</option>
                  {Object.values(callFrame.participants()).map((p) => {
                    if (!p.owner) {
                      // only show participants for direct messages
                      return (
                        <option value={p.session_id}>{p.user_name}</option>
                      );
                    }
                  })}
                </select>
              )}

              <SubmitButton value="Send" type="submit" />
            </ButtonContainer>
          </ChatInputContainer>
        </Form>
      </Container>
    </FlexContainer>
  );
};

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
  flex: 1;

  @media (min-width: 996px) {
    height: 100%;
  }
`;

const ChatBox = styled.div`
  flex: 1;
  padding: 1rem;
  border: 2px solid ${theme.colors.greyLight};
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  background-color: ${theme.colors.white};
  overflow: scroll;
`;

const SubHeaderText = styled(HeaderText)`
  font-size: ${theme.fontSize.xlarge};
`;
const SubText = styled(BodyText)`
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;
const Form = styled.form`
  position: relative;
  border-radius: 0 0 6px 6px;
  border: 1px solid ${theme.colors.greyLight};
`;

const Label = styled.label`
  position: absolute;
  font-size: ${theme.fontSize.small};
  padding: 0.2rem;
  color: ${theme.colors.greyDark};
  visibility: hidden;
`;

const ChatInputContainer = styled.div`
  display: flex;
`;
const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  line-height: 22px;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  border: none;
  resize: none;

  &:focus {
    outline: none;
    border: 2px solid ${theme.colors.greenLight};
  }
`;
const ButtonContainer = styled.div`
  padding: 5px;
`;
const SubmitButton = styled.input`
  font-size: ${theme.fontSize.base};
  padding: 0.3rem 0.8rem;
  color: ${theme.colors.blueDark};
  background-color: ${theme.colors.turquoise};
  border-radius: 6px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;

  &:hover {
    border: 1px solid ${theme.colors.teal};
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 300px;
  min-height: 300px;
  height: 100%;
  background-color: ${theme.colors.white};
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.06),
    0 16px 32px rgba(0, 0, 0, 0.06);
`;

export default Chat;
