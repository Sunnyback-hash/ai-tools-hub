/**
 * discover-tools.js - AI 工具自动发现脚本
 * 从公开来源抓取新 AI 工具信息，输出为可导入 tools.json 的格式
 *
 * 用法: node scripts/discover-tools.js [--output data/new-tools.json]
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 现有工具数据库（用于去重）
const toolsPath = path.join(__dirname, '..', 'data', 'tools.json');
const existingTools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
const existingSlugs = new Set(existingTools.map(t => t.slug));
const existingUrls = new Set(existingTools.map(t => t.url.toLowerCase()));
const existingNames = new Set(existingTools.map(t => t.name.toLowerCase()));

// 分类映射关键词
const CATEGORY_KEYWORDS = {
  'ai-chatbot': ['chatbot', 'chat', 'assistant', 'conversational', 'gpt', 'claude', 'dialogue'],
  'ai-image': ['image', 'art', 'illustration', 'drawing', 'photo', 'avatar', 'picture', 'visual'],
  'ai-video': ['video', 'animation', 'motion', 'filmmak', 'vfx', 'clip'],
  'ai-coding': ['code', 'programming', 'developer', 'debug', 'deploy', 'api', 'copilot', 'ide'],
  'ai-writing': ['writing', 'copy', 'content', 'blog', 'article', 'text', 'grammar', 'seo writing'],
  'ai-research': ['research', 'search', 'analyze', 'data', 'science', 'insight', 'paper'],
  'ai-audio': ['audio', 'music', 'voice', 'speech', 'sound', 'tts', 'podcast', 'transcri'],
  'ai-design': ['design', 'ui', 'ux', 'layout', 'mockup', 'wireframe', 'prototype', 'logo', 'brand'],
  'ai-productivity': ['productivity', 'workflow', 'automat', 'task', 'schedule', 'meeting', 'note', 'calendar'],
  'ai-marketing': ['marketing', 'ad', 'email market', 'social media', 'analytics', 'funnel', 'campaign']
};

const CATEGORY_NAMES = {
  'ai-chatbot': 'AI Chatbots',
  'ai-image': 'AI Image Generation',
  'ai-video': 'AI Video',
  'ai-coding': 'AI Coding',
  'ai-writing': 'AI Writing',
  'ai-research': 'AI Research',
  'ai-audio': 'AI Audio',
  'ai-design': 'AI Design',
  'ai-productivity': 'AI Productivity',
  'ai-marketing': 'AI Marketing'
};

// 已知 AI 工具种子数据库（高质量来源）
const KNOWN_SOURCES = [
  { name: 'Suno AI', url: 'https://suno.ai', category: 'ai-audio', tags: ['music', 'audio', 'creative'], pricing: 'freemium', priceFrom: 0, description: 'AI music generation platform that creates full songs from text prompts with vocals and instrumentation.' },
  { name: 'ElevenLabs', url: 'https://elevenlabs.io', category: 'ai-audio', tags: ['voice', 'tts', 'audio'], pricing: 'freemium', priceFrom: 0, description: 'Industry-leading AI voice synthesis platform for text-to-speech, voice cloning, and dubbing.' },
  { name: 'Perplexity AI', url: 'https://perplexity.ai', category: 'ai-research', tags: ['search', 'research', 'chatbot'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered search engine that provides cited answers with real-time web access and source references.' },
  { name: 'Notion AI', url: 'https://notion.so/product/ai', category: 'ai-productivity', tags: ['productivity', 'writing', 'note'], pricing: 'paid', priceFrom: 10, description: 'AI assistant integrated into Notion workspace for writing, summarizing, brainstorming, and task automation.' },
  { name: 'Jasper AI', url: 'https://jasper.ai', category: 'ai-writing', tags: ['writing', 'marketing', 'content'], pricing: 'paid', priceFrom: 49, description: 'Enterprise AI writing platform for marketing teams to create on-brand content at scale.' },
  { name: 'Synthesia', url: 'https://synthesia.io', category: 'ai-video', tags: ['video', 'avatar', 'presentation'], pricing: 'paid', priceFrom: 29, description: 'AI video generation platform that creates professional videos with digital avatars from text scripts.' },
  { name: 'HeyGen', url: 'https://heygen.com', category: 'ai-video', tags: ['video', 'avatar', 'translation'], pricing: 'freemium', priceFrom: 0, description: 'AI video creation platform with avatar generation, voice cloning, and video translation capabilities.' },
  { name: 'Figma AI', url: 'https://figma.com', category: 'ai-design', tags: ['design', 'ui', 'prototyping'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered design tool for UI/UX with auto-layout, component suggestions, and design generation.' },
  { name: 'Canva AI', url: 'https://canva.com', category: 'ai-design', tags: ['design', 'graphic', 'template'], pricing: 'freemium', priceFrom: 0, description: 'All-in-one design platform with AI features for image generation, background removal, and layout suggestions.' },
  { name: 'Descript', url: 'https://descript.com', category: 'ai-video', tags: ['video', 'editing', 'podcast'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered video and podcast editor that lets you edit media by editing text transcripts.' },
  { name: 'Gamma', url: 'https://gamma.app', category: 'ai-productivity', tags: ['presentation', 'document', 'design'], pricing: 'freemium', priceFrom: 0, description: 'AI presentation and document builder that creates polished slides, docs, and webpages from prompts.' },
  { name: 'Otter.ai', url: 'https://otter.ai', category: 'ai-productivity', tags: ['transcription', 'meeting', 'notes'], pricing: 'freemium', priceFrom: 0, description: 'AI meeting assistant that records, transcribes, and summarizes meetings in real-time.' },
  { name: 'Grammarly', url: 'https://grammarly.com', category: 'ai-writing', tags: ['grammar', 'writing', 'editing'], pricing: 'freemium', priceFrom: 0, description: 'AI writing assistant for grammar checking, style improvement, tone adjustment, and plagiarism detection.' },
  { name: 'Copy.ai', url: 'https://copy.ai', category: 'ai-writing', tags: ['copywriting', 'marketing', 'content'], pricing: 'freemium', priceFrom: 0, description: 'AI copywriting tool for generating marketing copy, product descriptions, emails, and social media content.' },
  { name: 'Writesonic', url: 'https://writesonic.com', category: 'ai-writing', tags: ['writing', 'seo', 'blog'], pricing: 'freemium', priceFrom: 0, description: 'AI writing platform optimized for SEO content, blog posts, and marketing copy with built-in analytics.' },
  { name: 'DeepL', url: 'https://deepl.com', category: 'ai-writing', tags: ['translation', 'language', 'writing'], pricing: 'freemium', priceFrom: 0, description: 'Neural machine translation service known for superior translation quality across 30+ languages.' },
  { name: 'Zapier AI', url: 'https://zapier.com', category: 'ai-productivity', tags: ['automation', 'workflow', 'integration'], pricing: 'freemium', priceFrom: 0, description: 'AI-enhanced workflow automation platform connecting 6,000+ apps with natural language automation builder.' },
  { name: 'Fireflies.ai', url: 'https://fireflies.ai', category: 'ai-productivity', tags: ['meeting', 'transcription', 'collaboration'], pricing: 'freemium', priceFrom: 0, description: 'AI meeting assistant that auto-records, transcribes, and extracts action items from meetings.' },
  { name: 'Tome', url: 'https://tome.app', category: 'ai-productivity', tags: ['presentation', 'storytelling', 'design'], pricing: 'freemium', priceFrom: 0, description: 'AI-native storytelling format that generates presentations, landing pages, and visual documents.' },
  { name: 'Kling AI', url: 'https://kling.kuaishou.com', category: 'ai-video', tags: ['video', 'generation', 'creative'], pricing: 'freemium', priceFrom: 0, description: 'Advanced AI video generation model by Kuaishou capable of creating realistic videos from text or images.' },
  { name: 'Ideogram', url: 'https://ideogram.ai', category: 'ai-image', tags: ['image', 'text rendering', 'design'], pricing: 'freemium', priceFrom: 0, description: 'AI image generator excelling at text rendering within images, ideal for logos, posters, and typography.' },
  { name: 'Flux AI', url: 'https://flux1.ai', category: 'ai-image', tags: ['image', 'open source', 'art'], pricing: 'free', priceFrom: 0, description: 'Open-source AI image generation model by Black Forest Labs with state-of-the-art photorealism.' },
  { name: 'Lovable', url: 'https://lovable.dev', category: 'ai-coding', tags: ['coding', 'web builder', 'full-stack'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered full-stack web app builder that generates complete applications from natural language prompts.' },
  { name: 'Bolt.new', url: 'https://bolt.new', category: 'ai-coding', tags: ['coding', 'web builder', 'prototyping'], pricing: 'freemium', priceFrom: 0, description: 'AI development environment by StackBlitz that builds and deploys full-stack apps in the browser.' },
  { name: 'v0.dev', url: 'https://v0.dev', category: 'ai-coding', tags: ['coding', 'ui', 'component'], pricing: 'freemium', priceFrom: 0, description: 'Vercel AI that generates React/Next.js UI components from text descriptions with live preview.' },
  { name: 'Codium AI', url: 'https://codium.ai', category: 'ai-coding', tags: ['coding', 'testing', 'review'], pricing: 'freemium', priceFrom: 0, description: 'AI code analysis tool that generates meaningful test suites and identifies code issues automatically.' },
  { name: 'Kaggle AI', url: 'https://kaggle.com', category: 'ai-research', tags: ['data science', 'machine learning', 'competition'], pricing: 'free', priceFrom: 0, description: 'Google platform for data science competitions, datasets, notebooks, and ML model collaboration.' },
  { name: 'Consensus', url: 'https://consensus.app', category: 'ai-research', tags: ['research', 'science', 'papers'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered search engine for scientific research papers that answers questions with evidence from studies.' },
  { name: 'Elicit', url: 'https://elicit.com', category: 'ai-research', tags: ['research', 'papers', 'analysis'], pricing: 'freemium', priceFrom: 0, description: 'AI research assistant that finds, summarizes, and extracts data from academic papers automatically.' },
  { name: 'Semantic Scholar', url: 'https://semanticscholar.org', category: 'ai-research', tags: ['research', 'papers', 'citations'], pricing: 'free', priceFrom: 0, description: 'AI-enhanced academic search engine by AI2 that helps researchers find relevant papers efficiently.' },
  { name: 'ChatPDF', url: 'https://chatpdf.com', category: 'ai-research', tags: ['pdf', 'document', 'analysis'], pricing: 'freemium', priceFrom: 0, description: 'AI tool for chatting with PDF documents - upload a PDF and ask questions about its contents.' },
  { name: 'Jasper Art', url: 'https://jasper.ai/art', category: 'ai-image', tags: ['art', 'marketing', 'illustration'], pricing: 'paid', priceFrom: 49, description: 'AI art generator integrated into Jasper marketing platform for creating marketing visuals from prompts.' },
  { name: 'Removal.ai', url: 'https://removal.ai', category: 'ai-image', tags: ['background', 'editing', 'photo'], pricing: 'freemium', priceFrom: 0, description: 'AI background removal tool that accurately separates subjects from backgrounds in photos.' },
  { name: 'Upscayl', url: 'https://upscayl.org', category: 'ai-image', tags: ['upscale', 'enhancement', 'photo'], pricing: 'free', priceFrom: 0, description: 'Open-source AI image upscaler that enhances photo resolution using advanced AI models locally.' },
  { name: 'Murf AI', url: 'https://murf.ai', category: 'ai-audio', tags: ['voice', 'tts', 'studio'], pricing: 'freemium', priceFrom: 0, description: 'AI voice generator studio for creating realistic voiceovers from text with 120+ voices in 20+ languages.' },
  { name: 'AIVA', url: 'https://aiva.ai', category: 'ai-audio', tags: ['music', 'composition', 'creative'], pricing: 'freemium', priceFrom: 0, description: 'AI music composer that creates original soundtracks for films, games, ads, and videos.' },
  { name: 'Cleanvoice AI', url: 'https://cleanvoice.ai', category: 'ai-audio', tags: ['audio', 'editing', 'podcast'], pricing: 'paid', priceFrom: 10, description: 'AI audio post-processing tool that removes filler words, mouth sounds, and background noise from recordings.' },
  { name: 'AdCreative.ai', url: 'https://adcreative.ai', category: 'ai-marketing', tags: ['ad', 'creative', 'social media'], pricing: 'paid', priceFrom: 29, description: 'AI platform that generates high-converting ad creatives and social media posts optimized for performance.' },
  { name: 'HubSpot AI', url: 'https://hubspot.com', category: 'ai-marketing', tags: ['crm', 'marketing', 'sales'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered CRM and marketing platform with content generation, email writing, and lead scoring automation.' },
  { name: 'Brevo AI', url: 'https://brevo.com', category: 'ai-marketing', tags: ['email', 'marketing', 'campaign'], pricing: 'freemium', priceFrom: 0, description: 'AI-enhanced email marketing platform with smart send-time optimization and content generation.' },
  { name: 'Buffer AI', url: 'https://buffer.com', category: 'ai-marketing', tags: ['social media', 'scheduling', 'analytics'], pricing: 'freemium', priceFrom: 0, description: 'Social media management tool with AI assistant for generating post ideas and optimizing engagement.' },
  { name: 'SerpAPI', url: 'https://serpapi.com', category: 'ai-marketing', tags: ['seo', 'search', 'api'], pricing: 'freemium', priceFrom: 0, description: 'Real-time search API that provides structured search data for SEO tools and marketing automation.' },
  { name: 'Miro AI', url: 'https://miro.com', category: 'ai-productivity', tags: ['collaboration', 'whiteboard', 'brainstorming'], pricing: 'freemium', priceFrom: 0, description: 'AI-enhanced collaborative whiteboard for brainstorming, planning, and visual project management.' },
  { name: 'Arc Browser', url: 'https://arc.net', category: 'ai-productivity', tags: ['browser', 'productivity', 'search'], pricing: 'free', priceFrom: 0, description: 'AI-powered web browser with built-in AI search, auto-organize tabs, and smart browsing features.' },
  { name: 'Replit AI', url: 'https://replit.com', category: 'ai-coding', tags: ['coding', 'ide', 'deployment'], pricing: 'freemium', priceFrom: 0, description: 'AI-powered online IDE with code generation, debugging, and instant deployment in any language.' },
  { name: 'Tabnine', url: 'https://tabnine.com', category: 'ai-coding', tags: ['autocomplete', 'coding', 'privacy'], pricing: 'freemium', priceFrom: 0, description: 'AI code completion assistant focused on privacy, running locally to suggest code completions in real-time.' },
  { name: 'Weights & Biases', url: 'https://wandb.ai', category: 'ai-research', tags: ['ml', 'experiment', 'tracking'], pricing: 'freemium', priceFrom: 0, description: 'ML experiment tracking and model management platform for machine learning teams and researchers.' },
  { name: 'Roboflow', url: 'https://roboflow.com', category: 'ai-image', tags: ['computer vision', 'dataset', 'annotation'], pricing: 'freemium', priceFrom: 0, description: 'Computer vision platform for building, training, and deploying custom AI models with dataset management.' },
  { name: 'AutoGPT', url: 'https://github.com/Significant-Gravitas/AutoGPT', category: 'ai-chatbot', tags: ['autonomous', 'agent', 'automation'], pricing: 'free', priceFrom: 0, description: 'Open-source autonomous AI agent that chains LLM calls to accomplish complex tasks independently.' },
  { name: 'Suno.com Clone', url: 'https://udio.com', category: 'ai-audio', tags: ['music', 'generation', 'creative'], pricing: 'freemium', priceFrom: 0, description: 'AI music generation platform creating complete songs with vocals from text prompts, competitor to Suno.' },
  { name: 'Pika', url: 'https://pika.art', category: 'ai-video', tags: ['video', 'generation', 'creative'], pricing: 'freemium', priceFrom: 0, description: 'AI video generation tool that creates and edits videos from text or image prompts with lip-sync features.' },
  { name: 'Stable Diffusion', url: 'https://stability.ai', category: 'ai-image', tags: ['image', 'open source', 'art'], pricing: 'free', priceFrom: 0, description: 'Open-source AI image generation model that can run locally, with extensive community-built models and tools.' },
  { name: 'Bing Image Creator', url: 'https://bing.com/create', category: 'ai-image', tags: ['image', 'free', 'creative'], pricing: 'free', priceFrom: 0, description: 'Free AI image generator powered by DALL-E, accessible through Microsoft Bing with daily boost credits.' },
  { name: 'Codeium', url: 'https://codeium.com', category: 'ai-coding', tags: ['autocomplete', 'coding', 'free'], pricing: 'free', priceFrom: 0, description: 'Free AI code completion toolkit supporting 70+ languages and 40+ IDEs with fast local processing.' },
  { name: 'Windsurf', url: 'https://codeium.com/windsurf', category: 'ai-coding', tags: ['ide', 'coding', 'agent'], pricing: 'freemium', priceFrom: 0, description: 'AI-native IDE by Codeium with intelligent code generation, multi-file editing, and pair programming features.' },
  { name: 'Zhipu AI', url: 'https://zhipuai.cn', category: 'ai-chatbot', tags: ['chatbot', 'chinese', 'multimodal'], pricing: 'freemium', priceFrom: 0, description: 'Leading Chinese AI company offering GLM series models for chat, coding, and multimodal tasks.' },
];

/**
 * 自动推断分类
 */
