import React from "react";
import styled from "styled-components";
import theme from "../theme";
import Anchor from "./Anchor";
import fbIcon from "./images/fb-icon.svg";
import twitterIcon from "./images/twitter-icon.svg";

const Footer = () => {
  return (
    <Container>
      <LinksContainer>
        <Column>
          <Category>Product</Category>
          <Anchor href="https://www.daily.co/hipaa-compliance">
            <LinkText>HIPAA Compliance</LinkText>
          </Anchor>
          <Anchor href="https://www.daily.co/security">
            <LinkText>Security & Compliance</LinkText>
          </Anchor>
          <Anchor href="https://www.daily.co/pricing">
            <LinkText>Pricing</LinkText>
          </Anchor>
        </Column>
        <Column>
          <Category>Resources</Category>
          <Anchor href="https://docs.daily.co/docs">
            <LinkText>Getting Started</LinkText>
          </Anchor>
          <Anchor href="https://docs.daily.co/docs/reference-docs">
            <LinkText>Reference docs</LinkText>
          </Anchor>
          <Anchor href="https://www.daily.co/blog/tag/code-tutorials/">
            <LinkText>Tutorials</LinkText>
          </Anchor>
          <Anchor href="https://docs.daily.co/changelog">
            <LinkText>Changelog</LinkText>
          </Anchor>
          <Anchor href="https://help.daily.co/en/">
            <LinkText>Help center</LinkText>
          </Anchor>
        </Column>
        <Column>
          <Category>Company</Category>
          <Anchor href="https://www.daily.co/about-us">
            <LinkText>About us</LinkText>
          </Anchor>
          <Anchor href="https://www.daily.co/privacy">
            <LinkText>Privacy Policy</LinkText>
          </Anchor>
          <Anchor href="https://www.daily.co/terms-of-service">
            <LinkText>Terms of Service</LinkText>
          </Anchor>
          <Anchor href="https://www.daily.co/contact">
            <LinkText>Contact us</LinkText>
          </Anchor>
        </Column>
      </LinksContainer>
      <FlexContainerIcons>
        <MediumText>Built worldwide</MediumText>
        <IconContainer>
          <Anchor href="https://twitter.com/trydaily">
            <Icon src={twitterIcon} alt="Daily's Twitter" />
          </Anchor>
          <Anchor href="https://www.facebook.com/dailydotco/">
            <Icon src={fbIcon} alt="Daily's Facebook" />
          </Anchor>
        </IconContainer>
      </FlexContainerIcons>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 6rem;
  padding-right: 1rem;
  padding-left: 1rem;
  margin-top: auto;
  margin-bottom: 1rem;
  width: 100%;
`;
const LinksContainer = styled.div`
  display: flex;
  padding-bottom: 3rem;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
const Category = styled.h4`
  font-size: ${theme.fontSize.med};
  color: ${theme.colors.blueDark};
  font-family: Graphik Medium, Arial, sans-serif;
  line-height: 24px;
`;
const LinkText = styled.span`
  font-size: ${theme.fontSize.med};
  color: ${theme.colors.blue};
  line-height: 24px;
  font-family: Graphik Web, Arial, sans-serif;
  margin-bottom: 8px;
  text-decoration: none;
  display: block;
`;
const FlexContainerIcons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const MediumText = styled.p`
  margin: 0;
  font-size: ${theme.fontSize.med};
  color: ${theme.colors.greyDark};
`;
const IconContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const Icon = styled.img`
  margin-left: 0.75rem;
  margin-right: 0.75rem;
`;

export default Footer;
