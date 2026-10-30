# Plano — Blog de Notas

Blog de ensaios e textos livres (reflexões, sociedade, cotidiano) publicado em `https://thiago662.github.io/blog-de-notas-app/`. O conteúdo vem do **Ademiro de Blogs** (blog `blog-de-notas` no Firestore do projeto `ademiro-dac27`); este repositório é só o site público.

**Implementação de referência:** `C:\Projetos\Blogs\brain-logs-app` — mesmo modelo, já no ar. Copiar de lá o que for igual (ver CLAUDE.md, seção "O que reaproveitar do brain-logs").

**Objetivo:** mesmo resultado do brain-logs (página HTML por post, card no link compartilhado), mantendo a **identidade visual de post-its** deste blog.

---

## Decisões

| Tema | Decisão | Motivo |
|---|---|---|
| Base | Projeto novo com `ng new` (Angular atual) em vez de atualizar o 17 | igual ao brain-logs: código antigo é pequeno |
| Renderização | Prerender estático (`outputMode: 'static'`) | HTML pronto no build → card em redes sociais e SEO |
| Hospedagem | GitHub Pages, repositório `blog-de-notas-app`, branch **`master`** | repositório já existe |
| Dados | Firestore lite + TransferState, só posts `published` | igual ao brain-logs |
| Config | `firebase.config.ts` ignorado pelo git + secret `FIREBASE_CONFIG` | igual ao brain-logs e ao ademiro |
| Conteúdo | Markdown (`marked`) via `[innerHTML]` sanitizado pelo Angular | substitui o HTML com `bypassSecurityTrustHtml` atual (inseguro) |
| Rotas | `/` lista, `/:slug` post | formato do botão "Ver no blog" do ademiro (hoje usa ID do Realtime DB) |
| Visual | Cards em formato de **post-it**, cor por categoria | identidade do blog (já existe no código atual) |
| Atualização | deploy no push, manual e agendado a cada 6h | igual ao brain-logs |

---

## Fases

### Fase 0 — Base
- [x] Commit do estado atual (há alterações locais com o visual de post-its que ainda não foram commitadas)
- [x] Projeto novo (config copiada do brain-logs, mesmas versões do `ng new`) + prerender estático, Bootstrap (com o tema SCSS das cores dos post-its)
- [x] `overrides` de `@emnapi/*` no `package.json` desde o início (ver CLAUDE.md)
- [x] Config do Firebase no modelo `firebase.config.ts` / `firebase.config.example.ts`
- [x] Workflow de deploy no Pages (branch `master`) + `404.html` (escrito)
- [x] Usuário: Pages com source GitHub Actions + secret `FIREBASE_CONFIG`

### Fase 1 — Dados
- [x] `BlogService` copiado do brain-logs, com `blogSlug: 'blog-de-notas'`
- [x] `renderMarkdown` copiado do brain-logs (com os testes)

### Fase 2 — Páginas
- [x] `/` lista de posts (cards genéricos; post-its na Fase 4)
- [x] `/:slug` página do post
- [x] 404 (com `noindex`)
- [x] Título + meta tags Open Graph (serviço `Seo` do brain-logs)

### Fase 3 — Prerender e publicação
- [x] Deploy rodou e site publicado conferido (home e post prerenderizados, og:*, 404 cai no app)
- [x] `getPrerenderParams` (uma página por post)
- [x] Workflow no push, manual e agendado
- [ ] Usuário, no ademiro: URL pública `https://thiago662.github.io/blog-de-notas-app` e URL do deploy `https://github.com/thiago662/blog-de-notas-app/actions/workflows/deploy.yml`

### Fase 4 — Visual
- [x] Post-its com a cor pela categoria (`custom.categoria`), sem a cadeia de `ngClass` repetida
- [x] Página do post com a identidade do blog (fundo off-white, navbar escura)
- [x] Logo (post-it com N): favicon SVG/ICO, apple-touch-icon, navbar e `og-default.png` nas meta tags
- [x] Visual "caderno de ensaios" (fita, folha pautada, marca-texto) + tema claro/escuro opcional, navbar sempre escura
- [x] Autor (`settings.autor`) (código pronto; falta o campo no ademiro para ver)

### Fase 5 — Publicação
- [ ] Publicar um ensaio real no ademiro (rascunhos em `C:\Projetos\Blogs\textos`)
- [ ] Conferir o card do link compartilhado (ex.: Post Inspector do LinkedIn)

---

## Fora do primeiro ciclo
- Página por categoria, busca, RSS, comentários.

## Pré-requisitos no ademiro
- Campos do blog **Blog de Notas**:
  - `categoria` — *Lista de opções*, escopo **post**, opções: `programação`, `administração`, `dicas`, `ensaio`, `produtividade`
  - `autor` — *Texto curto*, escopo **blog**
- Pelo menos um post publicado.

## Limpeza depois da migração
- Apagar o nó `teste-projects` do Realtime DB do projeto **scrum-truco** e fechar as regras dele (hoje é de leitura pública). Os posts antigos eram de teste.
