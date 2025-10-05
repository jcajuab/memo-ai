import type { TranscriptionResponse } from "@/services/transcription.service";

export interface KeyPoint {
  text: string;
  timestamp: string;
}

export const DEFAULT_SUMMARY =
  "The quarterly planning meeting covered key objectives for Q4 2025, including product roadmap updates, resource allocation, and team expansion plans. The team discussed the successful launch of the new AI transcription feature and identified areas for improvement in user onboarding. Budget considerations for hiring two additional engineers were approved, and the marketing team presented their campaign strategy for the upcoming product release.";

export const DEFAULT_KEY_POINTS: KeyPoint[] = [
  {
    text: "Q4 product roadmap finalized with focus on AI-powered features and mobile app development. The team unanimously agreed to prioritize machine learning capabilities in the core product, with Sarah presenting a detailed timeline for implementation. Mobile app development will begin in early November with cross-platform support using React Native.",
    timestamp: "02:15",
  },
  {
    text: "New AI transcription feature achieved 95% accuracy rate in initial testing across various audio qualities and accents. The QA team ran comprehensive tests with over 500 audio samples, including challenging scenarios with background noise and multiple speakers. This exceeds our initial target of 90% accuracy and positions us competitively in the market.",
    timestamp: "05:42",
  },
  {
    text: "Budget approved for hiring two senior engineers and one product designer to support the growing product demands. The finance committee reviewed the hiring proposal and allocated $450,000 for total compensation packages. Recruitment will begin immediately with a target to have all positions filled by mid-November. Priority will be given to candidates with AI/ML experience.",
    timestamp: "12:30",
  },
  {
    text: "Marketing campaign scheduled to launch on November 15th with targeted social media and content strategy focusing on product differentiation and user testimonials. The campaign will include a series of blog posts, video tutorials, and case studies from beta users. Initial budget of $75,000 allocated for paid advertising across LinkedIn, Twitter, and industry-specific platforms.",
    timestamp: "18:05",
  },
  {
    text: "User feedback shows 4.7/5 satisfaction rating with particularly strong praise for the transcription accuracy, but onboarding improvements needed based on user session recordings. Analytics revealed that 23% of new users struggled with the initial setup process. UX team proposed a simplified three-step onboarding flow with interactive tooltips and video guides to address this concern.",
    timestamp: "23:18",
  },
  {
    text: "Next milestone: Beta launch of mobile app by end of Q4 with core functionality including real-time transcription, cloud sync, and offline mode. The development team committed to delivering an MVP with iOS and Android versions simultaneously. Early access program will include 100 selected users from our existing customer base for feedback and testing before public release in January.",
    timestamp: "28:50",
  },
];

export function formatTimestamp(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function buildDynamicKeyPoints(
  transcription: TranscriptionResponse,
  desiredCount = 6,
): KeyPoint[] {
  const words = transcription.response.words ?? [];

  if (words.length === 0) {
    return [];
  }

  const chunkSize = Math.max(12, Math.ceil(words.length / desiredCount));
  const keyPoints: KeyPoint[] = [];

  for (let index = 0; index < words.length; index += chunkSize) {
    const chunk = words.slice(index, index + chunkSize);
    if (chunk.length === 0) {
      continue;
    }

    const startTime = formatTimestamp(chunk[0]?.start ?? 0);
    const text = chunk
      .map((word) => word.word)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length === 0) {
      continue;
    }

    keyPoints.push({ text, timestamp: startTime });
    if (keyPoints.length >= desiredCount) {
      break;
    }
  }

  return keyPoints;
}
