import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
const { parse } = await import(astroRequire.resolve('@astrojs/compiler'));
const { createServer } = await import(astroRequire.resolve('vite'));
const { parse: parseYaml } = await import(astroRequire.resolve('yaml'));
const format = fileURLToPath(new URL('./readability-format.mjs', import.meta.url));
const prefix = 'paths-readable:';
const markdownPrefix = 'paths-authored-markdown:';
const ignored = new Set(['script', 'style', 'svg', 'canvas', 'noscript']);

function attributes(node) {
  return '{' + (node.attributes || []).filter((attribute) => (node.type === 'component' && !attribute.name?.startsWith('client:')) || ['href', 'src', 'alt', 'value', 'type', 'hidden', 'aria-hidden', 'aria-label', 'title', 'description', 'robots', 'canonicalPath'].includes(attribute.name) || attribute.kind === 'spread').map((attribute) => {
    if (attribute.kind === 'spread') return `...(${attribute.value})`;
    const value = attribute.kind === 'expression' ? `(${attribute.value})` : attribute.kind === 'shorthand' ? `(${attribute.name})` : attribute.kind === 'empty' ? 'true' : JSON.stringify(attribute.value);
    return JSON.stringify(attribute.name) + ':' + value;
  }).join(',') + '}';
}
function expression(node) {
  if (node.type === 'text') return `__decode(${JSON.stringify(node.value)})`;
  if (['comment', 'frontmatter', 'doctype'].includes(node.type)) return '""';
  if (node.type === 'expression') {
    const source = node.children.map((child) => child.type === 'text' ? child.value : expression(child)).join('');
    return source.replace(/\/\*[\s\S]*?\*\//g, '').trim() ? '(' + source + ')' : '""';
  }
  if (node.name === 'script') {
    const id = node.attributes?.find((attribute) => attribute.name === 'id')?.value;
    const data = node.attributes?.find((attribute) => attribute.name === 'set:html');
    if (['chart-data', 'overlap-chart-data'].includes(id) && data?.kind === 'expression') return `__chart(JSON.parse(${data.value}))`;
  }
  if (node.name && (ignored.has(node.name) || node.attributes?.some((attribute) => attribute.name === 'slot' && attribute.value === 'head'))) return '""';
  const children = '[' + (node.children || []).map(expression).join(',') + ']';
  if (node.type === 'root' || node.type === 'fragment' || node.name === 'Fragment') return `__join(${children})`;
  if (node.name === 'slot') return 'Astro.slots.render()';
  if (node.name === 'Base') return `__base(${attributes(node)},${children})`;
  if (node.type === 'component') return `__component(${node.name},${attributes(node)},${children},Astro)`;
  if (node.type === 'element' || node.type === 'custom-element') return `__node(${JSON.stringify(node.name)},${attributes(node)},${children})`;
  throw new Error(`Unsupported public source node: ${node.type}`);
}

/** Compile only the registered public template and its local data imports. */
async function compile(file) {
  const source = await readFile(file, 'utf8');
  const { ast } = await parse(source, { position: true });
  const frontmatter = (ast.children.find((node) => node.type === 'frontmatter')?.value || '').replaceAll('import.meta.glob', 'Astro.glob');
  const parsed = ts.createSourceFile(file + '.ts', frontmatter, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const imports = [];
  const body = [];
  for (const statement of parsed.statements) {
    if (ts.isImportDeclaration(statement)) {
      const specifier = statement.moduleSpecifier.text;
      if (/\.css$/.test(specifier) || /(?:^|\/)Base\.astro$/.test(specifier)) continue;
      const absolute = specifier.startsWith('.') ? resolve(dirname(file), specifier) : specifier;
      const mapped = specifier.endsWith('.astro') ? prefix + absolute : specifier.endsWith('.md') ? markdownPrefix + absolute : absolute;
      imports.push(statement.getText(parsed).replace(statement.moduleSpecifier.getText(parsed), JSON.stringify(mapped)));
    } else body.push(statement.getText(parsed).replace(/^export\s+/, ''));
  }
  const code = `${imports.join('\n')}\nimport {node as __node, component as __component, joinContent as __join, decodeText as __decode, finishDocument as __finish, chartMarkdown as __chart} from ${JSON.stringify(format)};
export default async function render(Astro) {
const __readableMetadata = {};
const __base = async (props, children) => { Object.assign(__readableMetadata, props); return __join(children); };
${body.join('\n')}
const __markdownBody = await ${expression(ast)};
return { ...__readableMetadata, body: __finish(__markdownBody) };
}`;
  return ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, verbatimModuleSyntax: true } }).outputText;
}

export async function createSourceRenderer(root, origin) {
  const essayModules = {};
  for (const name of await readdir(resolve(root, 'src/pages/essays'))) {
    if (!name.endsWith('.md')) continue;
    const source = await readFile(resolve(root, 'src/pages/essays', name), 'utf8');
    essayModules['./' + name] = { frontmatter: parseYaml(source.match(/^---\n([\s\S]*?)\n---/)?.[1] || '') };
  }
  const server = await createServer({ root, configFile: false, appType: 'custom', optimizeDeps: { noDiscovery: true }, server: { middlewareMode: true }, plugins: [{ name: 'paths-public-markdown-source', resolveId(id) { if (id.startsWith(prefix) || id.startsWith(markdownPrefix)) return '\0' + id; }, async load(id) {
    if (id.startsWith('\0' + prefix)) return compile(id.slice(prefix.length + 1));
    if (id.startsWith('\0' + markdownPrefix)) {
      const source = (await readFile(id.slice(markdownPrefix.length + 1), 'utf8')).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
      return `export const Content = async () => ({body:${JSON.stringify(source)}});`;
    }
  } }] });
  return {
    async render(file, path, props = {}, content = '') {
      const module = await server.ssrLoadModule(prefix + resolve(root, file));
      return module.default({ props, glob(pattern) { if (file !== 'src/pages/essays/index.astro' || pattern !== './*.md') throw new Error('Unregistered public source collection'); return essayModules; }, params: { id: decodeURIComponent(path.split('/').filter(Boolean).at(-1) || '') }, site: new URL(origin), url: new URL(path, origin), slots: { render: async () => content } });
    },
    essayMetadata: (name) => essayModules['./' + name]?.frontmatter,
    close: () => server.close(),
  };
}
