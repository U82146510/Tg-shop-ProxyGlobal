(function () {
  var toggleBtn = document.getElementById('liveChatToggle');
  var closeBtn = document.getElementById('liveChatClose');
  var panel = document.getElementById('liveChatPanel');
  var form = document.getElementById('liveChatForm');
  var input = document.getElementById('liveChatInput');
  var messages = document.getElementById('liveChatMessages');

  if (!toggleBtn || !closeBtn || !panel || !form || !input || !messages) return;

  var sessionId = localStorage.getItem('liveChatSessionId');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('liveChatSessionId', sessionId);
  }

  var ws;
  var reconnectDelay = 1000;
  var maxReconnectDelay = 10000;
  var pingIntervalId;

  function startPing() {
    stopPing();
    pingIntervalId = setInterval(function () {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', sessionId: sessionId }));
      }
    }, 25000);
  }

  function stopPing() {
    if (pingIntervalId) {
      clearInterval(pingIntervalId);
      pingIntervalId = null;
    }
  }

  function connect() {
    ws = new WebSocket('wss://globalproxy.store/ws');

    ws.addEventListener('open', function () {
      reconnectDelay = 1000;
      ws.send(JSON.stringify({ type: 'register', sessionId: sessionId }));
      startPing();
    });

    ws.addEventListener('close', function () {
      stopPing();
      setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
    });

    ws.addEventListener('error', function () {
      try {
        ws.close();
      } catch (e) {
        return;
      }
    });

    ws.addEventListener('message', function (event) {
      try {
        var payload = JSON.parse(event.data);
        if (payload && payload.type === 'operator_message' && payload.text && payload.sessionId === sessionId) {
          addMessage(payload.text, 'operator');
        }
      } catch (error) {
        return;
      }
    });
  }

  connect();

  closeBtn.addEventListener('click', function () {
    panel.style.display = 'none';
    toggleBtn.style.display = 'inline-flex';
    toggleBtn.setAttribute('aria-expanded', 'false');
  });

  toggleBtn.addEventListener('click', function () {
    panel.style.display = 'flex';
    toggleBtn.style.display = 'none';
    toggleBtn.setAttribute('aria-expanded', 'true');
  });

  function addMessage(text, from) {
    var messageEl = document.createElement('div');
    messageEl.textContent = text;
    messageEl.style.margin = '6px 0';
    messageEl.style.padding = '10px 12px';
    messageEl.style.borderRadius = '10px';
    messageEl.style.maxWidth = '80%';
    messageEl.style.fontSize = '14px';
    if (from === 'user') {
      messageEl.style.marginLeft = 'auto';
      messageEl.style.background = '#f59e0b';
      messageEl.style.color = '#0d0d0d';
    } else {
      messageEl.style.marginRight = 'auto';
      messageEl.style.background = '#ffffff';
      messageEl.style.color = '#0d0d0d';
      messageEl.style.border = '1px solid #e5e7eb';
    }
    messages.appendChild(messageEl);
    messages.scrollTop = messages.scrollHeight;
  }

  addMessage('Hi, how can I help you?', 'operator');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var text = input.value.trim();
    if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'chat_message', text: text, sessionId: sessionId }));
    addMessage(text, 'user');
    input.value = '';
  });
})();
