const API_URL =
  process.env.REACT_APP_ROOM_ENDPOINT === "local"
    ? "https://api.daily.co/v1"
    : `${process.env.REACT_APP_API_URL}/api`;

const HEADERS =
  process.env.REACT_APP_ROOM_ENDPOINT === "local"
    ? {}
    : {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_DAILY_API_KEY}`,
      };

export const fetchDailyRoom = async (roomName) => {
  const res = await fetch(`${API_URL}/rooms/${roomName}`, {
    method: "GET",
    headers: HEADERS,
  });
  const dailyRoom = res.json();
  return dailyRoom;
};
export const fetchDailyToken = async (token) => {
  const res = await fetch(`${API_URL}/meeting-tokens/${token}`, {
    method: "GET",
    headers: HEADERS,
  });

  const tokenRes = res.json();
  return tokenRes;
};
