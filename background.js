
const BLOCKED_DOMAINS = [
  'mail.google.com',
  'outlook.office.com',
  'teams.microsoft.com',
  'web.whatsapp.com',
  'app.asana.com'
];

const ALLOWED_WINDOWS = [
  { start: '11:00', end: '11:15' },
  { start: '15:00', end: '15:15' },
  { start: '18:00', end: '18:15' }
];

function isNowAllowed() {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  return ALLOWED_WINDOWS.some(({ start, end }) => currentTime >= start && currentTime <= end);
}
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) {
    return;
  }
  const url = new URL(tab.url);
  const domain = url.hostname;

  if (BLOCKED_DOMAINS.includes(domain)) {
    const isAllowedNow = isNowAllowed();

    // Retrieve the overrides from storage
    const { overrideUntil } = await chrome.storage.local.get("overrideUntil");
    const overrideActive = overrideUntil && new Date().getTime() < overrideUntil;

    const { letMeInExpiry } = await chrome.storage.local.get("letMeInExpiry");
    const letMeInActive = letMeInExpiry && new Date().getTime() < letMeInExpiry;

    // Block the page unless it's allowed by time or an override is active
    if (!(isAllowedNow || overrideActive || letMeInActive)) {
      chrome.tabs.update(tabId, {
        url: chrome.runtime.getURL('block.html') + '?blockedUrl=' + encodeURIComponent(tab.url)
      });
    }
  }
});
