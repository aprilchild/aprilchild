var rubydocURL = "http://www.ruby-doc.org/core/";
var railsURL = "http://api.rubyonrails.com/";

var baseURL = rubydocURL;
var baseURLList = new Array();

// Minimun size of window
var minWidth = 500;
var minHeight = 190;

var minPaneWidth = 185;

var leftPane;
var rightPane;
var dividerResize;

// We keep track if everything is loaded here
var loadedHash = new Array();

// This is where we keep the arrays of links for filtering
var linksHash = new Array();

// Where we keep track of what's current
var currentPane;
var currentDocURL;

var lastFilteredPane;
var lastFilteredTerm;

// Our timer variables
var filterTimer = null;
var filterTimerInterval = 1500;

// Async XMLHttpRequest stuff
var req; // XmlHttpRequest object
var targetDiv; // The target div - where to put the retrieved HTML
var postProcessingCode; // A string containing JS code to execute on callback

var versionReq; // Another XmlHttpRequest object for checking latest version
var currentVersion;

function logDebug(msg) {
  var docoDiv = document.getElementById('docoDiv');
  docoDiv.innerHTML = docoDiv.innerHTML + msg + "<br/>";
}

function setup() {
  // Create the back buttons
  createGenericButton(document.getElementById('doneButton'), 'Go', null);
  createGenericButton(document.getElementById('bookmarkButton'), 'Bookmark', null);
  createGenericButton(document.getElementById('cancelButton'), 'Return', null);
  createGenericButton(document.getElementById('removeBookmark'), 'Remove Bookmark', null);
  createGenericButton(document.getElementById('activateBookmark'), 'Go To Bookmark', null);
    
  // Init all variables etc
  initialize();
  
  // Setup the timers
  if(window.widget) {
    widget.onshow = onWidgetShow;
    widget.onhide = onWidgetHide;
  }
}

function initialize() {

  // Initialize global variables
  loadedHash['files'] = false;
  loadedHash['classes'] = false;
  loadedHash['methods'] = false;

  linksHash['files'] = null;
  linksHash['classes'] = null;
  linksHash['methods'] = null;

  currentPane = "files";
  currentDocURL = "";
  
  lastFilteredPane = "";
  lastFilteredTerm = "";
  
  leftPane = document.getElementById('leftPane');
  rightPane = document.getElementById('rightPane');
  dividerResize = document.getElementById('dividerResize');

  // Get our preferences
  if(window.widget) {    
    // Get the current URL
    var baseURLSetting = widget.preferenceForKey(localKey("baseURLSetting"));
    if (baseURLSetting && baseURLSetting.length > 0) {
        document.getElementById("baseURL").value = baseURLSetting;
        baseURL = baseURLSetting;
    } else {
      widget.setPreferenceForKey(baseURL,localKey("baseURLSetting"));
    }
    
    var doVersionCheck = widget.preferenceForKey(localKey("checkForNewVersions"));
    if(doVersionCheck == null) {
      doVersionCheck = true;
      widget.setPreferenceForKey(doVersionCheck, localKey("checkForNewVersions"));
    }
    document.getElementById("versionCheck").checked = doVersionCheck;
    
    // Do the version check on load
    if(doVersionCheck) checkForNewVersions();
    
    loadBookmarks();
    loadSizePreferences();
  }
  
  // Clear the nav panes
  document.getElementById('classes').innerHTML = '';  
  document.getElementById('files').innerHTML = '';
  document.getElementById('methods').innerHTML = '';
  
  document.getElementById('classesLabel').className = "navLink";
  document.getElementById('filesLabel').className = "navLink";
  document.getElementById('methodsLabel').className = "navLink";
            
  // Get the class list
  getNavPane('classes', baseURL + 'fr_class_index.html');
  
  if(filterTimer != null) clearInterval(filterTimer);
  filterTimer = setInterval('filterObserver()', filterTimerInterval);
}

function onWidgetShow() {
  if(filterTimer != null) filterTimer = setInterval('filterObserver()', filterTimerInterval);  
}

function onWidgetHide() {
  if(filterTimer != null) clearInterval(filterTimer);
}

function saveURL() { 
  if(window.widget) {
    var value = document.getElementById("baseURL").value;
    // Fix the url, if necessary
    if(value.substr(0, 7) != 'http://') value = 'http://' + value;
    if(value.lastIndexOf('/') != (value.length - 1)) value += '/';
    // Save it to preferences
    widget.setPreferenceForKey(value,localKey("baseURLSetting"));
    initialize();    
  }
}

