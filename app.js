(function(){
  var email = 'hello@inventorytrackerforafurniturewareho.com';
  var toast = document.getElementById('toast');
  function say(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('on');
    setTimeout(function(){ toast.classList.remove('on'); }, 2600);
  }

  var menu = document.getElementById('menu-btn');
  var links = document.getElementById('nav-links');
  if(menu && links){
    menu.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){ links.classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
    });
  }

  var form = document.getElementById('lead-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var field = document.getElementById('email');
      var nameField = document.getElementById('name');
      var value = (field && field.value || '').trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)){
        say('Please enter a valid email address.');
        if(field) field.focus();
        return;
      }
      var who = (nameField && nameField.value || '').trim();
      var subject = encodeURIComponent('Project request');
      var body = encodeURIComponent('Hi,\n\nI would like a plan for this project.\n\nName: ' + (who || '(not given)') + '\nReply to: ' + value + '\n\n(describe the project)');
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
      say('Opening your email app...');
    });
  }

  /* ------------------------- Gmail + data modal ------------------------- */
  var modal = document.getElementById('connect-modal');
  var KEY = modal ? modal.getAttribute('data-key') : 'botlancer:connect';
  var connect = loadConnect();

  function loadConnect(){
    try {
      var raw = localStorage.getItem(KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(parsed && typeof parsed === 'object') return parsed;
      }
    } catch(e){}
    return { gmail: null, data: null, setup: null };
  }
  function saveConnect(){
    try { localStorage.setItem(KEY, JSON.stringify(connect)); }
    catch(e){ say('This browser blocked local storage.'); }
  }
  function text(id, msg, cls){
    var el = document.getElementById(id);
    if(!el) return;
    el.textContent = msg;
    el.className = 'status-line' + (cls ? ' ' + cls : '');
  }
  function renderConnect(){
    var g = connect.gmail, d = connect.data;
    var pill = document.getElementById('connect-pill');
    if(pill){
      pill.textContent = g ? 'Gmail: demo' : 'Gmail: not connected';
      pill.className = 'nav-pill' + (g ? ' on' : '');
    }
    if(g){
      text('gmail-status', 'Demo connected for ' + g.email + ' — saved in this browser only. No email is sent.', 'ok');
      var ge = document.getElementById('gmail-email');
      if(ge && !ge.value) ge.value = g.email;
    } else {
      text('gmail-status', 'Not connected yet.', '');
    }
    if(d){
      text('data-status', 'Demo data: ' + d.name + (d.rows ? ' · ' + d.rows + ' rows' : '') + ' — parsed in this browser only.', 'ok');
    }
    var steps = document.querySelectorAll('.modal-step');
    steps.forEach(function(s){
      var n = Number(s.getAttribute('data-step'));
      var done = (n === 1 && g) || (n === 2 && d) || (n === 3 && connect.setup);
      s.className = 'modal-step' + (done ? ' done on' : '');
    });
    if(connect.setup){
      text('setup-status', 'Walkthrough complete (demo). Production credentials are added on the server, not here.', 'ok');
    } else if(g && d){
      text('setup-status', 'Ready to finish. Press “Mark setup complete” below.', 'warn');
    } else {
      text('setup-status', 'Connect Gmail and data to complete the walkthrough.', '');
    }
  }
  function openModal(){
    if(!modal) return;
    modal.classList.add('on');
    modal.setAttribute('aria-hidden', 'false');
    var first = document.getElementById('gmail-email');
    if(first) setTimeout(function(){ first.focus(); }, 60);
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('on');
    modal.setAttribute('aria-hidden', 'true');
  }

  ['connect-btn','hero-connect','foot-connect','demo-connect'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.addEventListener('click', openModal);
  });
  if(modal){
    modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && modal.classList.contains('on')) closeModal();
    });
  }
  var closeBtn = document.getElementById('modal-close');
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  var doneBtn = document.getElementById('modal-done');
  if(doneBtn) doneBtn.addEventListener('click', closeModal);

  var gmailForm = document.getElementById('gmail-form');
  if(gmailForm){
    gmailForm.addEventListener('submit', function(e){
      e.preventDefault();
      var field = document.getElementById('gmail-email');
      var value = (field && field.value || '').trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)){
        text('gmail-status', 'Enter a valid email address first.', 'bad');
        if(field) field.focus();
        return;
      }
      connect.gmail = { email: value, mode: 'demo', at: Date.now() };
      saveConnect();
      renderConnect();
      say('Gmail demo connection saved. No email was sent.');
    });
  }

  var sampleBtn = document.getElementById('data-sample');
  if(sampleBtn){
    sampleBtn.addEventListener('click', function(){
      connect.data = { name: 'Sample data (labelled)', rows: null, mode: 'demo', at: Date.now() };
      saveConnect();
      renderConnect();
      say('Sample data selected.');
    });
  }

  var fileInput = document.getElementById('data-file');
  if(fileInput){
    fileInput.addEventListener('change', function(){
      var file = fileInput.files && fileInput.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(){
        var raw = String(reader.result || '');
        var rows = null;
        try {
          if(/\.json$/i.test(file.name)){
            var parsed = JSON.parse(raw);
            rows = Array.isArray(parsed) ? parsed.length : (parsed.rows && parsed.rows.length) || null;
          } else {
            rows = Math.max(0, raw.split(/\r?\n/).filter(function(l){ return l.trim(); }).length - 1);
          }
        } catch(e){ rows = null; }
        connect.data = { name: file.name, rows: rows, mode: 'demo', at: Date.now() };
        saveConnect();
        renderConnect();
        say('Data preview saved locally: ' + (rows == null ? file.name : rows + ' rows'));
      };
      reader.onerror = function(){ text('data-status', 'Could not read that file. Try CSV or JSON.', 'bad'); };
      reader.readAsText(file.slice(0, 2 * 1024 * 1024));
    });
  }

  var finish = document.getElementById('setup-status');
  if(finish){
    // A dedicated control created lazily so the markup stays simple.
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-primary';
    btn.style.marginTop = '10px';
    btn.textContent = connect.setup ? 'Setup complete (demo)' : 'Mark setup complete';
    btn.addEventListener('click', function(){
      if(!connect.gmail || !connect.data){
        text('setup-status', 'Add Gmail and data first — demo mode still requires both.', 'bad');
        return;
      }
      connect.setup = { mode: 'demo', at: Date.now() };
      saveConnect();
      btn.textContent = 'Setup complete (demo)';
      renderConnect();
      say('Walkthrough complete. Production steps are in CONNECT.md.');
    });
    finish.parentNode.appendChild(btn);
  }

  var resetBtn = document.getElementById('connect-reset');
  if(resetBtn){
    resetBtn.addEventListener('click', function(){
      connect = { gmail: null, data: null, setup: null };
      try { localStorage.removeItem(KEY); } catch(e){}
      var ge = document.getElementById('gmail-email');
      if(ge) ge.value = '';
      var df = document.getElementById('data-file');
      if(df) df.value = '';
      renderConnect();
      say('Demo connection cleared.');
    });
  }
  renderConnect();

  var items = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('on'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function(el){ io.observe(el); });
  } else {
    items.forEach(function(el){ el.classList.add('on'); });
  }
})();