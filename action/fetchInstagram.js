/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is TelaSocial
 *
 * The Initial Developer of the Original Code is Taboca TelaSocial.
 * Portions created by the Initial Developer are Copyright (C) 2010 
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Marcio Galli   <mgalli@taboca.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var sys = require("sys"),
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    request = require("request"),
    exec  = require('child_process').exec,
    forever = require('forever'),
    out = require('../3rdparty/stdout-2-json/stdout-2-json'),
    xml2js = require('xml2js');
 
function parseAndSave() { 

   this.listPages= new Array();
   this.downloadedItems = new Array();

   this.channel = null; 
   this.sendToApp = null;
   this.targetStore = null; 
   this.hasEnded = null;

   this.init = function (sourceChannel, appPath, sendingDataFunction, hasEndedFunction) { 

    	this.targetStore = sourceChannel;
      this.channel = sourceChannel; 
      this.baseStore = new Array()
      this.jsonStore = {item: new Array()}
      this.jsonStoreRecent = {item: new Array()}
    	this.sendToApp = sendingDataFunction;
    	this.hasEnded  = hasEndedFunction;
      this.appPath = appPath; 
      this.channelData = null;

      this.sendToApp("Parsing the JSON data for channel " + sourceChannel);	

      var filePath = pathFS.join( __dirname, '..', this.appPath, 'channel', sourceChannel +'.json');
      that = this; 

    	fs.readFile(filePath, function(err, data) {

          var result = JSON.parse(data);

          var filePathLocal = pathFS.join( __dirname, '..', that.appPath, 'channel', sourceChannel+'-db-cache.json');

          fs.readFile(filePathLocal, function(err, data) {

               if (err) { 
                   if(err.errno==34) {
  //                     out.senderr({'result':'error', 'payload': err});
  //                   throw err; 
                   } 
               } else { 
                     // we maintain the store as an eash to search.
                     that.jsonStore = JSON.parse(data);
                     for(var k = 0;k<that.jsonStore.item.length;k++) {
                        console.log('----')
                        var curr = that.jsonStore.item[k];
                        that.baseStore[curr.md5URL]=curr;
                     }
               }

               var syncCachedFile = false;

              /* Most recent images */

              for(var i=0;i<result.length;i++) { 
                  var link = result[i].images.standard_resolution.url;
                  var text = result[i].caption.text;
                  var from = result[i].caption.from.username;

                  var md5Link = MD5(link);

                  var cached = false; 

                  if(that.baseStore) {
                     if(that.baseStore) {
                       if(that.baseStore[md5Link]) {
                          cached = true; 
                       }
                     }
                  }

                  if(!cached) {  

                    syncCachedFile = true;
                    
                    that.sendToApp("Sending image to queue " + link); 
                    
                    var fileBase   = pathFS.join( __dirname, '..', that.appPath, 'scripts', 'utils', 'copy.sh');
                    var originFile = pathFS.join( __dirname, '..', that.appPath, 'assets' , 'default.png');
                    var targetFile = pathFS.join( __dirname, '..', that.appPath, 'channel', 'cache', sourceChannel , md5Link+'.png' );                    

                    var params = new Array(); 
                    params.push(originFile);
                    params.push(targetFile);

                    var child = exec(fileBase + ' ' + originFile + ' ' + targetFile);

                    child.stdout.on('data', function (data) {
                      console.log('stdout : ' + data);
                    });

                    child.stderr.on('data', function (data) {
                      console.log('stderr: ' + data);
                    });

                    child.on('exit', function (code) {
                      console.log('child process exited with code ' + code);
                    });


                    matchingObject = {"from": from, "text": text , "src":link, "channel": sourceChannel , "download" : '/channel/cache/' +sourceChannel + '/' + md5Link + '.png' , "md5URL" : md5Link , "test":false, "targetFile":targetFile};
                    
                    that.listPages.push(matchingObject);
                    
                    that.jsonStore.item.push(matchingObject); 
                    that.jsonStoreRecent.item.push(matchingObject); 
 
                  } else { 
                  
                    that.sendToApp("!!! Already in cache!! " + link); 
                    that.jsonStoreRecent.item.push(that.baseStore[md5Link]); 

                  }

              } 

              if(syncCachedFile) {        
                      that.channelData = JSON.stringify(that.jsonStore);

                      console.log('==== out to write === :' + that.channelData);
                      //that.renderFetch(); 
                      var fileOutLocal = pathFS.join( __dirname, '..', that.appPath, 'channel', sourceChannel+'-db-cache.json');
                      fs.writeFile(fileOutLocal, that.channelData, 'utf8', function(err){
                           if (err) { 
                             out.senderr({'result':'error', 'payload': err});
                             throw err; 
                           }   
                           // warning: we need to clear the timer...
                           //out.send({'result':'ok'});
                           //clearTimeout(timer);
                      });

                      var fileOutLocal = pathFS.join( __dirname, '..', that.appPath, 'channel', sourceChannel+'-cache.json');

                      fs.writeFile(fileOutLocal, JSON.stringify(that.jsonStoreRecent), 'utf8', function(err){
                           if (err) { 
                             out.senderr({'result':'error', 'payload': err});
                             throw err; 
                           }   
                           // warning: we need to clear the timer...
                           //out.send({'result':'ok'});
                           //clearTimeout(timer);
                      });

                      that.renderFetch()
              }

          }); 
    	});
   } 

   this.renderFetch = function () { 
    var curr = this.listPages.pop();
    if(curr) { 

      this.sendToApp("Trying to load from " +  curr.src + " to " + curr.targetFile);
      this.fechObject(curr);
    } else { 
      //this.hasEnded(this.downloadedItems, this.channelData);
    } 	
   } 

   this.fechObject = function (objToFetch) { 
        var href = url.parse(objToFetch.src);
        console.log('00000' + objToFetch.src)
        //var filedate= JSON.stringify({ date: new Date() });
        var that = this; 
        var filePath = objToFetch.targetFile;
        var file = fs.createWriteStream(filePath);
        file.on('close',function () { 
            console.log('==ok==, file saved');
            objToFetch.test=true;
            that.downloadedItems.push(objToFetch);
            setTimeout(function () { that.renderFetch() },1000);
         //   file.close();
        });
        file.on('error', function (err) {
            console.log('===error====' + err)
        });
        request({uri:href}, function fDone(error, response, body) { 
              console.log(error)

             // if error, maintain temp image
        }).pipe(file);
    }
} 

