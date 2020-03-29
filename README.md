AutoPinTab extension
====================
Firefox extension that automatically pins new tabs based on their URL.

To decide the tabs to automatically pin, user must define a set of patterns.  
A pattern could be a plain text URL (like `http://www.google.com`) or a
JavaScript [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Writing_a_regular_expression_pattern)
pattern like `^https?//www\.google\.com/`.

Installation
------------
Official (signed) AutoPinTab releases must be installed through
[Firefox Addons website](https://addons.mozilla.org/firefox/addon/autopintab/).

Development releases are **unsigned** so they require some manual steps to be loaded on Firefox standard edition:
- download master branch in a [ZIP archive](https://github.com/coolsoft-ita/autopintab/archive/master.zip), then extract it in a folder of your choice **OR** clone the whole [GIT repository](https://github.com/coolsoft-ita/autopintab.git)
- open `about:debugging` on Firefox
- click "Load Temporary Add-on" button and select `manifest.json` from extracted/cloned source files

To avoid these steps you can install Firefox Developer edition
(it can be installed side-by-side with standard edition).

**NOTE:** the unsigned AutoPinTab release will be loaded temporarily,
so it must be reloaded each time you restart the browser.

Usage
-----
Open a tab you want to be automatically pinned, right-click on its content and
select the new AutoPinTab context menu item.

This menu contains items to quickly add current URL to your AutoPinTab patterns.  

Now reload the tab (or open a new one) and check if it gets pinned automatically.

Licensing
---------
AutoPinTab is open source software, licensed under GPLv3.  
Source code is available here: https://github.com/coolsoft-ita/autopintab.git

If you like it, feel free to support its development:
visit its [homepage](http://coolsoft.altervista.org/autopintab) and click on **Donate**.

## Credits
- [jQuery library](https://jquery.com)  
  Great multipurpose JS library
- [Flat icons P2 by Solidicons](http://www.myiconfinder.com/icon/color-colour-svg-png-eps-base-isoicons-map-marker-pin-thumb-push-workspace-thumb-pin/1110)  
  Extension icon

Changelog
---------

## v.1.2.0 - 2020-03-29
- Added new feature to Import/Export settings.

## v.1.1.1 - 2019-11-28
- Fixed Options page colors when Firefox Dark mode is enabled.

## v.1.1.0 - 2018-08-23
- Options dialog now show patterns in a table.
- Fixed context menu items not always updating.

## v.1.0.1 - 2017-07-19
- Fixed CSS that caused options dialog checkboxes to disappear.

## v.1.0.0 - 2016-11-30
- First release.
