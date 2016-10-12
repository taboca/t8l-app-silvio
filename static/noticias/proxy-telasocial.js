
doFilter = function (that)  { 

 var title = $(that).find('title').text();
 var image = $(that).find('img').attr('src');

 var link = $(that).find('subtitle').text();
 $('#temp').html(link);
 var sub = $('#temp').text();

 var link = $(that).find('description').text();
 $('#temp').html(link);
 var text = $('#temp').text();

 var link = $(that).find('link').text();
 $('#temp').html(link);
 var externallink = $('#temp').text();

 var src = 'http://fotos.mixar.com.br'+image;

 return {'title':title, 'subtitle': sub, 'body': text, 'src':src, 'externallink':externallink};
 //return {'title':title, 'subtitle':desc, 'body': descFull, 'src':src};
} 
