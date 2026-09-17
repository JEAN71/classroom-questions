(() => {
  const config = window.CLASS_QUESTIONS_CONFIG || {};
  const params = new URLSearchParams(window.location.search);
  const session = params.get('session') || '';
  const form = document.querySelector('#question-form');
  const input = document.querySelector('#question');
  const status = document.querySelector('#status');
  const label = document.querySelector('#session-label');
  const resourceWrap = document.querySelector('#resource-wrap');
  const resourceLink = document.querySelector('#resource-link');

  label.textContent = session ? `Lecture: ${session}` : 'This QR code has no lecture session.';
  if (!session) {
    input.disabled = true;
    form.querySelector('button').disabled = true;
    status.textContent = 'Ask your instructor for the QR code shown for today’s lecture.';
  }

  if (config.resourcesBaseUrl && session) {
    resourceLink.href = `${config.resourcesBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(session)}/`;
    resourceWrap.classList.remove('hidden');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    if (!config.apiUrl || config.apiUrl.includes('PASTE_YOUR')) {
      status.textContent = 'This question page has not been configured yet.';
      return;
    }

    input.disabled = true;
    form.querySelector('button').disabled = true;
    status.textContent = 'Sending…';
    try {
      // no-cors permits a static GitHub Pages site to submit to Apps Script.
      // The response is deliberately not read; the endpoint validates and logs it.
      await fetch(config.apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify({action: 'submitQuestion', session, question})
      });
      input.value = '';
      status.textContent = 'Your question was sent.';
    } catch (_) {
      status.textContent = 'Could not send the question. Please try again.';
    } finally {
      input.disabled = false;
      form.querySelector('button').disabled = false;
      input.focus();
    }
  });
})();
