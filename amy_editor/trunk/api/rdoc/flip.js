var flipShown = false;
var flipAnimation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, firstElement:null, timer:null};
var loadingShown = false;
var loadingAnimation = {duration:0, starttime:0, to:1.0, now:0.0, from:0.0, firstElement:null, timer:null};



function enterflip(event)
{
    document.getElementById('fliprollie').style.display = 'block';
}
function exitflip(event)
{
    document.getElementById('fliprollie').style.display = 'none';
}

function startLoading() {

  if (!loadingShown)
  {
      if (loadingAnimation.timer != null)
      {
          clearInterval (loadingAnimation.timer);
          loadingAnimation.timer  = null;
      }
              
      var starttime = (new Date).getTime() - 13;
              
      loadingAnimation.duration = 500;
      loadingAnimation.starttime = starttime;
      loadingAnimation.firstElement = document.getElementById ('loading');
      loadingAnimation.timer = setInterval ("animate(loadingAnimation);", 13);
      loadingAnimation.from = loadingAnimation.now;
      loadingAnimation.to = 1.0;
      animate(loadingAnimation);
      loadingShown = true;
  }  
}

function stopLoading() {
  if (loadingShown)
  {
      // fade in the info button
      if (loadingAnimation.timer != null)
      {
          clearInterval (loadingAnimation.timer);
          loadingAnimation.timer  = null;
      }
              
      var starttime = (new Date).getTime() - 13;
              
      loadingAnimation.duration = 500;
      loadingAnimation.starttime = starttime;
      loadingAnimation.firstElement = document.getElementById ('loading');
      loadingAnimation.timer = setInterval ("animate(loadingAnimation);", 13);
      loadingAnimation.from = loadingAnimation.now;
      loadingAnimation.to = 0.0;
      animate(loadingAnimation);
      loadingShown = false;
  }
}

function showBack()
{
    var front = document.getElementById("front");
    var back = document.getElementById("back");
        
    if (window.widget)
        widget.prepareForTransition("ToBack");
                
    front.style.display="none";
    back.style.display="block";
        
    if (window.widget) {
        if(window.innerWidth < 600) window.resizeTo(600, window.innerHeight)
        setTimeout ('widget.performTransition();', 0);  
    }

    document.getElementById('baseURL').value = baseURL;    
    document.getElementById('baseURL').focus();
}

function hideBack()
{
    // For some reason the rollie doesn't disappear
    document.getElementById('fliprollie').style.display = 'none';

    var front = document.getElementById("front");
    var back = document.getElementById("back");
        
    if (window.widget)
        widget.prepareForTransition("ToFront");
                
    back.style.display="none";
    front.style.display="block";
        
    if (window.widget) {
      setTimeout ('widget.performTransition();', 0);
      loadSizePreferences();  
    }
}

function mousemove (event)
{
    if (!flipShown)
    {
        if (flipAnimation.timer != null)
        {
            clearInterval (flipAnimation.timer);
            flipAnimation.timer  = null;
        }
                
        var starttime = (new Date).getTime() - 13;
                
        flipAnimation.duration = 500;
        flipAnimation.starttime = starttime;
        flipAnimation.firstElement = document.getElementById ('flip');
        flipAnimation.timer = setInterval ("animate(flipAnimation);", 13);
        flipAnimation.from = flipAnimation.now;
        flipAnimation.to = 1.0;
        animate(flipAnimation);
        flipShown = true;
    }
}
function mouseexit (event)
{
    if (flipShown)
    {
        // fade in the info button
        if (flipAnimation.timer != null)
        {
            clearInterval (flipAnimation.timer);
            flipAnimation.timer  = null;
        }
                
        var starttime = (new Date).getTime() - 13;
                
        flipAnimation.duration = 500;
        flipAnimation.starttime = starttime;
        flipAnimation.firstElement = document.getElementById ('flip');
        flipAnimation.timer = setInterval ("animate(flipAnimation);", 13);
        flipAnimation.from = flipAnimation.now;
        flipAnimation.to = 0.0;
        animate(flipAnimation);
        flipShown = false;
    }
}
function animate(obj)
{
    var T;
    var ease;
    var time = (new Date).getTime();
                
        
    T = limit_3(time-obj.starttime, 0, obj.duration);
        
    if (T >= obj.duration)
    {
        clearInterval (obj.timer);
        obj.timer = null;
        obj.now = obj.to;
    }
    else
    {
        ease = 0.5 - (0.5 * Math.cos(Math.PI * T / obj.duration)); ///
        obj.now = computeNextFloat (obj.from, obj.to, ease);
    }
        
    obj.firstElement.style.opacity = obj.now;
}
function limit_3 (a, b, c)
{
    return a < b ? b : (a > c ? c : a);
}
function computeNextFloat (from, to, ease)
{
    return from + (to - from) * ease;
}
