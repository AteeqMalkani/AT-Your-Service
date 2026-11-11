import { useState, useEffect, useRef } from 'react';
import { aiService } from '../services/api';
import { RequestDraft, ContinueRequestResponse } from '../types/api';

export interface Message {
  text: string;
  isUser: boolean;
}

export function useConversation(
  initialParams: {
    requestId: string | null;
    initialDraft: string | null;
    question: string | null;
    initialMessage: string | null;
  }
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<RequestDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isAskingAnythingElse, setIsAskingAnythingElse] = useState(false);
  const [isCollectingAdditionalDetails, setIsCollectingAdditionalDetails] = useState(false);

  useEffect(() => {
    if (initialParams.requestId && initialParams.initialDraft) {
      try {
        const parsedDraft = JSON.parse(initialParams.initialDraft as string);
        setDraft(parsedDraft);

        setMessages([
          { text: initialParams.initialMessage as string, isUser: true },
          { text: initialParams.question || "How can I help you further?", isUser: false },
        ]);
      } catch (e) {
        console.error("Failed to parse initial draft", e);
      }
    }
  }, [initialParams.requestId, initialParams.initialDraft, initialParams.question, initialParams.initialMessage]);

  const sendFollowUp = async (message: string) => {
    if (!message.trim() || !draft) return { success: false, error: "Invalid input or missing draft" };

    setLoading(true);
    setError(null);

    const userMessage = message.trim();
    const currentMessages = [...messages, { text: userMessage, isUser: true }];
    setMessages(currentMessages);

    try {
      const response = await aiService.continueRequest({
        requestId: draft.requestId,
        draft: draft,
        message: userMessage,
      });

      setDraft(response.draft);

      if (response.status === "ready_for_review") {
        setIsComplete(true);
        if (isAskingAnythingElse || isCollectingAdditionalDetails) {
          setMessages([
            ...currentMessages,
            {
              text: "Updated! Your request is still ready for review. Would you like to add anything else?",
              isUser: false,
            },
          ]);
          setIsAskingAnythingElse(true);
          setIsCollectingAdditionalDetails(false);
        } else {
          setMessages([
            ...currentMessages,
            {
              text: "Great! Your request is now complete and ready for review. Would you like to add anything else?",
              isUser: false,
            },
          ]);
          setIsAskingAnythingElse(true);
        }
      } else if (response.nextQuestion) {
        setIsComplete(false);
        setMessages([
          ...currentMessages,
          { text: response.nextQuestion, isUser: false },
        ]);
      } else {
        setMessages([
          ...currentMessages,
          { text: "I have updated your request.", isUser: false },
        ]);
      }
      return { success: true };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to send answer. Please try again.";
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  const handleAnythingElseYes = () => {
    setIsCollectingAdditionalDetails(true);
    setIsAskingAnythingElse(false);
    setMessages([
      ...messages,
      { text: "Yes, I want to add something", isUser: true },
      { text: "What would you like to add?", isUser: false },
    ]);
  };

  const handleAnythingElseNo = () => {
    setIsAskingAnythingElse(false);
  };

  return {
    messages,
    setMessages,
    draft,
    setDraft,
    loading,
    error,
    isComplete,
    isAskingAnythingElse,
    isCollectingAdditionalDetails,
    sendFollowUp,
    handleAnythingElseYes,
    handleAnythingElseNo,
    setError,
  };
}
