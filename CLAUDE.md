# CLAUDE.md — Blog de Notas

Contexto para o Claude Code trabalhar neste repositório. Plano e checklist das fases: [PLAN.md](PLAN.md).

## Como trabalhar com o usuário

- Responder em **português**, de forma **curta e direta**, com passos numerados. Textos longos confundem.
- "Dúvida apenas" / "apenas ideias" / "não mexer em nada" = responder sem alterar código.
- Neste repositório: **commit e push direto na `master`**, sem branch/PR, até ele pedir outra coisa.
- Mensagens de commit em português (`feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`), terminando com:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- Configurações no site do GitHub (Pages, secrets) e no console do Firebase/ademiro ele faz: entregar o passo a passo. Não há `gh` instalado.
- Verificar antes de dizer que está pronto: `npm run build`, `npm test -- --watch=false` e `npm run check`.
- Ambiente: Windows, PowerShell 5.1 (sem `&&`; use `;`). Node 24.20, npm 11.19. Chrome instalado.

## O que é

Site público do **Blog de Notas**: ensaios e textos livres. Conteúdo escrito no **Ademiro de Blogs** (CMS do usuário: `C:\Projetos\Blogs\ademiro-de-blogs`, repositório `thiago662/ademiro-de-blogs`) e lido do Firestore do projeto Firebase `ademiro-dac27`. Este repositório só lê.

Publicação: `https://thiago662.github.io/blog-de-notas-app/` (GitHub Pages).

## Estado atual (2026-10-30)

- Migrado para o modelo do brain-logs (Angular 22, zoneless, prerender estático, Firestore). Visual "caderno de ensaios" (Fase 4): post-its com fita, folha pautada para o post, tema claro/escuro opcional.
- Projeto antigo (Angular 17 + Realtime DB do scrum-truco) está no commit `23db9ce`: `git show 23db9ce:src/styles.scss` etc.
- A URL do Realtime DB antigo já está no histórico público. Não reescrever histórico: a limpeza é feita no banco (ver PLAN.md, "Limpeza").

### Identidade visual (preservar)

`src/styles.scss` sobrescreve o `$theme-colors` do Bootstrap (via SCSS) com cores de post-it:

| Nome | Cor | Categoria (no código atual) |
|---|---|---|
| `pink` | `#F97594` | programação |
| `yellow` | `#FFD71A` | administração |
| `green` | `#E4E549` | dicas |
| `orange` | `#FCAC4A` | ensaio |
| `blue` | `#74CBC5` | produtividade |
| `red` | `#F36F6F` | qualquer outra |
| `off-white` | `#FAFAEA` | fundo da página no tema claro (`--paper`) |

- Navbar **sempre escura** (`--band`), nos dois temas; botão "tema claro/escuro" nela. Sem escolha o tema segue o sistema; a escolha fica em `localStorage['tema']` e vira `data-theme` no `<html>` (script em `index.html`, antes da pintura).
- Tokens e estilos em `src/styles.scss` (CSS variables; as cores de post-it vêm das variáveis SCSS). Fontes via Google Fonts: Fraunces (títulos), Newsreader (leitura), Caveat (letra de mão), DM Mono (metadados).
- Post-it = `.note` com classe `n-<cor>`; categoria → cor num único mapa em `core/categorias.ts`. Corpo do post = `.prose`: `**negrito**` vira marca-texto, `~~riscado~~` risco de lápis, citação (`>`) vira bilhete com fita.
- Logo: post-it laranja com canto dobrado e um N traçado à mão (`public/favicon.svg`; o mesmo SVG está inline na navbar). Em `public/` também `favicon.ico` (16/32/48), `apple-touch-icon.png` (180, fundo escuro) e `og-default.png` (1200×630, `og:image` padrão em `core/seo.ts` quando o post não tem capa). Para refazer os PNGs/ICO: renderizar o SVG no Chrome headless (`--screenshot`) e empacotar o ICO com PNGs.
- `tools/check.mjs` usa os seletores `.note` e `.prose`: se mudar essas classes, mudar lá também (senão o check passa com `cards=0`).

## O que reaproveitar do brain-logs

O `C:\Projetos\Blogs\brain-logs-app` é a **implementação de referência** — mesmo stack, já no ar e testado. Ler o `CLAUDE.md` de lá. Copiar e adaptar:

