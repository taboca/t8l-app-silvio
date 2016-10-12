
doFilter = function (that)  { 

 var title = that.title;
 var image = that.img[0].src+'.jpg';
 var text = that.description;
 var sub = that.subtitle;
 var src = '/channel/destaques/'+image;
 var externallink = '';
 return {'title':title, 'subtitle': sub, 'body': text, 'src':src, 'externallink':externallink};
 //return {'title':title, 'subtitle':desc, 'body': descFull, 'src':src};
} 
