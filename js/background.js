chrome.browserAction.onClicked.addListener(function(tab){
	chrome.tabs.executeScript(tab.id, {file:"jQuery/jquery-1.7.2.min.js"});
	chrome.tabs.executeScript(tab.id, {file:"highlight.js"});
	chrome.tabs.executeScript(tab.id,{code:'retriveList("https://raw.github.com/Ciack404/BrowExtTest/master/data.json")'});
});
