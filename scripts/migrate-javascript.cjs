// One-time, syntax-only migration. Original sources remain in Git history.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = [path.join(root, 'App.tsx'), ...walk(path.join(root, 'src')), ...walk(path.join(root, '__tests__'))].filter(file => /\.tsx?$/.test(file));
for (const file of files) {
  const result = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName: file,
    compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve },
  });
  fs.writeFileSync(file.replace(/\.tsx?$/, '.js'), result.outputText);
  fs.unlinkSync(file);
}
console.log(`Converted ${files.length} files to JavaScript.`);
