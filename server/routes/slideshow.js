// Slideshow image list API route.
const express = require('express');
const fs = require('fs');
const path = require('path');
const {SLIDESHOW_DIR, SLIDESHOW_EXTENSIONS} = require('../config');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (!fs.existsSync(SLIDESHOW_DIR)) {
      return res.json([]);
    }

    const images = fs.readdirSync(SLIDESHOW_DIR, {withFileTypes: true})
      .filter(entry => entry.isFile() && SLIDESHOW_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map(entry => entry.name)
      .sort((left, right) => left.localeCompare(right, undefined, {numeric: true, sensitivity: 'base'}))
      .map(name => `images/slide-show-images/${encodeURIComponent(name)}`);

    res.json(images);
  } catch (err) {
    console.error('Error listing slideshow images:', err);
    res.status(500).json({error: 'Failed to list slideshow images'});
  }
});

module.exports = router;
