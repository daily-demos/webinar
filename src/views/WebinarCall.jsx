import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import DailyIframe from "@daily-co/daily-js";
import styled from "styled-components";
import Chat from "../components/Chat";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import SubHeader from "../components/text/SubHeader";
import BodyText from "../components/text/BodyText";
import { useParams, useLocation } from "react-router-dom";

const WebinarCall = () => {
  const videoRef = useRef(null);
  const inputRef = useRef();

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
      console.log(roomName);
      fetch(`https://daily-webinar.netlify.app/api/rooms/${roomName}`, {})
        .then((res) => res.json())
        .then((res) => setStartTime(new Date(res.config.nbf).toUTCString()))
        .catch((err) => console.log(err));
      console.log(search);
      if (search && search.match(/^[?t=*+]/)) {
        console.log("matches admin");
        const token = search.replace("?t=", "");
        fetch(`https://daily-webinar.netlify.app/api/meeting-tokens/${token}`)
          .then((res) => res.json())
          .then((res) => {
            if (res.is_owner && res.room_name === roomName) {
              console.log("set admin");
              // add admin setting
              setRoomInfo({
                token,
                username: res.user_name,
                url: `${baseUrl}${roomName}?t=${token}`,
                accountType: "admin",
              });
            } else {
              console("admin error");
              setCurrentView("error");
            }
          })
          .catch((err) => console.log(err));
      } else {
        console.log("set participant");
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
    console.log(inputRef.current.value);
    if (inputRef.current && inputRef.current.value?.trim()) {
      console.log("set username");
      setRoomInfo({
        ...roomInfo,
        username: inputRef.current.value?.trim(),
      });
    }
  };

  const CALL_OPTIONS = {
    iframeStyle: {
      width: "100%",
      height: "100%",
    },
  };
  // http://localhost:3000/webinar?t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvIjp0cnVlLCJ1IjoiamVzcyIsInNzIjp0cnVlLCJ2byI6ZmFsc2UsImFvIjpmYWxzZSwiciI6IndlYmluYXIiLCJkIjoiNDNkNWVhYjgtZjRiNy00ZjUxLTlkNjUtOTY4N2UyOGJkYjRlIiwiaWF0IjoxNjA2NDA4MDI5fQ.SSLKfjRtGN_ikqiy1ykxJwHMlXar19ZpBe61svkubKs

  useEffect(() => {
    if (!videoRef || !videoRef.current || !roomInfo) return;
    if (!roomInfo.username) {
      setCurrentView("waiting");
      return;
    } // needs to be entered by participant
    console.log(roomInfo);
    if (!callFrame) {
      CALL_OPTIONS.url = roomInfo.url;
      const newCallFrame = DailyIframe.createFrame(
        videoRef.current,
        CALL_OPTIONS
      );
      setCallFrame(newCallFrame);
      newCallFrame
        .join({ userName: roomInfo.username })
        .then(() => {
          updateSize();
          console.log("set call");
          setCurrentView("call");
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
    if (videoRef.current) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setHeight(videoRef.current.clientWidth * 0.75);
      }, 100);
    }
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, [callFrame]);

  return (
    <FlexContainer>
      {currentView === "loading" && <Loading />}
      {currentView === "error" && <ErrorMessage />}
      {currentView === "waiting" && (
        <WaitingRoom>
          <SubHeader>Welcome to Daily!</SubHeader>
          {startTime && (
            <BodyText>This call will start at: ${startTime}</BodyText>
          )}
          <BodyText>
            Your camera and mic will be off by default for the entire duration
            of the call. The call will have a chat next to it to communicate
            with the presenter and ask questions about Daily. We encourage you
            to use this call to clarify any questions you may have!
          </BodyText>
          <BodyText>
            Before joining, please share your name with us so we know who you
            are!
          </BodyText>
          <form onSubmit={submitName}>
            <label htmlFor="username">Name</label>
            <input ref={inputRef} id="username" type="text" />
            <input type="submit" />
          </form>
        </WaitingRoom>
      )}
      <Container height={height}>
        <CallFrame ref={videoRef} hidden={currentView !== "call"} />
      </Container>
      {currentView === "call" && roomInfo.username && (
        <Chat callFrame={callFrame} accountType={roomInfo.accountType} />
      )}
    </FlexContainer>
  );
};

const FlexContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
`;

const WaitingRoom = styled.div`
  margin-top: 3rem;
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
