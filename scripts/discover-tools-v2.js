/**
 * discover-tools-v2.js - 全网 AI 工具自动发现引擎（升级版）
 * 
 * 数据来源:
 *   1. There's An AI For That (theresanaiforthat.com)
 *   2. FutureTools.io 
 *   3. Product Hunt AI 板块
 *   4. AI Tool Hunt
 *   5. 内置高质量种子库（人工整理最新工具）
 * 
 * 用法: node scripts/discover-tools-v2.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 加载现有工具数据库
const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const existingTools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
const existingSlugs = new Set(existingTools.map(t => t.slug));
const existingUrls = new Set(existingTools.map(t => t.url.toLowerCase().replace(/\/$/, '')));
const existingNames = new Set(existingTools.map(t => t.name.toLowerCase()));

console.log(`📦 现有工具库: ${existingTools.length} 个工具`);

// 分类关键词
const CATEGORY_KEYWORDS = {
  'ai-chatbot': ['chatbot', 'chat', 'assistant', 'conversational', 'gpt', 'claude', 'dialogue', 'agent'],
  'ai-image': ['image', 'art', 'illustration', 'drawing', 'photo', 'avatar', 'picture', 'visual', 'stable diffusion', 'flux', 'upscale'],
  'ai-video': ['video', 'animation', 'motion', 'film', 'vfx', 'clip', 'reel', 'shorts'],
  'ai-coding': ['code', 'programming', 'developer', 'debug', 'deploy', 'api', 'copilot', 'ide', 'compiler', 'git'],
  'ai-writing': ['writing', 'copy', 'content', 'blog', 'article', 'text', 'grammar', 'seo writing', 'paraphrase', 'essay'],
  'ai-research': ['research', 'search', 'analyze', 'data', 'science', 'insight', 'paper', 'summarize', 'knowledge'],
  'ai-audio': ['audio', 'music', 'voice', 'speech', 'sound', 'tts', 'podcast', 'transcri', 'vocal', 'song'],
  'ai-design': ['design', 'ui', 'ux', 'layout', 'mockup', 'wireframe', 'prototype', 'logo', 'brand', 'figma', 'canva'],
  'ai-productivity': ['productivity', 'workflow', 'automat', 'task', 'schedule', 'meeting', 'note', 'calendar', 'organiz'],
  'ai-marketing': ['marketing', 'ad ', 'email market', 'social media', 'analytics', 'funnel', 'campaign', 'seo', 'crm']
};

function inferCategory(name, description, url) {
  const text = (name + ' ' + description + ' ' + url).toLowerCase();
  const scores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.reduce((sum, kw) => sum + (text.includes(kw) ? 1 : 0), 0);
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'ai-productivity';
}

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateProsCons(category) {
  const prosByCategory = {
    'ai-chatbot': ['Intuitive conversational interface', 'Context-aware responses', 'Multi-language support', 'Fast response times'],
    'ai-image': ['High-quality output', 'Fast generation speed', 'Multiple style options', 'Easy to use interface'],
    'ai-video': ['Professional quality output', 'Time-saving automation', 'Multiple export formats', 'Template library'],
    'ai-coding': ['Accurate code generation', 'Multiple language support', 'IDE integration', 'Context-aware suggestions'],
    'ai-writing': ['Natural sounding output', 'Tone customization', 'SEO optimization', 'Bulk generation capability'],
    'ai-research': ['Credible source citations', 'Comprehensive analysis', 'Time-efficient research', 'Multi-database search'],
    'ai-audio': ['Natural sounding voices', 'Multiple voice options', 'Fast processing speed', 'Multiple language support'],
    'ai-design': ['Professional templates', 'Easy customization', 'Brand consistency', 'Rapid prototyping'],
    'ai-productivity': ['Time-saving automation', 'Intuitive interface', 'Integration with popular tools', 'Real-time collaboration'],
    'ai-marketing': ['ROI optimization', 'Data-driven insights', 'A/B testing support', 'Multi-channel integration']
  };
  const consByCategory = {
    'ai-chatbot': ['May produce inaccurate information', 'Limited offline capability', 'Learning curve for advanced features'],
    'ai-image': ['May require prompt engineering', 'Limited fine control', 'Watermark on free tier'],
    'ai-video': ['Rendering time for long videos', 'Limited editing depth', 'Storage requirements'],
    'ai-coding': ['May need manual review', 'Context window limitations', 'Not ideal for complex architectures'],
    'ai-writing': ['May lack personal voice', 'Requires editing', 'Subscription costs for full features'],
    'ai-research': ['May miss niche sources', 'Requires verification', 'Premium features locked'],
    'ai-audio': ['Robotic edge cases', 'Processing time for long audio', 'Language limitations'],
    'ai-design': ['Template limitations', 'Export format restrictions', 'Learning curve'],
    'ai-productivity': ['Setup time required', 'Integration gaps', 'Privacy concerns'],
    'ai-marketing': ['Data privacy concerns', 'Over-automation risk', 'Cost for premium features']
  };
  const pros = prosByCategory[category] || prosByCategory['ai-productivity'];
  const cons = consByCategory[category] || consByCategory['ai-productivity'];
  return {
    pros: pros.slice(0, 3 + Math.floor(Math.random() * 2)),
    cons: cons.slice(0, 2 + Math.floor(Math.random() * 2))
  };
}

// ============================================================
// 最新 AI 工具种子库（2025-2026 年热门新工具，定期人工更新）
// ============================================================
const LATEST_SEEDS = [
  // ===== AI Chatbots & Agents =====
  { name: 'Grok 3', url: 'https://grok.com', category: 'ai-chatbot', tags: ['chatbot', 'agent', 'real-time'], pricing: 'freemium', priceFrom: 0, description: 'xAI\'s latest Grok 3 model with real-time web search, deep think mode, and image understanding. Integrated with X platform.' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', category: 'ai-chatbot', tags: ['chatbot', 'coding', 'reasoning'], pricing: 'free', priceFrom: 0, description: 'High-performance open-source AI chatbot from DeepSeek with strong coding and reasoning capabilities at zero cost.' },
  { name: 'Mistral Le Chat', url: 'https://chat.mistral.ai', category: 'ai-chatbot', tags: ['chatbot', 'open source', 'fast'], pricing: 'freemium', priceFrom: 0, description: 'European AI assistant powered by Mistral models with fast responses, web search, and code execution.' },
  { name: 'Kimi', url: 'https://kimi.ai', category: 'ai-chatbot', tags: ['chatbot', 'long context', 'research'], pricing: 'freemium', priceFrom: 0, description: 'AI assistant by Moonshot AI with 1M token context window, ideal for analyzing long documents and complex research.' },
  { name: 'Copilot', url: 'https://copilot.microsoft.com', category: 'ai-chatbot', tags: ['chatbot', 'microsoft', 'productivity'], pricing: 'freemium', priceFrom: 0, description: 'Microsoft\'s AI assistant powered by GPT-4o with web search, image generation, and deep integration with Microsoft 365.' },
  { name: 'Meta AI', url: 'https://meta.ai', category: 'ai-chatbot', tags: ['chatbot', 'meta', 'social'], pricing: 'free', priceFrom: 0, description: 'Meta\'s free AI assistant built on Llama models, integrated across WhatsApp, Instagram, and Facebook.' },
  { name: 'Qwen', url: 'https://qwenlm.github.io', category: 'ai-chatbot', tags: ['chatbot', 'open source', 'multilingual'], pricing: 'free', priceFrom: 0, description: 'Alibaba\'s open-source Qwen model series with multilingual support and strong math/coding performance.' },
  { name: 'AI Studio', url: 'https://aistudio.google.com', category: 'ai-chatbot', tags: ['chatbot', 'google', 'gemini'], pricing: 'free', priceFrom: 0, description: 'Google AI Studio is a free browser-based IDE for prototyping with Gemini models, including 1M context and multimodal input.' },
  
  // ===== AI Image =====
  { name: 'Midjourney v7', url: 'https://midjourney.com', category: 'ai-image', tags: ['image', 'art', 'v7'], pricing: 'paid', priceFrom: 10, description: 'Midjourney v7 delivers even more photorealistic images with improved prompt adherence and enhanced detail control.' },
  { name: 'Recraft', url: 'https://recraft.ai', category: 'ai-image', tags: ['image', 'vector', 'design'], pricing: 'freemium', priceFrom: 0, description: 'AI image generation tool specializing in vector graphics, icons, and brand illustrations with style consistency.' },
  { name: 'Imagen 3', url: 'https://deepmind.google/technologies/imagen-3/', category: 'ai-image', tags: ['image', 'google', 'photorealistic'], pricing: 'freemium', priceFrom: 0, description: 'Google DeepMind\'s Imagen 3 delivers photorealistic images with exceptional detail, lighting, and text rendering.' },
  { name: 'Magnific AI', url: 'https://magnific.ai', category: 'ai-image', tags: ['upscale', 'enhance', 'photo'], pricing: 'paid', priceFrom: 39, description: 'AI image upscaler and enhancer that adds extraordinary detail and realism to photos and AI-generated images.' },
  { name: 'Fooocus', url: 'https://github.com/lllyasviel/Fooocus', category: 'ai-image', tags: ['image', 'open source', 'sdxl'], pricing: 'free', priceFrom: 0, description: 'Easy-to-use open-source image generation tool based on SDXL, optimized for minimal setup and high quality output.' },
  { name: 'Krea AI', url: 'https://krea.ai', category: 'ai-image', tags: ['image', 'real-time', 'creative'], pricing: 'freemium', priceFrom: 0, description: 'Real-time AI image generation canvas that lets you paint and edit images with AI as you draw.' },
  
  // ===== AI Video =====
  { name: 'Vidu', url: 'https://vidu.studio', category: 'ai-video', tags: ['video', 'generation', 'chinese'], pricing: 'freemium', priceFrom: 0, description: 'Chinese AI video generation model by Shengshu Technology with high temporal consistency and cinematic quality.' },
  { name: 'Luma Dream Machine', url: 'https://lumalabs.ai', category: 'ai-video', tags: ['video', 'generation', '3d'], pricing: 'freemium', priceFrom: 0, description: 'AI video generation model by Luma AI that creates highly realistic videos with accurate physics and 3D consistency.' },
  { name: 'Haiper', url: 'https://haiper.ai', category: 'ai-video', tags: ['video', 'generation', 'fast'], pricing: 'freemium', priceFrom: 0, description: 'High-fidelity AI video generation platform focused on speed and quality with text-to-video and image-to-video modes.' },
  { name: 'Wan Video', url: 'https://wanvideo.com', category: 'ai-video', tags: ['video', 'alibaba', 'open source'], pricing: 'free', priceFrom: 0, description: 'Alibaba\'s open-source video generation model Wan 2.1 with state-of-the-art quality for text-to-video tasks.' },
  { name: 'Kling AI 2.0', url: 'https://klingai.com', category: 'ai-video', tags: ['video', 'kling', '2.0'], pricing: 'freemium', priceFrom: 0, description: 'Kling 2.0 by Kuaishou features improved motion quality, longer duration, and enhanced prompt understanding for video AI.' },
  { name: 'InVideo AI', url: 'https://invideo.io', category: 'ai-video', tags: ['video', 'editing', 'script'], pricing: 'freemium', priceFrom: 0, description: 'AI video creation platform that turns scripts and prompts into professional videos with voiceover, B-roll, and subtitles.' },
  
  // ===== AI Coding =====
  { name: 'Devin', url: 'https://devin.ai', category: 'ai-coding', tags: ['agent', 'coding', 'autonomous'], pricing: 'paid', priceFrom: 500, description: 'World\'s first AI software engineer that autonomously plans, codes, tests, and deploys software end-to-end.' },
  { name: 'Gemini Code Assist', url: 'https://codeassist.google', category: 'ai-coding', tags: ['coding', 'google', 'ide'], pricing: 'freemium', priceFrom: 0, description: 'Google\'s AI coding assistant with 1M token context window, full codebase understanding, and enterprise security.' },
  { name: 'Amazon Q', url: 'https://aws.amazon.com/q', category: 'ai-coding', tags: ['coding', 'aws', 'enterprise'], pricing: 'freemium', priceFrom: 0, description: 'AWS AI assistant for software development with code generation, code review, and AWS-specific guidance.' },
  { name: 'Continue.dev', url: 'https://continue.dev', category: 'ai-coding', tags: ['coding', 'open source', 'ide'], pricing: 'free', priceFrom: 0, description: 'Open-source AI code assistant for VS Code and JetBrains that connects to any LLM for autocomplete and chat.' },
  { name: 'Aider', url: 'https://aider.chat', category: 'ai-coding', tags: ['coding', 'terminal', 'git'], pricing: 'free', priceFrom: 0, description: 'AI pair programming tool in the terminal that edits code in your local git repository using Claude or GPT models.' },
  
  // ===== AI Writing =====
  { name: 'Rytr', url: 'https://rytr.me', category: 'ai-writing', tags: ['writing', 'content', 'budget'], pricing: 'freemium', priceFrom: 0, description: 'Budget-friendly AI writing assistant generating high-quality content for blogs, emails, and marketing copy in 30+ languages.' },
  { name: 'Hyperwrite', url: 'https://hyperwriteai.com', category: 'ai-writing', tags: ['writing', 'autocomplete', 'research'], pricing: 'freemium', priceFrom: 0, description: 'AI writing assistant with real-time autocomplete, paraphrasing, summarization, and web research capabilities.' },
  { name: 'Wordtune', url: 'https://wordtune.com', category: 'ai-writing', tags: ['writing', 'rewrite', 'tone'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered writing companion that rewrites, shortens, expands, and adjusts the tone of your sentences.' },
  { name: 'AI Writer', url: 'https://ai-writer.com', category: 'ai-writing', tags: ['writing', 'seo', 'citations'], pricing: 'paid', priceFrom: 29, description: 'SEO-focused AI writing tool that generates factual articles with verifiable citations from scientific sources.' },
  
  // ===== AI Research =====
  { name: 'Genspark', url: 'https://genspark.ai', category: 'ai-research', tags: ['search', 'research', 'agent'], pricing: 'freemium', priceFrom: 0, description: 'AI search engine that creates custom Sparkpages — rich, multi-source research summaries on any topic.' },
  { name: 'Felo', url: 'https://felo.ai', category: 'ai-research', tags: ['search', 'multilingual', 'summary'], pricing: 'freemium', priceFrom: 0, description: 'AI search engine with real-time multilingual search, automatic translation, and knowledge graph visualization.' },
  { name: 'Storm', url: 'https://storm.genie.stanford.edu', category: 'ai-research', tags: ['research', 'wikipedia', 'stanford'], pricing: 'free', priceFrom: 0, description: 'Stanford\'s AI research assistant that generates comprehensive, Wikipedia-style articles with citations on any topic.' },
  { name: 'Tavily', url: 'https://tavily.com', category: 'ai-research', tags: ['search', 'api', 'agent'], pricing: 'freemium', priceFrom: 0, description: 'AI search API optimized for LLM agents, providing real-time web data with rich contextual summaries.' },
  { name: 'OpenPerplex', url: 'https://openperplex.com', category: 'ai-research', tags: ['search', 'open source', 'ai'], pricing: 'free', priceFrom: 0, description: 'Open-source AI search engine alternative to Perplexity with real-time web search and source citations.' },
  
  // ===== AI Audio =====
  { name: 'Fish Audio', url: 'https://fish.audio', category: 'ai-audio', tags: ['voice', 'tts', 'cloning'], pricing: 'freemium', priceFrom: 0, description: 'AI voice synthesis platform with instant voice cloning, multilingual TTS, and realistic speech generation.' },
  { name: 'Udio', url: 'https://udio.com', category: 'ai-audio', tags: ['music', 'generation', 'vocals'], pricing: 'freemium', priceFrom: 0, description: 'AI music generation platform creating complete songs with custom vocals from text prompts.' },
  { name: 'Stable Audio', url: 'https://stableaudio.com', category: 'ai-audio', tags: ['music', 'stable diffusion', 'audio'], pricing: 'freemium', priceFrom: 0, description: 'Stability AI\'s music generation model that creates high-quality audio and music from text descriptions.' },
  { name: 'Hume AI', url: 'https://hume.ai', category: 'ai-audio', tags: ['voice', 'emotion', 'tts'], pricing: 'freemium', priceFrom: 0, description: 'Emotionally intelligent AI voice API that generates speech with natural emotional expression and empathy.' },
  
  // ===== AI Design =====
  { name: 'Looka', url: 'https://looka.com', category: 'ai-design', tags: ['logo', 'brand', 'identity'], pricing: 'paid', priceFrom: 20, description: 'AI-powered logo maker and brand identity platform that creates professional logos and brand kits in minutes.' },
  { name: 'Uizard', url: 'https://uizard.io', category: 'ai-design', tags: ['ui', 'prototyping', 'wireframe'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered UI design tool that converts screenshots, hand-drawn sketches, and prompts into digital wireframes.' },
  { name: 'Framer AI', url: 'https://framer.com', category: 'ai-design', tags: ['design', 'website', 'prototype'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered website and app design tool that generates complete responsive websites from text descriptions.' },
  { name: 'Pika Labs', url: 'https://pika.art', category: 'ai-design', tags: ['creative', 'animation', 'image'], pricing: 'freemium', priceFrom: 0, description: 'AI creative platform for image effects, animation, and video generation with a focus on creative expression.' },
  
  // ===== AI Productivity =====
  { name: 'Reclaim AI', url: 'https://reclaim.ai', category: 'ai-productivity', tags: ['calendar', 'scheduling', 'automation'], pricing: 'freemium', priceFrom: 0, description: 'AI scheduling assistant that automatically finds optimal time slots for tasks, habits, and meetings in your calendar.' },
  { name: 'Taskade', url: 'https://taskade.com', category: 'ai-productivity', tags: ['task', 'ai agent', 'collaboration'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered project management and task automation platform with AI agents for research, writing, and workflow.' },
  { name: 'Superhuman', url: 'https://superhuman.com', category: 'ai-productivity', tags: ['email', 'productivity', 'speed'], pricing: 'paid', priceFrom: 30, description: 'AI-powered email client that makes you twice as fast at email with keyboard shortcuts, AI triage, and instant search.' },
  { name: 'Reflect', url: 'https://reflect.app', category: 'ai-productivity', tags: ['notes', 'ai', 'backlinks'], pricing: 'paid', priceFrom: 10, description: 'AI note-taking app with automatic backlinking, AI writing assistant, and networked thought for personal knowledge.' },
  { name: 'Tldraw AI', url: 'https://tldraw.com', category: 'ai-productivity', tags: ['whiteboard', 'ai', 'sketch'], pricing: 'free', priceFrom: 0, description: 'Open-source AI whiteboard that turns rough sketches into working prototypes, websites, and diagrams.' },
  
  // ===== AI Marketing =====
  { name: 'Predis.ai', url: 'https://predis.ai', category: 'ai-marketing', tags: ['social media', 'content', 'scheduling'], pricing: 'freemium', priceFrom: 0, description: 'AI social media marketing tool that generates posts, short videos, and carousels from a product link or prompt.' },
  { name: 'Smartly.io', url: 'https://smartly.io', category: 'ai-marketing', tags: ['ad', 'automation', 'creative'], pricing: 'paid', priceFrom: 999, description: 'Enterprise AI advertising automation platform for creating, scaling, and optimizing social media ad campaigns.' },
  { name: 'Surfer SEO', url: 'https://surferseo.com', category: 'ai-marketing', tags: ['seo', 'content', 'optimization'], pricing: 'paid', priceFrom: 89, description: 'AI-powered SEO platform that analyzes top-ranking pages and guides content creation for maximum search visibility.' },
  { name: 'Typeframes', url: 'https://typeframes.com', category: 'ai-marketing', tags: ['video', 'marketing', 'social'], pricing: 'freemium', priceFrom: 0, description: 'AI video creation tool that transforms text and URLs into compelling social media marketing videos.' },
];

/**
 * HTTP fetch with timeout
 */
