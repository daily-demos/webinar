import React from "react";
import styled from "styled-components";
import theme from "../theme";
import Anchor from "./Anchor";
import logo from "./images/logo.svg";

const Header: React.FC = () => {
  return (
    <Container>
      <LogoContainer>
        <div>
          <Logo src={logo} />
        </div>
      </LogoContainer>
      <Anchor underline={false} href="https://dashboard.daily.co/signup">
        <TextStyledLikeButton>Sign up for free</TextStyledLikeButton>
      </Anchor>
    </Container>
  );
};

const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 1rem 2rem 1rem;
`;
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const Logo = styled.img`
  width: 5rem;
`;
const TextStyledLikeButton = styled.span`
  display: block;
  padding: 0.4rem 1rem 0.5rem;
  background-color: ${theme.colors.white};
  color: ${theme.colors.blueDark};
  font-size: ${theme.fontSize.base};
  border-radius: 6px;
  border: 1px solid #c8d1dc;
  font-family: ${theme.fontFamily.bold};

  &:hover {
    border: 1px solid ${theme.colors.greyDark};
  }
`;

export default Header;
