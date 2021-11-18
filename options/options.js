/*
 * Copyright (C) 2021 Claudio Nicora <coolsoft.ita@gmail.com>
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

$(function () {
  // fields
  let patternsContainer = $('table.patterns tbody');

  // load settings and update patterns list
  chrome.storage.local.get('patterns', function (settings) {
    UpdatePatternsList(settings.patterns || []);
  });
  chrome.storage.onChanged.addListener(changes => {
    if (changes.patterns !== undefined) {
      UpdatePatternsList(changes.patterns.newValue || []);
    }
  });

  // attach events to UI elements
  $('#cmdSave').click(Save);
  $('#cmdAddNew').click(AddNew);
  $('#cmdImport').click(() => {
    $('#importFile').click();
  });
  $('#chkReorderTabs').click((e) => {
    SaveConfig(CFG_REORDER_TABS, e.currentTarget.checked);
  });
  $('#importFile').change(function (e) {
    Import(this.files);
  });
  $('#cmdExport').click(Export);

  /**
   * Validate an HTML pattern item, add error messages/classes and returns true
   * if the pattern definition is valid, false otherwise.
   *
   * @returns {Pattern|boolean} Returns the defined pattern or false;
   */
  function ValidateHTMLItem(htmlItem) {
    // reset errors
    htmlItem.find('input').removeClass('pattern-error');
    htmlItem.find('.field-error').hide();

    let pattern = HTML2Pattern(htmlItem);
    let validation = pattern.Validate();

    if (validation !== true) {
      $.each(validation, function (fieldName, errorText) {
        htmlItem.find('input.field-' + fieldName).addClass('pattern-error');
        let itemError = htmlItem.find('.' + fieldName + '-error');
        itemError.text(errorText);
        itemError.show();
      });
      return false;
    }
    return pattern;
  }

  /**
   * Add a new pattern element to list
   */
  function AddNew() {
    // remove the .nopatterns-tag item, if exists
    patternsContainer.children('.nopatterns').remove();
    // add the new pattern
    let patternId = 'pattern_' + new Date().getTime();
    let $newPatternItem = Pattern2HTML(new Pattern());
    patternsContainer.append($newPatternItem);
    // give focus to the newly added pattern
    $newPatternItem.find('.field-pattern').focus().select();
  }

  /**
   * Saves the patterns to settings.
   */
  function Save() {
    // build a new patterns collection
    let errorsFound = false;
    let patterns = [];

    // scan pattern HTML items and build patterns
    patternsContainer.find('tr').each(function () {
      let item = $(this);
      let pattern = ValidateHTMLItem(item);

      if (pattern === false) {
        // if the pattern is invalid won't save
        errorsFound = true;
      } else {
        // save the pattern
        patterns.push(pattern);
      }
    });

    if (!errorsFound) {
      // save patterns (it will refresh the list)
      SavePatterns(patterns);
    }
  }

  /**
   * Import patterns from JSON file.
   */
  function Import(files) {
    const file = files[0] || null;
    if (file) {
      if (!file.type.endsWith('/json')) {
        alert('Need to select a JSON file');
        return;
      }

      // function to import JSON data
      let doImport = function (text) {
        let data = JSON.parse(text);
        // populate new patterns array
        let newPatterns = [];
        for (id in data.patterns) {
          let srcPattern = data.patterns[id];
          let newPattern = new Pattern();
          for (const key of Object.keys(newPattern)) {
            if (srcPattern.hasOwnProperty(key)) {
              newPattern[key] = srcPattern[key];
            }
          }
          newPatterns.push(newPattern);
        }
        // store the new patterns to settings
        SavePatterns(newPatterns);
      };

      // Firefox ESR (v68.x) does not have Blob.text() method, so we need a workaround
      if (typeof Blob.prototype.text != 'undefined') {
        file.text().then(function (text) {
          doImport(text);
        });
      } else {
        const reader = new FileReader();
        reader.addEventListener('loadend', function (e) {
          doImport(e.srcElement.result);
        });
        reader.readAsText(file);
      }
    }
  }

  /**
   * Export patterns to JSON file.
   */
  function Export() {
    chrome.storage.local.get('patterns', function (settings) {
      // create object URL for JSON data to download
      let settingsBlob = new Blob([JSON.stringify(settings, null, ' ')], {
        type: 'text/json',
      });
      let settingsUrl = URL.createObjectURL(settingsBlob);

      // download it to user
      let downloading = chrome.downloads.download({
        url: settingsUrl,
        filename: 'autopintab-settings.json',
        conflictAction: 'overwrite',
        saveAs: true,
      });
    });
  }

  /**
   * Fills the patterns list
   * @returns {undefined}
   */
  function UpdatePatternsList(patterns) {
    // cleanup
    patternsContainer.children().remove();
    // fill data
    for (let pattern of patterns) {
      patternsContainer.append(Pattern2HTML(pattern));
    }
    if (patternsContainer.children().length == 0) {
      patternsContainer.append($('#itemTemplateEmpty').html());
    }
  }

  /**
   * Return an HTML element with values from the given pattern
   * or an empty (new) pattern element.
   */
  function Pattern2HTML(pattern) {
    let $template = $($('#itemTemplate').html());
    for (let fieldName of Object.keys(pattern)) {
      let $elem = $template.find('.field-' + fieldName).first();
      if ($elem.is(':checkbox')) {
        $elem.prop('checked', pattern[fieldName]);
      } else {
        $elem.val(pattern[fieldName]);
      }
    }
    // delete button
    $template.find('.cmdDelete').click(function () {
      $(this).closest('tr').remove();
    });
    // add drag&drop functionality
    $template.find('.drag-handle').on('mousedown', RowDragDrop);
    return $template;
  }

  /**
   * Return a pattern object built from its HTML LI element.
   *
   * @returns {Pattern}
   */
  function HTML2Pattern(htmlItem) {
    let pattern = new Pattern();
    for (let fieldName of Object.keys(pattern)) {
      let elem = htmlItem.find('.field-' + fieldName);
      if (elem.length) {
        if (elem.is(':checkbox')) {
          pattern[fieldName] = elem.prop('checked');
        } else if (elem.is('[type="number"]')) {
          pattern[fieldName] = Number(elem.val());
        } else {
          pattern[fieldName] = elem.val().trim();
        }
      }
    }
    return pattern;
  }

  /**
   * Table row sort with mouse drag&drop
   */
  function RowDragDrop(e) {
    let tr = $(e.target).closest('tr');
    let sy = e.pageY;
    let drag = false;
    if ($(e.target).is('tr')) {
      tr = $(e.target);
    }
    let index = tr.index();
    $(tr).addClass('grabbed');
    function move(e) {
      if (!drag && Math.abs(e.pageY - sy) < 10) return;
      drag = true;
      tr.siblings().each(function () {
        let s = $(this);
        let i = s.index();
        let y = s.offset().top;
        if (e.pageY >= y && e.pageY < y + s.outerHeight()) {
          if (i < tr.index()) {
            s.insertAfter(tr);
          } else {
            s.insertBefore(tr);
          }
          return false;
        }
      });
    }
    function up(e) {
      if (drag && index != tr.index()) {
        drag = false;
      }
      $(document).unbind('mousemove', move).unbind('mouseup', up);
      $(tr).removeClass('grabbed');
    }
    $(document).mousemove(move).mouseup(up);
  }
});
