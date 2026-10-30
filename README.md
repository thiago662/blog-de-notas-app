# 🧠 Blog de Notas

Ensaios e textos livres.

O conteúdo é gerenciado no [Ademiro de Blogs](https://github.com/thiago662/ademiro-de-blogs) e lido do Firestore. Este repositório é só o site público: as páginas são geradas no build (prerender) e publicadas no GitHub Pages.

Plano e andamento em [PLAN.md](PLAN.md).

## Rodando localmente

**Requisitos:** Node.js 24.15+.

```bash
npm install
cp src/environments/firebase.config.example.ts src/environments/firebase.config.ts
# preencha com o firebaseConfig do projeto Firebase do Ademiro
npm start          # http://localhost:4200
```

O blog só lê posts **publicados** — as Security Rules do Ademiro não liberam rascunhos.

| Comando | Uso |
|---|---|
| `npm start` | servidor de desenvolvimento |
| `npm run build` | build de produção com uma página pré-renderizada por post |
| `npm test -- --watch=false` | testes unitários |
| `npm run check` | após o build, testa as páginas no Chrome headless (requer Chrome) |

## Deploy

1. **Settings → Pages → Source:** `GitHub Actions`.
2. **Settings → Secrets and variables → Actions → New repository secret** `FIREBASE_CONFIG` com o objeto do console (só o `{ ... }`).
3. Push na `master` publica em `https://<usuario>.github.io/blog-de-notas-app/`.

O deploy também roda **a cada 6h** e manualmente (*Actions → Deploy GitHub Pages → Run workflow*), para posts publicados no Ademiro ganharem página própria.

Detalhes técnicos e decisões: [CLAUDE.md](CLAUDE.md) e [PLAN.md](PLAN.md).
