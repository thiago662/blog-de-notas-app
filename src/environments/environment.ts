import { firebaseConfig } from './firebase.config';

export const environment = {
  firebase: firebaseConfig,
  /** Slug do blog no Ademiro de Blogs. */
  blogSlug: 'blog-de-notas',
  /** URL pública do site, sem barra no final (Open Graph exige URLs absolutas). */
  siteUrl: 'https://thiago662.github.io/blog-de-notas-app',
};
