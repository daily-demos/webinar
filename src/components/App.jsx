import React from "react";
import styled from "styled-components";
import { Route, Routes } from "react-router-dom";
import theme from "../theme";
import WebinarCall from "../views/WebinarCall";
import Home from "../views/Home";
import Header from "./Header";
import decorativeSlash1 from "./images/slash1.svg";
import decorativeSlash2 from "./images/slash2.svg";
import decorativeSlash3 from "./images/slash3.svg";

const App = () => {
  return (
    <Container>
      <ImageContainer>
        <BackgroundImg1 src={decorativeSlash1} alt=" " />
        <BackgroundImg2 src={decorativeSlash2} alt=" " />
        <BackgroundImg3 src={decorativeSlash3} alt=" " />
      </ImageContainer>
      <Body>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:roomName" element={<WebinarCall />} />
        </Routes>
      </Body>
    </Container>
  );
};

const Container = styled.div`
  background: ${theme.colors.white};
  min-height: 100vh;
`;

const Image = styled.img`
  position: absolute;
  @media (max-width: 740px) {
    display: none;
  }
`;

const ImageContainer = styled.div`
  position: relative;
`;

const BackgroundImg1 = styled(Image)`
  left: 0;
  top: 100px;
`;
const BackgroundImg2 = styled(Image)`
  right: 0;
  top: 20px;
`;
const BackgroundImg3 = styled(Image)`
  right: 0;
  top: 400px;
`;

const Body = styled.div`
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 2rem 3rem;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 500px) {
    padding: 1rem;
  }
`;

export default App;
