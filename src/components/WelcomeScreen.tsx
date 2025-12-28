import React from "react";

interface WelcomeScreenProps {
  onClick: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClick }) => {
  return (
    <div className="welcome-screen main">
      <div className="background"></div>
      <div className="content">
        <div className='top-wrapper'>
          <h1 className='cookie-regular glow header'>Art Exhibition System</h1>
        </div>
        <div className='middle-wrapper'>
          <h1 className='roboto-medium'>Welcome!</h1>
          <h2 className='roboto-medium'>Check your painting status to know if your painting was approved for Grand Exhibition</h2>
        </div>
        <div className='bottom-wrapper'>
          <button onClick={onClick}><span className="text">Check the painting</span></button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;