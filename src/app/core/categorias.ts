/** Cor do post-it (nome do tema Bootstrap em styles.scss) por categoria. */
const CORES: Record<string, string> = {
  programação: 'pink',
  administração: 'yellow',
  dicas: 'green',
  ensaio: 'orange',
  produtividade: 'blue',
};

/** Categoria ausente ou desconhecida usa `red`. */
export function corDaCategoria(custom: Record<string, unknown>): string {
  return CORES[String(custom['categoria'] ?? '')] ?? 'red';
}
