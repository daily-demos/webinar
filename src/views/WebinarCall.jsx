import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import DailyIframe from "@daily-co/daily-js";
import styled from "styled-components";
import Chat from "../components/Chat";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import SubHeader from "../components/text/SubHeader";
import BodyText from "../components/text/BodyText";
import { useParams, useLocation } from "react-router-dom";
import checkmark from "../components/images/checkmark.svg";

import theme from "../theme";
import OrangeHeader from "../components/text/OrangeHeader";

const WebinarCall = () => {
  const videoRef = useRef(null);
  const inputRef = useRef();
  const emailRef = useRef();
  const companyRef = useRef();

  const [currentView, setCurrentView] = useState("loading"); // loading | call | waiting | error
  const [callFrame, setCallFrame] = useState(null);
  const [height, setHeight] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null); // {token?: string, accountType: 'participant' | 'admin', username: string, url: string }
  const [startTime, setStartTime] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  // ?t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvIjp0cnVlLCJ1IjoiamVzcyIsInNzIjp0cnVlLCJ2byI6ZmFsc2UsImFvIjpmYWxzZSwiciI6IndlYmluYXIiLCJkIjoiNDNkNWVhYjgtZjRiNy00ZjUxLTlkNjUtOTY4N2UyOGJkYjRlIiwiaWF0IjoxNjA2NDA4MDI5fQ.SSLKfjRtGN_ikqiy1ykxJwHMlXar19ZpBe61svkubKs
  const { roomName } = useParams();
  const { search } = useLocation();

  useEffect(() => {
    if (roomInfo) return;
    if (currentView === "loading") {
      fetch(`https://daily-webinar.netlify.app/api/rooms/${roomName}`, {})
        .then((res) => res.json())
        .then((res) => setStartTime(new Date(res.config.nbf).toUTCString()))
        .catch((err) => console.log(err));

      if (search && search.match(/^[?t=*+]/)) {
        const token = search.replace("?t=", "");
        fetch(`https://daily-webinar.netlify.app/api/meeting-tokens/${token}`)
          .then((res) => res.json())
          .then((res) => {
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
      const data = {
        "entry.1667022758": inputRef.current.value,
        "entry.2075101699": emailRef.current.value,
        "entry.1964318055": companyRef.current.value,
      };
      fetch(
        `https://docs.google.com/forms/u/0/d/e/1FAIpQLSddqD1Q5W4Fatf0Px38ysFrC3COgS-PqAfjIXf6qnCgKfzZKg/formResponse?entry.1667022758=${inputRef.current.value}&entry.2075101699=${emailRef.current.value}&entry.1964318055=${companyRef.current.value}&submit=Submit`,
        {
          method: "GET",
          mode: "no-cors",
        }
      )
        .then(() => {
          // setRoomInfo({
          //     ...roomInfo,
          //     username: inputRef.current.value?.trim(),
          //   });
        })
        .catch((err) => {
          // todo handle error
          console.log(err);
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
  };
  // http://localhost:3000/webinar?t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvIjp0cnVlLCJ1IjoiamVzcyIsInNzIjp0cnVlLCJ2byI6ZmFsc2UsImFvIjpmYWxzZSwiciI6IndlYmluYXIiLCJkIjoiNDNkNWVhYjgtZjRiNy00ZjUxLTlkNjUtOTY4N2UyOGJkYjRlIiwiaWF0IjoxNjA2NDA4MDI5fQ.SSLKfjRtGN_ikqiy1ykxJwHMlXar19ZpBe61svkubKs

  useEffect(() => {
    if (!videoRef || !videoRef?.current || !roomInfo) return;
    if (!roomInfo?.username) {
      setCurrentView("waiting");
      return;
    } // needs to be entered by participant

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
          // const showEvent = (e) => console.log(e);
          // newCallFrame;
          // .on("loading", showEvent)
          // .on("loaded", showEvent)
          // .on("joining-meeting", showEvent)
          // .on("joined-meeting", showEvent)
          // .on("participant-joined", showEvent)
          // .on("participant-updated", showEvent)
          // .on("participant-left", showEvent);
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
    <FlexContainer height={height}>
      {currentView === "loading" && <Loading />}
      {currentView === "error" && <ErrorMessage />}
      {currentView === "waiting" && (
        <WaitingRoom>
          <SubContainer>
            <SubHeader>Welcome to Daily!</SubHeader>
            {startTime && (
              <BodyText>This call will start at: ${startTime}</BodyText>
            )}
            <InstructionText>
              Here are some things to know before we get started:
            </InstructionText>
            <HintList>
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
                  We encourage you to use this call to clarify any questions you
                  may have!
                </BodyText>
              </HintListItem>
            </HintList>
          </SubContainer>
          <Form onSubmit={submitName}>
            <FormHeader>Before joining, please introduce yourself:</FormHeader>
            <Label htmlFor="username">Name</Label>
            <Input ref={inputRef} id="username" type="text" required />
            <Label htmlFor="email">Email</Label>
            <Input ref={emailRef} id="email" type="text" required />
            <Label htmlFor="company">Company</Label>
            <Input ref={companyRef} id="company" type="text" required />
            <SubmitButton type="submit" value="Join call!" />
          </Form>
        </WaitingRoom>
      )}
      <Container height={height}>
        <CallFrame ref={videoRef} hidden={currentView !== "call"} />
      </Container>
      {currentView === "call" && roomInfo.username && (
        <Chat callFrame={callFrame} accountType={roomInfo?.accountType} />
      )}
    </FlexContainer>
  );
};

const FlexContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  height: ${(props) => props.height || 400}px;
`;

const WaitingRoom = styled.div`
  margin-top: 3rem;
  display: flex;
  width: 100%;
  @media (max-width: 996px) {
    flex-direction: column;
  }
`;

const SubContainer = styled.div`
  flex: 1;
  margin-right: 3rem;

  @media (max-width: 996px) {
    margin-right: 0rem;
  }
`;

const HintList = styled.ul`
  list-style: none;
  padding-left: 0;
`;
const HintListItem = styled.li`
  display: flex;
`;
const Icon = styled.img`
  width: 1.8rem;
  margin-right: 1rem;
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

const FormHeader = styled(BodyText)`
  font-weight: 600;
  color: ${theme.colors.greyDark};
`;
const InstructionText = styled(FormHeader)`
  margin-top: 1rem;
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
  padding: 0.5rem;
  border-radius: 6px;
  background-color: ${theme.colors.turquoise};
  border: 1px solid ${theme.colors.turquoise};
  color: ${theme.colors.blueDark};
  font-weight: 600;
  margin-top: 2rem;
  width: 250px;
  margin-left: auto;
  margin-right: auto;
  cursor: pointer;

  &:hover {
    border: 1px solid ${theme.colors.teal};
  }
`;

const Container = styled.div`
  flex: 2;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
  flex-basis: 600px;
  height: ${(props) => props.height || 400}px;
  margin-bottom: 2rem;
`;

const CallFrame = styled.div`
  height: 100%;
  width: 100%;
  visibility: ${(props) => (props.hidden ? "hidden" : "visible")};
`;

export default WebinarCall;
