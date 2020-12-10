import styled from "styled-components";
import BodyText from "./text/BodyText";
import theme from "../theme";

export const SubContainer = styled.div`
  flex: 1;
  margin-right: 3rem;

  @media (max-width: 996px) {
    margin-right: 0rem;
  }
`;

export const HintList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

export const HintListItem = styled.li`
  display: flex;
`;

export const Icon = styled.img`
  width: 1.5rem;
  margin-right: 0.5rem;
`;

export const FormHeader = styled(BodyText)`
  font-weight: 600;
  color: ${theme.colors.blueDark};
`;

export const InstructionText = styled(FormHeader)`
  margin-top: 1rem;
`;
