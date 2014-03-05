chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.url && !sender.tab.incognito) {
    console.log(request.url);
    chrome.history.addUrl({url: request.url});
  }
});
