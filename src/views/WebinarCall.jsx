import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import DailyIframe from "@daily-co/daily-js";
import styled from "styled-components";
import { useParams, useLocation } from "react-router-dom";
import Chat from "../components/Chat";
import AuRevoir from "../components/AuRevoir";
import Loading from "../components/Loading";
import { InstructionText } from "../components/List";
import InCallSupportMessage from "../components/InCallSupportMessage";
import InCallWaitingRoom from "../components/InCallWaitingRoom";
import theme from "../theme";
import { ADMIN } from "../constants";

// Call options passed to daily-js when callframe is created
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
  // showLocalVideo: true,
  showParticipantsBar: false,
};

/**
 * Use for local testing (replace with line 48 if deployed on Netlify)
 */
const API_URL = "https://api.daily.co/v1/";

/**
 * Uncomment and use if deployed to Netlify (see README for instructions)
 */
// const API_URL = `${process.env.REACT_APP_API_URL}/api`;

const WebinarCall = () => {
  const videoRef = useRef(null);

  const [currentView, setCurrentView] = useState("loading"); // loading | call | waiting | error | left-call
  const [callFrame, setCallFrame] = useState(null);
  const [error, setError] = useState(null);
  const [height, setHeight] = useState(400);
  const [roomInfo, setRoomInfo] = useState(null); // {token?: string, accountType: 'participant' | 'admin', username: string, url: string }
  const [startTime, setStartTime] = useState(null);

  const baseUrl = process.env.REACT_APP_DAILY_BASE_URL;
  const { roomName } = useParams();
  const { search } = useLocation();

  const updateCallOptions = (roomInfo) => {
    CALL_OPTIONS.url = roomInfo?.url;
    // show local video is the person joining is an admin
    CALL_OPTIONS.showLocalVideo = roomInfo?.accountType === ADMIN;
  };

  useEffect(() => {
    if (!videoRef?.current || !roomInfo?.url || callFrame) return;
    // set room url; callFrame properties are otherwise already set above

    updateCallOptions(roomInfo);

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
      }

      // remind the admin to export chat-- it's not saved anywhere other than local state
      if (roomInfo?.accountType === ADMIN) {
        window.alert(
          "Hey admin, don't forget to export the chat before closing this window if you want to save it."
        );
      }
    };
    const handleError = (err) => checkAndSetError(err);

    newCallFrame
      .on("joined-meeting", joinedMeeting)
      .on("left-meeting", leftMeeting)
      .on("participant-updated", participantUpdated)
      .on("error", handleError);

    return () => {
      newCallFrame
        .off("joined-meeting", joinedMeeting)
        .off("left-meeting", leftMeeting)
        .off("participant-updated", participantUpdated)
        .off("error", handleError);
    };
  }, [roomInfo, videoRef, callFrame, error, currentView]);

  useEffect(() => {
    if (roomInfo) return;
    if (currentView === "loading" && !callFrame) {
      // validate the room from the URL
      fetch(`${API_URL}/rooms/${roomName}`, {
        method: "GET",
        /**
         * Remove these headers for the deployed to Netlify version
         */
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_DAILY_API_KEY}`,
        },
      })
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
      fetch(`${API_URL}/meeting-tokens/${token}`, {
        method: "GET",
        /**
         * Remove these headers for the deployed to Netlify version
         */
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_DAILY_API_KEY}`,
        },
      })
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

  useEffect(() => {
    let timeout;

    // handles setting the iframe's height on window resize to maintain aspect ratio
    const updateSize = () => {
      if (!videoRef?.current) return;

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
      }, 100);
    };

    updateSize();

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const renderCurrentViewUI = useMemo(() => {
    switch (currentView) {
      case "loading":
        return <Loading />;
      case "left-call":
        return <AuRevoir />;
      case "waiting":
        return (
          <InCallWaitingRoom
            startTime={startTime}
            roomInfo={roomInfo}
            setRoomInfo={setRoomInfo}
            error={error}
          />
        );
      case "call":
        return (
          <Chat
            callFrame={callFrame}
            accountType={roomInfo?.accountType}
            height={height}
          />
        );
      default:
        return null;
    }
  }, [currentView, startTime, roomInfo, height, callFrame, error]);

  return (
    <FlexContainerColumn>
      <FlexContainer>
        {/* Additional UI depending on current state of call */}
        {renderCurrentViewUI}

        {error && <ErrorText>Error: {error}</ErrorText>}

        {/* Daily video call iframe */}
        <VideoContainer height={height} hidden={currentView !== "call"}>
          <CallFrame ref={videoRef} hidden={currentView !== "call"} />
        </VideoContainer>
      </FlexContainer>
      {currentView === "call" && <InCallSupportMessage />}
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
const ErrorText = styled(InstructionText)`
  color: ${theme.colors.red};
  margin: 0 1rem;
`;
const VideoContainer = styled.div`
  flex: 1.2;
  margin: 1rem;
  flex-basis: 400px;
  background-color: white;
  height: ${(props) => (props.hidden ? "100" : props.height)}px;
`;
const CallFrame = styled.div`
  height: 100%;
  width: 100%;
  visibility: ${(props) => (props.hidden ? "hidden" : "visible")};
`;

export default WebinarCall;
