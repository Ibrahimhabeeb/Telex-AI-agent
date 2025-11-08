export class AgentCardDto {
  name = process.env.AGENT_NAME || 'Audio Intelligence Agent';
  description = 'An AI agent that analyzes content from URLs or audio files, providing insights such as speech-to-text conversion and sentiment analysis.';
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

  // Changed to accept URL and text as default input
  defaultInputModes = ['url', 'text'];
  defaultOutputModes = ['text', 'markdown'];

  skills = [
    {
      id: 'transcribe_content',
      name: 'Transcribe Content',
      description: 'Convert speech from audio or content from a URL into text, and analyze sentiment or tone.',
      inputModes: ['audio', 'url', 'text'], // now accepts audio, URL, or text
      outputModes: ['text', 'markdown'],
      examples: [
        'Transcribe this audio clip.',
        'Summarize this podcast episode from URL.',
        'Analyze this text for sentiment.',
      ],
    },
    {
      id: 'analyze_content',
      name: 'Analyze Content',
      description: 'Detect emotions, classify speakers, or provide insights from audio, URL, or text content.',
      inputModes: ['audio', 'url', 'text'], // now accepts audio, URL, or text
      outputModes: ['text', 'markdown'],
      examples: [
        'Analyze emotions in this audio file.',
        'Who sounds angry or happy in this recording?',
        'Analyze this URL for key insights.',
      ],
    },
  ];

  supportsAuthenticatedExtendedCard = false;
}
