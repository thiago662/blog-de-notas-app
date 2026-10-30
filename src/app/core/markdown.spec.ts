import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('suporta GFM: tabela, tarefas, tachado e código', () => {
    const html = renderMarkdown(
      '| a | b |\n| - | - |\n| 1 | 2 |\n\n- [x] feito\n\n~~velho~~\n\n```ts\nconst x = 1;\n```',
    );
    expect(html).toContain('<table>');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('<del>velho</del>');
    expect(html).toContain('<code class="language-ts">');
  });

  it('imagem do Ademiro: proporção no alt vira legenda do título', () => {
    const html = renderMarkdown('![1.00](https://x.dev/a.png "Diagrama da arquitetura")');
    expect(html).toContain('alt="Diagrama da arquitetura"');
    expect(html).not.toContain('alt="1.00"');
  });

  it('imagem comum mantém o alt', () => {
    expect(renderMarkdown('![Logo](https://x.dev/logo.png)')).toContain('alt="Logo"');
  });

  it('descarta imagem que não é https', () => {
    expect(renderMarkdown('![x](http://inseguro.dev/a.png)')).not.toContain('<img');
    expect(renderMarkdown('![x](javascript:alert(1))')).not.toContain('<img');
  });

  it('escapa atributos da imagem', () => {
    expect(renderMarkdown('![a](https://x.dev/a.png "um \\"titulo\\" <b>")')).toContain('&quot;titulo&quot; &lt;b&gt;');
  });
});