function inferCategory(name, description, url) {
  const text = (name + ' ' + description + ' ' + url).toLowerCase();
  const scores = {};
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[cat] = keywords.reduce((sum, kw) => sum + (text.includes(kw) ? 1 : 0), 0);
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return best[1] > 0 ? best[0] : 'ai-productivity';
}

/**
 * 生成 slug
 */
function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 生成合理的 pros/cons
 */
function generateProsCons(description, category) {
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
    'ai-chatbot': ['May produce inaccurate information', 'Limited offline capability', 'Learning curve for advanced features', 'Response quality varies'],
    'ai-image': ['May require prompt engineering', 'Limited fine control', 'Output inconsistency', 'Watermark on free tier'],
    'ai-video': ['Requires good source material', 'Limited editing depth', 'Rendering time for long videos', 'Storage requirements'],
    'ai-coding': ['May need manual review', 'Large codebase slowdown', 'Context window limitations', 'Not ideal for complex architectures'],
    'ai-writing': ['May lack personal voice', 'Requires editing', 'Generic suggestions possible', 'Subscription costs for full features'],
    'ai-research': ['May miss niche sources', 'English bias in coverage', 'Requires verification', 'Premium features locked'],
    'ai-audio': ['Robotic edge cases', 'Limited emotional range', 'Processing time for long audio', 'Language limitations'],
    'ai-design': ['Template limitations', 'Learning curve', 'Export format restrictions', 'Brand asset import issues'],
    'ai-productivity': ['Setup time required', 'Integration gaps', 'Privacy concerns', 'Premium feature paywall'],
    'ai-marketing': ['Data privacy concerns', 'Over-automation risk', 'Learning curve for setup', 'Cost for premium features']
  };

  const pros = prosByCategory[category] || prosByCategory['ai-productivity'];
  const cons = consByCategory[category] || consByCategory['ai-productivity'];

  return {
    pros: pros.slice(0, 3 + Math.floor(Math.random() * 2)),
    cons: cons.slice(0, 2 + Math.floor(Math.random() * 2))
  };
}

