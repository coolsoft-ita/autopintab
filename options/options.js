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

$(function(){

  // reference to background page
  var bgPage = chrome.extension.getBackgroundPage();

  // fields
  var tblPatterns = $('#tblPatterns');

  // load settings and update patterns list
  chrome.storage.local.get('patterns', function(settings){
    UpdatePatternsList(settings.patterns || []);
  });
  chrome.storage.onChanged.addListener(function(changes){
    UpdatePatternsList(changes.patterns.newValue || []);
  });

  // attach events to UI elements
  $('#cmdSave').click(SavePatterns);
  $('#cmdAddNew').click(AddNewPattern);


  /**
   * Validate an HTML pattern item, add error messages/classes and returns true
   * if the pattern definition is valid, false otherwise.
   *
   * @returns {Pattern} Returns the defined pattern or false;
   */
  function ValidateHTMLItem(htmlItem) {

    var itemError = htmlItem.find('.pattern-error');
    var pattern = HTML2Pattern(htmlItem);
    var validation = pattern.Validate();

    if (validation !== true) {
      $.each(validation, function(fieldName, errorText){
        htmlItem.find('input.field-'+fieldName).addClass('pattern-error');
        itemError.html(itemError.html() + '<div>' + errorText + '</div>');
        itemError.show();
      });
      return false;
    }
    else {
      // reset errors
      htmlItem.find('input').removeClass('pattern-error');
      itemError.html('');
      itemError.hide();
      return pattern;
    }
  }


  /**
   * Add a new pattern element to list
   */
  function AddNewPattern() {
    // remove the .nopatterns-tag item, if exists
    tblPatterns.children('.nopatterns').remove();
    // add the new pattern
    var patternId = 'pattern_' + new Date().getTime();
    var $newPatternItem = Pattern2HTML(patternId, new bgPage.Pattern());
    tblPatterns.append($newPatternItem);
    // give focus to the newly added pattern
    $newPatternItem.find('.field-pattern').focus().select();
  }


  /**
   * Saves the patterns to settings.
   */
  function SavePatterns() {

    // build a new patterns collection
    var errorsFound = false;
    var patterns = [];

    // scan pattern HTML items and build patterns
    var res = $('.patterns tbody.pattern');
    $('.patterns tbody.pattern').each(function(){
      var item = $(this);
      var pattern = ValidateHTMLItem(item);
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
      bgPage.SavePatterns(patterns);
    }

  }


  /**
   * Fills the patterns list
   * @returns {undefined}
   */
  function UpdatePatternsList(patterns) {
    // cleanup
    tblPatterns.find('tbody').remove();
    // fill data
    for (pattern of patterns) {
      tblPatterns.append(Pattern2HTML(pattern));
    }
    if (tblPatterns.children().length == 0) {
      tblPatterns.append($('#itemTemplateEmpty').html());
    }
  }


  /**
   * Return an HTML element with values from the given pattern
   * or an empty (new) pattern element.
   */
  function Pattern2HTML(pattern) {
    var $template = $($('#itemTemplate').html());
    for (fieldName of Object.keys(pattern)) {
      var $elem = $template.find('.field-' + fieldName).first();
      if ($elem.is(':checkbox')) {
        $elem.prop('checked', pattern[fieldName]);
      }
      else {
        $elem.val(pattern[fieldName]);
      }
    }
    // delete button
    $template.find('.cmdDelete').click(function(){
      if (confirm('Delete this pattern?')) {
        $(this).closest('tbody').remove();
      }
    });
    return $template;
  }


  /**
   * Return a pattern object built from its HTML LI element.
   *
   * @returns {Pattern}
   */
  function HTML2Pattern(htmlItem) {
    var pattern = new bgPage.Pattern();
    for (fieldName of Object.keys(pattern)) {
      let $elem = htmlItem.find('.field-' + fieldName);
      if ($elem.length) {
        if ($elem.is(':checkbox')) {
          pattern[fieldName] = $elem.prop('checked');
        }
        else {
          pattern[fieldName] = $elem.val().trim();
        }
      }
    }
    return pattern;
  }

});
