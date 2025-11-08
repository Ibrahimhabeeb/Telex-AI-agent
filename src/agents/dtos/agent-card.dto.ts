export class AgentCardDto {
  name = process.env.AGENT_NAME || 'Audio Intelligence Agent';
  description = 'An AI agent that analyzes and transcribes audio files, providing insights such as speech-to-text conversion and sentiment analysis.';
  url = "https://telex-ai-agent-production-fb6a.up.railway.app";
  provider = {
    organization: process.env.AGENT_ORGANIZATION || 'Your Org',
    url: "https://telex-ai-agent-production-fb6a.up.railway.app"
  };
  version = '1.0.0';
  documentationUrl = `https://telex-ai-agent-production-fb6a.up.railway.app/docs`;
  capabilities = {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true,
  };
  defaultInputModes = ['audio'];
  defaultOutputModes = ['text', 'markdown'];
  skills = [
    {
      id: 'transcribe_audio',
      name: 'Transcribe Audio',
      description: 'Convert speech to text and analyze the sentiment or tone of the conversation.',
      inputModes: ['audio'],
      outputModes: ['text', 'markdown'],
      examples: [
        'Transcribe this audio clip.',
        'What is being discussed in this recording?',
        'Summarize this podcast episode.',
      ],
    },
    {
      id: 'analyze_audio',
      name: 'Analyze Audio',
      description: 'Detect emotions, classify speakers, and provide insights from audio content.',
      inputModes: ['audio'],
      outputModes: ['text', 'markdown'],
      examples: [
        'Analyze the emotions in this audio file.',
        'Who sounds angry or happy in this recording?',
      ],
    },
  ];
  supportsAuthenticatedExtendedCard = false;
}
