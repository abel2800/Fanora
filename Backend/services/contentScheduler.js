const { Op } = require('sequelize');
const { Content, Notification, User } = require('../models');

let running = false;

async function publishDueContent() {
  if (running) return;
  running = true;
  try {
    const due = await Content.findAll({
      where: {
        status: 'draft',
        scheduledPublishDate: { [Op.lte]: new Date() },
      },
      limit: 100,
    });

    for (const content of due) {
      await content.update({
        status: 'published',
        publishedAt: new Date(),
        scheduledPublishDate: null,
      });

      const creator = await User.findByPk(content.creatorId);
      if (creator) {
        await Notification.create({
          userId: creator.id,
          type: 'content_published',
          relatedContentId: content.id,
          title: 'Scheduled post published',
          message: `"${content.title}" is now live`,
          data: { deepLink: `/content/${content.id}` },
        }).catch(() => {});
      }
    }
  } catch (error) {
    console.error('Scheduled publishing error:', error);
  } finally {
    running = false;
  }
}

function startContentScheduler() {
  publishDueContent();
  const timer = setInterval(publishDueContent, 30 * 1000);
  timer.unref?.();
  return timer;
}

module.exports = { startContentScheduler, publishDueContent };
