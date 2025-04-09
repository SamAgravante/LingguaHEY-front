import React from 'react';
import styled from 'styled-components';
import handWaveImage from '../assets/images/hand-wave.png'; // Import the image

// Styled Components for Styling
const HomePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center; // Center content vertically
  justify-content: center; // Center content horizontally
  height: 100vh;
  background-color: #282c34;
  color: white;
  font-family: sans-serif;
  text-align: center; // Center text within elements
`;

const HandContainer = styled.div`
  background-color: #b0e0e6;
  padding: 20px;
  border-radius: 20px;
  margin-bottom: 20px;
  display: flex; // Add flexbox to center image
  justify-content: center; // Center image horizontally
  align-items: center; // Center image vertically
`;

const HandImage = styled.img`
  max-width: 100%; // Ensure image doesn't exceed container width
  height: auto;
  display: block; // Remove inline spacing
`;

const Title = styled.h1`
  font-size: 2em;
  margin-bottom: 5px;
`;

const Subtitle = styled.p`
  font-size: 1em;
  color: #ccc;
  margin-bottom: 20px;
`;

const GetStartedButton = styled.button`
  background-color: #2ecc71;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #27ae60;
  }
`;

const SignupLink = styled.p`
  margin-top: 20px;
  font-size: 0.9em;
  color: #ccc;

  a {
    color: #b0e0e6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// HomePage Component
const HomePage = () => {
  return (
    <HomePageContainer>
      <HandContainer>
        <HandImage src={handWaveImage} alt="Hand Wave" />
      </HandContainer>
      <Title>LingguaHey</Title>
      <Subtitle>Learn languages with fun!</Subtitle>
      <GetStartedButton>Get Started</GetStartedButton>
      <SignupLink>
        No Account Yet? <a href="/signup">Register Now</a>
      </SignupLink>
    </HomePageContainer>
  );
};

export default HomePage;