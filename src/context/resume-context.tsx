
"use client";

import type { ExtractResumeDataOutput } from '@/types/resume';
import { defaultResumeData } from '@/types/resume';
import type { Dispatch, ReactNode } from 'react';
import * as React from 'react';

// Define the shape of the state
interface ResumeState {
  resume: ExtractResumeDataOutput;
}

// Define the actions
type ResumeAction = {
  type: 'SET_RESUME_DATA';
  payload: ExtractResumeDataOutput;
};

// Create the context
const ResumeContext = React.createContext<{
  state: ResumeState;
  dispatch: Dispatch<ResumeAction>;
} | undefined>(undefined);

// Define the reducer
function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'SET_RESUME_DATA':
      return { ...state, resume: action.payload };
    default:
      return state;
  }
}

// Define the provider component
export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = React.useReducer(resumeReducer, { resume: defaultResumeData });

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook to use the resume context
export function useResumeContext() {
  const context = React.useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
}
