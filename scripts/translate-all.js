/**
 * scripts/translate-all.js
 * 讀取 README.md，對指定語言逐個產生 README.<lang>.md
 * 使用社群套件 @k3rn31p4nic/google-translate-api
 */
const fs = require('fs');
const path = require('path');
const translate = require('@k3rn31p4nic/google-translate-api');
const unified = require('unified');
const parse = require('remark-parse');
const stringify = require('remark-stringify');
const visit = require('unist-util-visit');

const readmeNames = ['README.md', 'readme.md'];
let README = null;
for (const name of readmeNames) {
  if (fs.existsSync(path.join(process.cwd(), name))) {
    README = name;
    break;
  }
}
if (!README) {
  console.error('README.md not found in repository root.');
  process.exit(1);
}

const src = fs.readFileSync(path.join(process.cwd(), README), 'utf8');
const ast = unified().use(parse).parse(src);

// 要產生的語言列表（依你確認）
const langs = [
  'zh-CN','es','en','ar','hi','pt-BR','bn','ru','ja','pa-Arab',
  'vi','tr','mr','te','ms','id','ko','fr','ta','de','ur'
];

async function translateNodeText(nodeValue, lang) {
  if (!nodeValue || !nodeValue.trim()) return nodeValue;
  try {
    const res = await translate(nodeValue, { to: lang });
    return res.text;
  } catch (err) {
    console.error('Translate error for lang', lang, 'text:', nodeValue.slice(0,60), '...', err && err.message);
    return nodeValue;
  }
}

async function translateAst(originalAst, lang) {
  const astCopy = JSON.parse(JSON.stringify(originalAst));
  const nodes = [];
  visit(astCopy, (node) => {
    if (node.type === 'text') {
      nodes.push(node);
    }
  });

  for (const node of nodes) {
    node.value = await translateNodeText(node.value, lang);
  }

  const md = unified().use(stringify).stringify(astCopy);
  return md;
}

(async () => {
  for (const lang of langs) {
    console.log('Translating to', lang);
    try {
      const out = await translateAst(ast, lang);
      const safeLang = lang.replace('/', '-');
      const filename = `README.${safeLang}.md`;
      fs.writeFileSync(path.join(process.cwd(), filename), out, 'utf8');
      console.log('Written', filename);
    } catch (e) {
      console.error('Failed for', lang, e && e.message);
    }
    await new Promise((r) => setTimeout(r, 700));
  }
  console.log('All translations completed.');
})();
