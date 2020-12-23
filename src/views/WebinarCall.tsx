import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import DailyIframe, { DailyCall, DailyCallOptions } from "@daily-co/daily-js";
import styled from "styled-components";
import Chat from "../components/Chat";
import ErrorMessage from "../components/ErrorMessage";
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

type ParamTypes = {
  roomName: string;
};

type RoomInfo = {
  token?: string | null;
  username?: string | null;
  url?: string;
  accountType?: "admin" | "participant";
};

const CALL_OPTIONS: DailyCallOptions = {
  // @ts-ignore
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
  // showLocalVideo: false,
  // showParticipantsBar: false,
};

const WebinarCall: React.FC = () => {
  const videoRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const companyRef = useRef<HTMLInputElement | null>(null);

  const [currentView, setCurrentView] = useState<string>("loading"); // loading | call | waiting | error | left-call
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [height, setHeight] = useState<number>(400);
  const [submitting, setSubmitting] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null); // {token?: string, accountType: 'participant' | 'admin', username: string, url: string }
  const [startTime, setStartTime] = useState<string | null>(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { roomName } = useParams<ParamTypes>();
  const { search } = useLocation();

  useEffect(() => {
    if (roomInfo) return;
    if (currentView === "loading" && !callFrame) {
      fetch(`https://daily-webinar.netlify.app/api/rooms/${roomName}`, {})
        .then((res) => res.json())
        .then((res) => {
          if (res.error && res.info) {
            setError(res.info);
            setCurrentView("error");
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

      if (search && search.match(/^[?t=*+]/)) {
        const token = search.replace("?t=", "");
        console.log("setting admin");
        fetch(`https://daily-webinar.netlify.app/api/meeting-tokens/${token}`)
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
            } else if (res.error && res.info) {
              setError(res.info);
            } else {
              setCurrentView("error");
            }
          })
          .catch((err) => {
            checkAndSetError(err);
          });
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
  }, [currentView, callFrame, baseUrl, roomInfo, roomName, search]);

  const checkAndSetError = (res: any) => {
    if (res && res.action === "error" && res.errorMsg) {
      setError(res.errMsg);
    } else {
      setError(null);
    }
    console.error("error", res);
  };

  const submitName = (e: React.FormEvent<HTMLFormElement>) => {
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
        `https://docs.google.com/forms/u/0/d/e/${process.env.REACT_APP_FORM_ID}/formResponse?entry.1667022758=${inputRef.current.value}&entry.2075101699=${emailRef.current.value}&entry.1964318055=${companyRef.current.value}&submit=Submit`,
        {
          method: "GET",
          mode: "no-cors",
        }
      )
        .then(() => {
          console.log("setting room info");
          if (inputRef.current) {
            setRoomInfo({
              ...roomInfo,
              username: inputRef.current.value?.trim(),
            });
            setSubmitting(false);
          }
        })
        .catch((err) => {
          // todo handle error
          console.log(err);
          setSubmitting(false);
        });
    }
  };

  useEffect(() => {
    if (!videoRef || !videoRef?.current || !roomInfo) return;
    // if you're not an admin, you can't join without filling out the sign in form
    if (!roomInfo?.username) {
      setCurrentView("waiting");
      return;
    }
    setCurrentView("loading");

    if (!callFrame) {
      // set room url; callFrame properties are otherwise already set above
      CALL_OPTIONS.url = roomInfo?.url;
      const newCallFrame = DailyIframe.createFrame(
        videoRef.current,
        CALL_OPTIONS
      );

      setCallFrame(newCallFrame);

      // join call with additional event listeners added
      newCallFrame
        .setShowNamesMode("always")
        .on("joined-meeting", () => setCurrentView("call"))
        .on("left-meeting", () => {
          if (roomInfo?.accountType !== ADMIN && !error) {
            setCurrentView("left-call");
          } else if (roomInfo?.accountType === ADMIN) {
            // remind the admin to export chat-- it's not saved anywhere other than local state
            window.alert(
              "Hey admin, don't forget to export the chat before closing this window if you want to save it."
            );
          }
        })
        .on("error", (err) => checkAndSetError(err))
        // @ts-ignore
        .join({ userName: roomInfo?.username })
        .then(() => {
          setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
          console.log("join meeting successful");
        })
        .catch((err) => checkAndSetError(err));
    }
    return () => {
      if (callFrame) {
        callFrame.destroy();
        setCallFrame(null);
      }
    };
  }, [roomInfo, videoRef, callFrame]);

  useLayoutEffect(() => {
    let timeout: any;
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
        {currentView === "error" && (
          <ErrorMessage
            goBack={() => {
              setCurrentView("waiting");
            }}
            error={error}
            isAdmin={search.match(/^[?t=*+]/)}
          />
        )}
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

const VideoContainer = styled.div<{ height: number; hidden: boolean }>`
  flex: 1.2;
  margin: 1rem;
  flex-basis: 400px;
  height: ${(props) => (props.hidden ? "100" : props.height)}px;
`;

const ChatContainer = styled.div<{ height: number }>`
  flex: 1;
  margin: 1rem;
  height: ${(props) => props.height}px;
`;

const CallFrame = styled.div<{ hidden: boolean }>`
  height: 100%;
  width: 100%;
  visibility: ${(props) => (props.hidden ? "hidden" : "visible")};
`;

export default WebinarCall;
