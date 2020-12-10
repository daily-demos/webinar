import styled from "styled-components";
import theme from "../../theme";

const BodyText = styled.p`
  font-size: ${theme.fontSize.med};
  color: ${theme.colors.greyDark};
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin: 0;
  line-height: 20px;
`;

export default BodyText;