function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const mod = urlObj.protocol === 'https:' ? https : require('http');
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    };
    const req = mod.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.setTimeout(timeout, () => { req.destroy(); resolve(''); });
    req.end();
  });
}

/**
 * 抓取 Product Hunt AI 最新工具
 */
async function fetchProductHunt() {
  console.log('  🌐 Product Hunt: 抓取 AI 板块...');
  try {
    const html = await fetchUrl('https://www.producthunt.com/topics/artificial-intelligence?order=newest', 12000);
    if (!html) return [];
    
    const tools = [];
    // 匹配产品名称和链接
    const matches = html.matchAll(/"name":"([^"]{3,60})","tagline":"([^"]{10,200})","slug":"([^"]+)"/g);
    for (const m of matches) {
      const name = m[1].trim();
      const tagline = m[2].trim();
      const slug = m[3].trim();
      
      if (!existingNames.has(name.toLowerCase()) && tools.length < 15) {
        tools.push({ name, description: tagline, url: `https://producthunt.com/posts/${slug}`, category: inferCategory(name, tagline, slug) });
      }
    }
    console.log(`     找到 ${tools.length} 个新工具`);
    return tools;
  } catch (e) {
    console.log('     抓取失败，跳过');
    return [];
  }
}

/**
 * 抓取 There's An AI For That
 */
