import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import DailyIframe from "@daily-co/daily-js";
import styled from "styled-components";
import Chat from "../components/Chat";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import HeaderText from "../components/text/HeaderText";
import BodyText from "../components/text/BodyText";
import { useParams, useLocation } from "react-router-dom";
import checkmark from "../components/images/checkmark.svg";
import theme from "../theme";
import {
  Icon,
  HintList,
  HintListItem,
  SubContainer,
  InstructionText,
  FormHeader,
} from "../components/List";
import Anchor from "../components/Anchor";

const WebinarCall = () => {
  const videoRef = useRef(null);
  const inputRef = useRef();
  const emailRef = useRef();
  const companyRef = useRef();

  const [currentView, setCurrentView] = useState("loading"); // loading | call | waiting | error
  const [callFrame, setCallFrame] = useState(null);
  const [height, setHeight] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null); // {token?: string, accountType: 'participant' | 'admin', username: string, url: string }
  const [startTime, setStartTime] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { roomName } = useParams();
  const { search } = useLocation();

  useEffect(() => {
    if (roomInfo) return;
    if (currentView === "loading") {
      fetch(`https://daily-webinar.netlify.app/api/rooms/${roomName}`, {})
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          if (res.error) {
            setCurrentView("error");
            return;
          }
          if (res.config?.nbf) {
            console.log(res.config?.nbf);
            setStartTime(new Date(res.config?.nbf * 1000).toUTCString());
          }
        })
        .catch((err) => setCurrentView("error"));

      if (search && search.match(/^[?t=*+]/)) {
        const token = search.replace("?t=", "");
        console.log("setting admin");
        fetch(`https://daily-webinar.netlify.app/api/meeting-tokens/${token}`)
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
            if (res.is_owner && res.room_name === roomName) {
              // add admin setting
              setRoomInfo({
                token,
                username: res.user_name,
                url: `${baseUrl}${roomName}?t=${token}`,
                accountType: "admin",
              });
            } else {
              setCurrentView("error");
            }
          })
          .catch((err) => console.log(err));
      } else {
        console.log("setting participant");
        setRoomInfo({
          token: null,
          username: null,
          url: `${baseUrl}${roomName}`,
          accountType: "participant",
        });
      }
    }
  }, [currentView]);

  const submitName = (e) => {
    e.preventDefault();
    if (inputRef?.current && emailRef?.current && companyRef?.current) {
      /* 
        Google form values
        "entry.1667022758": inputRef.current.value,
        "entry.2075101699": emailRef.current.value,
        "entry.1964318055": companyRef.current.value,
      */

      setSubmitting(true);
      fetch(
        `https://docs.google.com/forms/u/0/d/e/1FAIpQLSddqD1Q5W4Fatf0Px38ysFrC3COgS-PqAfjIXf6qnCgKfzZKg/formResponse?entry.1667022758=${inputRef.current.value}&entry.2075101699=${emailRef.current.value}&entry.1964318055=${companyRef.current.value}&submit=Submit`,
        {
          method: "GET",
          mode: "no-cors",
        }
      )
        .then(() => {
          console.log("setting room info");
          setRoomInfo({
            ...roomInfo,
            username: inputRef.current.value?.trim(),
          });
          setSubmitting(false);
        })
        .catch((err) => {
          // todo handle error
          console.log(err);
          setSubmitting(false);
        });
    }
  };

  const CALL_OPTIONS = {
    iframeStyle: {
      width: "100%",
      height: "100%",
      border: "1px solid #e6eaef",
      borderRadius: "6px 6px 0 0",
      boxShadow: `0 1px 2px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02),
      0 4px 8px rgba(0, 0, 0, 0.02), 0 8px 16px rgba(0, 0, 0, 0.02),
      0 16px 32px rgba(0, 0, 0, 0.02)`,
    },
    showLeaveButton: true,
    showFullscreenButton: true,
  };

  useEffect(() => {
    if (!videoRef || !videoRef?.current || !roomInfo) return;
    if (!roomInfo?.username) {
      setCurrentView("waiting");
      return;
    } // needs to be entered by participant
    console.log(callFrame);
    if (!callFrame) {
      CALL_OPTIONS.url = roomInfo?.url;
      const newCallFrame = DailyIframe.createFrame(
        videoRef.current,
        CALL_OPTIONS
      );
      setCallFrame(newCallFrame);
      newCallFrame
        .join({ userName: roomInfo?.username })
        .then(() => {
          updateSize();
          setCurrentView("call");
          console.log("joined meeting");
        })
        .catch((err) => {
          console.log(err);
          if (
            !!err &&
            err === "This room is not available yet, please try later"
          ) {
            setCurrentView("waiting");
          } else {
            setCurrentView("error");
          }
        });
    }
    return () => {
      console.log("destroy");
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, [roomInfo, videoRef]);

  let timeout = null;
  const updateSize = () => {
    if (videoRef?.current) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
      }, 100);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [callFrame]);

  return (
    <FlexContainerColumn>
      <FlexContainer>
        {currentView === "loading" && <Loading />}
        {currentView === "error" && (
          <ErrorMessage isAdmin={search.match(/^[?t=*+]/)} />
        )}
        {currentView === "waiting" && (
          <WaitingRoom>
            <SubContainer>
              <HeaderText>Welcome to Daily!</HeaderText>
              <InstructionText>
                Here are some things to know before we get started:
              </InstructionText>
              <HintList>
                {startTime && (
                  <HintListItem>
                    <Icon src={checkmark} alt="checkmark" />
                    <BodyText>
                      This call will start at:{" "}
                      <StartTimeText>{startTime}</StartTimeText>
                    </BodyText>
                  </HintListItem>
                )}
                <HintListItem>
                  <Icon src={checkmark} alt="checkmark" />
                  <BodyText>
                    Your camera and mic will be off by default for the entire
                    duration of the call.
                  </BodyText>
                </HintListItem>
                <HintListItem>
                  <Icon src={checkmark} alt="checkmark" />
                  <BodyText>
                    The call will have a chat next to it to communicate with the
                    presenter so you can ask questions about Daily.
                  </BodyText>
                </HintListItem>
                <HintListItem>
                  <Icon src={checkmark} alt="checkmark" />
                  <BodyText>
                    We encourage you to use this call to clarify any questions
                    you may have!
                  </BodyText>
                </HintListItem>
              </HintList>
            </SubContainer>
            <Form onSubmit={submitName}>
              <FormHeader>
                Before joining, please introduce yourself:
              </FormHeader>
              <Label htmlFor="username">Your name</Label>
              <Input ref={inputRef} id="username" type="text" required />
              <Label htmlFor="email">Your email</Label>
              <Input ref={emailRef} id="email" type="email" required />
              <Label htmlFor="company">Your company (or LinkedIn)</Label>
              <Input ref={companyRef} id="company" type="text" required />
              <SubmitButton
                type="submit"
                value="Join our call"
                disabled={submitting}
              />
            </Form>
          </WaitingRoom>
        )}
        <Container height={height}>
          <CallFrame ref={videoRef} hidden={currentView !== "call"} />
        </Container>
        {currentView === "call" && roomInfo.username && (
          <ChatContainer height={height}>
            <Chat callFrame={callFrame} accountType={roomInfo?.accountType} />
          </ChatContainer>
        )}
      </FlexContainer>
      {currentView === "call" && (
        <FlexRow>
          <HelpText>
            If you're having any trouble connecting, message us in the chat,
            check our{" "}
            <Anchor
              href="https://help.daily.co/en/articles/2303117-top-troubleshooting-5-tips-that-solve-99-of-issues"
              color={theme.colors.orange}
            >
              help center article
            </Anchor>
            , or email support directly{" "}
            <Anchor href="mailto:help@daily.co" color={theme.colors.orange}>
              help@daily.co
            </Anchor>
          </HelpText>
          <Flex1>_</Flex1>
        </FlexRow>
      )}
    </FlexContainerColumn>
  );
};

const FlexContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
`;
const FlexContainerColumn = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 1075px) {
    flex-direction: column-reverse;
  }
`;
const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 996px) {
    flex-direction: column;
  }
`;

const HelpText = styled(BodyText)`
  flex: 2;
  margin: 1rem;
`;
const Flex1 = styled.div`
  flex: 1;
  font-size: 0;
  color: transparent;
`;

const WaitingRoom = styled.div`
  margin-top: 3rem;
  display: flex;
  width: 100%;
  @media (max-width: 996px) {
    flex-direction: column;
  }
`;

const StartTimeText = styled.span`
  color: ${theme.colors.orange};
  font-weight: 600;
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
`;
const SubmitButton = styled.input`
  padding: 0.4rem 1rem 0.5rem;
  border-radius: 6px;
  background-color: ${theme.colors.turquoise};
  border: 1px solid ${theme.colors.turquoise};
  color: ${theme.colors.blueDark};
  font-weight: 600;
  margin-top: 2rem;
  margin-left: auto;
  cursor: pointer;

  &:hover {
    border: 1px solid ${theme.colors.teal};
  }
  &:disabled {
    opacity: 0.5;
  }
`;

const Container = styled.div`
  flex: 2;
  margin: 1rem;
  flex-basis: 600px;
  height: ${(props) => props.height || 400}px;
`;

const ChatContainer = styled.div`
  flex: 1;
  margin: 1rem;
  height: ${(props) => props.height || 400}px;
`;

const CallFrame = styled.div`
  height: 100%;
  width: 100%;
  visibility: ${(props) => (props.hidden ? "hidden" : "visible")};
`;

export default WebinarCall;
