"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { State } from "./PageState";
const FeedbackContext = createContext({
  message: "",
  notify: (message: string) => {
    void message;
  },
});
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [message, notify] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => notify(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <FeedbackContext.Provider value={{ message, notify }}>
      {children}
    </FeedbackContext.Provider>
  );
}
export const useFeedback = () => useContext(FeedbackContext);
export function OperationFeedback() {
  const { message, notify } = useFeedback();
  return message ? (
    <State tone="success">
      <span>{message}</span>
      <button onClick={() => notify("")} aria-label="Dismiss success message">
        Dismiss
      </button>
    </State>
  ) : null;
}
