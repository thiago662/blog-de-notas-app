import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('Blog de Notas');
  });

  it('should toggle the theme', async () => {
    document.documentElement.dataset['theme'] = 'light';
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('.tema') as HTMLButtonElement).click();
    expect(document.documentElement.dataset['theme']).toBe('dark');
    delete document.documentElement.dataset['theme'];
    localStorage.removeItem('tema');
  });
});
