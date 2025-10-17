(function () {
  // Estilo dark mode roxo
  const style = document.createElement('style');
  style.textContent = `
    #nickz-autotyper-btn {
      position: fixed; top: 20px; right: 20px; z-index: 1000000;
      background: #7e57c2; color: white; border: none; padding: 10px 16px;
      border-radius: 6px; font-family: system-ui, sans-serif;
      cursor: pointer; box-shadow: 0 4px 12px rgba(126, 87, 194, 0.4);
      font-weight: bold;
    }
    #nickz-credit {
      position: fixed; bottom: 10px; right: 10px;
      color: #d1c4e9; font-size: 12px; z-index: 999999;
      background: rgba(126, 87, 194, 0.25); padding: 2px 6px;
      border-radius: 3px; font-family: system-ui, sans-serif;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Créditos
  const credit = document.createElement('div');
  credit.id = 'nickz-credit';
  credit.textContent = '© Nickz';
  document.body.appendChild(credit);

  // Botão flutuante
  const btn = document.createElement('button');
  btn.id = 'nickz-autotyper-btn';
  btn.textContent = 'Digitar Redação';
  document.body.appendChild(btn);

  // Função para digitar com eventos realistas
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

  // Encontrar campo de redação
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

  // AÇÃO PRINCIPAL
  btn.addEventListener('click', () => {
    const campo = encontrarCampo();
    if (!campo) {
      alert('⚠️ Clique dentro do campo de redação primeiro, depois no botão.');
      return;
    }

    // 👇 AQUI: pede o texto AO USUÁRIO na hora!
    const texto = prompt(
      '✍️ Digite o texto que deseja digitar automaticamente:\n\n' +
      '(Use Enter para quebrar linhas. Clique em "Cancelar" para usar texto padrão.)'
    );

    // Se cancelar, usa um texto padrão
    const textoFinal = texto !== null ? texto : 
      "Esse texto foi digitado automaticamente! Créditos: Nickz. ✨\n\nParágrafo 2: Funciona com quebras de linha!";

    digitarNoElemento(campo, textoFinal);
  });
})();