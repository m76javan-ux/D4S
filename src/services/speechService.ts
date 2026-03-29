export const speakDutch = (text: string) => {
  const cleanText = text.replace(/\*/g, '').replace(/#/g, '');
  const speech = new SpeechSynthesisUtterance(cleanText);
  speech.lang = "nl-NL";
  speech.rate = 0.95;
  window.speechSynthesis.speak(speech);
};

export const recognizeSpeech = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      reject("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "nl-NL";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(event.error);
    };

    recognition.start();
  });
};
