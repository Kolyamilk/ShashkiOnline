import React, { createContext, useState, useContext } from 'react';

const GameTypeContext = createContext();

export const useGameType = () => useContext(GameTypeContext);

export const GameTypeProvider = ({ children }) => {
  const [gameType, setGameType] = useState('russian'); // 'russian' или 'giveaway'

  return (
    <GameTypeContext.Provider value={{ gameType, setGameType }}>
      {children}
    </GameTypeContext.Provider>
  );
};