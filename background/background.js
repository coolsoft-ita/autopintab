/*
 * Copyright (C) 2016 Claudio Nicora <coolsoft.ita@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Patterns collection
 * @type Pattern[]
 */
var patterns = [];

// build context menu
BuildContextMenu();


/********************************************************
 * Settings management
 ********************************************************/
/**
 * Initial load
 */
browser.storage.local.get('patterns', function(settings){
  if (typeof settings.patterns != 'undefined' && settings.patterns.constructor == Array) {
    patterns = settings.patterns;
  }
  else {
    patterns = [];
  }
});


/**
 * Attach to settings changes
 */
chrome.storage.onChanged.addListener(function(changes){
  patterns = changes.patterns.newValue;
});


/**
 * First update of context menu items
 */
browser.tabs.query({currentWindow: true, active: true}).then(
  function(tabs){
    // tabs should have only one item
    for (tab of tabs) {
      RefreshContextMenu(tab.url);
    }
  }
);


/********************************************************
 * Tab management
 ********************************************************/
/**
 * Tab create/update handler.
 * NOTE: can't use onCreated event because it doesn't get the opened tab URL.
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
  // check if tab URL is included in pinnable URLs
  if (changeInfo.url && IsPinnable(changeInfo.url)) {
    // set the tab as "pinned"
    browser.tabs.update(tabId, { pinned: true });
  }
});

// intercept tab switching
browser.tabs.onActivated.addListener(TabActivatedHandler);


/**
 * Update context menu status.
 */
function TabActivatedHandler(activeInfo) {
  browser.tabs.get(activeInfo.tabId).then(
    function(tabInfo){
      RefreshContextMenu(tabInfo.url);
    }
  );
}


/**
 * Test if the given URL is pinnable.
 * @param {string} URL to test.
 * @returns {Boolean}
 */
function IsPinnable(url) {
  for (pattern of patterns) {
    if (Matches(pattern, url)) {
      return true;
    }
  }
  return false;
}


/********************************************************
 * Utils
 ********************************************************/
function GetHostname(url) {
  var match = url.match(/^\w*:\/\/.*?\/|about:.*/ig);
  return (match && match.length > 0) ? match[0] : url;
}


/**
 * Test the pattern against the given URL.
 * Returns true if the pattern matches.
 *
 * @returns {Boolean}
 */
function Matches(pattern, url) {
  if (!url || !pattern.enabled) {
    return false;
  }
  else if (pattern.isRegex) {
    return url.match(new RegExp(pattern.pattern));
  }
  else {
    return url == pattern.pattern;
  }
}


/********************************************************
 * Tab management
 ********************************************************/
/**
 * Refresh context menu state
 */
function RefreshContextMenu(url) {
  if (url) {
    var enabled = !IsPinnable(url)
    browser.contextMenus.update("pinUrl", {
      title: "Auto pin \"" + url + "\"",
    });
    var hostname = GetHostname(url);
    browser.contextMenus.update("pinHost", {
      title: "Auto pin \"" + hostname + "*\"",
    });
  }
}


/**
 * Build context menu structure
 */
function BuildContextMenu() {
  browser.contextMenus.create({
    id: "mainMenu",
    title: "AutoPinTab",
    contexts: ["all"]
  });
  browser.contextMenus.create({
    id: "pinUrl",
    title: "...",
    contexts: ["all"],
    parentId: "mainMenu",
    onclick: function(){
      browser.tabs.query({currentWindow: true, active: true}).then(function(tabs){
        // keep only the first element of the returned array
        if (tabs.length) {
          RefreshContextMenu(tabs[0].url);
          patterns.push(new Pattern(tabs[0].url, false));
          SavePatterns(patterns);
        }
      });
    }
  });
  browser.contextMenus.create({
    id: "pinHost",
    title: "...",
    contexts: ["all"],
    parentId: "mainMenu",
    onclick: function(){
      browser.tabs.query({currentWindow: true, active: true}).then(function(tabs){
        // keep only the first element of the returned array
        if (tabs.length) {
          var url = tabs[0].url;
          var hostname = "^" + GetHostname(url).replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          RefreshContextMenu(url);
          patterns.push(new Pattern(hostname, true));
          SavePatterns(patterns);
        }
      });
    }
  });
  browser.contextMenus.create({
    id: "sep1",
    contexts: ["all"],
    type: "separator",
    parentId: "mainMenu",
  });
  browser.contextMenus.create({
    id: "optionsMenu",
    title: "Options...",
    contexts: ["all"],
    parentId: "mainMenu",
    onclick: function(){chrome.runtime.openOptionsPage();}
  });
}
