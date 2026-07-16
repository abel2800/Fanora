const { v2: cloudinary } = require('cloudinary');
const { Readable } = require('stream');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

/**
 * Upload a multer memory file to Cloudinary, or fall back to a local mock URL.
 */
const uploadBuffer = async (file, folder = 'fanora') => {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!isConfigured()) {
      const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, '') || 'fanora';
      const extension = path.extname(file.originalname || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
      const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
      const uploadDirectory = path.join(__dirname, '..', 'uploads', safeFolder);
      await fs.mkdir(uploadDirectory, { recursive: true });
      await fs.writeFile(path.join(uploadDirectory, fileName), file.buffer, { flag: 'wx' });
      return {
        url: `/uploads/${safeFolder}/${fileName}`,
        publicId: null,
        format: extension.slice(1),
        bytes: file.size,
        resourceType: file.mimetype.startsWith('video/') ? 'video' : 'image',
        mock: true,
      };
    }

    return new Promise((resolve, reject) => {
      const resourceType = file.mimetype.startsWith('video/')
        ? 'video'
        : file.mimetype.startsWith('audio/')
          ? 'video'
          : 'image';

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `fanora/${folder}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            resourceType: result.resource_type,
            duration: result.duration || null,
            width: result.width,
            height: result.height,
            mock: false,
          });
        }
      );

      bufferToStream(file.buffer).pipe(uploadStream);
    });
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadBuffer,
};
