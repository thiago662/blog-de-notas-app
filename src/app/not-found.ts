import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Seo } from './core/seo';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="text-center py-5">
      <h1 class="h3">Página não encontrada</h1>
      <a routerLink="/">Voltar para o início</a>
    </div>
  `,
})
export class NotFound implements OnInit {
  private readonly seo = inject(Seo);

  ngOnInit() {
    this.seo.set({ title: 'Página não encontrada — Blog de Notas', description: '', path: '/', noindex: true });
  }
}
