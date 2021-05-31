import React, {
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import DailyIframe from "@daily-co/daily-js";
import styled from "styled-components";
import Chat from "../components/Chat";
import AuRevoir from "../components/AuRevoir";
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
  HintListItemText,
} from "../components/List";
import Anchor from "../components/Anchor";
import { ADMIN } from "../constants";

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
  showLocalVideo: false,
  showParticipantsBar: false,
};

const WebinarCall = () => {
  const videoRef = useRef(null);
  const inputRef = useRef(null);

  const [currentView, setCurrentView] = useState("loading"); // loading | call | waiting | error | left-call
  const [callFrame, setCallFrame] = useState(null);
  const [error, setError] = useState(null);
  const [height, setHeight] = useState(400);
  const [roomInfo, setRoomInfo] = useState(null); // {token?: string, accountType: 'participant' | 'admin', username: string, url: string }
  const [startTime, setStartTime] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { roomName } = useParams();
  const { search } = useLocation();

  useEffect(() => {
    if (!videoRef?.current || !roomInfo?.url || callFrame) return;
    // set room url; callFrame properties are otherwise already set above
    CALL_OPTIONS.url = roomInfo?.url;
    CALL_OPTIONS.showLocalVideo =
      roomInfo?.accountType === ADMIN ? true : false;
    const newCallFrame = DailyIframe.createFrame(
      videoRef.current,
      CALL_OPTIONS
    );

    setCallFrame(newCallFrame);
    const joinedMeeting = () => {
      if (currentView !== "call") {
        setCurrentView("call");
        setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
      }
    };
    const participantUpdated = (e) => {
      if (!["call", "left-call"].includes(currentView)) {
        setCurrentView("call");
        setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
      }
    };
    const leftMeeting = () => {
      if (roomInfo?.accountType !== ADMIN && !error) {
        setCurrentView("left-call");
      } else if (roomInfo?.accountType === ADMIN) {
        // remind the admin to export chat-- it's not saved anywhere other than local state
        window.alert(
          "Hey admin, don't forget to export the chat before closing this window if you want to save it."
        );
      }
    };
    // @ts-ignore
    const handleError = (err) => checkAndSetError(err);

    newCallFrame
      .on("joined-meeting", joinedMeeting)
      .on("left-meeting", leftMeeting)
      .on("participant-updated", (e) => participantUpdated(e))
      .on("error", handleError);

    return () => {
      newCallFrame
        .off("joined-meeting", joinedMeeting)
        // .off("left-meeting", leftMeeting)
        .off("error", handleError);
    };
  }, [roomInfo, videoRef, callFrame, error, currentView]);

  useEffect(() => {
    if (roomInfo) return;
    if (currentView === "loading" && !callFrame) {
      // validate the room from the URL
      fetch(`https://webinar-demo.netlify.app//api/rooms/${roomName}`, {})
        .then((res) => res.json())
        .then((res) => {
          if (res.error && res.info) {
            setError(res.info);
            return;
          }
          if (res.config?.nbf) {
            const timeUnformatted = new Date(res.config?.nbf * 1000);
            const time = new Intl.DateTimeFormat("en-US", {
              timeZone: "America/Los_Angeles",
            }).format(timeUnformatted);
            setStartTime(time);
          }
        })
        .catch((err) => checkAndSetError(err));
    }

    if (search && search.match(/^[?t=*+]/) && !error) {
      const token = search.replace("?t=", "");

      // validate the token from the URL if supplied
      fetch(`https://webinar-demo.netlify.app//api/meeting-tokens/${token}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.is_owner && res.room_name === roomName) {
            // add admin setting
            setRoomInfo({
              token,
              username: res.user_name,
              url: `${baseUrl}${roomName}?t=${token}`,
              accountType: ADMIN,
            });
            return;
          }
          setError(res.info || "Something went wrong!");
        })
        .catch((err) => {
          checkAndSetError(err);
        });
    } else {
      setRoomInfo({
        token: null,
        username: null,
        url: `${baseUrl}${roomName}`,
        accountType: "participant",
      });
    }
  }, [currentView, baseUrl, roomName, search, roomInfo, error, callFrame]);

  const checkAndSetError = (res) => {
    if (res && res.action === "error" && res.errorMsg) {
      setError(res.errMsg);
    } else {
      setError(null);
    }
    console.error("error", res);
  };

  const submitName = (e) => {
    e.preventDefault();
    if (!inputRef?.current) return;
    setRoomInfo({
      ...roomInfo,
      username: inputRef.current.value?.trim(),
    });
  };

  const joinCall = useCallback(() => {
    if (!videoRef?.current || !roomInfo || !callFrame) return;
    callFrame
      .join({ userName: roomInfo?.username })
      .then(() => {
        setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
        setCurrentView("call");
        console.log("join meeting successful");
      })
      .catch((err) => checkAndSetError(err));
  }, [roomInfo, videoRef, callFrame]);

  useEffect(() => {
    const state = callFrame?.meetingState();
    if (state === "joined-meeting") {
      setCurrentView("call");
    }
    if (!roomInfo) return;
    // if you're not an admin, you can't join without filling out the sign in form
    if (!roomInfo?.username) {
      setCurrentView("waiting");
      return;
    }
    setCurrentView("loading");
    if (callFrame) {
      joinCall();
    }
  }, [roomInfo, videoRef, callFrame, joinCall]);

  useLayoutEffect(() => {
    let timeout;
    // handles setting the iframe's height on resize to maintain aspect ratio
    const updateSize = () => {
      if (videoRef?.current) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
        }, 100);
      }
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [callFrame]);
  return (
    <FlexContainerColumn>
      <FlexContainer>
        {currentView === "loading" && <Loading />}
        {currentView === "left-call" && <AuRevoir />}
        {error && <ErrorText>Error: {error}</ErrorText>}
        {currentView === "waiting" && (
          <WaitingRoom>
            <SubContainer>
              <HeaderText>Welcome!</HeaderText>
              <InstructionText>
                Here are some things to know before we get started:
              </InstructionText>
              <HintList>
                {startTime && (
                  <HintListItem>
                    <Icon src={checkmark} alt="checkmark" />
                    <HintListItemText>
                      This call starts at:{" "}
                      <StartTimeText>{startTime}</StartTimeText>
                    </HintListItemText>
                  </HintListItem>
                )}
                <HintListItem>
                  <Icon src={checkmark} alt="checkmark" />
                  <HintListItemText>
                    Your camera and mic will be off during the entire call. (No
                    one can see or hear you!)
                  </HintListItemText>
                </HintListItem>
                <HintListItem>
                  <Icon src={checkmark} alt="checkmark" />
                  <HintListItemText>
                    You can send chat messages to the Daily team during the call
                    to ask questions
                  </HintListItemText>
                </HintListItem>
                <HintListItem>
                  <Icon src={checkmark} alt="checkmark" />
                  <HintListItemText>
                    We encourage you to use this call to clarify any questions
                    you may have!
                  </HintListItemText>
                </HintListItem>
              </HintList>
            </SubContainer>
            <Form onSubmit={submitName}>
              <FormHeader>
                Before joining, please introduce yourself:
              </FormHeader>
              <Label htmlFor="username">Your name</Label>
              <Input ref={inputRef} id="username" type="text" required />
              <SubmitButton
                type="submit"
                value="Join our call"
                disabled={error}
              />
            </Form>
          </WaitingRoom>
        )}
        <VideoContainer height={height} hidden={currentView !== "call"}>
          <CallFrame ref={videoRef} hidden={currentView !== "call"} />
        </VideoContainer>
        {currentView === "call" && roomInfo && roomInfo.username && (
          <ChatContainer height={height}>
            <Chat callFrame={callFrame} accountType={roomInfo?.accountType} />
          </ChatContainer>
        )}
      </FlexContainer>
      {currentView === "call" && (
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
      )}
    </FlexContainerColumn>
  );
};

const FlexContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  @media (max-width: 1075px) {
    flex-direction: column;
  }
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
const ErrorText = styled(InstructionText)`
  color: ${theme.colors.red};
  margin: 0 1rem;
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

const WaitingRoom = styled.div`
  margin: 3rem 1rem 0;
  display: flex;

  @media (max-width: 996px) {
    flex-direction: column;
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

const VideoContainer = styled.div`
  flex: 1.2;
  margin: 1rem;
  flex-basis: 400px;
  height: ${(props) => (props.hidden ? "100" : props.height)}px;
`;

const ChatContainer = styled.div`
  flex: 1;
  margin: 1rem;
  height: ${(props) => props.height}px;
`;

const CallFrame = styled.div`
  height: 100%;
  width: 100%;
  visibility: ${(props) => (props.hidden ? "hidden" : "visible")};
`;

export default WebinarCall;
