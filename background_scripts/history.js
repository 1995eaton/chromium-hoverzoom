chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.url && !sender.tab.incognito) {
    chrome.history.addUrl({url: request.url});
  }
});
