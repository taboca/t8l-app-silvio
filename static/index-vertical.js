/* Grids On The Fly */

$(document).ready(function() {

   /* This needs to grows to become the grid system placement */
   /* The exercise here is that we want to load the sub elements and internal 
      iframe pages are ready. */

   register("/main/footer", "cabecalho", "./patrocinadores/index.html?mode=tv", iframeTemplate);
  // register("/main/middle", "meio", "./galeria/index.html", iframeTemplate);
   register("/main/topheader", "topo", "./header-vertical/index.html", iframeTemplate);
   register("/main/topheader", "topo", "./header-vertical/index.html", iframeTemplate);
   register("/main/topmiddle", "destaques", "./destaques/index.html", iframeTemplate);
   register("/main/bottomsection2", "tweeter", "./twitter-new/index.html", iframeTemplate);
   register("/main/topmiddleright", "noticias", "./noticias/index.html", iframeTemplate);
   //register("/main/bottomsection", "identica", "./galeria-cache/index.html", iframeTemplate);
   register("/main/bottomsection", "identica", "./galeria/index.html", iframeTemplate);

   //register("/main/climatempo", "clima", "./clima/index.html", iframeTemplate);
   register("/main/hora", "hora", "./tempo/index.html", iframeTemplate);
   register("/main/data", "data", "./tempo/date.html", iframeTemplate);
   compile();   
   setTimeout('startEngine()',5000);

});

function startEngine() { 
   s1();
//   setTimeout("cicleMidia()",TEMPO_INICIO_MIDIA);
} 

function cicleMidia() { 
   setTimeout( function () { 
	var doc = $("#main #middle #abas").get();
	doc = document.getElementById("meio").contentDocument;
	cc.send( doc.getElementById("galeria").contentDocument, "container", "rotate");
	cicleMidia();
   }, TEMPO_REFRESH_MIDIA);
} 

function s1() { 
  if(document.location.toString().indexOf("mode")>-1) { 
    var param = document.location.toString().split("mode=");
    if(param[1]=="tv") { 
      document.getElementById("viewport").style.width="1080";
      document.getElementById("viewport").style.height="1920";
      animate();
    } 
  } 
} 

function animate() { 
  tv.setup();
  tv.add($('#animation li'));
  tv.play();
  setTimeout("animate()",TEMPO_REFRESH);
} 


