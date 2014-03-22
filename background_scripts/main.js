chrome.runtime.onMessage.addListener(function(request, sender) {
  switch (request.action) {
    case "addHistory":
      if (request.url && !sender.tab.incognito) {
        chrome.history.addUrl({url: request.url});
      }
      break;
    case "openLink":
      if (request.url) {
        chrome.tabs.create({url: request.url, index: sender.tab.index + 1});
      }
      break;
    default:
      break;
  }
});
