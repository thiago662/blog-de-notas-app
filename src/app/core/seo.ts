import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

export interface PageMeta {
  title: string;
  description: string;
  /** Caminho a partir da raiz do site, ex.: "/meu-post". */
  path: string;
  /** URL absoluta (https) da imagem do card. */
  image?: string;
  type?: 'website' | 'article';
  publishedAt?: string | null;
  noindex?: boolean;
}

/** Título + meta tags (description, Open Graph, Twitter). No prerender vão direto para o HTML. */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  set(page: PageMeta) {
    const url = environment.siteUrl + page.path;
    this.title.setTitle(page.title);
    const tags: Record<string, string> = {
      description: page.description,
      'og:title': page.title,
      'og:description': page.description,
      'og:url': url,
      'og:type': page.type ?? 'website',
      'og:site_name': 'Blog de Notas',
      'twitter:card': page.image ? 'summary_large_image' : 'summary',
    };
    if (page.image) tags['og:image'] = page.image;
    if (page.publishedAt) tags['article:published_time'] = page.publishedAt;
    tags['robots'] = page.noindex ? 'noindex' : 'index,follow';

    for (const [key, content] of Object.entries(tags)) {
      const attr = key.startsWith('og:') || key.startsWith('article:') ? 'property' : 'name';
      this.meta.updateTag({ [attr]: key, content });
    }
    if (!page.image) this.meta.removeTag("property='og:image'");
  }
}