function startApp(about, appPath) {
    out.send({'result':'note','data':'init fetch...'});
    var a = new parseAndSave();

    a.init(about, appPath, function (str) {
       out.send({'result':'note','data':str } );
    }, function (elements, dataStringOfJSON) { 
        // This is sucess, we think so 
        for(var k in elements) {
          var el = elements[k];
          //console.log(el.uid + ' test = ' + el.test);
        }

        var filePath = pathFS.join( __dirname, '..', appPath, 'channel', about+'.txt');
        fs.writeFile(filePath, dataStringOfJSON, 'utf-8', function(err){
           if (err) { 
             out.senderr({'result':'error', 'payload': err});
             throw err; 
           }   
           clearTimeout(timer);
           out.send({'result':'ok'});
        });
    })
}


/* Remember to clear the timeouts */
timer = setTimeout(function () { out.send({'result':'expired'}) },45000); 
startApp(process.argv[2], process.argv[3]);




/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is md5.jvs 1.0b / Henri's code. 
 *
 * The Initial Developer of the Original Code is
 * Henri Torgemane. 
 * Portions created by the Initial Developer are Copyright (C) 1996
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Marcio S. Galli - mgalli@geckonnection.com
 *  
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 *  md5.jvs 1.0b 27/06/96
 *
 * Javascript implementation of the RSA Data Security, Inc. MD5
 * Message-Digest Algorithm. Original code (c) 1996 Henri Torgemane. 
 *
 */

/*
 * Many thanks to Henri Torgemane, the original developer of this MD5 implementation. 
 *   marcio.
 */


function array(n) {
  for(i=0;i<n;i++) this[i]=0;
  this.length=n;
}

/* Some basic logical functions had to be rewritten because of a bug in
 * Javascript.. Just try to compute 0xffffffff >> 4 with it..
 * Of course, these functions are slower than the original would be, but
 * at least, they work!
 */

function integer(n) { return n%(0xffffffff+1); }

function shr(a,b) {
  a=integer(a);
  b=integer(b);
  if (a-0x80000000>=0) {
    a=a%0x80000000;
    a>>=b;
    a+=0x40000000>>(b-1);
  } else
    a>>=b;
  return a;
}

function shl1(a) {
  a=a%0x80000000;
  if (a&0x40000000==0x40000000)
  {
    a-=0x40000000;  
    a*=2;
    a+=0x80000000;
  } else
    a*=2;
  return a;
}

function shl(a,b) {
  a=integer(a);
  b=integer(b);
  for (var i=0;i<b;i++) a=shl1(a);
  return a;
}

