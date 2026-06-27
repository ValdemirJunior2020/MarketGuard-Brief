import OpenAI from 'openai';
import { env } from '../utils/env.js';

export type MarketSummary = {
  summary: string;
  whyItMatters: string;
  possibleAffectedAreas: string[];
  riskLevel: 'low' | 'medium' | 'high';
  isFinancialAdvice: false;
};

const neutralFallback: MarketSummary = {
  summary: 'This item may be relevant to market sentiment. Review the original source before making any decision.',
  whyItMatters: 'The source may include public information that traders monitor for changes in sentiment, policy expectations, or volatility.',
  possibleAffectedAreas: ['market sentiment'],
  riskLevel: 'low',
  isFinancialAdvice: false
};

function hasInstructionalTradingLanguage(text: string) {
  const normalized = text.toLowerCase();
  const blockedPatterns = [
    /\bshould\s+(buy|sell|short|hold|enter|exit)\b/,
    /\bmust\s+(buy|sell|short|hold|enter|exit)\b/,
    /\btrade\s+this\s+now\b/,
    /\bprice\s+target\b/,
    /\bguaranteed\b/,
    /\bwill\s+profit\b/,
    /\bwill\s+prevent\s+loss\b/
  ];
  return blockedPatterns.some((pattern) => pattern.test(normalized));
}

function sanitizeSummary(value: MarketSummary): MarketSummary {
  const combined = [value.summary, value.whyItMatters, ...value.possibleAffectedAreas].join(' ');
  if (value.isFinancialAdvice || hasInstructionalTradingLanguage(combined)) {
    return neutralFallback;
  }

  return {
    summary: value.summary || neutralFallback.summary,
    whyItMatters: value.whyItMatters || neutralFallback.whyItMatters,
    possibleAffectedAreas: Array.isArray(value.possibleAffectedAreas) ? value.possibleAffectedAreas.slice(0, 6) : ['market sentiment'],
    riskLevel: ['low', 'medium', 'high'].includes(value.riskLevel) ? value.riskLevel : 'low',
    isFinancialAdvice: false
  };
}

export async function summarizeMarketNews(input: {
  title: string;
  source: string;
  snippet: string;
  publishedAt: Date;
}): Promise<MarketSummary> {
  if (!env.openAiApiKey) {
    return neutralFallback;
  }

  const client = new OpenAI({ apiKey: env.openAiApiKey });

  try {
    const response = await client.responses.create({
      model: env.openAiModel,
      input: [
        {
          role: 'system',
          content:
            'You create concise news intelligence summaries. Do not provide financial advice, trading instructions, forecasts stated as certainty, price targets, or sensational language. Use neutral wording and uncertainty.'
        },
        {
          role: 'user',
          content: JSON.stringify({
            task: 'Summarize this public news item for market risk awareness only.',
            requiredTone: 'neutral, informational, uncertainty-aware',
            title: input.title,
            source: input.source,
            publishedAt: input.publishedAt.toISOString(),
            snippet: input.snippet
          })
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'marketguard_summary',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: { type: 'string' },
              whyItMatters: { type: 'string' },
              possibleAffectedAreas: {
                type: 'array',
                items: { type: 'string' }
              },
              riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
              isFinancialAdvice: { type: 'boolean', const: false }
            },
            required: ['summary', 'whyItMatters', 'possibleAffectedAreas', 'riskLevel', 'isFinancialAdvice']
          }
        }
      }
    });

    const outputText = response.output_text;
    const parsed = JSON.parse(outputText) as MarketSummary;
    return sanitizeSummary(parsed);
  } catch (error) {
    console.error('OpenAI summary failed', error);
    return neutralFallback;
  }
}
