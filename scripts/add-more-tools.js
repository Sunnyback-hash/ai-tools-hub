const fs = require('fs');
const path = require('path');

// ====== Step 1: Fix meta descriptions in build.js template ======
// Read build.js and fix the static pages description template
let buildJs = fs.readFileSync('build.js', 'utf8');

// Fix: add desc field to staticPages array and update template
// First, update the staticPages array to have proper descriptions
const oldStaticPages = `  const staticPages = [
    { name: 'about', title: 'About AI Tools Hub', desc: 'About AI Tools Hub.', slug: 'about' },
    { name: 'contact', title: 'Contact Us', desc: 'Contact Us.', slug: 'contact' },`;

const newStaticPages = `  const staticPages = [
    { name: 'about', title: 'About AI Tools Hub', desc: 'Learn about AI Tools Hub - the comprehensive directory of AI tools for writing, image generation, video creation, coding, and more. Discover, compare and choose the best AI tools.', slug: 'about' },
    { name: 'contact', title: 'Contact Us | AI Tools Hub', desc: 'Get in touch with AI Tools Hub. Submit a tool, report an issue, or suggest improvements to our AI tools directory.', slug: 'contact' },`;

if (buildJs.includes(oldStaticPages)) {
  buildJs = buildJs.replace(oldStaticPages, newStaticPages);
  console.log('[OK] Updated staticPages desc fields');
} else {
  console.log('[SKIP] staticPages pattern not found, trying alternative...');
}

// Fix the template to use page.desc instead of page.title + "."
buildJs = buildJs.replace(
  `<title>\${page.title} | AI Tools Hub</title><meta name="description" content="\${page.title}.">`,
  `<title>\${page.title} | AI Tools Hub</title><meta name="description" content="\${page.desc}">`
);
console.log('[OK] Updated static pages template to use page.desc');

fs.writeFileSync('build.js', buildJs, 'utf8');
console.log('[OK] build.js updated\n');

// ====== Step 2: Add new AI tools to tools.json ======
const tools = JSON.parse(fs.readFileSync('data/tools.json', 'utf8'));
const existingSlugs = new Set(tools.map(t => t.slug));
console.log('Existing tools:', tools.length);

