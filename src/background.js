'use strict';

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') {
    return;
  }

  // Create an alarm so we have something to look at in the demo
  await chrome.alarms.create('demo-default-alarm', {
    delayInMinutes: 0,
    // periodInMinutes: 1440,
    periodInMinutes: 0.3,
  });
});
