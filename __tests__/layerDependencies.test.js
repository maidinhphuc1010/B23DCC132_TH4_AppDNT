const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../src');
function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? filesIn(file)
      : file.endsWith('.js')
      ? [file]
      : [];
  });
}
test('source relative imports have no cycles and new layers respect boundaries', () => {
  const graph = new Map();
  for (const file of filesIn(root)) {
    const text = fs.readFileSync(file, 'utf8');
    const imports = [
      ...text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g),
    ].map(match => match[1]);
    graph.set(
      file,
      imports
        .filter(name => name.startsWith('.'))
        .map(name => path.resolve(path.dirname(file), `${name}.js`)),
    );
    const relative = path.relative(root, file).replace(/\\/g, '/');
    if (relative.startsWith('api/')) {
      expect(
        imports.every(name => name === './client' || name === '../config'),
      ).toBe(true);
    }
    if (relative.startsWith('storage/')) {
      expect(
        imports.every(
          name =>
            name === './keys' ||
            name === '@react-native-async-storage/async-storage',
        ),
      ).toBe(true);
    }
    if (relative.startsWith('screens/')) {
      expect(text).not.toMatch(/\bfetch\s*\(|\baxios\b|\bAsyncStorage\b/);
    }
  }
  const visited = new Set();
  const active = new Set();
  function visit(file) {
    if (active.has(file)) {
      throw new Error(`Circular import: ${file}`);
    }
    if (visited.has(file)) {
      return;
    }
    active.add(file);
    for (const dependency of graph.get(file) || []) {
      visit(dependency);
    }
    active.delete(file);
    visited.add(file);
  }
  for (const file of graph.keys()) {
    visit(file);
  }
});