function saveSizePreferences() {
  if(window.widget) {
    widget.setPreferenceForKey(window.innerWidth, localKey("width"));
    widget.setPreferenceForKey(window.innerHeight, localKey("height"));
    widget.setPreferenceForKey(getNavPaneWidth(), localKey("navWidth"));
  }
}

function loadSizePreferences() {
  if(window.widget) {
    var width = widget.preferenceForKey(localKey("width"));
    var height = widget.preferenceForKey(localKey("height"));
    var navWidth = widget.preferenceForKey(localKey("navWidth"));
      
    if( width && height ) 
      window.resizeTo(width, height);

  
    if(navWidth)
      setNavPaneWidth(navWidth);
  }
}

function loadBookmarks() {
  // Get the URL list - this is shared between all widgets, so don't use 'localKey'
  var rawURLList = widget.preferenceForKey("baseURLList");
  if(rawURLList && rawURLList.length > 0) {
    baseURLList = rawURLList.split("!!!");
  } else {
    // Fill up the base list
    baseURLList[0] = rubydocURL;
    baseURLList[1] = railsURL;
  }
  
  // Add the items to the bookmark pulldown  
  var bookmarkList = document.getElementById('bookmarks');
  
  bookmarkList.options.length = 0;
  for(var i = 0; i < baseURLList.length; i++) {
    bookmarkList.options[i] = new Option(baseURLList[i], baseURLList[i]);
    if(bookmarkList.options[i].text == baseURL) bookmarkList.selectedIndex = i;
  }
  
}

function saveBookmarks() {
  if(window.widget) {
    var bookmarkList = document.getElementById('bookmarks');  
    var bookmarkListString = '';
    for(var i = 0; i < bookmarkList.options.length; i++) {
      bookmarkListString += ((i > 0) ? '!!!' : '') + bookmarkList.options[i].text;
    }
    widget.setPreferenceForKey(bookmarkListString, "baseURLList");
  }
}

function addBookmark() {
  if(window.widget) {
    saveURL();
    var bookmarkList = document.getElementById('bookmarks');
    var matchedIndex = -1;
    // Check if it's already in there
    for(var i = 0; i < bookmarkList.options.length; i++) {
      if(baseURL == bookmarkList.options[i].text) {
        matchedIndex = i;
        break;
      }
    }
    // If it's a new entry, insert it
    if(matchedIndex == -1) {
      matchedIndex = bookmarkList.options.length; 
      bookmarkList.options[matchedIndex] = new Option(baseURL, baseURL);
      saveBookmarks();
    }
    bookmarkList.selectedIndex = matchedIndex;
  }
  
}

function removeBookmark() {
  var bookmarkList = document.getElementById('bookmarks');
  if(bookmarkList.selectedIndex != -1) bookmarkList.options[bookmarkList.selectedIndex] = null;
  // Save the bookmarks
  if(window.widget) {
    saveBookmarks();
  }  
}

function activateBookmark() {
  // Copy the current selection into the baseURL
  var bookmarkList = document.getElementById('bookmarks');
  if(bookmarkList.selectedIndex != -1) {
    document.getElementById('baseURL').value = bookmarkList.options[bookmarkList.selectedIndex].text;
    saveURL();
    hideBack();
  }
}

function filterKeyHandler(event) {
  if(event.keyCode == 13) 
    filterCurrentPane();
}

function filterObserver() {
  var filterTerm = document.getElementById('filter').value;
  // Check to see if we're currently filtered correctly
  if((lastFilteredPane != currentPane) || (lastFilteredTerm != filterTerm)) {
    if(loadedHash[currentPane]) {
      filterCurrentPane();
      lastFilteredPane = currentPane;
      lastFilteredTerm = filterTerm;
    }
  }
}

function filterCurrentPane()
{
  // Suspend the filter observer timer so we don't double up on the method call
  if(filterTimer != null) clearInterval(filterTimer);
  
  var filter = new RegExp(document.getElementById('filter').value, 'i');
  var links = linksHash[currentPane];

  var currentNav = document.getElementById(currentPane);
  // Hide the nav pane so it doesn't re-render each element as it iterates through
  // Without this it runs REALLY SLOWLY (even moreso :)
  currentNav.style.display = 'none';

  for(var i = 0; i < links.length; i++) {
    if(links[i].innerHTML.search(filter) == -1) 
      links[i].style.display = 'none';
    else
      links[i].style.display = 'block';
  }

  // Bring it on back now
  currentNav.style.display = 'block';
  
  // Restart the timer
  filterTimer = setInterval('filterObserver()', filterTimerInterval);

}

