import {el,node,busy,words} from './common.js';
const sample = ['Retrieval-augmented generation retrieves relevant passages and uses those passages to generate an answer.','Citations identify the source of a claim so readers can verify its evidence.','Cosine similarity compares the direction of two vectors.'];
let pages = sample;
function show(index) {
  el('source').textContent = 'Page ' + (index + 1) + ' of ' + pages.length;
  el('preview').textContent = pages[index];
}
el('sample').onclick = () => {
  pages = sample;
  el('pdf').value = '';
  el('result').replaceChildren();
  show(0);
};
el('pdf').onchange = () => {
  const file = el('pdf').files[0];
  if (!file) return;
  busy(el('run'),'Reading PDF…',async () => {
    if (file.size > 20e6) throw Error('Choose a PDF under 20 MB.');
    const base = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/';
    const lib = await import(base + 'pdf.mjs');
    lib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.mjs';
    const doc = await lib.getDocument({data:await file.arrayBuffer()}).promise;
    try {
      if (doc.numPages > 80) throw Error('Choose a PDF under 81 pages.');
      const contents = [];
      for (let n=1;n<=doc.numPages;n++) {
        const page = await doc.getPage(n);
        contents.push((await page.getTextContent()).items.map(item=>item.str ?? '').join(' '));
      }
      if (!contents.some(text=>text.trim())) throw Error('This PDF has no selectable text.');
      pages = contents;
      show(0);
      el('result').replaceChildren();
    } finally {
      await doc.destroy();
    }
  });
};
const stop = new Set(words('what is are the a an do does how in of it explain me about can you kya hai kaise ka ki ke mein'));
el('run').onclick = () => {
  const terms = [...new Set(words(el('question').value).filter(word=>!stop.has(word)))];
  const matches = pages.flatMap((page,index)=>(page.match(/[^.!?]+[.!?]?/g) ?? []).map(text=>{
    const tokens = new Set(words(text));
    return {text:text.trim(),index,score:terms.filter(term=>tokens.has(term)).length};
  })).sort((a,b)=>b.score-a.score);
  const best = matches[0];
  if (!terms.length || !best || best.score / terms.length < .6) {
    el('result').textContent = terms.length ? 'No supporting passage found in these notes.' : 'Enter a question.';
    return;
  }
  const citation = node('button','Open page '+(best.index+1),'secondary');
  citation.onclick = () => show(best.index);
  el('result').replaceChildren(node('strong','Matching excerpt'),node('p',best.text),citation);
  show(best.index);
};
show(0);
