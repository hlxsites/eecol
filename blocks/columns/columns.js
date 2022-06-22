export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  if (!block.classList.contains('dark')) {
    block.querySelectorAll('a.button, p.button-container').forEach((a) => { a.className = ''; });
  }
}
