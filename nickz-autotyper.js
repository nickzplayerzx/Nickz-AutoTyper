(function () {
  'use strict';

  if (document.getElementById('nickz-autotyper-modal')) return;

  // Carregar rascunho salvo (se existir)
  const savedDraft = localStorage.getItem('nickz_autotyper_draft') || '';

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

    /* Modal de confirmação */
    #nickz-success-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
    #nickz-success-content h3 {
      color: #b39ddb;
      margin-top: 0;
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
      <span>✍️ AutoTyper</span>
      <button id="nickz-minimize-btn">−</button>
    </div>
    <div id="nickz-autotyper-body">
      <textarea id="nickz-autotyper-textarea" placeholder="Cole seu texto aqui...">${savedDraft}</textarea>
      <button id="nickz-autotyper-btn">Iniciar Digitação</button>
      <div id="nickz-autotyper-countdown"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Salvar rascunho a cada 1 segundo (opcional: pode ser ao digitar)
  const textarea = document.getElementById('nickz-autotyper-textarea');
  setInterval(() => {
    localStorage.setItem('nickz_autotyper_draft', textarea.value);
  }, 1000);

  // === Arrastar ===
  let isDragging = false;
  let offsetX, offsetY;
  const header = document.getElementById('nickz-autotyper-header');
  header.addEventListener('mousedown', (e) => {
    if (e.target.id === 'nickz-minimize-btn') return;
    isDragging = true;
    const rect = modal.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    modal.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    modal.style.left = (e.clientX - offsetX) + 'px';
    modal.style.top = (e.clientY - offsetY) + 'px';
    modal.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => isDragging = false);

  // === Minimizar ===
  const minimizeBtn = document.getElementById('nickz-minimize-btn');
  minimizeBtn.addEventListener('click', () => {
    modal.classList.toggle('nickz-minimized');
    minimizeBtn.textContent = modal.classList.contains('nickz-minimized') ? '+' : '−';
  });

  // === Digitação realista ===
  async function digitarNoElemento(el, texto) {
    if (!el) return;
    el.focus();

    // Não limpamos mais automaticamente — deixamos para o usuário decidir
    // Mas garantimos que o texto será inserido corretamente
    if (el.isContentEditable) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand('insertText', false, texto);
    } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = texto;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // === Encontrar campo ===
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
      /reda|text|essay|escrita|resposta|composi|artigo/i.test(
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

  // === Modal de sucesso ===
  function mostrarSucesso() {
    const successModal = document.createElement('div');
    successModal.id = 'nickz-success-modal';
    successModal.innerHTML = `
      <div id="nickz-success-content">
        <h3>✅ Sucesso!</h3>
        <p>Texto digitado com sucesso.</p>
        <button id="nickz-success-btn">OK</button>
      </div>
    `;
    document.body.appendChild(successModal);

    document.getElementById('nickz-success-btn').onclick = () => {
      document.body.removeChild(successModal);
    };
  }

  // === Botão principal ===
  document.getElementById('nickz-autotyper-btn').addEventListener('click', () => {
    const campo = encontrarCampo();
    if (!campo) {
      alert('⚠️ Clique dentro do campo de texto primeiro.');
      return;
    }

    const texto = textarea.value.trim();
    if (!texto) {
      alert('⚠️ Digite um texto antes de iniciar.');
      return;
    }

    // Desativar interação durante contagem
    modal.style.opacity = '0.7';
    modal.style.pointerEvents = 'none';

    alert('✅ Pronto!\n\n➡️ Certifique-se de que o cursor está no campo de texto.\n\nA digitação começará em 5 segundos.');

    mostrarContagem(async () => {
      await digitarNoElemento(campo, texto);
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
      mostrarSucesso(); // ✅ Pop-up de sucesso
    });
  });
})();
