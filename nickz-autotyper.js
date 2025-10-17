(function () {
  'use strict';

  if (document.getElementById('nickz-autotyper-modal')) return;

  const style = document.createElement('style');
  style.textContent = `
    #nickz-autotyper-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      background: #120b1f;
      border: 2px solid #7e57c2;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(126, 87, 194, 0.5);
      font-family: 'Segoe UI', system-ui, sans-serif;
      width: 90%;
      max-width: 500px;
      padding: 24px;
      color: #e0d6ff;
    }
    #nickz-autotyper-header {
      text-align: center;
      margin-bottom: 16px;
    }
    #nickz-autotyper-header h3 {
      margin: 0;
      color: #b39ddb;
      font-size: 20px;
    }
    #nickz-autotyper-textarea {
      width: 100%;
      height: 120px;
      background: #1a142a;
      color: #d9c7ff;
      border: 1px solid #7e57c2;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      resize: vertical;
      margin-bottom: 16px;
      box-sizing: border-box;
    }
    #nickz-autotyper-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(90deg, #7e57c2, #5e35b1);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.3s;
    }
    #nickz-autotyper-btn:hover {
      opacity: 0.9;
    }
    #nickz-autotyper-countdown {
      text-align: center;
      margin-top: 12px;
      font-size: 18px;
      color: #ffcc80;
      font-weight: bold;
    }
    #nickz-credit {
      position: fixed;
      bottom: 12px;
      right: 12px;
      color: #b39ddb;
      font-size: 12px;
      z-index: 2147483646;
      background: rgba(94, 53, 177, 0.2);
      padding: 4px 10px;
      border-radius: 6px;
      pointer-events: none;
    }
    @media (max-width: 600px) {
      #nickz-autotyper-modal {
        width: 95%;
        padding: 20px;
      }
      #nickz-autotyper-textarea {
        height: 140px;
      }
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
      <h3>✍️ AutoTyper Universal</h3>
    </div>
    <textarea id="nickz-autotyper-textarea" placeholder="Cole ou digite seu texto aqui..."></textarea>
    <button id="nickz-autotyper-btn">Iniciar Digitação</button>
    <div id="nickz-autotyper-countdown"></div>
  `;
  document.body.appendChild(modal);

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

  document.getElementById('nickz-autotyper-btn').addEventListener('click', () => {
    const campo = encontrarCampo();
    if (!campo) {
      alert('⚠️ Nenhum campo de texto encontrado.\n\n➡️ Clique dentro do campo onde deseja digitar, depois abra este menu novamente.');
      return;
    }

    const texto = document.getElementById('nickz-autotyper-textarea').value.trim();
    if (!texto) {
      alert('⚠️ Digite ou cole um texto antes de iniciar.');
      return;
    }

    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => modal.remove(), 300);

    alert('✅ Pronto!\n\n➡️ **Clique dentro do campo de texto** (se ainda não tiver).\n\nA digitação começará em 5 segundos.');

    mostrarContagem(() => {
      digitarNoElemento(campo, texto);
    });
  });
})();