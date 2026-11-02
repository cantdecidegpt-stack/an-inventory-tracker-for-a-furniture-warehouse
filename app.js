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
      var value = (field && field.value || '').trim();
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)){
        say('Please enter a valid email address.');
        if(field) field.focus();
        return;
      }
      var subject = encodeURIComponent('Project request');
      var body = encodeURIComponent('Hi,\n\nI would like a plan for:\n\n(describe the project)\n\nReply to: ' + value);
      window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + body;
      say('Opening your email app...');
    });
  }

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