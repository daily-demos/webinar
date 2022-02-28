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
import LeftCall from "../components/LeftCall";
import Loading from "../components/Loading";
import { InstructionText } from "../components/List";
import InCallSupportMessage from "../components/InCallSupportMessage";
import InCallWaitingRoom from "../components/InCallWaitingRoom";
import theme from "../theme";
import { ADMIN } from "../constants";
import { fetchDailyRoom, fetchDailyToken } from "../api";

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

const WebinarCall = () => {
  const videoRef = useRef(null);

  const [currentView, setCurrentView] = useState("loading"); // loading | call | waiting | error | left-call
  const [callFrame, setCallFrame] = useState(null);
  const [error, setError] = useState(null);
  const [height, setHeight] = useState(400);
  const [roomInfo, setRoomInfo] = useState(null); // {token?: string, accountType: 'participant' | 'admin', username: string, url: string }
  const [startTime, setStartTime] = useState(null);

  const { roomName } = useParams();
  const { search } = useLocation();

  const baseUrl = process.env.REACT_APP_DAILY_BASE_URL;

  const updateCallOptions = (roomInfo) => {
    CALL_OPTIONS.url = roomInfo?.url;
    // show local video is the person joining is an admin
    CALL_OPTIONS.showLocalVideo = roomInfo?.accountType === ADMIN;
  };

  useEffect(() => {
    // As soon as there is a room URL available, create the Daily callframe
    if (!videoRef?.current || !roomInfo?.url || callFrame) return;

    // Add room-specific call options, like room URL, to default/existing settings
    updateCallOptions(roomInfo);

    const newCallFrame = DailyIframe.createFrame(
      videoRef.current,
      CALL_OPTIONS
    );

    // DAILY EVENT CALLBACKS
    const participantUpdated = (e) => {
      if (!["call", "left-call"].includes(currentView)) {
        setCurrentView("call");
        setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
      }
    };
    const leftMeeting = () => {
      if (roomInfo?.accountType !== ADMIN && !error) {
        setCurrentView("left-call");
        callFrame.destroy();
      }

      // remind the admin to export chat-- it's not saved anywhere other than local state
      if (roomInfo?.accountType === ADMIN) {
        window.alert(
          "Hey admin, don't forget to export the chat before closing this window if you want to save it."
        );
      }
    };
    const handleError = (err) => {
      if (err && err.action === "error" && err.errorMsg) {
        setError(err.errMsg);
      } else {
        setError(null);
      }
      console.error("error", err);
    };

    newCallFrame
      .on("left-meeting", leftMeeting)
      .on("participant-updated", participantUpdated)
      .on("error", handleError);

    setCallFrame(newCallFrame);

    return () => {
      newCallFrame
        .off("left-meeting", leftMeeting)
        .off("participant-updated", participantUpdated)
        .off("error", handleError);
    };
  }, [roomInfo, videoRef, callFrame, error, currentView]);

  const validateDailyRoomProvided = useCallback(async () => {
    // Validate the room exists (room name provided in URL)
    const dailyRoom = await fetchDailyRoom(roomName);

    // show error if anything went funky
    if (dailyRoom.error && dailyRoom.info) {
      setError(dailyRoom.info);
      return;
    }
    // if there's a "not-before-time" on the room, set it in local state
    if (dailyRoom?.config?.nbf) {
      const timeUnformatted = new Date(dailyRoom.config?.nbf * 1000);
      const time = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
      }).format(timeUnformatted);
      setStartTime(time);
    }
  }, [roomName]);

  const validateTokenProvided = useCallback(async () => {
    const token = search.replace("?t=", "");
    // validate the token from the URL if supplied
    const tokenInfo = await fetchDailyToken(token);
    if (tokenInfo.is_owner && tokenInfo.room_name === roomName) {
      // add admin setting
      setRoomInfo({
        token,
        username: tokenInfo.user_name,
        url: `${baseUrl}${roomName}`,
        accountType: ADMIN,
      });
      // show in-call view if it's a valid token
      setCurrentView("call");
    }
  }, [baseUrl, roomName, search]);

  useEffect(() => {
    // don't request room info if it's already set
    if (roomInfo || callFrame) return;

    /*
     First, validate the room via Daily's REST API.
     Wait until validating an optional token query param
     below before setting room info.
     */
    const validateRoom = async () => await validateDailyRoomProvided(roomName);
    validateRoom();

    // Next, check for a token in query params and validate it
    const hasProvidedToken = search && search.match(/^[?t=*+]/);

    // A token being provided means they're trying to join as an admin
    if (hasProvidedToken) {
      // validate token and update room info if valid
      validateTokenProvided();
    } else {
      // just update room info for regular participants
      setRoomInfo({
        token: null,
        username: null,
        url: `${baseUrl}${roomName}`,
        accountType: "participant",
      });
      // show waiting room view with name form
      setCurrentView("waiting");
    }
  }, [
    baseUrl,
    roomName,
    search,
    roomInfo,
    callFrame,
    validateDailyRoomProvided,
    validateTokenProvided,
  ]);

  // handles setting the iframe's height on window resize to maintain aspect ratio
  const updateSize = useCallback(() => {
    let timeout;
    if (!videoRef?.current) return;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
    }, 100);
  }, [videoRef]);

  const joinCall = useCallback(async () => {
    if (!callFrame) return;
    try {
      setCurrentView("call");
      // update the callframe height to get the right aspect ratio
      updateSize();
      await callFrame.join({ userName: roomInfo.username });
    } catch (err) {
      console.error(err);
    }
  }, [roomInfo?.username, callFrame, updateSize]);

  // handle window resizes to manage aspect ratio of daily iframe
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  const renderCurrentViewUI = useMemo(() => {
    const handleSubmitNameForm = (username) => {
      // add local user's name to roomInfo
      // it needs to be set for the chat widget to work :)
      setRoomInfo({
        ...roomInfo,
        username,
      });

      joinCall();
    };
    switch (currentView) {
      case "loading":
        return <Loading />;
      case "left-call":
        return <LeftCall />;
      case "waiting":
        return (
          <InCallWaitingRoom
            startTime={startTime}
            joinCall={handleSubmitNameForm}
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
  }, [currentView, startTime, roomInfo, height, callFrame, error, joinCall]);

  return (
    <FlexContainerColumn>
      <FlexContainer>
        {/* Daily video call iframe */}
        <VideoContainer height={height} hidden={currentView !== "call"}>
          <CallFrame ref={videoRef} hidden={currentView !== "call"} />
        </VideoContainer>

        {/* Additional UI depending on current state of call */}
        {renderCurrentViewUI}

        {error && <ErrorText>Error: {error}</ErrorText>}
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
