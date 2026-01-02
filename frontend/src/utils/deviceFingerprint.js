import {UAParser} from 'ua-parser-js';

export function collectDeviceFingerprint() {
  const nav = window.navigator;
  const screen = window.screen;

  const parser = new UAParser(nav.userAgent);
  const result = parser.getResult();

  const deviceData = {
    userAgent: nav.userAgent,
    language: nav.language,
    colorDepth: screen.colorDepth,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: nav.platform,
    canvas: getCanvasFingerprint()
  };

  return {
    hash: generateHash(JSON.stringify(deviceData)),
    browser: result.browser.name || 'Unknown',
    os: `${result.os.name} ${result.os.version || ''}`.trim() || 'Unknown',
    deviceType: result.device.type === 'mobile' ? 'Mobile' : (result.device.type === 'tablet' ? 'Tablet' : 'Desktop'),
    screenResolution: deviceData.screenResolution,
    timezone: deviceData.timezone,
    language: deviceData.language
  };
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Session-Mgmt', 2, 15);
    return canvas.toDataURL();
  } catch (e) {
    return 'unsupported';
  }
}

// function parseUserAgent(userAgent) {
//   const result = {
//     browser: 'Unknown',
//     os: 'Unknown',
//     deviceType: 'Desktop'
//   };

//   if (userAgent.includes('Chrome')) result.browser = 'Chrome';
//   else if (userAgent.includes('Firefox')) result.browser = 'Firefox';
//   else if (userAgent.includes('Safari')) result.browser = 'Safari';
//   else if (userAgent.includes('Edge')) result.browser = 'Edge';

//   if (userAgent.includes('Windows')) result.os = 'Windows';
//   else if (userAgent.includes('Mac')) result.os = 'MacOS';
//   else if (userAgent.includes('Linux')) result.os = 'Linux';
//   else if (userAgent.includes('Android')) result.os = 'Android';
//   else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) result.os = 'iOS';

//   if (/Mobile|Android|iPhone/i.test(userAgent)) result.deviceType = 'Mobile';
//   else if (/Tablet|iPad/i.test(userAgent)) result.deviceType = 'Tablet';

//   return result;
// }

function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}