// Transforms all the <a href=""> links to widget friendly javascript links
function applyAnchorTransforms(rawHTMLText, baseURL) {
  return rawHTMLText.replace(/href=(.)(.*?)\1/g, 'href=$1javascript:openRelativeLink(\'$2\',\'' + baseURL + '\');$1');
}

// This redirects our request to the docoDiv
function openRelativeLink(url, relativeTo) {
  
  if(url[0] == '#') {
    scrollDocoDivToAnchor(url.substring(1, url.length));
  } else {
    // TODO: Check if it's an absolute link or javascript? 
    var urlBase = relativeTo.substring(0, relativeTo.lastIndexOf('/') + 1);
    var urlSections = url.split('#');
    openPageToDocoDiv(urlBase + urlSections[0], url.length > 1 ? urlSections[1] : '' );
  }
}

// Opens the specified RDoc page into the docoDiv
function openPageToDocoDiv(page, anchor) {
  var postProc = '';
  if(anchor === undefined) anchor = '';
  
  // Are we already on this page?
  if(page == currentDocURL) {
    scrollDocoDivToAnchor(anchor);
  } else {
    // Get the new page
    postProc = 'scrollDocoDivToAnchor("' + anchor + '");';
    getRDocPage(page, 'docoDiv', postProc);
  }
}

// Scrolls the doco div to the specified anchor
function scrollDocoDivToAnchor(anchor) {
  var docoDiv = document.getElementById('docoDiv');
  if(anchor.length > 0)
  {
    var anchorTags = docoDiv.getElementsByTagName('A');
    if(anchorTags != null) {
      for(var i = 0; i < anchorTags.length; i++) {
        if(anchorTags[i].name == anchor) {
          docoDiv.scrollTop = anchorTags[i].offsetTop;
          break;
        }
      }
    }
  } else {
    docoDiv.scrollTop = 0;
  }
}

function getNavPane(divName, pageUri) {
  if (!loadedHash[divName]) {
    showLoading(divName);
    getRDocPage(pageUri, 
                divName, 
                'recalcPane("' + divName + '"); loadedHash["'+ divName +'"] = true;');
  } else {
    recalcPane(divName);
  }  
}

function showLoading(divName)
{
  document.getElementById(divName).innerHTML = "Loading " + divName + "..." 
  recalcPane(divName);
}

function recalcPane(element)
{
  if(element != currentPane)
  {
    document.getElementById(currentPane).style.display = "none";
    document.getElementById(currentPane + 'Label').className = "navLink";
    currentPane = element;
    document.getElementById(currentPane).style.display = "block";
    document.getElementById(currentPane + 'Label').className = "navLinkActive";
    // Load the links tags
    linksHash[element] = document.getElementById(currentPane).getElementsByTagName('A');
  }
  //calculateAndShowThumb(document.getElementById(element));
}

// Returns the page
function getRDocPage(page, target, postProc)
{
  if(req == null) {
    req = new XMLHttpRequest();
    req.onreadystatechange = requestCallback;
  }
  
  stopLoading();
  req.abort();
  startLoading();
  currentDocURL = page;
  req.open("GET", currentDocURL, true);
  targetDiv = target;
  postProcessingCode = postProc;
  req.send(null);
  //return req.responseText;
}

// Callback function once request has finished
function requestCallback() {
  // only if req shows "loaded"
  if (req.readyState == 4) {
    // only if "OK"
    if (req.status == 200) {
      document.getElementById(targetDiv).innerHTML = applyAnchorTransforms(req.responseText, currentDocURL);
      eval(postProcessingCode);
    } else {
      var errMsg = "There was a problem retrieving the data:<br/>";
      
      if(req.status === undefined)
        errMsg += "<b>Network error</b>";
      else
        errMsg += "<b>" + req.status + " - " + req.statusText + "</b>";
        
      document.getElementById(targetDiv).innerHTML = errMsg;
      currentDocURL = ''; // Clear this as an error occurred
    }
    stopLoading();
  }
}

// Starts the request to get the latest widget version
function checkForNewVersions() {
  if(versionReq == null) {
    versionReq = new XMLHttpRequest();
    versionReq.onreadystatechange = versionRequestCallback;
  }

  versionReq.abort();
  versionReq.open("GET", "http://widgets.precisionis.com.au/rdoc_version.txt", true);
  versionReq.send(null);
}

// The callback function for when we get our version data back
function versionRequestCallback() {
  if (versionReq.readyState == 4) {
    // Check if 'OK'
    if (versionReq.status == 200) {
      // Get the version text
      var latestVersion = parseFloat(versionReq.responseText);
      var currentVersion = parseFloat(getKeyValue('version.plist', 'CFBundleVersion'));  
      
      if(latestVersion > currentVersion) 
        displayNewVersionMessage(true);
    }
  }
}

