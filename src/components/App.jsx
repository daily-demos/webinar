import React from "react";
import styled from "styled-components";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import theme from "../theme";
import WebinarCall from "../views/WebinarCall";
import Home from "../views/Home";
import Header from "./Header";
import decorativeSlash1 from "./images/slash1.svg";
import decorativeSlash2 from "./images/slash2.svg";
import decorativeSlash3 from "./images/slash3.svg";
import Footer from "./Footer";

function App() {
  return (
    <Router>
      <Container>
        <ImageContainer>
          <BackgroundImg1 src={decorativeSlash1} alt=" " />
          <BackgroundImg2 src={decorativeSlash2} alt=" " />
          <BackgroundImg3 src={decorativeSlash3} alt=" " />
        </ImageContainer>
        <Body>
          <Header />
          <Switch>
            <Route path="/:roomName">
              <WebinarCall />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
          <Footer />
        </Body>
      </Container>
    </Router>
  );
}

const Container = styled.div`
  background: ${theme.colors.white};
  min-height: 100vh;
  padding-top: 2rem;
  padding-bottom: 2rem;
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
  transform: scaleX(-1);
  top: 20px;
`;
const BackgroundImg2 = styled(Image)`
  right: 0;
  top: 40px;
`;
const BackgroundImg3 = styled(Image)`
  right: 0;
  top: 400px;
`;

const Body = styled.div`
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 3rem;
  padding-right: 3rem;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export default App;
