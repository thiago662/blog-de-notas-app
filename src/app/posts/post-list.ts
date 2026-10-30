import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogInfo, BlogService, PostSummary } from '../core/blog.service';
import { Seo } from '../core/seo';

@Component({
  selector: 'app-post-list',
  imports: [RouterLink, DatePipe],
  templateUrl: './post-list.html',
})
export class PostList implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly seo = inject(Seo);

  protected readonly blog = signal<BlogInfo | null>(null);
  protected readonly posts = signal<PostSummary[] | null>(null);

  async ngOnInit() {
    const [blog, posts] = await Promise.all([this.blogService.getBlog(), this.blogService.listPosts()]);
    this.blog.set(blog);
    this.posts.set(posts);
    this.seo.set({
      title: blog?.name || 'Blog de Notas',
      description: blog?.description || 'Ensaios e textos livres.',
      path: '/',
    });
  }
}
