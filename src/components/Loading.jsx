import React from "react";
import styled from "styled-components";
import theme from "../theme";
import HeaderText from "./text/HeaderText";

const Loading = () => {
  return (
    <Container>
      <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
        <g fill="none" fillRule="evenodd" strokeWidth="2">
          <circle cx="22" cy="22" r="19.4775">
            <animate
              attributeName="r"
              begin="0s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="0s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="22" cy="22" r="11.8787">
            <animate
              attributeName="r"
              begin="-0.9s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="-0.9s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </Svg>
      <WaitText>Please wait...</WaitText>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin-top: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;
const Svg = styled.svg`
  height: 32px;
  stroke: ${theme.colors.blueDark};
  width: 32px;
  margin-bottom: 1rem;
`;

const WaitText = styled(HeaderText)`
  font-size: ${theme.fontSize.large};
`;

export default Loading;
