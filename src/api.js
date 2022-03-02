/**
 * Use for local testing (replace with commented out version below if deployed on Netlify)
 */
const API_URL = "https://api.daily.co/v1";

/**
 * Uncomment and use if deployed to Netlify (see README for instructions)
 */
// const API_URL = `${process.env.REACT_APP_API_URL}/api`;

export const fetchDailyRoom = async (roomName) => {
  const res = await fetch(`${API_URL}/rooms/${roomName}`, {
    method: "GET",
    /**
     * Remove these headers for the deployed to Netlify version
     */
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_DAILY_API_KEY}`,
    },
  });
  const dailyRoom = res.json();
  return dailyRoom;
};
export const fetchDailyToken = async (token) => {
  const res = await fetch(`${API_URL}/meeting-tokens/${token}`, {
    method: "GET",
    /**
     * Remove these headers for the deployed to Netlify version
     */
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_DAILY_API_KEY}`,
    },
  });

  const tokenRes = res.json();
  return tokenRes;
};
