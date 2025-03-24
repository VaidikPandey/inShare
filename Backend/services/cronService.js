const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const File = require('../models/file');

cron.schedule('* * * * *', async () => {
  try {
    console.log('Running cron job to delete expired files...');

    const expiredFiles = await File.find({ expiresAt: { $lt: new Date() } });

    if (expiredFiles.length === 0) {
      console.log('No expired files found.');
      return;
    }

    for (const file of expiredFiles) {
      const filePath = path.join(__dirname, '../', file.path);

      try {
        await fs.promises.unlink(filePath);
        console.log(`Successfully deleted expired file: ${file.filename}`);
      } catch (err) {
        console.error(`Failed to delete file: ${file.filename}`, err);
      }

      await File.deleteOne({ _id: file._id });
    }

    console.log(`Deleted ${expiredFiles.length} expired files.`);
  } catch (err) {
    console.error('Error deleting expired files:', err);
  }
});

module.exports = cron;

