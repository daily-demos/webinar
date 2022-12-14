import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import DailyIframe from "@daily-co/daily-js";
import styled from "styled-components";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import Chat from "../components/Chat";
import LeftCall from "../components/LeftCall";
import Loading from "../components/Loading";
import { InstructionText } from "../components/List";
import InCallSupportMessage from "../components/InCallSupportMessage";
import InCallWaitingRoom from "../components/InCallWaitingRoom";
import theme from "../theme";
import { ACCOUNT_TYPE } from "../constants";
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
  const [joined, setJoined] = useState(false);

  const { roomName } = useParams();
  const { search } = useLocation();
  const [searchParams] = useSearchParams();

  const baseUrl = process.env.REACT_APP_DAILY_BASE_URL;
  // add trailing slash if not included
  const formattedBaseUrl = baseUrl.replace(/\/?$/, "/");

  const updateCallOptions = (roomInfo) => {
    CALL_OPTIONS.url = roomInfo.url;
    // show local video is the person joining is an admin
    CALL_OPTIONS.showLocalVideo = roomInfo.accountType === ACCOUNT_TYPE.ADMIN;
    CALL_OPTIONS.userName = roomInfo.username;
    if (roomInfo.token) {
      CALL_OPTIONS.token = roomInfo.token;
    }
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
    if (roomInfo?.accountType !== ACCOUNT_TYPE.ADMIN) {
      setCurrentView("left-call");
      setJoined(false);
      callFrame.destroy();
    }
    // remind the admin to export chat-- it's not saved anywhere other than local state
    else {
      window.alert(
        "Hey admin, don't forget to export the chat before closing this window if you want to save it."
      );
    }
  }, [roomInfo?.accountType, callFrame]);

  const handleJoined = () => setJoined(true);

  const createAndJoinCallFrame = useCallback(async () => {
    // As soon as there is a room URL available, create the Daily callframe
    if (!roomInfo || callFrame) return;

    // Add room-specific call options, like room URL, to default/existing settings
    updateCallOptions(roomInfo);

    const newCallFrame = await DailyIframe.createFrame(
      videoRef.current,
      CALL_OPTIONS
    );

    setCallFrame(newCallFrame);
    setCurrentView("call");

    // Add Daily event handlers
    newCallFrame
      .on("left-meeting", leftMeeting)
      .on("error", handleError)
      .on("joined-meeting", handleJoined);

    try {
      await newCallFrame.join();
      // update the callframe height to get the right aspect ratio
      updateSize();
    } catch (err) {
      console.error(err);
    }

    return () =>
      // Remove Daily event handlers
      newCallFrame
        .off("left-meeting", leftMeeting)
        .off("error", handleError)
        .off("joined-meeting", handleJoined);
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
    const token = searchParams.get("t");

    // validate the token from the URL if supplied
    const tokenInfo = await fetchDailyToken(token);

    if (tokenInfo.is_owner && tokenInfo.room_name === roomName) {
      // add admin setting
      setRoomInfo({
        token,
        username: tokenInfo.user_name,
        url: `${formattedBaseUrl}${roomName}`,
        accountType: ACCOUNT_TYPE.ADMIN,
      });
      return true;
    } else {
      const errorMsg =
        "The token you're trying to use appears invalid. Please make sure the is_owner value is true and the room_name field is set.";
      setError(errorMsg);
      setCurrentView("waiting");
      return false;
    }
  }, [formattedBaseUrl, roomName, searchParams]);

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
        url: `${formattedBaseUrl}${roomName}`,
        accountType: ACCOUNT_TYPE.PARTICIPANT,
      });
      // show waiting room view with name form
      setCurrentView("waiting");
    }
  }, [
    formattedBaseUrl,
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

  /**
   * Render some conditional UI depending on where the participant is
   * in the user flow
   */
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
      default:
        return null;
    }
  }, [currentView, startTime, roomInfo, error]);

  return (
    <FlexContainerColumn>
      <FlexContainer>
        {/* Daily video call iframe */}
        <VideoContainer height={height} hidden={currentView !== "call"}>
          <CallFrame ref={videoRef} />
        </VideoContainer>

        {/* Additional UI depending on current state of call */}
        {renderCurrentViewUI}

        {/* Only show chat when call is officially joined (in case pre-join UI is enabled) */}
        {joined && (
          <Chat
            callFrame={callFrame}
            accountType={roomInfo.accountType}
            height={height}
            username={roomInfo.username}
          />
        )}

        {/* Show any error messages we're aware of */}
        {error && <ErrorText>Error: {error}</ErrorText>}
      </FlexContainer>
      {/* Extra message with Daily custom support info */}
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
`;

export default WebinarCall;
