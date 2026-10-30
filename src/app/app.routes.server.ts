import { inject } from '@angular/core';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { BlogService } from './core/blog.service';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  {
    // Um HTML por post publicado no momento do build (card do LinkedIn, SEO).
    // Post publicado depois do build cai no 404.html (app no navegador) até o próximo deploy.
    path: ':slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const posts = await inject(BlogService).listPosts();
      return posts.map((post) => ({ slug: post.slug }));
    },
  },
  { path: '**', renderMode: RenderMode.Client },
];
