const { randomBytes } = require('crypto');

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  let ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  return ip;
}

function getRequestUserId(req) {
  // 1. Check custom header (from localStorage fallback)
  if (req.headers['x-user-id']) {
    return req.headers['x-user-id'];
  }
  // 2. Check cookies
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(/(?:^|; )userId=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

function generateVirtualIp() {
  const x = Math.floor(Math.random() * 254) + 1;
  const y = Math.floor(Math.random() * 254) + 1;
  return `10.244.${x}.${y}`;
}

async function getOrCreateUser(req, res) {
  const db = req.app.locals.db;
  const usersCollection = db.collection('users');
  const ip = getClientIp(req);
  
  let userId = getRequestUserId(req);
  let user = null;

  if (userId) {
    user = await usersCollection.findOne({ $or: [{ id: userId }, { encodedId: userId }] });
  }

  if (!user) {
    // Generate new unique user
    userId = `usr_${randomBytes(8).toString('hex')}`;
    const virtualIp = generateVirtualIp();
    user = {
      id: userId,
      encodedId: userId, // for backwards compatibility
      ip: ip,
      virtualIp: virtualIp, // static virtual IP
      createdAt: new Date().toISOString(),
      activity: [],
    };
    await usersCollection.insertOne(user);
  } else {
    // Update the current physical IP if it changed
    if (user.ip !== ip) {
      await usersCollection.updateOne(
        { id: user.id },
        { $set: { ip: ip } }
      );
      user.ip = ip;
    }
  }

  // Ensure cookie is set
  res.cookie('userId', user.id, {
    httpOnly: true,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    sameSite: 'lax',
    secure: false, // allow HTTP in dev
  });

  return user;
}

async function addUserActivity(db, userId, activityEntry) {
  const usersCollection = db.collection('users');
  const entry = {
    ...activityEntry,
    timestamp: new Date().toISOString(),
  };

  await usersCollection.updateOne(
    { $or: [{ id: userId }, { encodedId: userId }] },
    { 
      $push: { 
        activity: { 
          $each: [entry], 
          $position: 0 
        } 
      } 
    }
  );
}

module.exports = {
  getOrCreateUser,
  addUserActivity,
  getClientIp,
};
