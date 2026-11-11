import { useCallback, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

interface UseVoiceOptions {
  onTranscript?: (transcript: string) => void;
}

export function useVoice({ onTranscript }: UseVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setVoiceError(null);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const recognizedText = event.results?.[0]?.transcript?.trim();

    if (!recognizedText) return;

    setTranscript(recognizedText);
    onTranscriptRef.current?.(recognizedText);
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);

    if (event.error === "aborted") return;

    setVoiceError(
      event.message || "Speech recognition failed. Please try again.",
    );
  });

  const startListening = useCallback(async () => {
    try {
      setVoiceError(null);
      setTranscript("");

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        setVoiceError(
          "Microphone permission is required. Please enable it in your device settings.",
        );
        return false;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });

      return true;
    } catch (error) {
      console.error("Speech recognition error:", error);
      setVoiceError("Unable to start the microphone. Please try again.");
      return false;
    }
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const cancelListening = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    voiceError,
    startListening,
    stopListening,
    cancelListening,
  };
}
