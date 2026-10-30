import { DOCUMENT } from '@angular/common';
import { Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly doc = inject(DOCUMENT);
  protected readonly escuro = signal(false);

  constructor() {
    afterNextRender(() => this.escuro.set(this.temaAtual() === 'dark'));
  }

  /** Sem escolha gravada (o index.html aplica data-theme), vale o tema do sistema. */
  private temaAtual() {
    return (
      this.doc.documentElement.dataset['theme'] ??
      (this.doc.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
  }

  protected alternar() {
    const tema = this.temaAtual() === 'dark' ? 'light' : 'dark';
    this.doc.documentElement.dataset['theme'] = tema;
    try {
      localStorage.setItem('tema', tema);
    } catch {}
    this.escuro.set(tema === 'dark');
  }
}