function and(a,b) {
  a=integer(a);
  b=integer(b);
  var t1=(a-0x80000000);
  var t2=(b-0x80000000);
  if (t1>=0) 
    if (t2>=0) 
      return ((t1&t2)+0x80000000);
    else
      return (t1&b);
  else
    if (t2>=0)
      return (a&t2);
    else
      return (a&b);  
}

function or(a,b) {
  a=integer(a);
  b=integer(b);
  var t1=(a-0x80000000);
  var t2=(b-0x80000000);
  if (t1>=0) 
    if (t2>=0) 
      return ((t1|t2)+0x80000000);
    else
      return ((t1|b)+0x80000000);
  else
    if (t2>=0)
      return ((a|t2)+0x80000000);
    else
      return (a|b);  
}

function xor(a,b) {
  a=integer(a);
  b=integer(b);
  var t1=(a-0x80000000);
  var t2=(b-0x80000000);
  if (t1>=0) 
    if (t2>=0) 
      return (t1^t2);
    else
      return ((t1^b)+0x80000000);
  else
    if (t2>=0)
      return ((a^t2)+0x80000000);
    else
      return (a^b);  
}

function not(a) {
  a=integer(a);
  return (0xffffffff-a);
}

/* Here begin the real algorithm */

    var state = new array(4); 
    var count = new array(2);
  count[0] = 0;
  count[1] = 0;                     
    var buffer = new array(64); 
    var transformBuffer = new array(16); 
    var digestBits = new array(16);

    var S11 = 7;
    var S12 = 12;
    var S13 = 17;
    var S14 = 22;
    var S21 = 5;
    var S22 = 9;
    var S23 = 14;
    var S24 = 20;
    var S31 = 4;
    var S32 = 11;
    var S33 = 16;
    var S34 = 23;
    var S41 = 6;
    var S42 = 10;
    var S43 = 15;
    var S44 = 21;

    function F(x,y,z) {
  return or(and(x,y),and(not(x),z));
    }

    function G(x,y,z) {
  return or(and(x,z),and(y,not(z)));
    }

    function H(x,y,z) {
  return xor(xor(x,y),z);
    }

    function I(x,y,z) {
  return xor(y ,or(x , not(z)));
    }

    function rotateLeft(a,n) {
  return or(shl(a, n),(shr(a,(32 - n))));
    }

    function FF(a,b,c,d,x,s,ac) {
        a = a+F(b, c, d) + x + ac;
  a = rotateLeft(a, s);
  a = a+b;
  return a;
    }

    function GG(a,b,c,d,x,s,ac) {
  a = a+G(b, c, d) +x + ac;
  a = rotateLeft(a, s);
  a = a+b;
  return a;
    }

    function HH(a,b,c,d,x,s,ac) {
  a = a+H(b, c, d) + x + ac;
  a = rotateLeft(a, s);
  a = a+b;
  return a;
    }

    function II(a,b,c,d,x,s,ac) {
  a = a+I(b, c, d) + x + ac;
  a = rotateLeft(a, s);
  a = a+b;
  return a;
    }

    function transform(buf,offset) { 
  var a=0, b=0, c=0, d=0; 
  var x = transformBuffer;
  
  a = state[0];
  b = state[1];
  c = state[2];
  d = state[3];
  
  for (i = 0; i < 16; i++) {
      x[i] = and(buf[i*4+offset],0xff);
      for (j = 1; j < 4; j++) {
    x[i]+=shl(and(buf[i*4+j+offset] ,0xff), j * 8);
      }
  }

  /* Round 1 */
  a = FF ( a, b, c, d, x[ 0], S11, 0xd76aa478); /* 1 */
  d = FF ( d, a, b, c, x[ 1], S12, 0xe8c7b756); /* 2 */
  c = FF ( c, d, a, b, x[ 2], S13, 0x242070db); /* 3 */
  b = FF ( b, c, d, a, x[ 3], S14, 0xc1bdceee); /* 4 */
  a = FF ( a, b, c, d, x[ 4], S11, 0xf57c0faf); /* 5 */
  d = FF ( d, a, b, c, x[ 5], S12, 0x4787c62a); /* 6 */
  c = FF ( c, d, a, b, x[ 6], S13, 0xa8304613); /* 7 */
  b = FF ( b, c, d, a, x[ 7], S14, 0xfd469501); /* 8 */
  a = FF ( a, b, c, d, x[ 8], S11, 0x698098d8); /* 9 */
  d = FF ( d, a, b, c, x[ 9], S12, 0x8b44f7af); /* 10 */
  c = FF ( c, d, a, b, x[10], S13, 0xffff5bb1); /* 11 */
  b = FF ( b, c, d, a, x[11], S14, 0x895cd7be); /* 12 */
  a = FF ( a, b, c, d, x[12], S11, 0x6b901122); /* 13 */
  d = FF ( d, a, b, c, x[13], S12, 0xfd987193); /* 14 */
  c = FF ( c, d, a, b, x[14], S13, 0xa679438e); /* 15 */
  b = FF ( b, c, d, a, x[15], S14, 0x49b40821); /* 16 */

  /* Round 2 */
  a = GG ( a, b, c, d, x[ 1], S21, 0xf61e2562); /* 17 */
  d = GG ( d, a, b, c, x[ 6], S22, 0xc040b340); /* 18 */
  c = GG ( c, d, a, b, x[11], S23, 0x265e5a51); /* 19 */
  b = GG ( b, c, d, a, x[ 0], S24, 0xe9b6c7aa); /* 20 */
  a = GG ( a, b, c, d, x[ 5], S21, 0xd62f105d); /* 21 */
  d = GG ( d, a, b, c, x[10], S22,  0x2441453); /* 22 */
  c = GG ( c, d, a, b, x[15], S23, 0xd8a1e681); /* 23 */
  b = GG ( b, c, d, a, x[ 4], S24, 0xe7d3fbc8); /* 24 */
  a = GG ( a, b, c, d, x[ 9], S21, 0x21e1cde6); /* 25 */
  d = GG ( d, a, b, c, x[14], S22, 0xc33707d6); /* 26 */
  c = GG ( c, d, a, b, x[ 3], S23, 0xf4d50d87); /* 27 */
  b = GG ( b, c, d, a, x[ 8], S24, 0x455a14ed); /* 28 */
  a = GG ( a, b, c, d, x[13], S21, 0xa9e3e905); /* 29 */
  d = GG ( d, a, b, c, x[ 2], S22, 0xfcefa3f8); /* 30 */
  c = GG ( c, d, a, b, x[ 7], S23, 0x676f02d9); /* 31 */
  b = GG ( b, c, d, a, x[12], S24, 0x8d2a4c8a); /* 32 */

  /* Round 3 */
  a = HH ( a, b, c, d, x[ 5], S31, 0xfffa3942); /* 33 */
  d = HH ( d, a, b, c, x[ 8], S32, 0x8771f681); /* 34 */
  c = HH ( c, d, a, b, x[11], S33, 0x6d9d6122); /* 35 */
  b = HH ( b, c, d, a, x[14], S34, 0xfde5380c); /* 36 */
  a = HH ( a, b, c, d, x[ 1], S31, 0xa4beea44); /* 37 */
  d = HH ( d, a, b, c, x[ 4], S32, 0x4bdecfa9); /* 38 */
  c = HH ( c, d, a, b, x[ 7], S33, 0xf6bb4b60); /* 39 */
  b = HH ( b, c, d, a, x[10], S34, 0xbebfbc70); /* 40 */
  a = HH ( a, b, c, d, x[13], S31, 0x289b7ec6); /* 41 */
  d = HH ( d, a, b, c, x[ 0], S32, 0xeaa127fa); /* 42 */
  c = HH ( c, d, a, b, x[ 3], S33, 0xd4ef3085); /* 43 */
  b = HH ( b, c, d, a, x[ 6], S34,  0x4881d05); /* 44 */
  a = HH ( a, b, c, d, x[ 9], S31, 0xd9d4d039); /* 45 */
  d = HH ( d, a, b, c, x[12], S32, 0xe6db99e5); /* 46 */
  c = HH ( c, d, a, b, x[15], S33, 0x1fa27cf8); /* 47 */
  b = HH ( b, c, d, a, x[ 2], S34, 0xc4ac5665); /* 48 */

  /* Round 4 */
  a = II ( a, b, c, d, x[ 0], S41, 0xf4292244); /* 49 */
  d = II ( d, a, b, c, x[ 7], S42, 0x432aff97); /* 50 */
  c = II ( c, d, a, b, x[14], S43, 0xab9423a7); /* 51 */
  b = II ( b, c, d, a, x[ 5], S44, 0xfc93a039); /* 52 */
  a = II ( a, b, c, d, x[12], S41, 0x655b59c3); /* 53 */
  d = II ( d, a, b, c, x[ 3], S42, 0x8f0ccc92); /* 54 */
  c = II ( c, d, a, b, x[10], S43, 0xffeff47d); /* 55 */
  b = II ( b, c, d, a, x[ 1], S44, 0x85845dd1); /* 56 */
  a = II ( a, b, c, d, x[ 8], S41, 0x6fa87e4f); /* 57 */
  d = II ( d, a, b, c, x[15], S42, 0xfe2ce6e0); /* 58 */
  c = II ( c, d, a, b, x[ 6], S43, 0xa3014314); /* 59 */
  b = II ( b, c, d, a, x[13], S44, 0x4e0811a1); /* 60 */
  a = II ( a, b, c, d, x[ 4], S41, 0xf7537e82); /* 61 */
  d = II ( d, a, b, c, x[11], S42, 0xbd3af235); /* 62 */
  c = II ( c, d, a, b, x[ 2], S43, 0x2ad7d2bb); /* 63 */
  b = II ( b, c, d, a, x[ 9], S44, 0xeb86d391); /* 64 */

  state[0] +=a;
  state[1] +=b;
  state[2] +=c;
  state[3] +=d;

    }

    function init() {
  count[0]=count[1] = 0;
  state[0] = 0x67452301;
  state[1] = 0xefcdab89;
  state[2] = 0x98badcfe;
  state[3] = 0x10325476;
  for (i = 0; i < digestBits.length; i++)
      digestBits[i] = 0;
    }

    function update(b) { 
  var index,i;
  
  index = and(shr(count[0],3) , 0x3f);
  if (count[0]<0xffffffff-7) 
    count[0] += 8;
        else {
    count[1]++;
    count[0]-=0xffffffff+1;
          count[0]+=8;
        }
  buffer[index] = and(b,0xff);
  if (index  >= 63) {
      transform(buffer, 0);
  }
    }

    function finish() {
  var bits = new array(8);
  var padding; 
  var i=0, index=0, padLen=0;

  for (i = 0; i < 4; i++) {
      bits[i] = and(shr(count[0],(i * 8)), 0xff);
  }
        for (i = 0; i < 4; i++) {
      bits[i+4]=and(shr(count[1],(i * 8)), 0xff);
  }
  index = and(shr(count[0], 3) ,0x3f);
  padLen = (index < 56) ? (56 - index) : (120 - index);
  padding = new array(64); 
  padding[0] = 0x80;
        for (i=0;i<padLen;i++)
    update(padding[i]);
        for (i=0;i<8;i++) 
    update(bits[i]);

  for (i = 0; i < 4; i++) {
      for (j = 0; j < 4; j++) {
    digestBits[i*4+j] = and(shr(state[i], (j * 8)) , 0xff);
      }
  } 
    }

