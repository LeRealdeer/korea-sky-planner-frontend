'use client';

import { QuizProvider } from './sky/context/QuizContext';


export default function Providers({ children }) {
  return <QuizProvider>{children}</QuizProvider>;
}
