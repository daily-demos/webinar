import styled from "styled-components";
import theme from "../theme";

export const FlexContainer = styled.div`
  margin-top: 3rem;
  display: flex;
  width: 100%;
  @media (max-width: 996px) {
    flex-direction: column;
  }
`;

export const RightPanel = styled.div`
  flex: 1;
  margin-left: 3rem;

  @media (max-width: 996px) {
    margin-left: 0rem;
  }
`;

export const Card = styled.div`
  margin-top: 4rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.white};
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.06),
    0 16px 32px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;

  @media (max-width: 996px) {
    margin-left: 0rem;
  }
`;
