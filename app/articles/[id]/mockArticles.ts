export type MockArticle = {
  id: string;
  title: string;
  author: string;
  publication: string;
  date: string;
  readTime: string;
  tag: string;
  cover: string;
  markdown: string;
};

export const MOCK_ARTICLES: Record<string, MockArticle> = {
  "a-1": {
    id: "a-1",
    title: "Por que entender DeFi muda sua forma de operar",
    author: "Equipe Editorial",
    publication: "DeFi Institute",
    date: "Mar 20, 2026",
    readTime: "6 min",
    tag: "Fundamentos",
    cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=80",
    markdown: `# Operar com mapa

Em DeFi, velocidade sem clareza vira custo. Três erros comuns:

- Confundir **produto** com **risco**
- Ignorar dependências (oráculos, bridges, admin keys)
- Tratar APR como “garantia” de retorno

> Se você não consegue explicar o risco em uma frase, você provavelmente não consegue gerenciá-lo.

## Checklist de 5 minutos

- Entendo o colateral e o mecanismo de liquidação
- Sei o pior caso (slippage, peg, oracle, admin)
- Tenho limite claro de perda (stop)
- Revisei approvals e permissões

[Voltar para Artigos](/articles)
`,
  },
  "a-2": {
    id: "a-2",
    title: "AMMs: preço, slippage e o custo real do swap",
    author: "Time de Pesquisa",
    publication: "Mecânicas DeFi",
    date: "Mar 16, 2026",
    readTime: "8 min",
    tag: "Mecânicas",
    cover: "https://images.unsplash.com/photo-1551281044-8b89a5b42a28?w=1600&q=80",
    markdown: `# AMMs sem mistério

- O preço é consequência da **curva** e da **liquidez**
- Slippage aumenta quando seu trade “anda” na curva
- Taxas + impacto no preço = custo real

## Regra prática

- Quanto maior o tamanho do trade vs. liquidez, maior o slippage
- Compare rotas e considere taxa total antes de executar

[Voltar para Artigos](/articles)
`,
  },
  "a-3": {
    id: "a-3",
    title: "Checklist de segurança antes de interagir com um protocolo",
    author: "Equipe Editorial",
    publication: "Segurança",
    date: "Mar 10, 2026",
    readTime: "7 min",
    tag: "Segurança",
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&q=80",
    markdown: `# Segurança rápida (sem drama)

- Verifique o domínio e o contrato
- Revise permissões (approvals) antes e depois
- Cheque admin keys, upgrades e pausas
- Observe dependências: oráculos, bridges, multisigs

> O “ótimo” é sobreviver ao pior dia.

[Voltar para Artigos](/articles)
`,
  },
  "a-4": {
    id: "a-4",
    title: "Stablecoins: o que observar em momentos de estresse",
    author: "Equipe Editorial",
    publication: "Mercado",
    date: "Mar 05, 2026",
    readTime: "9 min",
    tag: "Mercado",
    cover: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1600&q=80",
    markdown: `# Stablecoins em estresse

- Colateral e mecanismos de resgate
- Liquidez de saída e “circuit breakers”
- Risco de contraparte e concentração

[Voltar para Artigos](/articles)
`,
  },
  "a-5": {
    id: "a-5",
    title: "Lending sem sustos: health factor e liquidações",
    author: "Time de Pesquisa",
    publication: "Mecânicas DeFi",
    date: "Feb 28, 2026",
    readTime: "10 min",
    tag: "Mecânicas",
    cover: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=1600&q=80",
    markdown: `# Lending sem sustos

- Health factor = buffer de segurança
- Entenda a fórmula e quais ativos “puxam” risco
- Evite operar no limite em volatilidade

[Voltar para Artigos](/articles)
`,
  },
  "a-6": {
    id: "a-6",
    title: "Auditoria rápida: um framework para avaliar protocolos",
    author: "Equipe Editorial",
    publication: "Segurança",
    date: "Feb 18, 2026",
    readTime: "8 min",
    tag: "Segurança",
    cover: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1600&q=80",
    markdown: `# Framework de auditoria rápida

- Superfícies de ataque (oráculos, bridges, upgrades)
- Controles: pausas, rate limits, multisig
- Sinais de centralização e dependências frágeis

[Voltar para Artigos](/articles)
`,
  },
};

