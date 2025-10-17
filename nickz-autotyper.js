(function () {
  'use strict';

  if (document.getElementById('nickz-autotyper-modal')) return;

  // Estilo com suporte a arrastar e minimizar
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
    #nickz-autotyper-header span {
      flex: 1;
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
      display: block;
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
    #nickz-autotyper-btn:hover {
      opacity: 0.9;
    }
    #nickz-autotyper-countdown {
      text-align: center;
      margin-top: 10px;
      font-size: 16px;
      color: #ffcc80;
      font-weight: bold;
      min-height: 22px;
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
    .nickz-minimized {
      height: 40px;
      overflow: hidden;
    }
    .nickz-minimized #nickz-autotyper-body {
      display: none;
    }
    @media (max-width: 600px) {
      #nickz-autotyper-modal {
        width: 95vw;
        max-width: 400px;
        right: 2.5vw;
      }
    }
  `;
  document.head.appendChild(style);

  // Créditos
  const credit = document.createElement('div');
  credit.id = 'nickz-credit';
  credit.textContent = 'Nickz (Yudi Matheus)';
  document.body.appendChild(credit);

  // Modal
  const modal = document.createElement('div');
  modal.id = 'nickz-autotyper-modal';
  modal.innerHTML = `
    <div id="nickz-autotyper-header">
      <span>✍️ AutoTyper</span>
      <button id="nickz-minimize-btn">−</button>
    </div>
    <div id="nickz-autotyper-body">
      <textarea id="nickz-autotyper-textarea" placeholder="Cole seu texto aqui..."></textarea>
      <button id="nickz-autotyper-btn">Iniciar Digitação</button>
      <div id="nickz-autotyper-countdown"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // === Funcionalidade: Arrastar ===
  let isDragging = false;
  let offsetX, offsetY;

  const header = document.getElementById('nickz-autotyper-header');
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'nickz-minimize-btn') return;
    isDragging = true;
    offsetX = e.clientX - modal.getBoundingClientRect().left;
    offsetY = e.clientY - modal.getBoundingClientRect().top;
    modal.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    modal.style.left = x + 'px';
    modal.style.top = y + 'px';
    modal.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // === Funcionalidade: Minimizar ===
  const minimizeBtn = document.getElementById('nickz-minimize-btn');
  minimizeBtn.addEventListener('click', () => {
    modal.classList.toggle('nickz-minimized');
    minimizeBtn.textContent = modal.classList.contains('nickz-minimized') ? '+' : '−';
  });

  // === Função: Digitar texto realista ===
  async function digitarNoElemento(el, texto) {
    if (!el) return;
    el.focus();

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (el.isContentEditable) {
      el.innerHTML = '';
    }

    for (let i = 0; i < texto.length; i++) {
      const char = texto[i];
      const charCode = char.charCodeAt(0);

      const eventProps = {
        bubbles: true,
        cancelable: true,
        view: window,
        key: char,
        code: char.length === 1 ? `Key${char.toUpperCase()}` : '',
        keyCode: charCode,
        which: charCode,
        charCode: charCode
      };

      el.dispatchEvent(new KeyboardEvent('keydown', eventProps));
      el.dispatchEvent(new KeyboardEvent('keypress', eventProps));

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const val = el.value;
        el.value = val.substring(0, start) + char + val.substring(end);
        el.setSelectionRange(start + 1, start + 1);
      } else if (el.isContentEditable) {
        document.execCommand('insertText', false, char);
      }

      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      el.dispatchEvent(new KeyboardEvent('keyup', eventProps));

      await new Promise(r => setTimeout(r, Math.random() * 60 + 40));
    }
  }

  // === Encontrar campo de texto ===
  function encontrarCampo() {
    const candidatos = [
      ...document.querySelectorAll('textarea'),
      ...document.querySelectorAll('[contenteditable="true"]'),
      ...document.querySelectorAll('[contenteditable]:not([contenteditable="false"])'),
      ...document.querySelectorAll('input[type="text"]')
    ].filter(el => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && (el.offsetWidth > 0 || el.offsetHeight > 0);
    });

    return candidatos.find(el =>
      /reda|text|essay|escrita|resposta|composi|artigo|answer|message|comment/i.test(
        (el.placeholder || '') + (el.name || '') + (el.id || '') + (el.className || '')
      )
    ) || candidatos[0];
  }

  // === Contagem regressiva ===
  function mostrarContagem(callback) {
    const countdownEl = document.getElementById('nickz-autotyper-countdown');
    let segundos = 5;
    countdownEl.textContent = `Iniciando em ${segundos}...`;

    const interval = setInterval(() => {
      segundos--;
      if (segundos > 0) {
        countdownEl.textContent = `Iniciando em ${segundos}...`;
      } else {
        clearInterval(interval);
        countdownEl.textContent = 'Digitando... ✨';
        callback();
      }
    }, 1000);
  }

  // === Botão principal ===
  document.getElementById('nickz-autotyper-btn').addEventListener('click', () => {
    const campo = encontrarCampo();
    if (!campo) {
      alert('⚠️ Clique dentro do campo de texto primeiro.');
      return;
    }

    const texto = document.getElementById('nickz-autotyper-textarea').value.trim();
    if (!texto) {
      alert('⚠️ Digite um texto antes de iniciar.');
      return;
    }

    modal.style.opacity = '0.8';
    modal.style.pointerEvents = 'none';

    alert('✅ Pronto!\n\n➡️ Clique no campo de texto (se ainda não tiver).\n\nA digitação começará em 5 segundos.');

    mostrarContagem(() => {
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
      digitarNoElemento(campo, texto);
    });
  });
})();
