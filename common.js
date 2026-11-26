export const el = id => document.getElementById(id);
export function node(tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}
export async function busy(button, status, operation) {
  button.disabled = true;
  el('result').textContent = status;
  try {
    await operation();
  } catch (error) {
    el('result').textContent = error.message || 'Something went wrong. Try again.';
  } finally {
    button.disabled = false;
  }
}
export const words = text => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
export const ai = () => import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