/**
 * 查找同类替代工具
 */
function findAlternatives(tool, allTools) {
  return allTools
    .filter(t => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 3)
    .map(t => t.slug);
}

/**
 * 抓取 Product Hunt 页面发现新工具
 */
function fetchProductHunt() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.producthunt.com',
      path: '/topics/artificial-intelligence',
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.setTimeout(10000, () => { req.destroy(); resolve(''); });
    req.end();
  });
}

/**
 * 主流程
 */
async function main() {
  console.log('🔍 AI Tools Discovery Engine');
  console.log('='.repeat(50));
  console.log(`📦 现有工具库: ${existingTools.length} 个工具`);
  console.log('');

  // 1. 种子数据库过滤
  console.log('📋 第一步: 扫描种子数据库...');
  const seedTools = KNOWN_SOURCES.filter(tool => {
    const slug = slugify(tool.name);
    return !existingSlugs.has(slug) &&
           !existingNames.has(tool.name.toLowerCase()) &&
           !existingUrls.has(tool.url.toLowerCase());
  });

  // 2. 尝试抓取 Product Hunt（可能失败，不阻塞流程）
  console.log('🌐 第二步: 尝试抓取 Product Hunt AI 板块...');
  let phTools = [];
  try {
    const phHtml = await fetchProductHunt();
    if (phHtml) {
      // 简单提取产品名和 URL
      const productRegex = /href="\/posts\/([^-][^"]*?)"[^>]*>\s*<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)/g;
      let match;
      const found = new Set();
      while ((match = productRegex.exec(phHtml)) !== null) {
        const slug = match[1];
        const name = match[2].trim();
        if (name && !found.has(name.toLowerCase()) && !existingNames.has(name.toLowerCase())) {
          found.add(name.toLowerCase());
          phTools.push({
            name: name,
            slug: slugify(name),
            url: `https://producthunt.com/posts/${slug}`,
            category: 'ai-productivity',
            pricing: 'unknown',
            priceFrom: 0,
            description: `Discover ${name} on Product Hunt - AI-powered tool.`,
            tags: ['discovery', 'new']
          });
        }
      }
      phTools = phTools.slice(0, 10); // 最多取 10 个
    }
  } catch (e) {
    console.log('   ⚠️ Product Hunt 抓取失败（网络问题），跳过。');
  }
  console.log(`   找到 ${phTools.length} 个潜在新工具`);

  // 3. 合并并去重
  const allNew = [...seedTools, ...phTools];
  const seen = new Set();
  const uniqueNew = allNew.filter(t => {
    const key = t.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 4. 补全字段
  console.log('🔧 第三步: 自动补全字段...');
  const enriched = uniqueNew.map(tool => {
    const slug = tool.slug || slugify(tool.name);
    const category = tool.category || inferCategory(tool.name, tool.description, tool.url);
    const { pros, cons } = tool.pros ? { pros: tool.pros, cons: tool.cons } : generateProsCons(tool.description, category);
    const alternatives = existingTools
      .filter(t => t.category === category)
      .slice(0, 3)
      .map(t => t.slug);

    return {
      name: tool.name,
      slug: slug,
      url: tool.url,
      description: tool.description,
      category: category,
      pricing: tool.pricing || 'unknown',
      priceFrom: tool.priceFrom || 0,
      pros: pros,
      cons: cons,
      rating: 4.0,
      tags: tool.tags || [CATEGORY_NAMES[category] || category],
      featured: false,
      alternatives: alternatives,
      discovered: true,
      needsReview: true
    };
  });

  // 5. 输出结果
  console.log('');
  console.log('='.repeat(50));
  console.log(`✅ 发现 ${enriched.length} 个新工具！`);
  console.log('');

  // 按分类统计
  const byCategory = {};
  enriched.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
  });
  console.log('📊 分类分布:');
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${CATEGORY_NAMES[cat] || cat}: ${count} 个`);
    });

  console.log('');
  console.log('📋 新工具列表:');
  enriched.forEach((t, i) => {
    console.log(`   ${(i + 1).toString().padStart(2, ' ')}. ${t.name} (${t.category}) — ${t.pricing}`);
  });

  // 6. 保存结果
  const outputPath = path.join(__dirname, '..', 'data', 'new-tools.json');
  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2));
  console.log('');
  console.log(`💾 已保存到: data/new-tools.json`);
  console.log('');
  console.log('📌 下一步:');
  console.log('   1. 检查 data/new-tools.json，人工审核工具信息');
  console.log('   2. 运行 node scripts/import-tools.js 自动导入到 tools.json');
  console.log('   3. 运行 node build.js 重新构建网站');
}

main().catch(console.error);
