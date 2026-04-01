import React, { createContext, useContext } from 'react';

const InviteContext = createContext(null);

export const InviteProvider = ({ children, resetInviteFlags }) => {
  return (
    <InviteContext.Provider value={{ resetInviteFlags }}>
      {children}
    </InviteContext.Provider>
  );
};

export const useInvite = () => useContext(InviteContext);