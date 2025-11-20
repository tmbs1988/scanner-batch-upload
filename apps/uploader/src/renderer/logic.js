// Minimal client-side CSV parsing and grouping logic (skeleton)
export function parseCsvLines(text) {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

export function whitelistFiles(fileList) {
  const result = [];
  for (const f of Array.from(fileList)) {
    const rel = f.webkitRelativePath || f.name || '';
    const lower = rel.toLowerCase();
    const isReport = lower.endsWith('.pdf');
    const isModel = lower.endsWith('.oex') || lower.endsWith('.stl') || lower.endsWith('.obj');
    const isImage = /\.(bmp|jpg|jpeg|png)$/i.test(lower) && (lower.includes('arch') || lower.includes('foot3d') || lower.includes('pronator'));
    if (isReport || isModel || isImage) {
      result.push({ file: f, relPath: rel, isReport, isModel, isImage });
    }
  }
  return result;
}

export function groupByDir(whitelisted) {
  const groups = new Map();
  for (const item of whitelisted) {
    const parts = item.relPath.split(/[\\/]/);
    const dir = parts.slice(0, -1).join('/');
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir).push(item);
  }
  return groups;
}

export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = String(r.result || '');
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function canonicalName(item) {
  const name = item.relPath.split(/[\\/]/).pop() || 'file.bin';
  const lower = name.toLowerCase();
  const ext = (name.match(/\\.[^\\.]+$/) || [''])[0] || '';
  if (item.isReport) return `report${ext || '.pdf'}`;
  if (item.isModel) {
    const isLeft = /(^|[_-])(l|left)(\\.|_|-)/i.test(name) || /_l\\b/i.test(name) || /\\bleft\\b/i.test(lower);
    const side = isLeft ? 'L' : 'R';
    const normExt = ext || '.oex';
    return `model_${side}${normExt}`;
  }
  if (item.isImage) {
    // keep original base name to avoid mislabel, but ensure only allowed prefixes
    if (lower.includes('arch')) return name.toLowerCase().startsWith('arch_') ? name : `arch_${name.replace(/^.*?([lr]\\.?)/i, '$1')}`;
    if (lower.includes('foot3d')) return name.toLowerCase().startsWith('foot3d_') ? name : `foot3d_${name.replace(/^.*?([lr]\\.?)/i, '$1')}`;
    if (lower.includes('pronator')) return name.toLowerCase().startsWith('pronator_') ? name : `touch_pronator_${name.replace(/^.*?([lr]\\.?)/i, '$1')}`;
  }
  return name;
}