const newTools = [
  {
    "name": "Grok",
    "slug": "grok",
    "url": "https://grok.com",
    "description": "xAI's real-time AI chatbot with direct access to X (Twitter) data. Provides up-to-the-minute information and unfiltered responses.",
    "category": "ai-chatbot",
    "pricing": "freemium",
    "priceFrom": 8,
    "pros": ["Real-time X data access", "Unfiltered responses", "Fast inference", "Integrated with X platform"],
    "cons": ["Only available via X Premium", "Can be controversial", "Less safe-guarded than competitors", "Limited API access"],
    "rating": 4.3,
    "tags": ["chatbot", "realtime", "xai", "research"],
    "featured": false,
    "alternatives": ["chatgpt", "claude", "gemini"]
  },
  {
    "name": "Opus Clip",
    "slug": "opus-clip",
    "url": "https://opus.pro",
    "description": "AI-powered video clipping tool that automatically finds the best moments in long videos and creates short clips for TikTok, Reels, and Shorts.",
    "category": "ai-video",
    "pricing": "freemium",
    "priceFrom": 9,
    "pros": ["Auto-caption generation", "Viral score prediction", "Multi-platform export", "AI b-roll suggestions"],
    "cons": ["Limited manual editing", "Credit-based pricing", "English-only UI", "Occasional inaccurate cuts"],
    "rating": 4.5,
    "tags": ["video", "clipping", "social-media", "shorts"],
    "featured": false,
    "alternatives": ["vidyo-ai", "kling-ai"]
  },
  {
    "name": "Krea.ai",
    "slug": "krea-ai",
    "url": "https://krea.ai",
    "description": "Real-time AI image generation and editing platform with an infinite canvas. Supports Stable Diffusion, DALL-E, and custom models with real-time preview.",
    "category": "ai-image",
    "pricing": "freemium",
    "priceFrom": 0,
    "pros": ["Real-time generation preview", "Infinite canvas", "Multiple model support", "Great for ideation"],
    "cons": ["Can be slow during peak hours", "UI learning curve", "Limited export options", "Free tier has watermarks"],
    "rating": 4.4,
    "tags": ["image", "real-time", "canvas", "stable-diffusion"],
    "featured": false,
    "alternatives": ["leonardo-ai", "midjourney", "dalle"]
  },
  {
    "name": "Magnific AI",
    "slug": "magnific-ai",
    "url": "https://magnific.ai",
    "description": "AI-powered image upscaler that enhances images with incredible detail and hallucinates realistic textures. The best AI upscaler for photographers and designers.",
    "category": "ai-image",
    "pricing": "paid",
    "priceFrom": 12,
    "pros": ["Best-in-class upscaling", "Hallucinates realistic details", "Multiple style options", "API available"],
    "cons": ["Expensive for high-res", "Can over-hallucinate", "No mobile app", "Learning curve for best results"],
    "rating": 4.7,
    "tags": ["image", "upscale", "enhance", "photography"],
    "featured": false,
    "alternatives": ["leonardo-ai", "removalai"]
  },
  {
    "name": "PhotoRoom",
    "slug": "photoroom",
    "url": "https://photoroom.com",
    "description": "AI product photography tool that automatically removes backgrounds and creates studio-quality product images. Essential for e-commerce sellers and marketers.",
    "category": "ai-image",
    "pricing": "freemium",
    "priceFrom": 9,
    "pros": ["Best-in-class background removal", "Studio-quality templates", "Batch processing", "API for e-commerce"],
    "cons": ["Subscription required for HD", "Limited customization", "Can struggle with complex edges", "Credit system for API"],
    "rating": 4.6,
    "tags": ["image", "ecommerce", "background-removal", "product-photography"],
    "featured": false,
    "alternatives": ["canva-ai", "removalai"]
  },
  {
    "name": "Play.ht",
    "slug": "playht",
    "url": "https://play.ht",
    "description": "AI voice generation platform with the most natural-sounding synthetic voices. Offers 800+ voices in 130+ languages with emotion control.",
    "category": "ai-audio",
    "pricing": "freemium",
    "priceFrom": 9,
    "pros": ["Most natural AI voices", "800+ voices in 130+ languages", "Emotion control", "Real-time preview"],
    "cons": ["Can be expensive for high volume", "Free tier very limited", "Some voices sound artificial", "Cloning requires consent"],
    "rating": 4.5,
    "tags": ["audio", "voice", "tts", "voice-cloning"],
    "featured": false,
    "alternatives": ["elevenlabs", "murf-ai", "cleanvoice-ai"]
  },
  {
    "name": "Beautiful.ai",
    "slug": "beautiful-ai",
    "url": "https://beautiful.ai",
    "description": "AI-powered presentation design tool that automatically adjusts layouts as you add content. Creates beautiful slides in minutes with smart templates.",
    "category": "ai-design",
    "pricing": "freemium",
    "priceFrom": 12,
    "pros": ["Smart templates that auto-adjust", "Beautiful default designs", "Team collaboration", "PowerPoint import"],
    "cons": ["Limited customization vs PowerPoint", "Subscription required for export", "Fewer templates than competitors", "Can be slow with large decks"],
    "rating": 4.4,
    "tags": ["design", "presentation", "slides", "productivity"],
    "featured": false,
    "alternatives": ["gamma", "tome", "canva-ai"]
  },
  {
    "name": "ComfyUI",
    "slug": "comfyui",
    "url": "https://github.com/comfyanonymous/ComfyUI",
    "description": "Advanced node-based UI for Stable Diffusion that gives you complete control over the image generation pipeline. The most powerful SD interface.",
    "category": "ai-image",
    "pricing": "free",
    "priceFrom": 0,
    "pros": ["Most powerful SD interface", "Complete pipeline control", "Huge community and custom nodes", "Completely free and open-source"],
    "cons": ["Steep learning curve", "Requires powerful GPU", "Local installation required", "Overwhelming for beginners"],
    "rating": 4.8,
    "tags": ["image", "stable-diffusion", "node-based", "open-source"],
    "featured": false,
    "alternatives": ["leonardo-ai", "midjourney", "dalle"]
  },
  {
    "name": "Jan.ai",
    "slug": "jan-ai",
    "url": "https://jan.ai",
    "description": "Open-source ChatGPT alternative that runs entirely on your device. 100% offline, private, and supports multiple open-source LLMs including Llama, Mistral, and Gemma.",
    "category": "ai-chatbot",
    "pricing": "free",
    "priceFrom": 0,
    "pros": ["100% offline and private", "Open-source and free", "Supports multiple LLMs", "No API costs"],
    "cons": ["Requires powerful hardware", "Slower than cloud-based AI", "Limited context vs GPT-4", "Setup can be tricky"],
    "rating": 4.5,
    "tags": ["chatbot", "local", "open-source", "privacy"],
    "featured": false,
    "alternatives": ["chatgpt", "claude", "lm-studio"]
  },
  {
    "name": "LM Studio",
    "slug": "lm-studio",
    "url": "https://lmstudio.ai",
    "description": "Desktop application for running local LLMs with a ChatGPT-like interface. Discover, download, and run open-source LLMs completely offline on your computer.",
    "category": "ai-chatbot",
    "pricing": "freemium",
    "priceFrom": 0,
    "pros": ["Beautiful ChatGPT-like UI", "Easy model discovery and download", "Completely offline", "Supports GGUF models"],
    "cons": ["Requires powerful hardware", "Limited to GGUF format", "No mobile version", "Can be resource-intensive"],
    "rating": 4.6,
    "tags": ["chatbot", "local", "llm", "offline"],
    "featured": false,
    "alternatives": ["jan-ai", "chatgpt", "ollama"]
  },
  {
    "name": "OpenRouter",
    "slug": "openrouter",
    "url": "https://openrouter.ai",
    "description": "Unified API for accessing 100+ LLMs from different providers. One API, one price, access to GPT-4, Claude, Llama, Mistral and more.",
    "category": "ai-chatbot",
    "pricing": "paid",
    "priceFrom": 0,
    "pros": ["Access 100+ LLMs via one API", "Competitive pricing", "No rate limits on most models", "OpenAI-compatible API"],
    "cons": ["Pay-per-token model", "No free tier for premium models", "Dependent on upstream providers", "Can be expensive at scale"],
    "rating": 4.5,
    "tags": ["chatbot", "api", "llm", "router"],
    "featured": false,
    "alternatives": ["chatgpt", "claude", "poe"]
  },
  {
    "name": "Jenni AI",
    "slug": "jenni-ai",
    "url": "https://jenni.ai",
    "description": "AI writing assistant that helps you write, edit, and research with citations. The best AI tool for academic writing, essays, and research papers.",
    "category": "ai-writing",
    "pricing": "freemium",
    "priceFrom": 10,
    "pros": ["Best for academic writing", "Automatic citations", "Plagiarism checker", "Research-powered suggestions"],
    "cons": ["Not ideal for creative writing", "Subscription required for full access", "Can be overly academic", "Limited templates"],
    "rating": 4.6,
    "tags": ["writing", "academic", "research", "citations"],
    "featured": false,
    "alternatives": ["chatgpt", "jasper", "rytr"]
  },
  {
    "name": "Rytr",
    "slug": "rytr",
    "url": "https://rytr.me",
    "description": "Affordable AI writing assistant for creating emails, blogs, ads, and social media posts. One of the most cost-effective AI writing tools with 40+ use cases.",
    "category": "ai-writing",
    "pricing": "freemium",
    "priceFrom": 9,
    "pros": ["Very affordable", "40+ use cases", "Built-in plagiarism checker", "Multiple tones and languages"],
    "cons": ["Less powerful than Jasper", "Output can be generic", "Limited integrations", "Free tier very restrictive"],
    "rating": 4.3,
    "tags": ["writing", "affordable", "emails", "blogs"],
    "featured": false,
    "alternatives": ["jasper", "copy-ai", "writesonic"]
  },
  {
    "name": "Frase",
    "slug": "frase",
    "url": "https://frase.io",
    "description": "AI-powered SEO content optimization tool that helps you research, write, and optimize high-ranking content. Analyzes top search results to guide your content strategy.",
    "category": "ai-writing",
    "pricing": "freemium",
    "priceFrom": 15,
    "pros": ["Best-in-class SERP analysis", "AI writer with SEO optimization", "Content briefs generator", "Competitor analysis"],
    "cons": ["Expensive for individuals", "Can be slow during research", "UI can be cluttered", "Learning curve for SEO beginners"],
    "rating": 4.5,
    "tags": ["writing", "seo", "content-optimization", "research"],
    "featured": false,
    "alternatives": ["surfer-seo", "semrush", "jasper"]
  },
  {
    "name": "Taplio",
    "slug": "taplio",
    "url": "https://taplio.com",
    "description": "AI-powered LinkedIn growth tool that helps you create better content, schedule posts, and engage with your network. The all-in-one LinkedIn personal branding tool.",
    "category": "ai-marketing",
    "pricing": "paid",
    "priceFrom": 39,
    "pros": ["Best LinkedIn AI tool", "Content ideas from viral posts", "Auto-scheduling", "Engagement automation"],
    "cons": ["LinkedIn-only", "Expensive for individuals", "Can trigger LinkedIn limits", "Learning curve"],
    "rating": 4.4,
    "tags": ["marketing", "linkedin", "social-media", "personal-branding"],
    "featured": false,
    "alternatives": ["buffer-ai", "hubspot-ai"]
  },
  {
    "name": "Engage AI",
    "slug": "engage-ai",
    "url": "https://engageai.io",
    "description": "AI tool that writes personalized LinkedIn comments for you. Analyzes posts and generates thoughtful, relevant comments to increase your visibility and engagement on LinkedIn.",
    "category": "ai-marketing",
    "pricing": "freemium",
    "priceFrom": 9,
    "pros": ["Saves huge time on engagement", "Personalized comment suggestions", "Chrome extension available", "Improves LinkedIn visibility"],
    "cons": ["LinkedIn-only", "Can sound generic if not edited", "Free tier limited", "Needs human oversight"],
    "rating": 4.3,
    "tags": ["marketing", "linkedin", "engagement", "comments"],
    "featured": false,
    "alternatives": ["taplio", "buffer-ai"]
  },
  {
    "name": "Snov.io AI",
    "slug": "snov-ai",
    "url": "https://snov.io",
    "description": "AI-powered sales engagement platform with email finder, verifier, and drip campaigns. The all-in-one tool for cold outreach and lead generation.",
    "category": "ai-marketing",
    "pricing": "freemium",
    "priceFrom": 30,
    "pros": ["Accurate email finder", "Built-in email verifier", "Drip campaign automation", "LinkedIn integration"],
    "cons": ["Steep learning curve", "Credits run out quickly", "UI can be slow", "Expensive for small teams"],
    "rating": 4.4,
    "tags": ["marketing", "sales", "email-outreach", "lead-gen"],
    "featured": false,
    "alternatives": ["hubspot-ai", "brevo-ai", "zapier-ai"]
  }
];

let added = 0;
newTools.forEach(tool => {
  if (!existingSlugs.has(tool.slug)) {
    tools.push(tool);
    existingSlugs.add(tool.slug);
    added++;
    console.log('  [+] Added:', tool.name, '(' + tool.slug + ')');
  } else {
    console.log('  [=] Skipped (exists):', tool.name, '(' + tool.slug + ')');
  }
});

fs.writeFileSync('data/tools.json', JSON.stringify(tools, null, 2), 'utf8');
console.log('\n[OK] tools.json updated:', tools.length, 'total tools (+' + added + ')\n');

// ====== Step 3: Rebuild the site ======
console.log('[BUILD] Running build.js...');
const { execSync } = require('child_process');
try {
  const output = execSync('node build.js', { encoding: 'utf8' });
  console.log(output);
  console.log('[OK] Site rebuilt successfully!');
} catch (e) {
  console.error('[ERROR] Build failed:', e.message);
  process.exit(1);
}

console.log('\n[ALL DONE] 3 steps completed:');
console.log('  1. build.js template fixed (meta descriptions)');
console.log('  2. Added ' + added + ' new AI tools to database');
console.log('  3. Site rebuilt with ' + tools.length + ' total tools');