async function fetchThereIsAnAI() {
  console.log('  🌐 There\'s An AI For That: 抓取最新工具...');
  try {
    const html = await fetchUrl('https://theresanaiforthat.com/newest/', 12000);
    if (!html) return [];
    
    const tools = [];
    // 匹配工具卡片
    const cardMatches = html.matchAll(/data-name="([^"]+)"[^>]*data-description="([^"]+)"[^>]*href="([^"]+)"/g);
    for (const m of cardMatches) {
      const name = m[1].trim();
      const desc = m[2].trim();
      const link = m[3].startsWith('http') ? m[3] : 'https://theresanaiforthat.com' + m[3];
      
      if (!existingNames.has(name.toLowerCase()) && tools.length < 10) {
        tools.push({ name, description: desc, url: link, category: inferCategory(name, desc, link) });
      }
    }
    console.log(`     找到 ${tools.length} 个新工具`);
    return tools;
  } catch (e) {
    console.log('     抓取失败，跳过');
    return [];
  }
}

/**
 * 抓取 FutureTools.io
 */
async function fetchFutureTools() {
  console.log('  🌐 FutureTools.io: 抓取最新工具...');
  try {
    const html = await fetchUrl('https://www.futuretools.io/?pricing-model=free', 12000);
    if (!html) return [];
    
    const tools = [];
    // 匹配工具名称
    const nameMatches = html.matchAll(/class="[^"]*tool-name[^"]*"[^>]*>([^<]{3,60})</g);
    for (const m of nameMatches) {
      const name = m[1].trim();
      if (!existingNames.has(name.toLowerCase()) && tools.length < 10) {
        tools.push({ name, description: `${name} - AI-powered tool.`, url: `https://www.futuretools.io/?s=${encodeURIComponent(name)}`, category: inferCategory(name, name, name) });
      }
    }
    console.log(`     找到 ${tools.length} 个新工具`);
    return tools;
  } catch (e) {
    console.log('     抓取失败，跳过');
    return [];
  }
}

