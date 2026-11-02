(function(){
  var COLS = window.__BL_COLUMNS__ || [];
  var KEY = window.__BL_KEY__ || 'botlancer:data';
  var seed = window.__BL_DATA__ || { rows: [], statuses: [] };
  var state = load();
  var sort = { key: COLS.length ? COLS[0].key : '', dir: 1 };
  var search = '';
  var filter = '';

  function load(){
    try {
      var raw = localStorage.getItem(KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        if(parsed && Array.isArray(parsed.rows)) return parsed;
      }
    } catch(e){}
    return JSON.parse(JSON.stringify(seed));
  }
  function save(){
    try { localStorage.setItem(KEY, JSON.stringify(state)); setSaved(true); }
    catch(e){ toast('Could not save locally'); }
  }
  function setSaved(ok){
    var el = document.getElementById('saved-pill');
    if(!el) return;
    el.textContent = ok ? 'saved locally' : 'not saved';
    el.className = 'pill ' + (ok ? 'ok' : 'bad');
  }
  function toast(msg){
    var el = document.getElementById('toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('on');
    setTimeout(function(){ el.classList.remove('on'); }, 2400);
  }
  function money(n){
    return '$' + Number(n || 0).toLocaleString('en-US');
  }
  function statusClass(v){
    var s = String(v || '').toLowerCase();
    if(/(done|paid|closed|complete|won|delivered|active|approved|confirmed|in stock)/.test(s)) return 'ok';
    if(/(pending|review|waiting|hold|draft|new|low|ordered|booked)/.test(s)) return 'warn';
    if(/\b(blocked|lost|cancelled|overdue|failed|risk|out|no-show)\b/.test(s)) return 'bad';
    return '';
  }
  function statuses(){
    var set = {};
    (seed.statuses || []).forEach(function(s){ set[s] = 1; });
    state.rows.forEach(function(r){ if(r.status) set[r.status] = 1; });
    return Object.keys(set);
  }
  function filtered(){
    var rows = state.rows.slice();
    if(search){
      var q = search.toLowerCase();
      rows = rows.filter(function(r){
        return COLS.some(function(c){ return String(r[c.key] == null ? '' : r[c.key]).toLowerCase().indexOf(q) !== -1; });
      });
    }
    if(filter){
      rows = rows.filter(function(r){ return String(r.status || '') === filter; });
    }
    if(sort.key){
      rows.sort(function(a, b){
        var x = a[sort.key], y = b[sort.key];
        var nx = Number(x), ny = Number(y);
        if(!isNaN(nx) && !isNaN(ny) && x !== '' && y !== '') return (nx - ny) * sort.dir;
        return String(x == null ? '' : x).localeCompare(String(y == null ? '' : y)) * sort.dir;
      });
    }
    return rows;
  }
  function renderKpis(){
    var rows = state.rows;
    var done = rows.filter(function(r){ return /(done|paid|closed|complete|won|delivered|confirmed|in stock)/i.test(String(r.status || '')); }).length;
    var open = rows.length - done;
    var risk = rows.filter(function(r){ return /\b(low|out|blocked|lost|cancelled|overdue|failed|risk|no-show)\b/i.test(String(r.status || '')); }).length;
    var valueKey = COLS.filter(function(c){ return c.type === 'number'; })[0];
    var total = valueKey ? rows.reduce(function(a, r){ return a + (Number(r[valueKey.key]) || 0); }, 0) : 0;
    var isMoney = valueKey && /(value|price|amount|revenue|cost|budget|total|fee|salary)/i.test(valueKey.key + ' ' + valueKey.label);
    var pct = rows.length ? Math.round((done / rows.length) * 100) : 0;
    var items = [
      { label: 'Records', value: rows.length.toLocaleString('en-US') },
      { label: 'Open', value: open.toLocaleString('en-US') },
      valueKey
        ? { label: valueKey.label, value: isMoney ? money(total) : total.toLocaleString('en-US') }
        : { label: 'Complete', value: pct + '%' },
      { label: 'At risk', value: risk.toLocaleString('en-US') }
    ];
    document.getElementById('kpis').innerHTML = items.map(function(i){
      return '<div class="kpi"><span>' + i.label + '</span><b>' + i.value + '</b></div>';
    }).join('');
  }
  function renderHead(){
    var head = document.querySelector('#table thead');
    head.innerHTML = '<tr>' + COLS.map(function(c){
      var mark = sort.key === c.key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '';
      return '<th data-key="' + c.key + '">' + c.label + mark + '</th>';
    }).join('') + '<th style="width:64px">Del</th></tr>';
    head.querySelectorAll('th[data-key]').forEach(function(th){
      th.addEventListener('click', function(){
        var k = th.getAttribute('data-key');
        if(sort.key === k) sort.dir = -sort.dir;
        else { sort.key = k; sort.dir = 1; }
        render();
      });
    });
  }
  function renderBody(){
    var rows = filtered();
    var body = document.querySelector('#table tbody');
    document.getElementById('count-pill').textContent = rows.length + ' record' + (rows.length === 1 ? '' : 's');
    if(!rows.length){
      body.innerHTML = '<tr><td colspan="' + (COLS.length + 1) + '" style="text-align:center;color:var(--dim);padding:40px 12px">No records match. Add one or clear the filters.</td></tr>';
      return;
    }
    body.innerHTML = rows.map(function(row){
      var idx = state.rows.indexOf(row);
      return '<tr data-idx="' + idx + '">' + COLS.map(function(c){
        var v = row[c.key] == null ? '' : row[c.key];
        if(c.type === 'select'){
          var opts = statuses().map(function(s){
            return '<option value="' + s + '"' + (String(s) === String(v) ? ' selected' : '') + '>' + s + '</option>';
          }).join('');
          return '<td><select data-key="' + c.key + '" style="min-width:0;padding:5px 8px;font-size:12px">' + opts + '</select></td>';
        }
        if(c.type === 'status'){
          return '<td><span class="pill ' + statusClass(v) + '">' + (v || '—') + '</span></td>';
        }
        return '<td contenteditable="true" data-key="' + c.key + '" data-type="' + (c.type || 'text') + '">' + String(v) + '</td>';
      }).join('') + '<td><button class="row-del" data-del="' + idx + '">Del</button></td></tr>';
    }).join('');

    body.querySelectorAll('td[contenteditable]').forEach(function(td){
      td.addEventListener('blur', function(){
        var tr = td.closest('tr');
        var idx = Number(tr.getAttribute('data-idx'));
        var key = td.getAttribute('data-key');
        var type = td.getAttribute('data-type');
        var raw = td.textContent.trim();
        state.rows[idx][key] = type === 'number' ? (Number(raw.replace(/[^0-9.-]/g, '')) || 0) : raw;
        save();
        renderKpis();
      });
      td.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){ e.preventDefault(); td.blur(); }
      });
    });
    body.querySelectorAll('select[data-key]').forEach(function(sel){
      sel.addEventListener('change', function(){
        var idx = Number(sel.closest('tr').getAttribute('data-idx'));
        state.rows[idx][sel.getAttribute('data-key')] = sel.value;
        save();
        renderKpis();
      });
    });
    body.querySelectorAll('[data-del]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = Number(btn.getAttribute('data-del'));
        state.rows.splice(idx, 1);
        save();
        render();
      });
    });
  }
  function renderFilters(){
    var sf = document.getElementById('status-filter');
    sf.innerHTML = '<option value="">All statuses</option>' + statuses().map(function(s){
      return '<option value="' + s + '"' + (filter === s ? ' selected' : '') + '>' + s + '</option>';
    }).join('');
    sf.onchange = function(){ filter = sf.value; renderBody(); };

    var so = document.getElementById('sort-select');
    so.innerHTML = '<option value="">Sort: default</option>' + COLS.map(function(c){
      return '<option value="' + c.key + '">Sort: ' + c.label + '</option>';
    }).join('');
    so.value = sort.key;
    so.onchange = function(){
      sort.key = so.value;
      sort.dir = 1;
      render();
    };
  }
  function render(){
    renderKpis();
    renderHead();
    renderBody();
    renderFilters();
  }
  function addRow(){
    var row = {};
    COLS.forEach(function(c){
      if(c.type === 'number') row[c.key] = 0;
      else if(c.type === 'select' || c.type === 'status') row[c.key] = (seed.statuses && seed.statuses[0]) || 'New';
      else row[c.key] = '';
    });
    state.rows.unshift(row);
    save();
    render();
    var first = document.querySelector('#table tbody tr td[contenteditable]');
    if(first) first.focus();
    toast('Row added');
  }
  function exportCsv(){
    function cell(v){ return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
    var lines = [COLS.map(function(c){ return cell(c.label); }).join(',')];
    filtered().forEach(function(r){
      lines.push(COLS.map(function(c){ return cell(r[c.key]); }).join(','));
    });
    var blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'records.csv';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 500);
    toast('CSV exported');
  }

  document.getElementById('add-btn').addEventListener('click', addRow);
  document.getElementById('export-btn').addEventListener('click', exportCsv);
  document.getElementById('reset-btn').addEventListener('click', function(){
    if(!confirm('Reset to the original sample data?')) return;
    state = JSON.parse(JSON.stringify(seed));
    save();
    render();
    toast('Sample data restored');
  });
  document.getElementById('search').addEventListener('input', function(e){
    search = e.target.value.trim();
    renderBody();
  });

  render();
})();