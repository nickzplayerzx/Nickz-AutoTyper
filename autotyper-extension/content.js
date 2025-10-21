(function () {
  'use strict';

  if (document.getElementById('nickz-autotyper-modal')) return;

  let savedDraft = '';
  try {
    savedDraft = localStorage.getItem('nickz_autotyper_draft') || '';
  } catch (e) {}

  const style = document.createElement('style');
  style.textContent = `
    #nickz-autotyper-modal {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: #120b1f;
      border: 2px solid #7e57c2;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(126, 87, 194, 0.5);
      font-family: 'Segoe UI', system-ui, sans-serif;
      width: 340px;
      color: #e0d6ff;
      user-select: none;
    }
    #nickz-autotyper-header {
      padding: 12px;
      background: linear-gradient(90deg, #7e57c2, #5e35b1);
      color: white;
      font-weight: bold;
      font-size: 15px;
      text-align: center;
      cursor: move;
      border-radius: 10px 10px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #nickz-minimize-btn {
      background: none;
      border: none;
      color: white;
      font-weight: bold;
      cursor: pointer;
      margin-left: 8px;
      font-size: 18px;
    }
    #nickz-autotyper-body {
      padding: 16px;
    }
    #nickz-autotyper-textarea {
      width: 100%;
      height: 100px;
      background: #1a142a;
      color: #d9c7ff;
      border: 1px solid #7e57c2;
      border-radius: 6px;
      padding: 10px;
      font-size: 13px;
      resize: vertical;
      box-sizing: border-box;
      margin-bottom: 12px;
    }
    #nickz-autotyper-btn {
      width: 100%;
      padding: 10px;
      background: linear-gradient(90deg, #7e57c2, #5e35b1);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    #nickz-credit {
      position: fixed;
      bottom: 12px;
      right: 12px;
      color: #b39ddb;
      font-size: 12px;
      background: rgba(94, 53, 177, 0.2);
      padding: 4px 10px;
      border-radius: 6px;
      pointer-events: none;
      z-index: 2147483646;
    }
    .nickz-minimized #nickz-autotyper-body {
      display: none;
    }
    #nickz-success-modal {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
    }
    #nickz-success-content {
      background: #120b1f;
      border: 2px solid #7e57c2;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      color: #e0d6ff;
      max-width: 350px;
      width: 90%;
    }
    #nickz-success-btn {
      margin-top: 16px;
      padding: 8px 20px;
      background: #7e57c2;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  const credit = document.createElement('div');
  credit.id = 'nickz-credit';
  credit.textContent = 'Nickz (Yudi Matheus)';
  document.body.appendChild(credit);

  const modal = document.createElement('div');
  modal.id = 'nickz-autotyper-modal';
  modal.innerHTML = `
    <div id="nickz-autotyper-header">
      <span>Nickz AutoTyper by Yudi Matheus ✍️ </span>
      <button id="nickz-minimize-btn">−</button>
    </div>
    <div id="nickz-autotyper-body">
      <textarea id="nickz-autotyper-textarea" placeholder="Cole o texto que deseja digitar automaticamente aqui neste campo">${savedDraft}</textarea>
      <button id="nickz-autotyper-btn">Iniciar Digitação</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Salvar rascunho
  const textarea = document.getElementById('nickz-autotyper-textarea');
  textarea.addEventListener('input', () => {
    clearTimeout(textarea.timer);
    textarea.timer = setTimeout(() => {
      try { localStorage.setItem('nickz_autotyper_draft', textarea.value); } catch (e) {}
    }, 800);
  });

  // Arrastar e minimizar (mesmo de antes)
  let isDragging = false, offsetX, offsetY;
  const header = document.getElementById('nickz-autotyper-header');
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'nickz-minimize-btn') return;
    isDragging = true;
    const rect = modal.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    modal.style.left = (e.clientX - offsetX) + 'px';
    modal.style.top = (e.clientY - offsetY) + 'px';
    modal.style.right = 'auto';
  });
  document.addEventListener('mouseup', () => isDragging = false);
  document.getElementById('nickz-minimize-btn').addEventListener('click', () => {
    modal.classList.toggle('nickz-minimized');
    document.getElementById('nickz-minimize-btn').textContent = modal.classList.contains('nickz-minimized') ? '+' : '−';
  });

  // ✅ DIGITAÇÃO HUMANA REAL — SEM LIMPAR, SEM COLAR
  async function digitarHumano(campo, texto) {
    // Focar e garantir cursor no final
    campo.focus();
    if (campo.tagName === 'TEXTAREA' || campo.tagName === 'INPUT') {
      const len = campo.value.length;
      campo.setSelectionRange(len, len);
    } else if (campo.isContentEditable) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(campo);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    for (let i = 0; i < texto.length; i++) {
      const char = texto[i];
      const charCode = char.charCodeAt(0);

      // Criar eventos como um teclado real
      const keydown = new KeyboardEvent('keydown', {
        key: char,
        code: char.length === 1 ? `Key${char.toUpperCase()}` : '',
        keyCode: charCode,
        which: charCode,
        bubbles: true,
        cancelable: true
      });
      campo.dispatchEvent(keydown);

      if (keydown.defaultPrevented) continue; // respeitar preventDefault

      const keypress = new KeyboardEvent('keypress', {
        key: char,
        keyCode: charCode,
        which: charCode,
        bubbles: true,
        cancelable: true
      });
      campo.dispatchEvent(keypress);

      if (keypress.defaultPrevented) continue;

      // Inserir caractere manualmente
      if (campo.tagName === 'TEXTAREA' || campo.tagName === 'INPUT') {
        const start = campo.selectionStart || campo.value.length;
        const end = campo.selectionEnd || start;
        const val = campo.value;
        campo.value = val.substring(0, start) + char + val.substring(end);
        campo.setSelectionRange(start + 1, start + 1);
      } else if (campo.isContentEditable) {
        document.execCommand('insertText', false, char);
      }

      // Disparar input e keyup
      campo.dispatchEvent(new InputEvent('input', { inputType: 'insertText', bubbles: true }));
      campo.dispatchEvent(new KeyboardEvent('keyup', {
        key: char,
        keyCode: charCode,
        which: charCode,
        bubbles: true
      }));

      await new Promise(r => setTimeout(r, Math.random() * 70 + 50));
    }
  }

  function encontrarCampo() {
    return [...document.querySelectorAll('[contenteditable="true"], textarea')]
      .filter(el => {
        const s = getComputedStyle(el);
        return s.display !== 'none' && s.visibility !== 'hidden' && el.offsetWidth > 0;
      })
      .find(el => /reda|text|essay|escrita/i.test(el.className + el.id + (el.placeholder || ''))) ||
      document.querySelector('[contenteditable="true"]') ||
      document.querySelector('textarea');
  }

  function mostrarSucesso() {
    const m = document.createElement('div');
    m.id = 'nickz-success-modal';
    m.innerHTML = `<div id="nickz-success-content"><h3>✅ Sucesso!</h3><p>O texto foi digitado com sucesso!</p><button id="nickz-success-btn">OK</button></div>`;
    document.body.appendChild(m);
    m.querySelector('#nickz-success-btn').onclick = () => document.body.removeChild(m);
  }

  document.getElementById('nickz-autotyper-btn').addEventListener('click', async () => {
    const campo = encontrarCampo();
    if (!campo) return alert('⚠️ Clique dentro do campo de redação primeiro.');

    const texto = textarea.value.trim();
    if (!texto) return alert('⚠️ Digite um texto.');

    modal.style.opacity = '0.6';
    modal.style.pointerEvents = 'none';

    alert('✅ Clique OK, depois **não clique em outro lugar**.\nA digitação começará em 5 segundos.');

    await new Promise(r => setTimeout(r, 5000));
    await digitarHumano(campo, texto);

    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    mostrarSucesso(); // ✅ Texto permanece no campo!
  });
})();

