/*
 * Copyright (C) 2018 Claudio Nicora <coolsoft.ita@gmail.com>
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

(function(){

  // fields
  let patternsContainer = document.querySelector('table.patterns tbody');

  // load settings and update patterns list
  chrome.storage.local.get('patterns', function(settings){
    UpdatePatternsList(settings.patterns || []);
  });
  chrome.storage.onChanged.addListener(function(changes){
    UpdatePatternsList(changes.patterns.newValue || []);
  });

  // attach events to UI elements
  document.getElementById("cmdSave").onclick = Save;
  document.getElementById("cmdAddNew").onclick = AddNew;

  /**
   * Validate an HTML pattern item, add error messages/classes and returns true
   * if the pattern definition is valid, false otherwise.
   *
   * @returns {Pattern|boolean} Returns the defined pattern or false;
   */
  function ValidateHTMLItem(htmlItem) {
    let itemError = htmlItem.querySelector('.pattern-error');
    let pattern = HTML2Pattern(htmlItem);
    let validation = pattern.Validate();

    if (validation !== true) {
      for (let fieldName of Object.keys(validation)) {
        let errorText = validation[fieldName];
        htmlItem.querySelector('input.field-'+fieldName).classList.add('pattern-error');
        itemError.innerHTML = itemError.innerHTML + '<div>' + errorText + '</div>';
        itemError.style.display = "block";
      }
      return false;
    }
    else {
      // reset errors
      htmlItem.querySelector('input').classList.remove('pattern-error');
      itemError.innerHTML = '';
      itemError.style.display = "none";
      return pattern;
    }
  }


  /**
   * Add a new pattern element to list
   */
  function AddNew() {
    let patternId = 'pattern_' + new Date().getTime();
    let $newPatternItem = Pattern2HTML(patternId, new Pattern());
    patternsContainer.appendChild($newPatternItem);
    // give focus to the newly added pattern
    patternsContainer.querySelector('tr:last-child .field-pattern').focus();
  }


  /**
   * Saves the patterns to settings.
   */
  function Save() {

    // build a new patterns collection
    let errorsFound = false;
    let patterns = [];

    // scan pattern HTML items and build patterns
    patternsContainer.querySelectorAll('tr:not(.nopatterns)').forEach(function(item) {
      let pattern = ValidateHTMLItem(item);
      if (pattern === false) {
        // if the pattern is invalid won't save
        errorsFound = true;
      }
      else {
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
   * Fills the patterns list
   * @returns {undefined}
   */
  function UpdatePatternsList(patterns) {
    // cleanup
    while (patternsContainer.firstChild) {
        patternsContainer.removeChild(patternsContainer.firstChild);
    }
    // fill data
    for (let pattern of patterns) {
      patternsContainer.appendChild(Pattern2HTML(pattern));
    }
    patternsContainer.appendChild(document.importNode(document.getElementById('itemTemplateEmpty').content, true));
  }


  /**
   * Return an HTML element with values from the given pattern
   * or an empty (new) pattern element.
   */
  function Pattern2HTML(pattern) {
    // let $template = document.importNode(document.getElementById('itemTemplate').content, true);
    let $template = document.importNode(document.getElementById('itemTemplate').content, true);
    for (let fieldName of Object.keys(pattern)) {
      let $elem = $template.querySelector('.field-' + fieldName);
      if ($elem && $elem.tagName == "INPUT" && $elem.type == "checkbox") {
        $elem.checked = pattern[fieldName];
      }
      else if ($elem) {
        $elem.value = pattern[fieldName];
      }
    }
    // delete button
    $template.querySelector('.cmdDelete').onclick = function(event){
      event.target.parentNode.parentNode.remove();
    };
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
      let $elem = htmlItem.querySelector('.field-' + fieldName);
      if ($elem) {
        if ($elem.tagName == "INPUT" && $elem.type == "checkbox") {
          pattern[fieldName] = $elem.checked;
        } else {
          pattern[fieldName] = $elem.value.trim();
        }
      }
    }
    return pattern;
  }

})();
