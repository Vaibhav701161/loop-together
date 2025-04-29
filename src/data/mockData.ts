
export interface Tool {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  monetization: "free" | "freemium" | "paid";
  rating: number;
  reviewCount: number;
  featured: boolean;
  imageUrl: string;
  developerName: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  usages: number;
  apiEndpoint?: string;
  promptTemplate?: string;
}

export const toolsData: Tool[] = [
  {
    id: "1",
    title: "TextGenie",
    description: "AI-powered content writing assistant with multiple templates",
    longDescription: "TextGenie is a powerful AI content writing assistant that helps you create high-quality content in seconds. Choose from multiple templates for blog posts, social media, emails, and more. The advanced language model understands context and can adapt to your brand voice.",
    category: "writing",
    tags: ["content", "copywriting", "blog", "marketing"],
    monetization: "freemium",
    rating: 4.7,
    reviewCount: 283,
    featured: true,
    imageUrl: "https://placehold.co/500x300/7359D6/FFF?text=TextGenie",
    developerName: "AI Writing Labs",
    createdAt: "2023-05-12T14:23:00Z",
    updatedAt: "2023-11-05T09:45:00Z",
    views: 12450,
    usages: 8720,
    promptTemplate: "Write a [content type] about [topic] in a [tone] tone."
  },
  {
    id: "2",
    title: "PixelMind",
    description: "Generate stunning images from text descriptions with advanced AI",
    longDescription: "PixelMind uses cutting-edge AI to transform your text descriptions into beautiful, unique images. Perfect for designers, marketers, and creatives who need visual content quickly. Features include custom styles, aspect ratios, and commercial usage rights.",
    category: "design",
    tags: ["images", "art", "graphics", "creative"],
    monetization: "freemium",
    rating: 4.9,
    reviewCount: 542,
    featured: true,
    imageUrl: "https://placehold.co/500x300/FF8E25/FFF?text=PixelMind",
    developerName: "Visual AI Systems",
    createdAt: "2023-03-22T11:14:00Z",
    updatedAt: "2023-10-17T16:30:00Z",
    views: 28750,
    usages: 15230,
    promptTemplate: "Create an image of [subject] with style [style] in [setting]."
  },
  {
    id: "3",
    title: "DataSense",
    description: "Transform complex data into insightful visualizations and reports",
    longDescription: "DataSense makes data analysis accessible to everyone. Upload your CSV, Excel, or JSON data and get instant insights with beautiful visualizations and comprehensive reports. Advanced machine learning algorithms identify patterns and trends you might miss.",
    category: "analysis",
    tags: ["data", "visualization", "reports", "business"],
    monetization: "paid",
    rating: 4.6,
    reviewCount: 178,
    featured: true,
    imageUrl: "https://placehold.co/500x300/E04C90/FFF?text=DataSense",
    developerName: "Insight Analytics",
    createdAt: "2023-07-09T09:33:00Z",
    updatedAt: "2023-11-20T14:15:00Z",
    views: 8920,
    usages: 4230,
    apiEndpoint: "https://api.example.com/datasense"
  },
  {
    id: "4",
    title: "CodeAssist",
    description: "AI pair programmer that helps you write better code faster",
    longDescription: "CodeAssist is your AI pair programmer that understands multiple programming languages and frameworks. Get code completions, refactoring suggestions, bug fixes, and documentation help as you type. Integrates with popular IDEs and code editors.",
    category: "development",
    tags: ["programming", "code", "developer", "productivity"],
    monetization: "free",
    rating: 4.8,
    reviewCount: 312,
    featured: false,
    imageUrl: "https://placehold.co/500x300/2563EB/FFF?text=CodeAssist",
    developerName: "DevTools AI",
    createdAt: "2023-04-15T16:42:00Z",
    updatedAt: "2023-12-01T11:20:00Z",
    views: 15320,
    usages: 11240,
    promptTemplate: "Write a [language] function that [task description]."
  },
  {
    id: "5",
    title: "SocialPro",
    description: "Create engaging social media content with AI-powered suggestions",
    longDescription: "SocialPro helps you create engaging social media content across multiple platforms. Get AI-powered post suggestions, hashtag recommendations, and engagement predictions. Schedule posts and analyze performance all in one place.",
    category: "marketing",
    tags: ["social media", "marketing", "content", "engagement"],
    monetization: "freemium",
    rating: 4.5,
    reviewCount: 256,
    featured: false,
    imageUrl: "https://placehold.co/500x300/0EA5E9/FFF?text=SocialPro",
    developerName: "ViralGenius",
    createdAt: "2023-06-12T13:45:00Z",
    updatedAt: "2023-11-10T09:30:00Z",
    views: 9870,
    usages: 6540,
    promptTemplate: "Create a [platform] post about [topic] targeting [audience]."
  },
  {
    id: "6",
    title: "VoiceForge",
    description: "Convert text to natural-sounding speech in multiple languages",
    longDescription: "VoiceForge transforms your text into natural-sounding speech in over 50 languages and 200+ voices. Perfect for creating voiceovers, podcasts, accessibility features, or any audio content. Customize pitch, speed, and emphasis for the perfect delivery.",
    category: "design",
    tags: ["audio", "speech", "voice", "accessibility"],
    monetization: "paid",
    rating: 4.7,
    reviewCount: 189,
    featured: false,
    imageUrl: "https://placehold.co/500x300/6366F1/FFF?text=VoiceForge",
    developerName: "AudioTech AI",
    createdAt: "2023-08-05T10:23:00Z",
    updatedAt: "2023-12-05T15:10:00Z",
    views: 7520,
    usages: 3950,
    apiEndpoint: "https://api.example.com/voiceforge"
  },
  {
    id: "7",
    title: "SummaryWiz",
    description: "Extract key insights from long documents and articles",
    longDescription: "SummaryWiz uses advanced AI to condense long documents, articles, and reports into concise summaries while preserving the most important information. Save hours of reading time and quickly grasp the essential points of any content.",
    category: "writing",
    tags: ["summary", "productivity", "reading", "research"],
    monetization: "free",
    rating: 4.4,
    reviewCount: 142,
    featured: false,
    imageUrl: "https://placehold.co/500x300/8B5CF6/FFF?text=SummaryWiz",
    developerName: "ContentLabs",
    createdAt: "2023-09-17T14:55:00Z",
    updatedAt: "2023-11-22T12:40:00Z",
    views: 5240,
    usages: 4120,
    promptTemplate: "Summarize the following text in [number] paragraphs: [text]"
  },
  {
    id: "8",
    title: "MarketMetrics",
    description: "AI-powered market research and competitor analysis",
    longDescription: "MarketMetrics helps businesses gain competitive advantage through AI-powered market research and competitor analysis. Get insights on market trends, competitor strategies, consumer behavior, and growth opportunities to make data-driven decisions.",
    category: "analysis",
    tags: ["market research", "business", "analytics", "competitors"],
    monetization: "paid",
    rating: 4.6,
    reviewCount: 98,
    featured: false,
    imageUrl: "https://placehold.co/500x300/EC4899/FFF?text=MarketMetrics",
    developerName: "BusinessInsight AI",
    createdAt: "2023-07-28T11:20:00Z",
    updatedAt: "2023-12-10T16:05:00Z",
    views: 3450,
    usages: 1230,
    apiEndpoint: "https://api.example.com/marketmetrics"
  }
];
