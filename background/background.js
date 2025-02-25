/*
 * Copyright (C) 2025 Claudio Nicora <coolsoft.ita@gmail.com>
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
var cfgReorderTabs = false;

/**
 * Tabs priority (key=tabId, value=priority)
 */
var tabsOrder = new Map();

// build context menu
BuildContextMenu();


/********************************************************
 * Settings management
 ********************************************************/
/**
 * Initial load
 */
browser.storage.local.get(null, settings => {

  patterns =  (typeof settings.patterns != 'undefined' && settings.patterns.constructor == Array)
    ? settings.patterns
    : [];

  if (typeof settings[CFG_REORDER_TABS] != 'undefined') {
    cfgReorderTabs = settings[CFG_REORDER_TABS];
  }

});


/**
 * Attach to settings changes
 */
chrome.storage.onChanged.addListener(changes => {
  if (typeof changes.patterns != 'undefined' && changes.patterns.constructor == Array) {
    patterns = changes.patterns.newValue;
  }
  if (typeof changes[CFG_REORDER_TABS] != 'undefined') {
    cfgReorderTabs = changes[CFG_REORDER_TABS].newValue;
  }
});


/********************************************************
 * Tab management
 ********************************************************/
/**
 * Tab create/update handler.
 * NOTE: can't use onCreated event because it doesn't get the opened tab URL.
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    // check if tab URL is included in pinnable URLs
    newUrl = changeInfo.url || tabInfo.url;
    let pattern;
    if (newUrl && null !== (pattern = IsPinnable(newUrl))) {
        // store pattern index, will be used to order pinned tabs
        tabsOrder.set(tabId, patterns.indexOf(pattern));
        // set the tab as "pinned"
        if (!tabInfo.pinned) {
            browser.tabs.update(tabId, { pinned: true });
            if (cfgReorderTabs) {
              ReorderPinnedTabs();
            }
        }
    }
});

/**
 * Tab close handler.
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  tabsOrder.delete(tabId);
});


/**
 * Reorder pinned tab using pattern priority
 */
function ReorderPinnedTabs()
{
    // sort tabsOrder Map by value (was the index of pattern in patterns list)
    let arr = []
    tabsOrder.forEach(function(priority, tabId, map){
        arr.push([ tabId, priority ]);
    });
    arr.sort((a, b) => { let x = a[1] - b[1]; return x ? x : a[0] - b[0]; })
    // list of tabIDs in pattern order
    let tabIDs = [];
    for (var elem of arr) {
        tabIDs.push(elem[0]);
    }
    // move tabs
    browser.tabs.move(tabIDs, { index: 0 });
}


/********************************************************
 * Utils
 ********************************************************/

/**
 * Extract the hostname from the given URL.
 *
 * @param url URL to test.
 * @returns {string}
 */
function GetHostname(url) {
    let match = url.match(/^\w*:\/\/.*?\/|about:.*|chrome:.*/ig);
    return (match && match.length > 0) ? match[0] : url;
}


/**
 * Test if the given URL is pinnable.
 *
 * @param {string} URL to test.
 * @returns {null|Pattern}
 * Returns the matching patterns or null.
 */
function IsPinnable(url) {
    for (let pattern of patterns) {
        if (Matches(pattern, url)) {
            return pattern;
        }
    }
    return null;
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
 * Context menu management
 ********************************************************/

/**
 * Refresh context menu state when the menu is opened
 */
browser.contextMenus.onShown.addListener(async function(info, tab) {
    if (tab.url) {
        browser.contextMenus.update("pinUrl", {
            title: "Auto pin \"" + tab.url + "\"",
        });
        let hostname = GetHostname(tab.url);
        browser.contextMenus.update("pinHost", {
            title: "Auto pin \"" + hostname + "*\"",
        });
        // force redraw of menu items (the popup menu was already shown)
        browser.contextMenus.refresh();
    }
});


/**
 * Build context menu structure
 */
function BuildContextMenu() {
    browser.contextMenus.create({
        id: "mainMenu",
        title: "AutoPinTab",
        contexts: ["all", "tab"]
    });
    browser.contextMenus.create({
        id: "pinUrl",
        title: "...",
        contexts: ["all", "tab"],
        parentId: "mainMenu",
        onclick: function(){
            browser.tabs.query({currentWindow: true, active: true}).then(function(tabs){
                // keep only the first element of the returned array
                if (tabs.length) {
                    patterns.push(new Pattern(tabs[0].url, false));
                    SavePatterns(patterns);
                }
            });
        }
    });
    browser.contextMenus.create({
        id: "pinHost",
        title: "...",
        contexts: ["all", "tab"],
        parentId: "mainMenu",
        onclick: function(){
            browser.tabs.query({currentWindow: true, active: true}).then(function(tabs){
              // keep only the first element of the returned array
                if (tabs.length) {
                    let url = tabs[0].url;
                    let hostname = "^" + GetHostname(url).replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
                    patterns.push(new Pattern(hostname, true));
                    SavePatterns(patterns);
                }
            });
        }
    });
    browser.contextMenus.create({
        id: "sep1",
        contexts: ["all", "tab"],
        type: "separator",
        parentId: "mainMenu",
    });
    browser.contextMenus.create({
        id: "optionsMenu",
        title: "Options...",
        contexts: ["all", "tab"],
        parentId: "mainMenu",
        onclick: function(){chrome.runtime.openOptionsPage();}
    });
}