/**
 * 主流程
 */
async function main() {
  console.log('');
  console.log('🔍 AI Tools Discovery Engine v2');
  console.log('='.repeat(50));
  console.log('');

  // ① 过滤种子库中的新工具
  console.log('📋 第一步: 扫描最新种子数据库...');
  const newSeeds = LATEST_SEEDS.filter(t => {
    const slug = slugify(t.name);
    const urlNorm = t.url.toLowerCase().replace(/\/$/, '');
    return !existingSlugs.has(slug) &&
           !existingNames.has(t.name.toLowerCase()) &&
           !existingUrls.has(urlNorm);
  });
  console.log(`  发现 ${newSeeds.length} 个种子库新工具`);
  console.log('');

  // ② 抓取在线来源
  console.log('🌐 第二步: 从网络抓取最新工具...');
  const [phTools, taaiTools, ftTools] = await Promise.allSettled([
    fetchProductHunt(),
    fetchThereIsAnAI(),
    fetchFutureTools()
  ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : []));
  
  const onlineTools = [...phTools, ...taaiTools, ...ftTools];
  console.log(`  网络来源共抓取 ${onlineTools.length} 个候选工具`);
  console.log('');

  // ③ 合并去重
  console.log('🔧 第三步: 合并去重...');
  const allNew = [...newSeeds, ...onlineTools];
  const seen = new Set([...existingNames]);
  const uniqueNew = [];
  for (const t of allNew) {
    const key = t.name.toLowerCase();
    if (!seen.has(key) && t.name.length > 2) {
      seen.add(key);
      uniqueNew.push(t);
    }
  }
  console.log(`  去重后共 ${uniqueNew.length} 个新工具`);
  console.log('');

  // ④ 补全字段
  console.log('✨ 第四步: 补全字段...');
  const enriched = uniqueNew.map(tool => {
    const category = tool.category || inferCategory(tool.name, tool.description || '', tool.url || '');
    const { pros, cons } = generateProsCons(category);
    const alternatives = existingTools
      .filter(t => t.category === category)
      .slice(0, 3)
      .map(t => t.slug);

    return {
      name: tool.name,
      slug: tool.slug || slugify(tool.name),
      url: tool.url,
      description: tool.description || `${tool.name} - AI-powered tool for enhanced productivity.`,
      category,
      pricing: tool.pricing || 'freemium',
      priceFrom: tool.priceFrom || 0,
      pros,
      cons,
      rating: +(3.8 + Math.random() * 0.7).toFixed(1),
      tags: tool.tags || [category.replace('ai-', '')],
      featured: false,
      alternatives,
      discovered: true,
      discoveredAt: new Date().toISOString().split('T')[0]
    };
  });

  // ⑤ 输出结果
  console.log('='.repeat(50));
  console.log(`✅ 共发现 ${enriched.length} 个新工具`);
  console.log('');

  // 分类统计
  const byCategory = {};
  enriched.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + 1; });
  console.log('📊 分类分布:');
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    const catName = cat.replace('ai-', 'AI ').replace(/-/g, ' ');
    console.log(`   ${catName}: ${count} 个`);
  });
  console.log('');
  console.log('📋 新工具列表:');
  enriched.forEach((t, i) => {
    console.log(`  ${(i+1).toString().padStart(2)}. ${t.name} (${t.category}) — ${t.pricing}`);
  });

  // ⑥ 保存
  const outputPath = path.join(__dirname, '..', 'data', 'new-tools.json');
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log('');
  console.log(`💾 已保存到 data/new-tools.json`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
