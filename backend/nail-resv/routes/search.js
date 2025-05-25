// backend/nail-resv/routes/search.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
// 請確認路徑正確指向 all_results.json
const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../all_results.json'), 'utf-8'
));

router.get('/search', (req, res) => {
  const normalize = val => {
    if (!val) return null;
    return Array.isArray(val) ? val : [val];
  };

  const {
    style, shape, color,
    texture, decorations, theme,
    limit = 20
  } = req.query;

  const filters = {
    style: normalize(style),
    shape: normalize(shape),
    color: normalize(color),
    texture: normalize(texture),
    decorations: normalize(decorations),
    theme: normalize(theme),
  };

  const max = Math.min(parseInt(limit, 10) || 20, 100);
  const results = [];

  for (const [filename, attrs] of Object.entries(data)) {
    let ok = true;
    for (const [cat, kws] of Object.entries(filters)) {
      if (kws && !kws.every(k => (attrs[cat]||[]).includes(k))) {
        ok = false;
        break;
      }
    }
    if (ok) {
      results.push(filename);
      if (results.length >= max) break;
    }
  }

  res.json({ count: results.length, files: results });
});

module.exports = router;
