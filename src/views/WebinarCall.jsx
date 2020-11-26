import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import DailyIframe from "@daily-co/daily-js";
import styled from "styled-components";
import Chat from "../components/Chat";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import SubHeader from "../components/text/SubHeader";
import BodyText from "../components/text/BodyText";

const Home = () => {
  const videoRef = useRef(null);
  const [currentView, setCurrentView] = useState("loading"); // loading | call | waiting | error | needsUsername
  const [username, setUsername] = useState(null);
  const [callFrame, setCallFrame] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [height, setHeight] = useState(null);
  const [roomURL, setRoomUrl] = useState();
  const defaultRoom = "https://jessmitch.staging.daily.co/webinar";

  const makeAdmin = () => {
    setAccountType("admin");
    setRoomUrl(
      `${defaultRoom}?t=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvIjp0cnVlLCJ1IjoiamVzcyIsInNzIjp0cnVlLCJ2byI6ZmFsc2UsImFvIjpmYWxzZSwiciI6IndlYmluYXIiLCJkIjoiNDNkNWVhYjgtZjRiNy00ZjUxLTlkNjUtOTY4N2UyOGJkYjRlIiwiaWF0IjoxNjA2NDA4MDI5fQ.SSLKfjRtGN_ikqiy1ykxJwHMlXar19ZpBe61svkubKs`
    );
  };

  const makeMember = () => {
    setAccountType("member");

    setRoomUrl(`${defaultRoom}`);
  };

  const CALL_OPTIONS = {
    iframeStyle: {
      width: "100%",
      height: "100%",
    },
  };

  useLayoutEffect(() => {
    let timeout = null;
    function updateSize() {
      if (videoRef.current) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          setHeight(videoRef.current.clientWidth * 0.75);
        }, 100);
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
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
          .join()
          .then(() => {
            setCurrentView("needsUsername");
          })
          .catch((err) => {
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
  }, [videoRef, roomURL]);

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
          <SubHeader>Welcome to our Daily Webinar!</SubHeader>
          <BodyText>
            We'll be going live shortly and answering any questions you may have
            about the Daily video call APIs.
          </BodyText>
        </WaitingRoom>
      )}
      {currentView === "needsUsername" && (
        <WaitingRoom>
          <SubHeader>Welcome to our Daily Webinar!</SubHeader>
          <BodyText>
            Before joining, please share your name with us so we know who you
            are!
          </BodyText>
          <label htmlFor="username">Name</label>
          <input id="username" type="text" />
        </WaitingRoom>
      )}
      <Container height={height}>
        <CallFrame ref={videoRef} visible={currentView === "call"} />
      </Container>
      {currentView === "call" && (
        <Chat callFrame={callFrame} accountType={accountType} />
      )}
    </FlexContainer>
  );
};

const FlexContainer = styled.div`
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  flex-direction: column;
`;

const WaitingRoom = styled.div`
  margin-top: 3rem;
`;

const Container = styled.div`
  flex: 2;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
  flex-basis: 600px;
  height: ${(props) => props.height || 100}px;
  margin-bottom: 2rem;
`;

const CallFrame = styled.div`
  height: 100%;
  width: 100%;
  visible: ${(props) => (props.visible ? "visible" : "hidden")}px;
`;

export default Home;
