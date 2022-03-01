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
    CALL_OPTIONS.userName = roomInfo?.username;
  };

  // handles setting the iframe's height on window resize to maintain aspect ratio
  const updateSize = useCallback(() => {
    let timeout;
    if (!videoRef?.current) return;

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      setHeight((videoRef?.current?.clientWidth || 500) * 0.75);
    }, 100);
  }, [videoRef]);

  const handleError = useCallback((err) => {
    if (err && err.action === "error" && err.errorMsg) {
      setError(err.errMsg);
    }
    console.error("error", err);
  }, []);

  const leftMeeting = useCallback(() => {
    // end call for attendees
    if (roomInfo?.accountType !== ADMIN) {
      setCurrentView("left-call");
      callFrame.destroy();
    }
    // remind the admin to export chat-- it's not saved anywhere other than local state
    else {
      window.alert(
        "Hey admin, don't forget to export the chat before closing this window if you want to save it."
      );
    }
  }, [roomInfo?.accountType, callFrame]);

  const createAndJoinCallFrame = useCallback(async () => {
    // As soon as there is a room URL available, create the Daily callframe
    if (!roomInfo || callFrame) return;
    console.log(callFrame);
    // Add room-specific call options, like room URL, to default/existing settings
    updateCallOptions(roomInfo);

    const newCallFrame = await DailyIframe.createFrame(
      videoRef.current,
      CALL_OPTIONS
    );

    setCallFrame(newCallFrame);
    setCurrentView("call");
    // update the callframe height to get the right aspect ratio
    updateSize();
    newCallFrame.on("left-meeting", leftMeeting).on("error", handleError);
    try {
      await newCallFrame.join();
    } catch (err) {
      console.error(err);
    }

    return () =>
      newCallFrame.off("left-meeting", leftMeeting).off("error", handleError);
  }, [roomInfo, videoRef, callFrame, updateSize, handleError, leftMeeting]);

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
      return true;
    } else {
      const errorMsg =
        "The token you're trying to use appears invalid. Please make sure the is_owner value is true and the room_name field is set.";
      setError(errorMsg);
      setCurrentView("waiting");
      return false;
    }
  }, [baseUrl, roomName, search]);

  /**
   * VALIDATING THE URL PROVIDED
   * 1. the room name is provided as part of the URL path and needs
   * to be validated as an existing Daily room that can be joined.
   * 2. an optional token ("t") query param can be used with a Daily
   * meeting token. There are used by webinar admins and also need to be
   * validated before the participant can join as a host.
   */
  useEffect(() => {
    // don't request room info if it's already set
    if (roomInfo) return;

    /*
     First, validate the room via Daily's REST API.
     Wait until validating an optional token query param
     below before setting room info. This helps avoid flashes of
     content.
     */
    validateDailyRoomProvided(roomName);

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

  // handle window resizes to manage aspect ratio of daily iframe
  useEffect(() => {
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [updateSize]);

  /**
   * JOINING THE ROOM - ADMIN AND ATTENDEE
   * 1. Admins: the username is set after the token is validated,
   * so if there's a username, we can start the call.
   * 2. Attendees: the username is set when the join form is submitted
   * and the room has already been validated, so we can start
   * the call.
   */
  useEffect(() => {
    if (!roomInfo?.username || callFrame) return;
    createAndJoinCallFrame();
  }, [roomInfo?.username, createAndJoinCallFrame, callFrame]);

  const renderCurrentViewUI = useMemo(() => {
    const addUsernameToRoomInfo = (username) => {
      setRoomInfo({
        ...roomInfo,
        username,
      });
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
            joinCall={addUsernameToRoomInfo}
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
