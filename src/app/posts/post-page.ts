import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService, Post } from '../core/blog.service';
import { corDaCategoria } from '../core/categorias';
import { renderMarkdown } from '../core/markdown';
import { Seo } from '../core/seo';

@Component({
  selector: 'app-post-page',
  imports: [RouterLink, DatePipe],
  templateUrl: './post-page.html',
})
export class PostPage implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly seo = inject(Seo);

  readonly slug = input.required<string>();

  protected readonly post = signal<Post | null>(null);
  protected readonly notFound = signal(false);
  protected readonly autor = signal('');
  protected readonly cor = computed(() => corDaCategoria(this.post()?.custom ?? {}));
  /** Inserido via [innerHTML]: o Angular sanitiza (remove scripts, eventos, javascript:). */
  protected readonly html = computed(() => renderMarkdown(this.post()?.body ?? ''));

  async ngOnInit() {
    const post = await this.blogService.getPost(this.slug());
    if (!post) {
      this.notFound.set(true);
      this.seo.set({ title: 'Post não encontrado — Blog de Notas', description: '', path: `/${this.slug()}`, noindex: true });
      return;
    }
    this.autor.set(String((await this.blogService.getBlog())?.settings['autor'] ?? ''));
    this.post.set(post);
    this.seo.set({
      title: `${post.title} — Blog de Notas`,
      description: post.summary || post.subtitle,
      path: `/${post.slug}`,
      image: post.coverUrl || undefined,
      type: 'article',
      publishedAt: post.publishedAt,
    });
  }
}
