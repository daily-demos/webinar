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
  const [currentView, setCurrentView] = useState("loading"); // loading | call | waiting | error | needsUsername
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const [callFrame, setCallFrame] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [height, setHeight] = useState(null);
  const [roomURL, setRoomUrl] = useState();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const { roomName } = useParams();
  const { search } = useLocation();
  const inputRef = useRef();
  // ?t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvIjp0cnVlLCJ1IjoiamVzcyIsInNzIjp0cnVlLCJ2byI6ZmFsc2UsImFvIjpmYWxzZSwiciI6IndlYmluYXIiLCJkIjoiNDNkNWVhYjgtZjRiNy00ZjUxLTlkNjUtOTY4N2UyOGJkYjRlIiwiaWF0IjoxNjA2NDA4MDI5fQ.SSLKfjRtGN_ikqiy1ykxJwHMlXar19ZpBe61svkubKs
  const makeAdmin = () => {
    setAccountType("admin");
    const room = `${baseUrl}/${roomURL}?t=${token}`;
    console.log(room);
    setRoomUrl(room);
  };

  const makeMember = () => {
    setAccountType("member");
    const room = `${baseUrl}${roomName}`;
    console.log("here", room);
    setRoomUrl(room);
  };
  console.log(useLocation());
  useEffect(() => {
    if (currentView === "loading") {
      if (search && search.match(/^[?t=]/)) {
        console.log("validate");
      } else {
        makeMember();
      }
    }
  }, [currentView]);

  useEffect(() => {
    if (!roomURL) return;
    setCurrentView("waiting");
  }, [roomURL]);

  const submitName = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value);
    if (inputRef.current && inputRef.current.value?.trim()) {
      console.log("set username");
      setUsername(inputRef.current.value?.trim());
    }
  };

  const CALL_OPTIONS = {
    iframeStyle: {
      width: "100%",
      height: "100%",
    },
  };

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
  }, []);

  useEffect(() => {
    if (!username) return;
    if (!videoRef || !videoRef.current) return;
    if (videoRef.current) {
      console.log("in");
      if (roomURL && !callFrame) {
        CALL_OPTIONS.url = roomURL;
        const newCallFrame = DailyIframe.createFrame(
          videoRef.current,
          CALL_OPTIONS
        );
        setCallFrame(newCallFrame);
        newCallFrame
          .join({ userName: username })
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
    }
    return () => {
      console.log("destroy");
      callFrame.destroy();
    };
  }, [username, videoRef]);

  return (
    <FlexContainer>
      {!accountType && (
        <div>
          <button onClick={makeAdmin}>make admin</button>
          <button onClick={makeMember}>make member</button>
        </div>
      )}
      {currentView === "loading" && <Loading />}
      {currentView === "error" && <ErrorMessage />}
      {currentView === "waiting" && (
        <WaitingRoom>
          <SubHeader>Welcome to Daily!</SubHeader>
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
      {currentView === "call" && username && (
        <Chat callFrame={callFrame} accountType={accountType} />
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
