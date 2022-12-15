import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import theme from "../theme";
import HeaderText from "./text/HeaderText";
import BodyText from "./text/BodyText";
import ChatMessage from "./ChatMessage";
import { ACCOUNT_TYPE } from "../constants";

const Chat = ({ callFrame, accountType, username }) => {
  const welcomeMessage = {
    message:
      accountType === ACCOUNT_TYPE.ADMIN
        ? "Chat messages will display here."
        : "Only the Daily team can see your message. We'll answer during the Q&A period.",
    type: "info",
    username: null,
    to: null,
    from: null,
  };
  const [chatHistory, _setChatHistory] = useState([welcomeMessage]);
  const [adminSendToType, _setAdminSendToType] = useState("*");
  const chatHistoryRef = useRef(chatHistory);
  const adminSendToTypeRef = useRef(adminSendToType);
  const inputRef = useRef(null);
  const forceScrollRef = useRef(null);

  const setChatHistory = useCallback(
    (history) => {
      // use ref to chat history so state values in event handlers are current
      chatHistoryRef.current = history;
      _setChatHistory(history);
    },
    [chatHistoryRef]
  );

  /**
   * DAILY APP-MESSAGE EVENT
   * Add callback for any app messages received
   */
  useEffect(() => {
    if (!callFrame) return;
    const updateChatHistory = (e) => {
      const participants = callFrame.participants();
      const username = participants[e.fromId].user_name;
      const { message, to, type, from } = e.data;
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

    callFrame.on("app-message", updateChatHistory);

    return () => callFrame.off("app-message", updateChatHistory);
  }, [callFrame, setChatHistory]);

  const setAdminSendToType = useCallback(
    (type) => {
      adminSendToTypeRef.current = type;
      _setAdminSendToType(type);
    },
    [adminSendToTypeRef]
  );

  const submitMessage = useCallback(
    (e) => {
      if (!callFrame) return;
      e.preventDefault();
      let sendToList = [];

      const participants = callFrame.participants();
      const from = participants?.local?.user_id;
      // if you're an admin you're either sending a direct message to one person or a broadcast message

      if (accountType === ACCOUNT_TYPE.ADMIN) {
        if (adminSendToType === "*") {
          // a broadcast message is sent once to everyone in the call (except the sender)
          sendToList = [
            {
              id: adminSendToType,
              username: "Everyone",
              type: "broadcast",
              to: "Everyone",
              from,
            },
          ];
        } else {
          // if it's not a broadcast message, it's a direct message to an attendee
          sendToList = [
            {
              id: adminSendToType,
              username: participants[adminSendToType].user_name,
              type: "toMember",
              to: participants[adminSendToType].user_name,
              from,
            },
          ];
          // we also cc the other admins on direct messages to attendees so they can follow the convo and take over if needed
          const ids = Object.keys(participants);
          ids.forEach((id) => {
            if (participants[id]?.owner) {
              sendToList.push({
                id: participants[id].session_id,
                username: participants[adminSendToType].user_name,
                type: "spy",
                to: participants[adminSendToType].user_name,
                from,
              });
            }
          });
        }
      }
      // otherwise, you're an attendee trying to message a host
      else {
        // attendees' messages are sent to the host(s), which could be 1 or more participants
        const ids = Object.keys(participants);
        ids.forEach((id) => {
          if (participants[id]?.owner) {
            sendToList.push({
              id: participants[id].session_id,
              username: participants[id].user_name,
              type: "toAdmin",
              to: "Host(s)",
              from,
            });
          }
        });
      }

      // If a attendee sends a message and there's not host, there's no one to receive it. :(
      // Show an error message in the chat instead
      if (!sendToList.length) {
        setChatHistory([
          ...chatHistoryRef.current,
          {
            message:
              "At least one admin must be present before the chat can be used.",
            username: participants?.local?.user_name || "Me",
            type: "error",
            to: null,
            from,
          },
        ]);
        return;
      }

      /**
       * Iterate through the list of people who need to receive the message
       * and send with Daily's sendAppMessage method
       */
      sendToList.forEach((p) => {
        callFrame.sendAppMessage(
          {
            message: inputRef.current && inputRef.current.value,
            from,
            to: p.to,
            type: p.type,
            username: p.username,
          },
          p.id
        );
      });

      /**
       * Add the message to your local chat too to keep your chat history up-to-date.
       * (app-messages are not received by the sender so you need to update your own chat.)
       */
      //
      setChatHistory([
        ...chatHistoryRef.current,
        {
          message: inputRef?.current?.value,
          username,
          type: sendToList[0].type,
          to: sendToList[0].to,
          from,
        },
      ]);

      // Reset the chat input value after sending
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [accountType, adminSendToType, callFrame, setChatHistory, username]
  );

  const adminMessageSelectOnChange = useCallback(
    (e) => {
      setAdminSendToType(e.target.value);
    },
    [setAdminSendToType]
  );

  const scrollToBottom = useCallback(() => {
    if (forceScrollRef?.current) {
      forceScrollRef.current.scrollTop =
        forceScrollRef.current.scrollHeight -
        forceScrollRef.current.clientHeight;
    }
  }, [forceScrollRef]);

  useEffect(scrollToBottom, [chatHistory, scrollToBottom]);

  const onTextAreaEnterPress = useCallback(
    (e) => {
      if (e.keyCode === 13 && e.shiftKey === false) {
        e.preventDefault();
        submitMessage(e);
      }
    },
    [submitMessage]
  );

  const exportChat = useCallback(() => {
    const historyStr = chatHistory
      .map((item) => Object.values(item).toString())
      .join("\n");
    const csvContent = `data:text/csv;charset=utf-8,${historyStr}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `webinar-chat_${new Date()}.csv`);
    document.body.appendChild(link);

    link.click();
  }, [chatHistory]);

  return (
    <ChatContainer>
      <FlexContainer>
        <SubHeaderText>{username ? `Hey ${username}!` : "Hey!"}</SubHeaderText>
        {accountType === ACCOUNT_TYPE.ATTENDEE ? (
          <SubText>
            Have a question about the Daily API? Send a chat message below!
          </SubText>
        ) : (
          <BodyText>
            You're hosting a call. Broadcast messages and DMs are available.
          </BodyText>
        )}
        {accountType === ACCOUNT_TYPE.ADMIN && (
          <ExportButtonContainer>
            <ExportButton onClick={exportChat}>Export Chat</ExportButton>
          </ExportButtonContainer>
        )}
        <Container>
          <ChatBox ref={forceScrollRef}>
            {chatHistory.map((chat, i) => (
              <ChatMessage
                key={`chat-message-${i}`}
                chat={chat}
                localParticipant={
                  callFrame ? callFrame.participants()?.local?.user_id : ""
                }
              />
            ))}
          </ChatBox>
          <Form onSubmit={submitMessage}>
            <Label htmlFor="messageInput">
              Message{" "}
              {accountType === ACCOUNT_TYPE.ATTENDEE ? "Daily admin" : ""}
            </Label>
            <ChatInputContainer>
              <Textarea
                ref={inputRef}
                id="messageInput"
                placeholder="Enter your message..."
                onKeyDown={onTextAreaEnterPress}
              />
              <ButtonContainer>
                {accountType === ACCOUNT_TYPE.ADMIN &&
                  callFrame?.participants() && (
                    <Select onChange={adminMessageSelectOnChange}>
                      <option value="*">Everyone</option>
                      {Object.values(callFrame.participants()).map((p, i) => {
                        if (!p.owner) {
                          // only show attendees for direct messages
                          return (
                            <option
                              key={`participant-${i}`}
                              value={p.session_id}
                            >
                              {p.user_name}
                            </option>
                          );
                        }
                        return null;
                      })}
                    </Select>
                  )}

                <SubmitButton
                  value={`Send ${
                    accountType === ACCOUNT_TYPE.ATTENDEE
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
    </ChatContainer>
  );
};

const ChatContainer = styled.div`
  flex: 1;
  margin: 1rem;
  height: ${(props) => props.height}px;
`;
const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  @media (max-width: 1075px) {
    height: 250px;
  }
`;

const ChatBox = styled.div`
  flex: 1;
  padding: 1rem;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  background-color: ${theme.colors.white};
  overflow-y: scroll;
`;

const SubHeaderText = styled(HeaderText)`
  font-size: ${theme.fontSize.xlarge};
`;
const SubText = styled(BodyText)`
  margin-bottom: 0.5rem;
`;

const ExportButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
`;

const ExportButton = styled.button`
  display: block;
  padding: 0.4rem 1rem 0.5rem;
  background-color: ${theme.colors.white};
  color: ${theme.colors.blueDark};
  font-size: ${theme.fontSize.base};
  border-radius: 6px;
  border: 1px solid ${theme.colors.grey};
  font-family: ${theme.fontFamily.bold};
  cursor: pointer;

  &:hover {
    border: 1px solid ${theme.colors.greyDark};
  }
`;
const Form = styled.form`
  position: relative;
  border-radius: 0 0 6px 6px;
  border-top: 1px solid ${theme.colors.greyLight};
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
  max-width: 120px;
  font-size: ${theme.fontSize.base};
  padding: 0.3rem 0.8rem;
  color: ${theme.colors.blueDark};
  background-color: #feaa2b;
  border-radius: 6px;
  border: none;
  margin-bottom: 0.5rem;
`;
const Textarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  line-height: 22px;
  padding-left: 0.5rem;
  padding-right: 0.25rem;
  border: 2px solid transparent;
  resize: none;
  font-family: ${theme.fontFamily.regular};

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
  font-family: ${theme.fontFamily.bold};
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
  min-height: 200px;
  height: 100%;
  background-color: ${theme.colors.white};
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.06),
    0 16px 32px rgba(0, 0, 0, 0.06);
`;

export default Chat;
