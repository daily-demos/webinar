import React from "react";
import styled from "styled-components";
import HeaderText from "../components/text/HeaderText";
import theme from "../theme";

const Home = () => {
  return (
    <FlexContainer>
      <div>
        <HeaderText>Welcome to Daily!</HeaderText>
      </div>
      <div></div>
    </FlexContainer>
  );
};

const FlexContainer = styled.div`
  margin-top: 3rem;
  display: flex;
  width: 100%;
  @media (max-width: 996px) {
    flex-direction: column;
  }
`;

export default Home;
