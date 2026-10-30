import { Injectable, PLATFORM_ID, PendingTasks, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { initializeApp } from 'firebase/app';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore/lite';
import { environment } from '../../environments/environment';

// Firestore lite: só leitura via REST, menor no navegador e funciona no prerender (Node).
const db = getFirestore(initializeApp(environment.firebase));

export interface BlogInfo {
  id: string;
  name: string;
  description: string;
  /** Valores dos campos de escopo "blog" no Ademiro (ex.: autor, linkedin). */
  settings: Record<string, unknown>;
}

export interface PostSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  coverUrl: string;
  tags: string[];
  /** ISO 8601 (serializável no TransferState). */
  publishedAt: string | null;
  /** Valores dos campos de escopo "post" no Ademiro (ex.: nivel, stack). */
  custom: Record<string, unknown>;
}

export interface Post extends PostSummary {
  /** Markdown. */
  body: string;
}

function toSummary(snap: QueryDocumentSnapshot<DocumentData>): PostSummary {
  const d = snap.data();
  return {
    id: snap.id,
    slug: d['slug'] ?? '',
    title: d['title'] ?? '',
    subtitle: d['subtitle'] ?? '',
    summary: d['summary'] ?? '',
    coverUrl: d['coverUrl'] ?? '',
    tags: d['tags'] ?? [],
    publishedAt: d['publishedAt']?.toDate().toISOString() ?? null,
    custom: d['custom'] ?? {},
  };
}

/**
 * Leitura pública do blog no Ademiro. As rules só liberam posts publicados,
 * então toda consulta de posts filtra status == 'published'.
 */
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly state = inject(TransferState);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private blog?: Promise<BlogInfo | null>;

  /** Memorizado: lista e post pedem o blog, mas ele é buscado uma vez só. */
  getBlog(): Promise<BlogInfo | null> {
    return (this.blog ??= this.cached('blog', async () => {
      const blogs = collection(db, 'blogs');
      const [snap] = (await getDocs(query(blogs, where('slug', '==', environment.blogSlug), limit(1)))).docs;
      if (!snap) return null;
      const d = snap.data();
      return { id: snap.id, name: d['name'] ?? '', description: d['description'] ?? '', settings: d['settings'] ?? {} };
    }));
  }

  listPosts(): Promise<PostSummary[]> {
    return this.cached('posts', async () => {
      const blogId = await this.getBlogId();
      if (!blogId) return [];
      const posts = collection(db, 'blogs', blogId, 'posts');
      const snaps = await getDocs(query(posts, where('status', '==', 'published'), orderBy('publishedAt', 'desc')));
      return snaps.docs.map(toSummary);
    });
  }

  getPost(slug: string): Promise<Post | null> {
    return this.cached(`post:${slug}`, async () => {
      const blogId = await this.getBlogId();
      if (!blogId) return null;
      const posts = collection(db, 'blogs', blogId, 'posts');
      const [snap] = (
        await getDocs(query(posts, where('status', '==', 'published'), where('slug', '==', slug), limit(1)))
      ).docs;
      return snap ? { ...toSummary(snap), body: snap.data()['body'] ?? '' } : null;
    });
  }

  private async getBlogId(): Promise<string | null> {
    return (await this.getBlog())?.id ?? null;
  }

  /**
   * No prerender: busca e grava no TransferState (vai embutido no HTML).
   * No navegador: usa o que veio no HTML; só consulta o Firestore se não houver (navegação interna).
   * PendingTasks faz o prerender esperar a consulta terminar (app é zoneless).
   */
  private cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    const stateKey = makeStateKey<T>(key);
    if (this.state.hasKey(stateKey)) {
      const value = this.state.get(stateKey, null as T);
      this.state.remove(stateKey);
      return Promise.resolve(value);
    }
    return this.loadTracked(stateKey, load);
  }

  private async loadTracked<T>(stateKey: ReturnType<typeof makeStateKey<T>>, load: () => Promise<T>): Promise<T> {
    const done = this.pendingTasks.add();
    try {
      const value = await load();
      if (this.isServer) this.state.set(stateKey, value);
      return value;
    } finally {
      done();
    }
  }
}
