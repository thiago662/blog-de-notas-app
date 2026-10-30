import { corDaCategoria } from './categorias';

describe('corDaCategoria', () => {
  it('mapeia categorias conhecidas', () => {
    expect(corDaCategoria({ categoria: 'ensaio' })).toBe('orange');
    expect(corDaCategoria({ categoria: 'programação' })).toBe('pink');
  });

  it('usa red para ausente ou desconhecida', () => {
    expect(corDaCategoria({})).toBe('red');
    expect(corDaCategoria({ categoria: 'outra' })).toBe('red');
  });
});
