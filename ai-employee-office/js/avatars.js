/*
 * avatars.js — original, locally drawn SVG "monitor face" characters.
 * Each employee gets different hair, brows, mouth and extras.
 * Phase 2: the `.mouth` group is where a speaking animation can be attached.
 */
window.AEO = window.AEO || {};

(function () {
  var INK = '#14121c';

  function eyes() {
    return '<g class="eyes">' +
      '<ellipse cx="68" cy="78" rx="11" ry="15" fill="' + INK + '"/><circle cx="72" cy="72" r="4" fill="#fff"/>' +
      '<ellipse cx="132" cy="78" rx="11" ry="15" fill="' + INK + '"/><circle cx="136" cy="72" r="4" fill="#fff"/>' +
      '</g>';
  }

  var PARTS = {
    anne: {
      back: '<path d="M0 0H200V160H168V70Q100 18 32 70V160H0Z" fill="#3a2a45"/>',
      brows: '<path d="M50 52Q68 40 86 52M114 52Q132 40 150 52" stroke="#3a2a45" stroke-width="6" fill="none" stroke-linecap="round"/>',
      mouth: '<path d="M62 112Q100 158 138 112Q100 124 62 112Z" fill="#d6336c"/><path d="M76 118Q100 132 124 118Q100 124 76 118Z" fill="#fff"/>'
    },
    tim: {
      back: '<path d="M0 0H200V52Q165 32 125 48Q80 30 42 58Q20 52 0 66Z" fill="#5a3a26"/>',
      brows: '<path d="M52 56Q68 48 84 56M116 56Q132 48 148 56" stroke="#5a3a26" stroke-width="6" fill="none" stroke-linecap="round"/>',
      mouth: '<path d="M64 112Q100 150 136 112Q100 122 64 112Z" fill="#e11d48"/>'
    },
    dwayne: {
      back: '<path d="M0 0H200V34Q100 20 0 34Z" fill="#b6a93a"/>',
      brows: '<path d="M46 48H90M110 48H154" stroke="#a9a030" stroke-width="8" fill="none" stroke-linecap="round"/>' +
             '<rect x="44" y="56" width="48" height="44" rx="10" fill="none" stroke="' + INK + '" stroke-width="5"/>' +
             '<rect x="108" y="56" width="48" height="44" rx="10" fill="none" stroke="' + INK + '" stroke-width="5"/>' +
             '<path d="M92 72H108M44 72H30M156 72H170" stroke="' + INK + '" stroke-width="5" fill="none"/>',
      mouth: '<path d="M72 124Q86 116 100 122Q114 116 128 124" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/>'
    },
    bryan: {
      back: '<path d="M0 0H200V40L180 14L160 42L140 10L120 40L100 8L80 40L60 10L40 42L20 14L0 40Z" fill="#2a1d14"/>',
      brows: '<path d="M50 54L86 60M114 60L150 54" stroke="#2a1d14" stroke-width="7" fill="none" stroke-linecap="round"/>' +
             '<g fill="#8a6f58" opacity=".55"><circle cx="58" cy="118" r="1.6"/><circle cx="70" cy="128" r="1.6"/><circle cx="84" cy="136" r="1.6"/><circle cx="100" cy="140" r="1.6"/><circle cx="116" cy="136" r="1.6"/><circle cx="130" cy="128" r="1.6"/><circle cx="142" cy="118" r="1.6"/></g>',
      mouth: '<path d="M58 108Q100 152 142 108Z" fill="#9f1239"/><path d="M64 109H136Q130 120 100 124Q70 120 64 109Z" fill="#fff"/>'
    },
    kelvin: {
      back: '<path d="M0 0H200V44Q150 26 100 34Q46 24 0 50Z" fill="#8d96a0"/>',
      brows: '<path d="M50 52Q68 44 86 54M114 54Q132 44 150 52" stroke="#6b7480" stroke-width="6" fill="none" stroke-linecap="round"/>' +
             '<path d="M92 104Q100 110 108 104" stroke="#00000030" stroke-width="3" fill="none"/>',
      mouth: '<path d="M70 120Q100 132 132 114" stroke="' + INK + '" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M132 114Q138 112 140 106" stroke="' + INK + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
    },
    kelsey: {
      back: '<path d="M0 0H200V110Q196 130 176 130H164V64Q100 24 36 64V130H24Q4 130 0 110Z" fill="#d9b04a"/>',
      brows: '<path d="M50 54Q68 44 86 54M114 54Q132 44 150 54" stroke="#9a7424" stroke-width="5" fill="none" stroke-linecap="round"/>' +
             '<circle cx="46" cy="110" r="14" fill="#f472b6" opacity=".35"/><circle cx="154" cy="110" r="14" fill="#f472b6" opacity=".35"/>',
      mouth: '<path d="M64 112Q100 148 136 112Q100 124 64 112Z" fill="#e0267a"/>'
    }
  };

  /* Returns the avatar markup for an employee. `status` drives the thinking dots. */
  AEO.avatarHtml = function (emp, status) {
    var p = PARTS[emp.id];
    var svg = '<svg viewBox="0 0 200 160" role="img" aria-label="' + emp.name + ' avatar" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="200" height="160" fill="' + emp.face + '"/>' +
      p.back + eyes() + p.brows + '<g class="mouth">' + p.mouth + '</g></svg>';
    var dots = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';
    return '<div class="avatar st-' + status + '" style="--c:' + emp.color + '">' + svg + dots + '</div>';
  };
})();
