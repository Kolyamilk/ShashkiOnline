import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [boardLightColor, setBoardLightColor] = useState('#f0d9b5');
  const [boardDarkColor, setBoardDarkColor] = useState('#b58863');
  const [myPieceColor, setMyPieceColor] = useState('#FFFFFF');
  const [opponentPieceColor, setOpponentPieceColor] = useState('#333333');
  const [myKingStyle, setMyKingStyle] = useState('crown');
  const [opponentKingStyle, setOpponentKingStyle] = useState('poop');
  const [kingCrownColor, setKingCrownColor] = useState('#FFD700'); // общий цвет короны

  return (
    <SettingsContext.Provider
      value={{
        boardLightColor,
        boardDarkColor,
        setBoardLightColor,
        setBoardDarkColor,
        myPieceColor,
        setMyPieceColor,
        opponentPieceColor,
        setOpponentPieceColor,
        myKingStyle,
        setMyKingStyle,
        opponentKingStyle,
        setOpponentKingStyle,
        kingCrownColor,
        setKingCrownColor,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};