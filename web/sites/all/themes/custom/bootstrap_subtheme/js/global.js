(function ($, Prism) {
  // Remove "automatic" highlighting.
  // @see https://github.com/PrismJS/prism/issues/765
  document.removeEventListener('DOMContentLoaded', Prism.highlightAll);

  var $document = $(document);
  var $window = $(window);

  // "Fix" Prism's commenting regex.
  // @see https://github.com/PrismJS/prism/issues/307#issuecomment-50856743
  var langs = ['clike', 'javascript', 'php'];
  for (var i = 0; i < langs.length; i++) {
    var comment;
    if (Array.isArray(Prism.languages[langs[i]].comment)) {
      comment = Prism.languages[langs[i]].comment[0];
    }
    else {
      comment = Prism.languages[langs[i]].comment;
    }
    comment.pattern = /(^[^"]*?("[^"]*?"[^"]*?)*?[^"\\]*?)(\/\*[\w\W]*?\*\/|(^|[^:])\/\/.*?(\r?\n|$))/g;
    Prism.languages[langs[i]].comment = comment;
  }

  // Add in "JSON" language syntax.
  // @see https://github.com/PrismJS/prism/pull/370
  Prism.languages.json = {
    'property': /"(\b|\B)[\w-]+"(?=\s*:)/ig,
    'string': /"(?!:)(\\?[^'"])*?"(?!:)/g,
    'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
    'function': {
      pattern: /[a-z0-9_]+\(/ig,
      inside: {
        punctuation: /\(/
      }
    },
    'punctuation': /[{}[\]);,]/g,
    'operator': /:/g,
    'boolean': /\b(true|false)\b/gi,
    'null': /\bnull\b/gi
  };
  Prism.languages.jsonp = Prism.languages.json;

  // Fix markdown "code" regex.
  delete Prism.languages.markdown.code;
  Prism.languages.insertBefore('markdown', 'comment', {
    'code': [
      {
        alias: 'block',
        pattern: /```[\w\W]+?```|``[\w\W]+?``/
      },
      {
        alias: 'inline',
        pattern: /`[^`\n]+`/
      }
    ]
  });

  // Fix "url-link" regular expression to allow @ symbols.
  // @see https://github.com/PrismJS/prism/issues/1841
  for (var lang in Prism.languages) {
    if (Prism.languages.hasOwnProperty(lang)) {
      for (var key in Prism.languages[lang]) {
        if (Prism.languages[lang].hasOwnProperty(key)) {
          if (key === 'url-link' && Prism.languages[lang][key] instanceof RegExp) {
            Prism.languages[lang][key] = /\b([a-z]{3,7}:\/\/|tel:)[\w\-+@%~/.:=&]+(?:\?[\w\-+@%~/.:#=?&!$'()*,;]*)?(?:#[\w\-+@%~/.:#=?&!$'()*,;]*)?/;
          }
          if (Prism.languages[lang][key].inside && Prism.languages[lang][key].inside['url-link'] instanceof RegExp) {
            Prism.languages[lang][key].inside['url-link'] = /\b([a-z]{3,7}:\/\/|tel:)[\w\-+@%~/.:#=?&amp;]+/;
          }
        }
      }
    }
  }

  // Alias/extend "htm" and "html" languages from "markup" language.
  Prism.languages.htm = Prism.languages.extend('markup', {});
  Prism.languages.html = Prism.languages.extend('markup', {});
  Prism.languages.js = Prism.languages.extend('javascript', {});

  var whitespace = window.localStorage.getItem('prism-whitespace');
  if (whitespace === void 0 || whitespace === null) window.localStorage.setItem('prism-whitespace', 1);

  // Handle language labels.
  Prism.hooks.add('before-highlight', function(env) {
    var pre = env.element.parentNode;
    if (!pre || !/pre/i.test(pre.nodeName)) return;
    var $pre = $(pre);
    $(pre).wrap('<div class="prism-wrapper"></div>');
    var $wrapper = $pre.parent();

    var language = pre.getAttribute('data-language');
    pre.removeAttribute('data-language');
    if (/^json/i.test(env.language)) {
      language = 'JSON';
    }
    else if (/^(htm|html|markup)/i.test(env.language)) {
      language = 'HTML';
    }
    else if (env.language === 'js') {
      language = 'JavaScript';
    }
    if (language) {
      $wrapper.attr('data-language', language);
    }

    // Create a toggle for showing whitespace.
    var $code = $(env.element);
    if ($code.is('.show-whitespace') || $pre.is('.show-whitespace')) {
      for (var key in env.grammar) {
        if (!env.grammar.hasOwnProperty(key)) continue;
        if (Array.isArray(env.grammar[key])) {
          for (var i = 0; i < env.grammar[key].length; i++) {
            if (typeof env.grammar[key][i] !== 'object') env.grammar[key][i] = { pattern: env.grammar[key][i] };
            if (!env.grammar[key][i].inside) env.grammar[key][i].inside = {};
            env.grammar[key][i].inside.paragraph = /\n/;
            env.grammar[key][i].inside.tab = /\t/;
            env.grammar[key][i].inside.space = /\s/;
          }
        }
        else {
          if (typeof env.grammar[key] !== 'object') env.grammar[key] = { pattern: env.grammar[key] };
          if (!env.grammar[key].inside) env.grammar[key].inside = {};
          env.grammar[key].inside.paragraph = /\n/;
          env.grammar[key].inside.tab = /\t/;
          env.grammar[key].inside.space = /\s/;
        }
      }
      env.grammar.paragraph = /\n/;
      env.grammar.tab = /\t/;
      env.grammar.space = /\s/;
      var enabled = parseInt(window.localStorage.getItem('prism-whitespace'), 10);
      var $toggle = $('<a href="#" class="prism-toggle-whitespace"></a>').text(enabled ? Drupal.t('Hide invisibles') : Drupal.t('Show invisibles'));
      $code[enabled ? 'addClass' : 'removeClass']('show-whitespace').addClass('toggles-whitespace');
      $pre.after($toggle);
    }
  });

  $document.on('click', 'a.prism-toggle-whitespace', function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $toggles = $document.find('.prism-toggle-whitespace');
    var $codes = $document.find('code.toggles-whitespace');
    var enabled = parseInt(window.localStorage.getItem('prism-whitespace'), 10) ? 0 : 1;
    $toggles.text(enabled ? Drupal.t('Hide invisibles') : Drupal.t('Show invisibles'));
    $codes[enabled ? 'addClass' : 'removeClass']('show-whitespace');
    window.localStorage.setItem('prism-whitespace', parseInt(enabled, 10));
  });



  var sourceHash = function () {
    var hash = location.hash.slice(1);
    var range = (hash.match(/\.([\d,-]+)$/) || [,''])[1];
    if (!range || document.getElementById(hash)) return;
    return '#' + hash.slice(0, hash.lastIndexOf('.'));
  };

  // Process "after-highlight" event.
  Prism.hooks.add('after-highlight', function (env) {
    var $code = $(env.element);

    // Ensure that the links added by the "Autolinker" plugin open in a new window.
    $code.find('a.token.url-link').attr('target', '_blank');

    // Handle code blocks.
    var pre = env.element.parentNode;
    if (!pre || !/pre/i.test(pre.nodeName)) return;

    var $pre = $code.parent();
    var $wrapper = $pre.parent();
    var links = $pre.data('links');

    // Merge the links from API module back in.
    if (links) {
      // Only replace the text inside tokens.
      $code.find('span.token').each(function () {
        var $token = $(this);
        var text = $token.html().replace(/^('|")/g, '').replace(/('|")$/g, '');
        if (links[text]) {
          if (links[text].title) links[text]['data-toggle'] = 'tooltip';
          var $link = $('<a>').text(text).attr(links[text]);
          $token.html($token.html().replace(new RegExp(text, 'g'), $link.wrap('<div>').parent().html()));
        }
      });
      var options = $.extend(true, {}, Drupal.settings.bootstrap.tooltipOptions, {
        placement: 'bottom'
      });
      $pre.find('[data-toggle="tooltip"]').tooltip(options);
    }

    // Bind on hashchange event to offset the scrolltop a bit.
    $window.on('hashchange', function () {
      var $highlight = $(sourceHash()).find('.temporary.line-highlight');
      if (!$highlight[0]) return;
      var newTop = $window.scrollTop() - 100;
      if (newTop < 0) newTop = 0;
      $window.scrollTop(newTop);
    });

    // This is currently in a DOM ready event (page load), so if there is a hash ID present, go ahead and trigger it.
    if (sourceHash()) {
      // The Prism line-highlight plugin binds directly with addEventListener (which jQuery does not trigger).
      // We must manually trigger it via the window object.
      var triggerHashchange = function () {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      };

      // Determine if the code is inside a collapsible panel. If it is, expand it and then trigger the hashchange.
      var $fieldset = $pre.parents('fieldset').first();
      var target = $fieldset.find('[data-toggle=collapse]').attr('href');
      var $toggle = $fieldset.find(target);
      if ($toggle[0]) {
        $window.on('shown.bs.collapse', triggerHashchange);
        $toggle.collapse('show');
      }
      // Otherwise trigger it now.
      else {
        triggerHashchange();
      }
    }
  });

  Prism.hooks.add('complete', function (env) {
    var pre = env.element.parentNode;
    if (!pre || !/pre/i.test(pre.nodeName)) return;

    // Show the code block (if hidden).
    var $pre = $(pre);
    if ($pre.hasClass('fade')) {
      $pre.addClass('in');
    }
  });

  // DOM ready.
  $document.ready(function () {
    var $body = $('body');
    var $footer = $body.find('.footer');
    var $sidebar = $body.find('.region-sidebar-second');

    // Affix the sidebar.
    if ($sidebar[0]) {
      $sidebar.affix({
        offset: {
          top: $sidebar.offset().top - 40,
          bottom: function () {
            return (this.bottom = $footer.outerHeight(true));
          }
        }
      });
    }

    // Highlight code on page.
    Prism.highlightAll();

    // Set default anchor options.
    $.fn.anchor.Constructor.DEFAULTS = $.extend(true, $.fn.anchor.Constructor.DEFAULTS, {
      anchors: '.region-content h2, .region-content h3, [data-anchor]',
      anchorIgnore: '.element-invisible, button, [data-anchor-ignore]:not([data-anchor-ignore="false"]),[data-dismiss],[data-slide],[data-toggle]:not([data-toggle="anchor"])'
    });

    // If there is a source hash (line highlighting), don't bind immediately.
    if (sourceHash()) {
      setTimeout(function () {
        $document.anchor();
      }, 300)
    }
    else {
      $document.anchor();
    }

  });

})(window.jQuery, window.Prism);