| Arquivo no brain-logs | Ajuste para este blog |
|---|---|
| `src/app/core/blog.service.ts` | nenhum (usa `environment.blogSlug`) |
| `src/app/core/markdown.ts` + `.spec.ts` | nenhum |
| `src/app/core/seo.ts` | trocar `og:site_name` "Brain Logs" → "Blog de Notas" |
| `src/environments/environment.ts` | `blogSlug: 'blog-de-notas'`, `siteUrl: 'https://thiago662.github.io/blog-de-notas-app'` |
| `src/environments/firebase.config.example.ts` | nenhum |
| `src/app/app.routes.ts`, `app.routes.server.ts`, `app.config.ts` | nenhum |
| `src/app/not-found.ts`, `posts/post-page.*`, `posts/post-list.*` | textos "Brain Logs" → "Blog de Notas"; visual de post-it |
| `tools/check.mjs` | trocar `dist/brain-logs-app` → `dist/blog-de-notas-app` |
| `.github/workflows/deploy.yml` | `branches: [master]`; caminhos `dist/blog-de-notas-app/...` |
| `angular.json` (`outputMode: "static"`, budgets 1MB/2MB) | nome do projeto; estilos: o tema SCSS (não o `bootstrap.min.css` pronto), para manter as cores customizadas |
| `package.json`: `overrides` de `@emnapi/*` e script `check` | copiar desde o início |
| `.gitignore`: linha `/src/environments/firebase.config.ts` | copiar |

O `src/environments/firebase.config.ts` (ignorado pelo git) pode ser copiado do brain-logs: é o mesmo projeto Firebase.

## Stack alvo

- Angular 22 standalone, zoneless, signals; Bootstrap 5 compilado via SCSS (tema dos post-its).
- Prerender estático (`outputMode: "static"`, sem servidor Express; remover `src/server.ts` e `express` gerados pelo `ng new --ssr`).
- Firebase Firestore lite (só leitura); `marked` para Markdown.
- Vitest (`ng test`).

## Dados (contrato com o Ademiro)

```
blogs/{blogId}                 slug, name, description, publicUrl, deployUrl, fieldDefs[], settings{}
blogs/{blogId}/posts/{postId}  slug, title, subtitle, summary, coverUrl, body (markdown), tags[],
                               status ('draft'|'published'|'archived'), custom{}, extras[],
                               publishedAt (Timestamp), updatedAt, authorUid
```

- Blog encontrado por `slug == 'blog-de-notas'` (id no Firestore: `nH9AjMVe7ElsCbVeJ54O`, mas buscar sempre pelo slug).
- **Toda consulta de posts filtra `status == 'published'`** (as rules negam rascunhos; sem o filtro a consulta inteira falha).
- Campos customizados combinados (configurar no ademiro, *Configurações* do blog):
  - `custom.categoria` (lista: programação, administração, dicas, ensaio, produtividade) → **define a cor do post-it**
  - `settings.autor` (texto)
  - Em 2026-10-30 o blog ainda **não tinha** campos nem posts publicados. Tolerar campos ausentes (categoria ausente → cor padrão `red`).
- Campos que existiam no banco antigo e **não existem mais**: `category` (agora `custom.categoria`), `topics` string (agora `tags[]`), `created_by` (agora `settings.autor`), `created_at` (agora `publishedAt`), `html` (agora `body` em Markdown), `thumbnail` (agora `coverUrl`), `active` (agora `status`).

### Não remover (vem do brain-logs)

- `TransferState` + `PendingTasks.add()` no `BlogService`: sem isso o prerender sai vazio (app zoneless) e o navegador refaz as consultas.
- HTML do post só via `[innerHTML]` (sanitizado pelo Angular). Nunca `bypassSecurityTrustHtml`.
- Imagens do editor do ademiro: `![1.00](url "legenda")` — o alt é a proporção; `renderMarkdown` usa o título como alt.

## Deploy

- Secret **`FIREBASE_CONFIG`** neste repositório: o mesmo objeto do brain-logs (`{ apiKey: ..., authDomain: ..., projectId: ..., appId: ... }`). O usuário cadastra.
- **Settings → Pages → Source: GitHub Actions** (hoje o Pages está ligado no modo antigo). O usuário troca.
- `404.html` = cópia de `index.csr.html` (rotas sem página pré-renderizada carregam o app no navegador).

## Armadilhas já resolvidas no brain-logs

- `npm ci` no Linux do Actions falha com `@emnapi/core ... does not satisfy` → `overrides` de `@emnapi/*` em 1.x (copiar do brain-logs).
- Lock gerado com `node_modules` antigo presente fica inconsistente → apagar `node_modules` antes de instalar; se o CI acusar o lock, regenerar com `npm install --package-lock-only` numa pasta limpa só com o `package.json`.
- `node_modules` não apaga no Windows (caminho longo): `Remove-Item -LiteralPath '\\?\<caminho>\node_modules' -Recurse -Force`. Se continuar travado, há um `ng serve` antigo rodando desta pasta — pedir ao usuário para encerrá-lo (não encerrar processos dele).
- O dev server não relê o `angular.json`: reiniciar o `npm start` após mudar.
- Porta 4200 pode estar ocupada por outro blog; o Angular oferece outra.

## Projetos relacionados

- `C:\Projetos\Blogs\brain-logs-app` — implementação de referência (blog técnico).
- `C:\Projetos\Blogs\ademiro-de-blogs` — CMS, fonte dos dados (README: modelo de dados e rules).
- `C:\Projetos\Blogs\textos` — rascunhos de ensaios para publicar.
