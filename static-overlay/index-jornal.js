$(document).ready(function() {

  register("/main/qqqqqqqqqqqqqqqq", "0.698045977995738", "./header/index.html", iframeTemplate);
  register("/main/wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww", "destaques", "./destaques/index.html", iframeTemplate);
  register("/main/eeeeeeeeeeeeeeeeeeeeeeee", "0.7342910511830653", "./noticias/index.html", iframeTemplate);
//  register("/main/flyershow", "flyer", "./flyer/index.html", iframeTemplate);
  register("/main/flyershow", "flyer", "./grade/index.html", iframeTemplate);
  register("/main/ttttttttttttttt", "0.8841019960292364", "./news/index.html", iframeTemplate);
  register("/main/yyyyyyyyy", "0.8448067060305994", "./weather/index.html", iframeTemplate);
  register("/main/uuuuuuuuuuuuuuuu", "0.13553831341819889", "./twitter-new/index.html", iframeTemplate);

  compile();
  
});

function animate() {
  tv.add($('#animation li'));
  tv.play(document.getElementById('meio').contentDocument);
  setTimeout("animate()",TEMPO_REFRESH);
}
