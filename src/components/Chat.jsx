import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import theme from "../theme";
import HeaderText from "./text/HeaderText";
import BodyText from "./text/BodyText";
import ChatMessage from "./ChatMessage";

const Chat = ({ callFrame, accountType }) => {
  const welcomeMessage = {
    message:
      "Welcome! Please let us know if there's anything specific you'd like to learn about Daily video APIs",
    type: "info",
    username: null,
    to: null,
    from: null,
  };
  const [chatHistory, _setChatHistory] = useState(
    accountType === "admin" ? [] : [welcomeMessage]
  );
  const [adminSendToType, _setAdminSendToType] = useState("*");
  const [appMessageHandlerAdded, setAppMessageHandlerAdded] = useState(false);
  const chatHistoryRef = useRef(chatHistory);
  const adminSendToTypeRef = useRef(adminSendToType);
  const inputRef = useRef(null);
  const forceScrollRef = useRef(null);

  const updateChatHistory = (e) => {
    const participants = callFrame.participants();
    const username = participants[e.fromId].user_name;
    const { message, to, type, from } = e.data;
    console.log(e.data);
    setChatHistory([
      ...chatHistoryRef.current,
      {
        message,
        username,
        type,
        to,
        from,
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
      let toId = null;
      let toUsername = null;
      let toText = null;
      let type = null;

      const participants = callFrame.participants();
      console.log(adminSendToType);
      if (accountType === "admin") {
        toId = adminSendToType;
        toUsername =
          adminSendToType === "*" ? "everyone" : participants[toId].user_name;
      } else {
        const ids = Object.keys(participants);
        ids.forEach((id) => {
          if (participants[id]?.owner) {
            toId = participants[id].session_id;
            console.log(participants[id]);
            toUsername = participants[id].user_name;
          }
        });
      }

      if (accountType === "admin") {
        type = adminSendToType === "*" ? "broadcast" : "toMember";

        toText = adminSendToType === "*" ? "everyone" : toUsername;
      } else {
        type = "toAdmin";
        toText = "host(s)";
      }

      const from = participants?.local?.user_name;

      // send the message to others
      callFrame.sendAppMessage(
        {
          message: inputRef.current.value,
          from,
          to: toText,
          type,
        },
        toId
      );

      // add message to your local chat since messages don't get triggered when you're the sender
      setChatHistory([
        ...chatHistoryRef.current,
        {
          message: inputRef.current.value,
          username: "Me",
          type,
          to: toText,
          from,
        },
      ]);
      inputRef.current.value = "";
    }
  };

  const adminMessageSelectOnChange = (e) => {
    setAdminSendToType(e.target.value);
  };

  const scrollToBottom = () => {
    if (forceScrollRef?.current) {
      console.log("scrolling");
      forceScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(scrollToBottom, [chatHistory]);

  return (
    <FlexContainer>
      <SubHeaderText>
        {accountType === "admin"
          ? "Hey, you're now hosting a Daily call"
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
          <BodyText>Use the dropdown below to choose who to message.</BodyText>
        </>
      )}
      <Container>
        <ChatBox>
          {chatHistory.map((chat, i) => (
            <ChatMessage key={`chat-message-${i}`} chat={chat} />
          ))}
          <HiddenElForcesScroll ref={forceScrollRef} />
        </ChatBox>
        <Form onSubmit={submitMessage}>
          <Label htmlFor="messageInput">
            Message {accountType !== "admin" ? "Daily admin" : ""}
          </Label>
          <ChatInputContainer>
            <Input ref={inputRef} id="messageInput" type="text" />
            <ButtonContainer>
              {accountType === "admin" && callFrame?.participants() && (
                <Select onChange={adminMessageSelectOnChange}>
                  <option value="*">Everyone</option>
                  {Object.values(callFrame.participants()).map((p, i) => {
                    if (!p.owner) {
                      // only show participants for direct messages
                      return (
                        <option key={`participant-${i}`} value={p.session_id}>
                          {p.user_name}
                        </option>
                      );
                    }
                  })}
                </Select>
              )}

              <SubmitButton
                value={`Send ${
                  accountType !== "admin"
                    ? "to host"
                    : adminSendToType === "*"
                    ? "broadcast"
                    : "DM"
                }`}
                type="submit"
              />
            </ButtonContainer>
          </ChatInputContainer>
        </Form>
      </Container>
    </FlexContainer>
  );
};

const HiddenElForcesScroll = styled.div`
  font-size: 0;
  color: white;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  margin: 1rem;
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
  font-size: 0;
  color: ${theme.colors.white};
  visibility: hidden;
`;

const ChatInputContainer = styled.div`
  display: flex;
`;

const Select = styled.select`
  font-size: ${theme.fontSize.base};
  padding: 0.3rem 0.8rem;
  color: ${theme.colors.blueDark};
  background-color: #feaa2b;
  border-radius: 6px;
  border: none;
  margin-bottom: 0.5rem;
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
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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
  margin-left: auto;

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