/* End of the MD5 algorithm */

function hexa(n) {
 var hexa_h = "0123456789abcdef";
 var hexa_c=""; 
 var hexa_m=n;
 for (hexa_i=0;hexa_i<8;hexa_i++) {
   hexa_c=hexa_h.charAt(Math.abs(hexa_m)%16)+hexa_c;
   hexa_m=Math.floor(hexa_m/16);
 }
 return hexa_c;
}


var ascii="01234567890123456789012345678901" +
          " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ"+
          "[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";

function MD5(entree) 
{
 var l,s,k,ka,kb,kc,kd;

 init();
 for (k=0;k<entree.length;k++) {
   l=entree.charAt(k);
   update(ascii.lastIndexOf(l));
 }
 finish();
 ka=kb=kc=kd=0;
 for (i=0;i<4;i++) ka+=shl(digestBits[15-i], (i*8));
 for (i=4;i<8;i++) kb+=shl(digestBits[15-i], ((i-4)*8));
 for (i=8;i<12;i++) kc+=shl(digestBits[15-i], ((i-8)*8));
 for (i=12;i<16;i++) kd+=shl(digestBits[15-i], ((i-12)*8));
 s=hexa(kd)+hexa(kc)+hexa(kb)+hexa(ka);
 return s; 
}

/* This implement the MD5 test suite */
var testOk=false;
function teste() {
 if (testOk) return;
 document.test.o1.value=MD5(document.test.i1.value);
 document.test.o2.value=MD5(document.test.i2.value);
 document.test.o3.value=MD5(document.test.i3.value);
 document.test.o4.value=MD5(document.test.i4.value);
 document.test.o5.value=MD5(document.test.i5.value);
 document.test.o6.value=MD5(document.test.i6.value);
 document.test.o7.value=MD5(document.test.i7.value);
 testOk=true;
}




