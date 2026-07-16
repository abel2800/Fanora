const express = require('express');
const multer = require('multer');
const { auth, isEmailVerified } = require('../middleware/auth');
const { uploadBuffer } = require('../utils/cloudinary');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/mp3',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// @route   POST /api/upload
// @desc    Upload a media file
// @access  Private
router.post('/', auth, isEmailVerified, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'uploads';
    const result = await uploadBuffer(req.file, folder);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
        resourceType: result.resourceType,
        duration: result.duration || null,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Upload failed' });
  }
});

module.exports = router;
