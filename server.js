const https = require('https');

/* Configuration! */
const txAdminUrl = "123.123.123.123"; /* Set to your txAdmin hostname or IP */
const txAdminPort = 40120; /* Default is 40120. */
const txAdminUsername = "username"; /* Set to a txAdmin user with appropriate permissions */
const txAdminPassword = "password"; /* Set to a txAdmin user with appropriate permissions */

/* No need to touch anything below here. You can, but it isn't needed really */

// Function to authenticate and get cookies
async function getAuthCookie() {
  const data = JSON.stringify({
    username: txAdminUsername,
    password: txAdminPassword
  });
  const options = {
    hostname: txAdminUrl,
    port: txAdminPort,
    path: '/auth/password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(`Authentication failed with status code: ${res.statusCode}`);
      }
      const cookies = res.headers['set-cookie'];
      if (!cookies) {
        return reject('No cookies received from authentication');
      }
      resolve(cookies.join('; ')); // Join in case multiple
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Function to logout after action
async function logout(cookies) {
  const options = {
    hostname: txAdminUrl,
    port: txAdminPort,
    path: '/auth/logout',
    method: 'GET',
    headers: {
      'Cookie': cookies
    }
  };
  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`[^2\x1b[1mINFO\x1b[0m^7] \x1b[41m\x1b[30m|txApi|\x1b[0m\x1b[1m ^7Logged out from txAdmin\x1b[0m^0`);
      }
      resolve();
    });
    req.on('error', (error) => {
      console.log(`[^1\x1b[1mERROR\x1b[0m^7] \x1b[41m\x1b[30m|txApi|\x1b[0m\x1b[1m Logout error: ${error.message}\x1b[0m^0`);
      resolve(); // Continue even if logout fails
    });
    req.end();
  });
}

// General function to perform player actions
async function performAction(actionType, playerId, reason, duration, identifiers, banId) {
  let cookies;
  try {
    cookies = await getAuthCookie();

    let path, postData;
    if (actionType === 'ban') {
      path = '/player/ban';
      postData = {
        refs: identifiers,
        reason: reason || 'No reason given',
        duration: duration || 'permanent'
      };
    } else if (actionType === 'kick') {
      path = '/player/kick';
      postData = {
        id: playerId.toString(),
        reason: reason || 'No reason given'
      };
    } else if (actionType === 'warn') {
      path = '/player/warn';
      postData = {
        id: playerId.toString(),
        reason: reason || 'No reason given'
      };
    } else if (actionType === 'unban') {
      path = `/unban/${banId}`;
      postData = {
        revokeReason: reason || 'No reason given'
      };
    } else {
      throw new Error('Invalid action type');
    }

    const dataStr = JSON.stringify(postData);
    const options = {
      hostname: txAdminUrl,
      port: txAdminPort,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataStr.length,
        'Cookie': cookies
      }
    };

    return await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const json = JSON.parse(body);
              console.log(`[^2\x1b[1mINFO\x1b[0m^7] \x1b[41m\x1b[30m|txApi|\x1b[0m\x1b[1m ^7${actionType.charAt(0).toUpperCase() + actionType.slice(1)}ed player ID: ${playerId || banId} for ${reason}\x1b[0m^0`);
              if (actionType === 'ban' && json.ids && json.ids.length > 0) {
                resolve({ banId: json.ids[0] }); // Use the first ban ID
              } else {
                resolve({ success: true });
              }
            } catch (parseError) {
              reject(`Failed to parse response: ${parseError.message}`);
            }
          } else {
            reject(`Action failed with status ${res.statusCode}: ${body}`);
          }
        });
      });
      req.on('error', reject);
      req.write(dataStr);
      req.end();
    });
  } catch (error) {
    console.log(`[^1\x1b[1mERROR\x1b[0m^7] \x1b[41m\x1b[30m|txApi|\x1b[0m\x1b[1m ${error}\x1b[0m^0`);
    throw error;
  } finally {
    if (cookies) await logout(cookies);
  }
}

// Exports
exports('txApi_banPlayer', async (identifiers, reason, duration) => {
  return await performAction('ban', null, reason, duration, identifiers);
});

exports('txApi_kickPlayer', async (playerId, reason) => {
  return await performAction('kick', playerId, reason);
});

exports('txApi_warnPlayer', async (playerId, reason) => {
  return await performAction('warn', playerId, reason);
});

exports('txApi_unbanPlayer', async (banId, reason) => {
  return await performAction('unban', null, reason, null, null, banId);
});
