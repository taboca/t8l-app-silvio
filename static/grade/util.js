

function doFilter(str, authorContainer) {
    //return str;
    $('#temp').html(str);
    var str = $('#temp').text();
    var fontSize = INNER_FONT_SIZE+3;

    var s = str.split(' ');
    var authorProposal = '';
    if(authorContainer) {
        if(typeof gridMaker.candidates[authorContainer] != 'undefined') {
            authorProposal = gridMaker.candidates[authorContainer][0];
        }
    }
    cor1 = parseInt(Math.random()*155);
    cor2 = parseInt(Math.random()*155);
    cor3 = parseInt(Math.random()*155);
    htmlMarkup = '<span class="zone" style="display:inline-block;background-color:rgb('+cor1+','+cor2+','+cor3+');"></span><span class="author" >'+authorProposal+'</span><br>';
    var opacity = 9;
    for (var i=0;i<s.length;i++) {
        var el = s[i];
        var elMark = '<span class="talk" style="opacity:0.'+opacity+';margin-right:3px;font-size:'+fontSize+'px">'+el+'</span>';
        if(i<9) {
          opacity--;
        }
       // var elMark = '<span style="color:white;padding:.1em">'+el+'</span>';
        fontSize-=1;
        htmlMarkup+=elMark;
    }
    return htmlMarkup;
}


/* http://tools.ietf.org/html/rfc5545
   This will go up to the minutes */


function durationToMinutes(strDuration) {
  	// example P15DT5H0M20S
	var countMin = 0;
	if(strDuration.indexOf('P') > -1 ) {
 		strDuration=strDuration.split('P')[1];
		if(strDuration.indexOf('D') > -1 ) {
			var splitter = strDuration.split('D');
			strDuration=splitter[1];
			countMin += parseInt(splitter[0])*60*24;
		}
		if(strDuration.indexOf('T') > -1) {
			strDuration=strDuration.split('T')[1];
			if(strDuration.indexOf('H') > -1 ) {
				var splitter=strDuration.split('H');
				strDuration=splitter[1];
				countMin += parseInt(splitter[0])*60;
			}
			if(strDuration.indexOf('M') > -1 ) {
				var splitter=strDuration.split('M');
				strDuration=splitter[1];
				countMin += parseInt(splitter[0]);
			}
		}
	}
	return countMin;
}

function eventsBySortedHours(values) {
   var array_with_keys = [];
   for (var i = 0; i < values.length; i++) {
     array_with_keys.push({ key: i, value: values[i] });
   }
   array_with_keys.sort(function(a, b) {
    if (parseInt(a.value) < parseInt(b.value)) { return -1; }
    if (parseInt(a.value) > parseInt(b.value)) { return  1; }
    return 0;
   });
   var keys = [];
   for (var i = 0; i < array_with_keys.length; i++) {
     keys.push(array_with_keys[i].key);
   }
   return keys;
}

function getUnicodeCharacter(cp) {
    if (cp >= 0 && cp <= 0xD7FF || cp >= 0xE000 && cp <= 0xFFFF) {
      return String.fromCharCode(cp);
    } else if (cp >= 0x10000 && cp <= 0x10FFFF) {
      cp -= 0x10000;
      var first = ((0xffc00 & cp) >> 10) + 0xD800
      var second = (0x3ff & cp) + 0xDC00;
      return String.fromCharCode(first) + String.fromCharCode(second);
    }
}

function strToMins(item) {
  var currHour  = item.split(':');
  return parseInt(currHour[0])*60+parseInt(currHour[1]);
}

var dateUtil =  {
 mos: ['Janeiro','Fevereito','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  getPtBrMonth: function () {
    var ddd = new Date();
    return this.mos[ddd.getMonth()];
  }
}
