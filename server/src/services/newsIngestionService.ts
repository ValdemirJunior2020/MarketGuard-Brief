import Parser from 'rss-parser';
import { createNewsItem, getNewsByUrl, upsertSource } from './firebaseDb.js';
import { getConfiguredFeedUrls } from '../utils/env.js';
import { summarizeMarketNews } from './openaiSummaryService.js';

const parser = new Parser();

const relevanceTerms = [
  'federal reserve',
  'fomc',
  'interest rate',
  'inflation',
  'cpi',
  'jobs report',
  'unemployment',
  'tariff',
  'treasury',
  'sec',
  'cftc',
  'central bank',
  'oil',
  'crypto',
  'regulation',
  'bank',
  'bond',
  'yield',
  'speech',
  'remarks',
  'statement'
];

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sourceUrlFromFeed(feedUrl: string) {
  try {
    const url = new URL(feedUrl);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return feedUrl;
  }
}

function scoreMarketRelevance(text: string) {
  const normalized = text.toLowerCase();
  const matched = relevanceTerms.filter((term) => normalized.includes(term));
  const score = Math.min(10, matched.length * 2);
  const riskLevel = score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low';
  return { score, riskLevel: riskLevel as 'low' | 'medium' | 'high', matched };
}

export async function ingestConfiguredNewsFeeds() {
  const feedUrls = getConfiguredFeedUrls();
  const results = [];

  for (const feedUrl of feedUrls) {
    const feed = await parser.parseURL(feedUrl);
    const sourceName = feed.title || sourceUrlFromFeed(feedUrl);

    const source = await upsertSource({
      name: sourceName,
      url: sourceUrlFromFeed(feedUrl),
      rssUrl: feedUrl
    });

    let created = 0;
    let skipped = 0;

    for (const item of feed.items) {
      const url = item.link || item.guid;
      if (!url) {
        skipped += 1;
        continue;
      }

      const existing = await getNewsByUrl(url);
      if (existing) {
        skipped += 1;
        continue;
      }

      const title = stripHtml(item.title || 'Untitled public update');
      const snippet = stripHtml(item.contentSnippet || item.content || item.summary || title).slice(0, 1400);
      const publishedAtDate = item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : new Date();
      const relevance = scoreMarketRelevance(`${title} ${snippet}`);
      const summary = await summarizeMarketNews({ title, source: source.name, snippet, publishedAt: publishedAtDate });

      await createNewsItem({
        title,
        url,
        source: source.name,
        sourceId: source.id,
        publishedAt: publishedAtDate.toISOString(),
        publishedAtMs: publishedAtDate.getTime(),
        snippet,
        aiSummary: summary.summary,
        whyItMatters: summary.whyItMatters,
        possibleAffectedAreas: Array.from(new Set([...summary.possibleAffectedAreas, ...relevance.matched])).slice(0, 8),
        riskLevel: relevance.score > 0 ? relevance.riskLevel : summary.riskLevel,
        isAiSummary: true,
        marketRelevanceScore: Math.max(relevance.score, summary.riskLevel === 'high' ? 7 : summary.riskLevel === 'medium' ? 4 : 1)
      });

      created += 1;
    }

    results.push({ feedUrl, source: source.name, created, skipped });
  }

  return { feedCount: feedUrls.length, results };
}
