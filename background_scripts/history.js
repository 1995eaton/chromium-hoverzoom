chrome.runtime.onMessage.addListener(function(request) {
  if (request.url) {
    chrome.history.addUrl({url: request.url});
  }
});
