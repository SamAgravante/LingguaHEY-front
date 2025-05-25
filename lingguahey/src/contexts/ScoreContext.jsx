import React, { createContext, useContext } from 'react';

const ScoreContext = createContext();

export function ScoreProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const refreshScore = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ScoreContext.Provider value={{ refreshTrigger, refreshScore }}>
      {children}
    </ScoreContext.Provider>
  );
}

export function useScore() {
  return useContext(ScoreContext);
}
