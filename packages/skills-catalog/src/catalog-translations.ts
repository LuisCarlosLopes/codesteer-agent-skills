// @MindContext: Dicionário de traduções PT-BR exclusivo para exibição humana no catálogo HTML (GitHub Pages)
// @MindDecision: Isolado dos arquivos SKILL.md para não alterar hashes SHA-256, contratos MCP ou gatilhos em inglês dos agentes
// @MindFlow: generate-catalog-html consulta getSkillTranslationPtBr(skill.name) → exibe em PT-BR no card e mantém busca bilíngue (PT-BR + EN)

export interface SkillTranslationPtBr {
  summary: string;
  doNotUse: string;
}

export const SKILL_TRANSLATIONS_PT_BR: Record<string, SkillTranslationPtBr> = {
  'advanced-elicitation': {
    summary:
      'Pressiona o modelo a reconsiderar, refinar e aprofundar sua resposta recente com questionamento estruturado. Quando usar: quando você solicitar elicitação avançada ou revisão crítica da última saída do agente.',
    doNotUse:
      'Não usar para: implementação de código, depuração (debugging) ou fluxos de produto não relacionados.',
  },
  'agno-architect': {
    summary:
      'Arquitetura multiagente com Agno (Python): Agents, Teams, Workflows, Tools, Knowledge/RAG, Memory, Sessions, Reasoning e padrões de produção. Quando usar: para criar, estruturar, depurar ou otimizar soluções no framework Agno ("cria um agente", "monta um time de agentes", "RAG com Agno", "persistência de sessão", "workflow determinístico").',
    doNotUse:
      'Não usar para: outros frameworks de agentes (LangChain, CrewAI, LlamaIndex), refatoração genérica em Python ou tarefas de frontend.',
  },
  'avaliador-de-prompt': {
    summary:
      'Revisão técnica estruturada de prompts (system prompt, user prompt ou instruções de agente): identifica o objetivo, atribui nota de 0 a 10 com rubrica ponderada, aponta técnicas presentes (CoT, few-shot, role, delimitadores, restrições), lista pontos fortes e riscos e oferece reescrita otimizada. Quando usar: para avaliar, auditar ou dar nota a um prompt.',
    doNotUse:
      'Não usar para: encurtar instruções sem alterar a semântica (use instruction-densifier), criar um prompt do zero sem rascunho ou revisar código.',
  },
  'copywriting-persuasivo': {
    summary:
      'Estrutura textos persuasivos e de resposta direta de alta conversão (PAS, AIDA, BAB, StoryBrand, 4Us) para páginas de vendas, sequências de e-mail, criativos de anúncios e landing pages. Quando usar: para escrever, otimizar, criticar ou reestruturar copy focada em conversão, propostas de valor e headlines.',
    doNotUse:
      'Não usar para: escrita de ficção, documentação técnica de software, repetição de palavras-chave de SEO sem intenção persuasiva ou jornalismo institucional.',
  },
  'criador-persona': {
    summary:
      'Transforma intenções simples em personas de IA tridimensionais e system prompts prontos para produção usando atuação pelo Método Stanislavski, Engenharia Reversa de Intenção e Design Modular de Persona. Quando usar: para criar, projetar ou refinar personas de IA, identidades de agentes especialistas ou prompts de role-play.',
    doNotUse:
      'Não usar para: depuração de código sem contexto de persona, resumo de textos gerais, consultas de banco de dados ou prompts fotográficos sem especificação de personagem.',
  },
  'debate-entre-experts-tech': {
    summary:
      'Conduz um painel estruturado entre 2 a 4 especialistas (arquiteto de soluções, DevOps, segurança, dados, DBA, full-stack) para resolver problemas complexos de engenharia: cada expert analisa passo a passo, propõe duas abordagens e debate critérios até convergir em uma recomendação com trade-offs explícitos. Quando usar: para comparar arquiteturas ou decisões técnicas com múltiplas perspectivas.',
    doNotUse:
      'Não usar para: respostas técnicas simples e diretas, code review de diffs, redação de ADR após decisão já tomada ou temas fora de engenharia de software.',
  },
  'deep-research-prompt': {
    summary:
      'Guia o usuário de forma interativa como um Arquiteto de Prompts de Pesquisa para elicitar, calibrar e gerar um Master Prompt de alta profundidade voltado a relatórios investigativos, acadêmicos ou de mercado. Quando usar: para estruturar ou refinar um prompt de pesquisa profunda (Deep Research).',
    doNotUse:
      'Não usar para: responder diretamente ao tema pesquisado, gerar o relatório final sem passar pelo prompt, depurar código ou resumir textos comuns.',
  },
  'design-to-html': {
    summary:
      'Recria um mock de interface (PNG/JPG/WebP) como HTML + CSS + JS estático puro, sem frameworks, em etapas validadas com o usuário (wireframe ASCII tipado → fundo → componentes e fontes → assets → revisão final). Quando usar: para converter um screenshot, export do Figma ou imagem de tela em HTML fiel ao pixel ou gerar um wireframe ASCII/SVG tipado.',
    doNotUse:
      'Não usar para: aplicações em React, Vue ou Vite (salvo pedido explícito), trabalho de frontend sem imagem/brief de tela, documentação de design system ou fotos comuns.',
  },
  'diretor-de-fotografia': {
    summary:
      'Diretor de Fotografia de IA: transforma um roteiro de produção detalhado (TikTok/Reels/Shorts, 60s+) em um Relatório de Geração Visual com estilo artístico unificado, base consistente de personagem, regras de ritmo (clipes de 3–5s, alternância A-roll/B-roll) e prompts cena a cena para Google Veo e Imagen 3. Quando usar: quando você já tem um roteiro e precisa dirigi-lo visualmente.',
    doNotUse:
      'Não usar para: escrever o roteiro do zero (use tiktok-faceless-strategist ou vertical-micro-drama-writer), gerar foto avulsa sem narrativa ou editar arquivos de vídeo.',
  },
  'electron-automation': {
    summary:
      'Automatiza aplicações desktop Electron (VS Code, Slack, Discord, Figma, Notion, Spotify etc.) usando agent-browser via Chrome DevTools Protocol (CDP). Quando usar: para interagir, controlar, testar ou automatizar um aplicativo desktop Electron em execução.',
    doNotUse:
      'Não usar para: páginas web comuns no navegador, aplicativos nativos não-Electron (Cocoa, Win32, GTK) ou automação mobile.',
  },
  'extrair-contexto-de-negocio': {
    summary:
      'Extrai o contexto de negócio e marca de uma empresa (proposta de valor, produtos, nicho, público, posicionamento, tom de voz, identidade visual e diferenciais competitivos) estritamente a partir de fontes oficiais fornecidas pelo usuário, separando fatos observados de inferências. Quando usar: para mapear ou diagnosticar o perfil de uma empresa a partir do site ou redes sociais.',
    doNotUse:
      'Não usar para: escrever copy de marketing, criar manual de marca do zero, comparar múltiplos concorrentes de uma só vez ou analisar sem fontes oficiais.',
  },
  'gerador-de-campanha': {
    summary:
      'Atua como diretor criativo, copywriter de performance e estrategista de marca para transformar o briefing de um produto ou app em uma campanha completa de vídeos curtos: diagnóstico, 3 ângulos criativos, roteiro cena a cena, variações de hook/CTA e adaptação para Reels e TikTok. Quando usar: para criar campanhas, roteiros de anúncio ou conceitos criativos para produtos.',
    doNotUse:
      'Não usar para: copy longa (landing pages, cartas de vendas, sequências de e-mail), planejamento de orçamento de mídia paga, conteúdo SEO ou edição de vídeo.',
  },
  'grill-me': {
    summary:
      'Interrogatório adversarial de um plano, design ou especificação antes de virar código: expõe premissas ocultas, contradições, becos sem saída e decisões tomadas por inércia, uma pergunta por vez. Quando usar: quando pedir para testar seu plano sob pressão ("me grille", "encontre buracos no plano", "o que pode dar errado?", "está pronto para implementar?").',
    doNotUse:
      'Não usar para: implementar, depurar ou revisar código já escrito, nem para levantar requisitos do zero.',
  },
  'instruction-densifier': {
    summary:
      'Compacta textos instrucionais voltados a LLMs (system prompts, AGENTS.md, CLAUDE.md, .cursorrules, SKILL.md e descrições de skills) para consumir menos tokens mantendo exatamente a mesma semântica operacional, gatilhos, precedências e proibições. Quando usar: para enxugar, condensar ou cortar tokens de instruções e prompts acima do orçamento.',
    doNotUse:
      'Não usar para: implementação de código, textos de produto ou marketing, ou resumo de documentos não-instrucionais.',
  },
  'lgpd-implementation': {
    summary:
      'Implementa, revisa ou audita conformidade com a LGPD em produtos digitais, fluxos de dados e operações de software (consentimento, base legal, direitos do titular, cookies, retenção, exclusão, ANPD, RIPD, DPO e arts. 20, 23, 37 e 38). Quando usar: para expor vulnerabilidades, controles ausentes e lacunas de privacidade no frontend, backend, banco e integrações.',
    doNotUse:
      'Não usar para: pareceres jurídicos formais, escopo exclusivo de GDPR europeu ou revisões de segurança sem relação com dados pessoais.',
  },
  'photo-character-profiler': {
    summary:
      'Realiza uma análise visual técnica de fotos de uma pessoa real e extrai um perfil neutro e estruturado (estrutura óssea facial, olhos, nariz, lábios, fototipo de Fitzpatrick, tipo de cabelo Walker, expressão FACS, vestuário e marcadores distintos) pronto para ancorar consistência de personagem em geradores de imagem. Quando usar: ao enviar fotos para extrair ficha de identidade visual.',
    doNotUse:
      'Não usar para: redigir o prompt final da cena (use photorealistic-image-generation), personagens fictícios sem foto de referência, reconhecimento facial ou julgamento estético.',
  },
  'photorealistic-image-generation': {
    summary:
      'Projeta prompts fotográficos, parâmetros ópticos de câmera, setups de iluminação física autêntica e controles de textura tátil para gerar imagens fotorrealistas sem aspecto artificial de IA. Quando usar: para criar prompts para Midjourney, Flux, Stable Diffusion, Imagen ou DALL-E simulando lentes, aberturas, filmes e iluminação realistas.',
    doNotUse:
      'Não usar para: gerar mocks de UI, wireframes, código HTML/CSS, gráficos vetoriais, modelos 3D low-poly, ilustrações cartoon ou estilo anime.',
  },
  'pipeline-canary': {
    summary:
      'Skill canário utilizada para verificar a integridade da esteira de validação, compilação SHA-256, geração HTML e servidor MCP do catálogo. Quando usar: apenas em testes automatizados e verificação de saúde do pipeline do catálogo.',
    doNotUse:
      'Não usar para: fluxos de agentes em produção ou implementação de funcionalidades reais.',
  },
  'prd-creator': {
    summary:
      'Transforma uma ideia bruta de produto ou funcionalidade em um Documento de Requisitos de Produto (PRD) pronto para engenharia em duas etapas: primeiro faz exatamente 3 perguntas de alinhamento de escopo e, após as respostas, redige o PRD completo com objetivos, KPIs, personas, user stories por épico e requisitos não-funcionais. Quando usar: para criar ou estruturar um PRD.',
    doNotUse:
      'Não usar para: sabatinar um plano já existente (use grill-me), escrever ADRs de arquitetura técnica, estimar esforço ou quebrar tarefas de sprint.',
  },
  'tiktok-faceless-strategist': {
    summary:
      'Projeta pacotes completos de vídeos faceless de alta retenção para TikTok/Reels/Shorts (60–65s): seleção de arquétipo de hook, SEO em 3 camadas, estrutura em loop perfeito, roteiro com timecode, locução limpa para TTS, ~20 prompts de imagem estáveis e prompt de vídeo para os 3 primeiros segundos. Quando usar: para criar roteiros e pacotes visuais de canais dark/faceless.',
    doNotUse:
      'Não usar para: vídeos com apresentador em câmera, ensaios longos de YouTube, copy de anúncios pagos ou landing pages, ou micro-dramas ficcionais com personagens.',
  },
  'vertical-micro-drama-writer': {
    summary:
      'Roteirista sênior para micro-dramas verticais (TikTok, Reels, Kwai, Shorts) que transforma uma ideia bruta em roteiro cronometrado de alta retenção com cliffhangers, micro-loops Zeigarnik, dossiê de personagens e prompts de vídeo de IA por cena (Runway, Kling, Luma, Veo, Sora). Quando usar: para criar novelas verticais, séries curtas ou episódios de 1 a 5 minutos.',
    doNotUse:
      'Não usar para: prompts de imagem estática (use photorealistic-image-generation), roteiros de longa-metragem, copy de vendas ou vídeos longos de YouTube.',
  },
  'viral-thumbnail': {
    summary:
      'Cria conceitos de thumbnails de alto CTR no estilo MrBeast/vlog para YouTube e vídeos curtos: analisa a psicologia do clique do título e das fotos enviadas e produz prompts detalhados de geração de imagem (Gemini/Imagen, Midjourney, Flux) em português e inglês com expressões intensas, cores saturadas e lacuna de curiosidade. Quando usar: para criar ou otimizar capas de vídeo.',
    doNotUse:
      'Não usar para: fotografia editorial realista, mocks de interface, logotipos, banners, carrosséis, roteiros de vídeo ou títulos/descrições de SEO.',
  },
  'visual-character-profiler': {
    summary:
      'Arquiteto de personagens que projeta prompts detalhados (400–600 palavras) para avatares humanos hiper-realistas e protagonistas de campanha (Nano Banana Pro / Gemini Image e modelos fotorrealistas), conduzindo um briefing em 4 etapas com estrutura óssea, fototipo de Fitzpatrick, textura de pele, iluminação cinematográfica e cartão de ancoragem. Quando usar: para criar avatares ou personagens consistentes em múltiplas cenas.',
    doNotUse:
      'Não usar para: fotos de produtos, paisagens ou arquitetura sem sujeito humano, personagens cartoon/anime/3D ou definições de persona apenas em texto.',
  },
};

export function getSkillTranslationPtBr(skillName: string): SkillTranslationPtBr | undefined {
  return SKILL_TRANSLATIONS_PT_BR[skillName];
}
