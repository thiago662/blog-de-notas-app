import { Marked } from 'marked';

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Proporção que o editor do Ademiro (Milkdown) grava no alt de imagens em bloco, ex.: "1.00". */
const RATIO = /^\d+(\.\d+)?$/;

const marked = new Marked({
  gfm: true,
  renderer: {
    image({ href, title, text }) {
      // Só imagens https: mesma regra do Ademiro.
      if (!/^https:\/\//.test(href)) return '';
      // No Ademiro a legenda vai no título e o alt pode ser a proporção da imagem.
      const alt = title || (RATIO.test(text) ? '' : text);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      return `<img src="${escapeAttr(href)}" alt="${escapeAttr(alt)}"${titleAttr} loading="lazy">`;
    },
  },
});

/**
 * Markdown (GFM) → HTML. NÃO é sanitizado aqui: insira sempre via [innerHTML],
 * que passa pelo sanitizador do Angular (no navegador e no prerender).
 */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
