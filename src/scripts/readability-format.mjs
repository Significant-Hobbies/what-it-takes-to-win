/** Semantic Markdown from authored Astro template nodes, never rendered HTML. */
export async function joinContent(values) {
  const value = await values;
  if (Array.isArray(value)) return (await Promise.all(value.map(joinContent))).join('');
  return value == null || typeof value === 'boolean' ? '' : String(value);
}
export function decodeText(value) {
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', times: '×', rarr: '→', larr: '←', le: '≤', ge: '≥' };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, key) => key[0] === '#' ? String.fromCodePoint(Number.parseInt(key.slice(key[1] === 'x' ? 2 : 1), key[1] === 'x' ? 16 : 10)) : entities[key] ?? match);
}
export async function node(tag, props, children) {
  if (props.hidden || (props['aria-hidden'] === 'true' || props['aria-hidden'] === true) || props.type === 'hidden') return '';
  const body = await joinContent(children);
  const text = body.replace(/\s+/g, ' ').trim();
  if (/^h[1-6]$/.test(tag)) return `\n\n${'#'.repeat(Number(tag[1]))} ${text}\n\n`;
  if (tag === 'a') { const label = text || props['aria-label'] || ''; return props.href && label ? `[${label.replace(/[[\]]/g, '\\$&')}](${props.href})` : label; }
  if (tag === 'img') return props.alt ? `\n![${props.alt}](${props.src})\n` : '';
  if (tag === 'br') return '\n';
  if (tag === 'hr') return '\n\n---\n\n';
  if (tag === 'strong' || tag === 'b') return `**${text}**`;
  if (tag === 'em' || tag === 'i') return `*${text}*`;
  if (tag === 'code') return '`' + body.trim() + '`';
  if (tag === 'pre') return '\n\n```\n' + body.trim().replace(/^`|`$/g, '') + '\n```\n\n';
  if (tag === 'li') return '\n- ' + text + '\n';
  if (tag === 'dt') return '\n- **' + text + ':** ';
  if (tag === 'dd') return text + '\n';
  if (tag === 'th' || tag === 'td') return text.replaceAll('|', '\\|') + ' | ';
  if (tag === 'tr') return '\n| ' + text + '\n';
  if (tag === 'thead') {
    const columns = Math.max(1, (body.match(/\|/g) || []).length - 1);
    return body + '| ' + new Array(columns).fill('---').join(' | ') + ' |\n';
  }
  if (tag === 'input') return props.value == null ? '' : ` ${props.value} `;
  if (tag === 'option') return text ? '\n- ' + text : '';
  if (tag === 'p' || tag === 'summary' || tag === 'blockquote' || tag === 'figcaption') return '\n\n' + text + '\n\n';
  if (['section', 'article', 'nav', 'div', 'ul', 'ol', 'dl', 'table', 'header', 'aside', 'figure', 'fieldset', 'label', 'select'].includes(tag)) return '\n' + body + '\n';
  return body;
}
export async function component(render, props, children, context) {
  const result = await render({ ...context, props, slots: { render: () => joinContent(children) } });
  return result.body;
}

export function finishDocument(body) {
  const code = [];
  const protectedBody = body.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[^\n]*(?:\n|$)/gm, (value) => { const index = code.push(value) - 1; return `__PATHS_SOURCE_CODE_${index}__\n`; });
  return protectedBody.replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim().replace(/__PATHS_SOURCE_CODE_(\d+)__/g, (_, index) => code[Number(index)]) + '\n';
}

/** Public chart data is evaluated from its authored data expression, not canvas pixels. */
export function chartMarkdown(data) {
  const labels = { ageData: 'Milestone ages', cohortData: 'Cohorts', engineData: 'Primary engines', archetypeData: 'Archetypes', advantageData: 'Advantage annotations' };
  const lines = ['\n\n## Chart data\n'];
  if (data.cells && data.series) {
    lines.push('Advantage and leverage are descriptive analyst annotations, not causal measurements.\n');
    for (const series of data.series) {
      lines.push(`### ${series.label}\n`, '| Advantage | Leverage | People |', '| --- | --- | --- |');
      for (const row of series.data) lines.push(`| ${row.advantage} | ${row.leverage} | ${row.count} |`);
      lines.push('');
    }
  } else for (const [key, rows] of Object.entries(data)) {
    lines.push(`### ${labels[key] || key}\n`);
    const columns = Object.keys(rows[0] || {});
    lines.push('| ' + columns.join(' | ') + ' |', '| ' + columns.map(() => '---').join(' | ') + ' |');
    for (const row of rows) lines.push('| ' + columns.map((column) => String(row[column]).replaceAll('|', '\\|')).join(' | ') + ' |');
    lines.push('');
  }
  return lines.join('\n') + '\n';
}
