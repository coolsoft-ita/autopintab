AutoPinTab extension
====================
This Firefox extension will automatically pin new tabs based on their URL.

To decide the tabs to automatically pin, user must define a set of patterns.  
A pattern could be a plain text URL (like `http://www.google.com`) or a
JavaScript [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Writing_a_regular_expression_pattern)
pattern like `^https?\/\/www\.google\.com\/`.

Installation
------------
Standard AutoPinTab releases must be installed through [Firefox Addons website](https://addons.mozilla.org/).

Development (unsigned) releases requires some manual steps:
- clone extension [GIT repository](https://github.com/coolsoft-ita/autopintab.git) to a local folder
- open `about:debugging` on Firefox
- click "Load Temporary Add-on" button and select `manifest.json` from cloned source files

**NOTE:** the development version will be loaded temporarily, so it must be reloaded again each time you restart your browser.

Usage
-----
Open a tab you want to be automatically pinned, right-click on its content and select the new AutoPinTab context menu item.

This menu contains items to quickly add current URL to your AutoPinTab patterns.  
**NOTE:** a disabled item means that the tab is already auto-pinned.

Once added you can reload the tab (or open a new one) and check if it gets pinned automatically.

Licensing
---------
AutoPinTab is open source software, licensed under MPL.  
Source code is available here: https://github.com/coolsoft-ita/autopintab.git

If you like it, feel free to support its development:
visit its [homepage](http://coolsoft.altervista.org/autopintab) and click on **Donate**.

## Credits
- [jQuery library](https://jquery.com)  
  Great multipurpose JS library
- [Flat icons P2 by Solidicons](http://www.myiconfinder.com/icon/color-colour-svg-png-eps-base-isoicons-map-marker-pin-thumb-push-workspace-thumb-pin/1110)  
  Extension icon
