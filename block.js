// block.js
const params = new URLSearchParams(window.location.search);
const blockedUrl = params.get('blockedUrl');
const blockedDomain = blockedUrl ? new URL(blockedUrl).hostname : null;

async function updateAndShowCount() {
  if (!blockedDomain) return;
  const { overrideCounts = {} } = await chrome.storage.local.get('overrideCounts');
  const count = overrideCounts[blockedDomain] || 0;
  document.getElementById('count').innerText = `You've overridden this ${count} time(s).`;
}

 async function manageOverrideCounts() {
   const { overrideCounts = {} } = await chrome.storage.local.get('overrideCounts');
   const currentCount = overrideCounts[blockedDomain] || 0;
   overrideCounts[blockedDomain] = currentCount + 1;
   await chrome.storage.local.set({ overrideCounts });
 }

 function overrideBlock() {
          const until = Date.now() + 15 * 60 * 1000; // 15 minutes
          chrome.storage.local.set({ letMeInExpiry: until }, function() {
            chrome.runtime.sendMessage({ overrideUntil: until, blockedDomain });
            if (blockedUrl) {
              window.location.href = blockedUrl;
            }
          });
        }
document.addEventListener("DOMContentLoaded", () => {
          document.getElementById('overrideButton').onclick = function() {
            const letMeInExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes from now
            chrome.storage.local.set({ letMeInExpiry }, function() {
              alert('Access granted for the next 15 minutes.');
              if (blockedUrl) {
                window.location.href = blockedUrl;
              }
            });
          };
        });


 setInterval(() => {
   const expiry = localStorage.getItem('letMeInExpiry');
   if (expiry && Date.now() > expiry) {
     localStorage.removeItem('letMeIn');
     localStorage.removeItem('letMeInExpiry');
   }
 }, 60000);  // Check every minute
