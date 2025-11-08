export class AgentCardDto {
  name = process.env.AGENT_NAME || 'Content Intelligence Agent';
  description = 'An AI agent that analyzes content from URLs or text, providing insights such as text analysis, summarization, and sentiment detection.';
  url = "https://telex-ai-agent-production-fb6a.up.railway.app";
  provider = {
    organization: process.env.AGENT_ORGANIZATION || 'Your Org',
    url: "https://telex-ai-agent-production-fb6a.up.railway.app"
  };
  version = '1.0.0';
  documentationUrl = `https://telex-ai-agent-production-fb6a.up.railway.app/docs`;
  capabilities = {
    streaming: false,  // set to false since no audio streaming
    pushNotifications: false,
    stateTransitionHistory: true,
  };

  defaultInputModes = ['url', 'text'];        // only text or URL
  defaultOutputModes = ['text', 'markdown'];  // only text/markdown outputs

  skills = [
    {
      id: 'transcribe_content',
      name: 'Process Content',
      description: 'Process and analyze content from a URL or plain text, providing summaries or sentiment analysis.',
      inputModes: ['url', 'text'],        // removed 'audio'
      outputModes: ['text', 'markdown'],
      examples: [
        {
          input: { parts: [{ text: 'Summarize this article from URL.', contentType: 'text/plain' }] },
          output: { parts: [{ text: 'Summary goes here...', contentType: 'text/plain' }] }
        },
        {
          input: { parts: [{ text: 'Analyze this text for sentiment.', contentType: 'text/plain' }] },
          output: { parts: [{ text: 'Positive sentiment detected.', contentType: 'text/plain' }] }
        }
      ]
    },
    {
      id: 'analyze_content',
      name: 'Analyze Content',
      description: 'Analyze text content from a URL or plain text to detect sentiment, tone, or key insights.',
      inputModes: ['url', 'text'],       // removed 'audio'
      outputModes: ['text', 'markdown'],
      examples: [
        {
          input: { parts: [{ text: 'Analyze this article for key points.', contentType: 'text/plain' }] },
          output: { parts: [{ text: 'Key points extracted...', contentType: 'text/plain' }] }
        }
      ]
    }
  ];

  supportsAuthenticatedExtendedCard = false;
}
