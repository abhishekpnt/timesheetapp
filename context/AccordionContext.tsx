import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AccordionContextProps {
  isAccordionExpanded: boolean;
  setAccordionExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

export const AccordionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAccordionExpanded, setAccordionExpanded] = useState(false);

  return (
    <AccordionContext.Provider value={{ isAccordionExpanded, setAccordionExpanded }}>
      {children}
    </AccordionContext.Provider>
  );
};

export const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
};