// Duh
function displayNewVersionMessage(visible) {
  var messageDiv = document.getElementById('newVersionMessage');
  if(visible && document.getElementById('versionCheck').checked) 
    messageDiv.style.display = 'block';
  else
    messageDiv.style.display = 'none';
}

// The onclick event for the 'new version' checkbox
function versionCheckboxHandler() {
  var isChecked = document.getElementById('versionCheck').checked;
  
  displayNewVersionMessage(false); // Hide the message
  
  // If we've checked it, do the check
  if(isChecked) 
    checkForNewVersions();
  
  // Save the preference
  if(window.widget) {
    widget.setPreferenceForKey(isChecked, localKey("checkForNewVersions"));
  }
}

// Parser for local 'plist' files from Chris @ http://www.dashboardwidgets.com/
function getKeyValue(plist, key) { 
   var xml_http = new XMLHttpRequest(); 
   xml_http.open("GET", plist, false); 
   xml_http.send(null); 
    
   var xml = xml_http.responseXML; 
   var keys = xml.getElementsByTagName("key"); 
   var vals = xml.getElementsByTagName("string"); 
   var key_value; 
    
   for (var i=0; i < keys.length; i++) { 
      if (keys[i].firstChild.data == key) { 
         key_value = vals[i].firstChild.data; 
         break; 
      } 
   } 
    
   return key_value; 
} 

// This allows us to have different storage persistance keys per instance of the widget
function localKey(key) {
  return widget.identifier + "_" + key;
}

// NAV PANE RESIZE CODE
var lastDividerX;

function dividerResizeMouseDown(event) {
  var x = event.x + window.screenX;

  document.addEventListener("mousemove", dividerResizeMouseMove, true);
  document.addEventListener("mouseup", dividerResizeMouseUp, true);
  lastDividerX = x;
  event.stopPropagation();
  event.preventDefault();
  
}

function dividerResizeMouseMove(event) {
  var screenX = event.x + window.screenX;

  // Find the new proposed width
  var newWidth = getNavPaneWidth() + (screenX - lastDividerX);
  var rightPaneWidth = window.innerWidth - newWidth;
  
  // Do the width checking here
  if( (newWidth >= minPaneWidth) && (rightPaneWidth >= minPaneWidth) ) {
    setNavPaneWidth(newWidth);
  }

  lastDividerX = screenX;
  event.stopPropagation();
  event.preventDefault();  
}

function getNavPaneWidth() {
  return parseInt(leftPane.style.width.split('px')[0]);  
}

function setNavPaneWidth(width) {
  leftPane.style.width = width + "px";
  rightPane.style.left = width + "px";  
  dividerResize.style.left = (width - 2) + "px";
}

function dividerResizeMouseUp(event) {
  document.removeEventListener("mousemove", dividerResizeMouseMove, true);
  document.removeEventListener("mouseup", dividerResizeMouseUp, true); 
  event.stopPropagation();
  event.preventDefault();  
  saveSizePreferences();
} 

// WINDOW RESIZE CODE
var lastPos;
function resizeMouseDown(event)
{
    var x = event.x + window.screenX;
    var y = event.y + window.screenY;
        
    document.addEventListener("mousemove", resizeMouseMove, true);
    document.addEventListener("mouseup", resizeMouseUp, true);
    lastPos = {x:x, y:y};
    event.stopPropagation();
    event.preventDefault();
}

function resizeMouseMove(event)
{
    var screenX = event.x + window.screenX;
    var screenY = event.y + window.screenY;
    
    var resizeX = screenX - lastPos.x;
    var resizeY = screenY - lastPos.y;
    
    if( ((window.innerWidth + resizeX) < minWidth) || // Window width
        ((window.innerWidth - getNavPaneWidth() + resizeX) < minPaneWidth) // Right pane width
      ) resizeX = 0;
    
    if( (window.innerHeight + resizeY) < minHeight ) resizeY = 0;
        
    window.resizeBy(resizeX, resizeY);
    
    lastPos = {x:screenX, y:screenY};
    event.stopPropagation();
    event.preventDefault();
}

function resizeMouseUp(event)
{
    document.removeEventListener("mousemove", resizeMouseMove, true);
    document.removeEventListener("mouseup", resizeMouseUp, true); 
    event.stopPropagation();
    event.preventDefault();
    
    saveSizePreferences();
}
