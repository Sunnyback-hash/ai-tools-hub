/**
 * add-promo-tools.js - 推广阶段补充高价值工具
 * 运行: node scripts/add-promo-tools.js
 */

const fs = require('fs');
const path = require('path');

const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const tools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));

const existing = new Set(tools.map(t => t.name.toLowerCase()));

const newTools = [
  {
    name: 'Inflection Pi',
    slug: 'inflection-pi',
    url: 'https://pi.ai',
    description: 'A personal AI from Inflection AI designed to be helpful, harmless, and honest. Conversational and emotionally intelligent.',
    category: 'ai-chatbot',
    pricing: 'free',
    priceFrom: 0,
    pros: ['Emotionally intelligent', 'Great conversation', 'Helpful and harmless', 'Free to use'],
    cons: ['Less capable than GPT-4', 'Limited integrations', 'Still in development'],
    rating: 4.3,
    tags: ['chatbot', 'personal', 'conversation'],
    featured: false,
    alternatives: ['chatgpt', 'claude']
  },
  {
    name: 'Poe by Quora',
    slug: 'poe',
    url: 'https://poe.com',
    description: 'Quoras AI chatbot aggregator. Access ChatGPT, Claude, Llama, and more from one interface with a single subscription.',
    category: 'ai-chatbot',
    pricing: 'freemium',
    priceFrom: 20,
    pros: ['Multiple models in one place', 'Good mobile app', 'Fast responses', 'Bot creation'],
    cons: ['Paywall for premium models', 'Quora account required', 'Less features than native apps'],
    rating: 4.4,
    tags: ['chatbot', 'aggregator', 'multi-model'],
    featured: false,
    alternatives: ['chatgpt', 'claude']
  },
  {
    name: 'Together AI',
    slug: 'together-ai',
    url: 'https://together.ai',
    description: 'Run open-source LLMs at scale. API access to Llama, Mistral, and dozens of other open models with competitive pricing.',
    category: 'ai-coding',
    pricing: 'pay-as-you-go',
    priceFrom: 0,
    pros: ['Open-source model focus', 'Competitive pricing', 'Great for fine-tuning', 'Fast inference'],
    cons: ['Requires technical knowledge', 'No GUI chatbot', 'Can get expensive'],
    rating: 4.5,
    tags: ['llm', 'api', 'open-source', 'inference'],
    featured: false,
    alternatives: ['replicate', 'huggingface']
  },
  {
    name: 'Ideogram',
    slug: 'ideogram',
    url: 'https://ideogram.ai',
    description: 'AI image generator that excels at rendering text within images. Created by former Google Brain researchers.',
    category: 'ai-image',
    pricing: 'freemium',
    priceFrom: 8,
    pros: ['Best-in-class text rendering', 'High-quality images', 'Active development', 'Free tier available'],
    cons: ['Limited styles vs Midjourney', 'Can struggle with complex prompts', 'Free tier has slow queue'],
    rating: 4.5,
    tags: ['image', 'text-rendering', 'generative'],
    featured: true,
    alternatives: ['midjourney', 'leonardo-ai']
  },
  {
    name: 'Playground AI',
    slug: 'playground-ai',
    url: 'https://playground.ai',
    description: 'Free AI image creator with multiple model support including DALL-E, Stable Diffusion, and Firefly. Great for experimentation.',
    category: 'ai-image',
    pricing: 'freemium',
    priceFrom: 10,
    pros: ['Multiple models in one place', 'Generous free tier', 'Great for experimentation', 'Edit existing images'],
    cons: ['Can be overwhelming', 'Output quality varies by model', 'Limited vs dedicated tools'],
    rating: 4.4,
    tags: ['image', 'multi-model', 'experimentation'],
    featured: false,
    alternatives: ['midjourney', 'leonardo-ai']
  },
  {
    name: 'Clipdrop',
    slug: 'clipdrop',
    url: 'https://clipdrop.co',
    description: 'AI-powered visual editing tools by Stability AI. Background removal, relighting, upscaling, and text-to-image in one suite.',
    category: 'ai-image',
    pricing: 'freemium',
    priceFrom: 9,
    pros: ['Comprehensive editing suite', 'Great background removal', 'Mobile app available', 'Stability AI backed'],
    cons: ['Free tier limited', 'Some features hit-or-miss', 'Less artistic than Midjourney'],
    rating: 4.3,
    tags: ['image', 'editing', 'background-removal'],
    featured: false,
    alternatives: ['removal-ai', 'leonardo-ai']
  },
  {
    name: 'Veed.io',
    slug: 'veed-io',
    url: 'https://veed.io',
    description: 'Simple online video editor with AI features including auto-subtitles, background removal, and AI avatars.',
    category: 'ai-video',
    pricing: 'freemium',
    priceFrom: 12,
    pros: ['Very easy to use', 'Great auto-subtitles', 'No watermark on paid', 'AI avatars included'],
    cons: ['Less powerful than Premiere', 'Rendering can be slow', 'Pricey for individuals'],
    rating: 4.4,
    tags: ['video', 'editing', 'subtitles'],
    featured: false,
    alternatives: ['descript', 'kapwing']
  },
  {
    name: 'Colossyan',
    slug: 'colossyan',
    url: 'https://colossyan.com',
    description: 'AI video generator for corporate training. Create videos with AI avatars and voices in minutes.',
    category: 'ai-video',
    pricing: 'freemium',
    priceFrom: 28,
    pros: ['Great for training videos', 'Multiple avatars', 'Many languages', 'Easy to use'],
    cons: ['Expensive for individuals', 'Avatars can look unnatural', 'Limited customization'],
    rating: 4.3,
    tags: ['video', 'avatar', 'corporate', 'training'],
    featured: false,
    alternatives: ['synthesia', 'heygen']
  },
  {
    name: 'Elai.io',
    slug: 'elai-io',
    url: 'https://elai.io',
    description: 'Create AI avatar videos from text. 80+ avatars, 75+ languages, and custom avatar options.',
    category: 'ai-video',
    pricing: 'freemium',
    priceFrom: 23,
    pros: ['80+ diverse avatars', '75+ languages', 'Custom avatar option', 'API available'],
    cons: ['Pricey for individuals', 'Avatar lip-sync imperfect', 'Learning curve'],
    rating: 4.2,
    tags: ['video', 'avatar', 'lms', 'training'],
    featured: false,
    alternatives: ['synthesia', 'colossyan']
  },
  {
    name: 'D-ID',
    slug: 'd-id',
    url: 'https://d-id.com',
    description: 'Create talking avatars and AI-presenters from a single photo. Used by millions for personalized video at scale.',
    category: 'ai-video',
    pricing: 'freemium',
    priceFrom: 6,
    pros: ['Photo-to-talking-head is unique', 'API for scale', 'Low cost entry', 'Creative use cases'],
    cons: ['Can look uncanny', 'Limited avatar customization', 'Free tier very limited'],
    rating: 4.3,
    tags: ['video', 'avatar', 'talking-head'],
    featured: false,
    alternatives: ['heygen', 'synthesia']
  },
  {
    name: 'Surfer SEO',
    slug: 'surfer-seo',
    url: 'https://surferseo.com',
    description: 'AI-powered SEO optimization tool. Analyze top-ranking pages and get data-driven content guidelines to rank higher.',
    category: 'ai-marketing',
    pricing: 'freemium',
    priceFrom: 59,
    pros: ['Data-driven SEO recommendations', 'Great content editor', 'Keyword research built-in', 'SERP analysis'],
    cons: ['Expensive for individuals', 'Learning curve', 'Can be overly formulaic'],
    rating: 4.6,
    tags: ['seo', 'content-optimization', 'keyword-research'],
    featured: true,
    alternatives: ['semrush', 'frase']
  },
  {
    name: 'Frase',
    slug: 'frase',
    url: 'https://frase.io',
    description: 'AI writing and SEO tool. Research, write, and optimize content that ranks. Briefs generated in minutes from top SERP results.',
    category: 'ai-writing',
    pricing: 'freemium',
    priceFrom: 15,
    pros: ['Fast SERP research', 'Good content optimization', 'Affordable vs competitors', 'AI writer included'],
    cons: ['Occasional factual errors', 'Limited vs Surfer', 'UI can be clunky'],
    rating: 4.5,
    tags: ['writing', 'seo', 'content-optimization'],
    featured: false,
    alternatives: ['surfer-seo', 'jasper']
  },
  {
    name: 'Otter.ai',
    slug: 'otter-ai',
    url: 'https://otter.ai',
    description: 'Real-time transcription and meeting notes. Automatically captures conversations, generates summaries, and extracts action items.',
    category: 'ai-productivity',
    pricing: 'freemium',
    priceFrom: 10,
    pros: ['Excellent real-time transcription', 'Meeting summaries', 'Zoom integration', 'Free tier available'],
    cons: ['Accuracy drops with accents', 'Free tier limited minutes', 'Can struggle with technical jargon'],
    rating: 4.6,
    tags: ['transcription', 'meeting-notes', 'productivity'],
    featured: true,
    alternatives: ['fireflies-ai', 'descript']
  },
  {
    name: 'Fireflies.ai',
    slug: 'fireflies-ai',
    url: 'https://fireflies.ai',
    description: 'AI meeting assistant that automatically records, transcribes, and generates smart summaries for all your meetings.',
    category: 'ai-productivity',
    pricing: 'freemium',
    priceFrom: 10,
    pros: ['Works with all meeting platforms', 'Automated summaries', 'Searchable meeting repository', 'Free tier available'],
    cons: ['Transcription accuracy varies', 'Can be distracting', 'Privacy concerns for some'],
    rating: 4.5,
    tags: ['meeting', 'transcription', 'productivity'],
    featured: false,
    alternatives: ['otter-ai', 'avoma']
  },
  {
    name: 'Miro AI',
    slug: 'miro-ai',
    url: 'https://miro.com',
    description: 'AI-powered whiteboard for teams. Generate ideas, summarize sticky notes, and create diagrams with AI assistance.',
    category: 'ai-productivity',
    pricing: 'freemium',
    priceFrom: 10,
    pros: ['Great for brainstorming', 'Integrates with Miro whiteboard', 'Good for remote teams', 'Free tier available'],
    cons: ['Requires Miro subscription for full features', 'Learning curve', 'Can be overwhelming'],
    rating: 4.4,
    tags: ['whiteboard', 'brainstorming', 'collaboration'],
    featured: false,
    alternatives: ['notion-ai', 'figma-ai']
  }
];

let added = 0;
for (const t of newTools) {
  if (!existing.has(t.name.toLowerCase())) {
    tools.push(t);
    existing.add(t.name.toLowerCase());
    added++;
    console.log('  + Added:', t.name);
  } else {
    console.log('  = Skipping (exists):', t.name);
  }
}

fs.writeFileSync(toolsPath, JSON.stringify(tools, null, 2));
console.log('\nDone! Added', added, 'new tools. Total:', tools.length);
