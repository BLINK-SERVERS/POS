const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/General-BXWM6d4c.js","assets/rolldown-runtime-CbXtAM7H.js","assets/vendor-hzoPRTZp.js","assets/index-Xxri-oAW.js","assets/index-BUxfS2ha.css","assets/ui-DLUQyhmm.js","assets/pairing-0pBNI91_.js","assets/supabase-DtuMx0jC.js","assets/Vender-B9wopSF5.js","assets/Receipt-s5ASPUTN.js","assets/Historial-DTqQx1sw.js","assets/DataTable-Dd4uUVpT.js","assets/Catalogo-DhKdjMBi.js","assets/Inventario-BZagrSWf.js","assets/Contactos-L_NtQRoa.js","assets/Finanzas-Ci19NPER.js","assets/Informes-wWn3EZ2Y.js","assets/export-C6jFIQ1o.js","assets/Ajustes-1NAkTlQg.js"])))=>i.map(i=>d[i]);
import{n as e,t}from"./rolldown-runtime-CbXtAM7H.js";import{_ as n,c as r,d as i,f as a,g as o,h as s,l as c,m as l,p as u,s as d,x as f,y as p}from"./vendor-hzoPRTZp.js";import{n as m,r as h,t as g}from"./index-Xxri-oAW.js";import{D as _,_ as v,f as y,g as b,h as x,n as S,o as C,p as w,r as T,s as E,v as D,x as O,y as k}from"./ui-DLUQyhmm.js";import{_ as A,a as j,b as ee,c as M,d as N,f as P,h as F,i as I,l as L,p as te,s as R,t as ne,v as re,y as z}from"./pairing-0pBNI91_.js";/* empty css                */var ie=t(((e,t)=>{t.exports=function(){return typeof Promise==`function`&&Promise.prototype&&Promise.prototype.then}})),B=t((e=>{var t,n=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];e.getSymbolSize=function(e){if(!e)throw Error(`"version" cannot be null or undefined`);if(e<1||e>40)throw Error(`"version" should be in range from 1 to 40`);return e*4+17},e.getSymbolTotalCodewords=function(e){return n[e]},e.getBCHDigit=function(e){let t=0;for(;e!==0;)t++,e>>>=1;return t},e.setToSJISFunction=function(e){if(typeof e!=`function`)throw Error(`"toSJISFunc" is not a valid function.`);t=e},e.isKanjiModeEnabled=function(){return t!==void 0},e.toSJIS=function(e){return t(e)}})),V=t((e=>{e.L={bit:1},e.M={bit:0},e.Q={bit:3},e.H={bit:2};function t(t){if(typeof t!=`string`)throw Error(`Param is not a string`);switch(t.toLowerCase()){case`l`:case`low`:return e.L;case`m`:case`medium`:return e.M;case`q`:case`quartile`:return e.Q;case`h`:case`high`:return e.H;default:throw Error(`Unknown EC Level: `+t)}}e.isValid=function(e){return e&&e.bit!==void 0&&e.bit>=0&&e.bit<4},e.from=function(n,r){if(e.isValid(n))return n;try{return t(n)}catch{return r}}})),H=t(((e,t)=>{function n(){this.buffer=[],this.length=0}n.prototype={get:function(e){let t=Math.floor(e/8);return(this.buffer[t]>>>7-e%8&1)==1},put:function(e,t){for(let n=0;n<t;n++)this.putBit((e>>>t-n-1&1)==1)},getLengthInBits:function(){return this.length},putBit:function(e){let t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}},t.exports=n})),U=t(((e,t)=>{function n(e){if(!e||e<1)throw Error(`BitMatrix size must be defined and greater than 0`);this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}n.prototype.set=function(e,t,n,r){let i=e*this.size+t;this.data[i]=n,r&&(this.reservedBit[i]=!0)},n.prototype.get=function(e,t){return this.data[e*this.size+t]},n.prototype.xor=function(e,t,n){this.data[e*this.size+t]^=n},n.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]},t.exports=n})),ae=t((e=>{var t=B().getSymbolSize;e.getRowColCoords=function(e){if(e===1)return[];let n=Math.floor(e/7)+2,r=t(e),i=r===145?26:Math.ceil((r-13)/(2*n-2))*2,a=[r-7];for(let e=1;e<n-1;e++)a[e]=a[e-1]-i;return a.push(6),a.reverse()},e.getPositions=function(t){let n=[],r=e.getRowColCoords(t),i=r.length;for(let e=0;e<i;e++)for(let t=0;t<i;t++)e===0&&t===0||e===0&&t===i-1||e===i-1&&t===0||n.push([r[e],r[t]]);return n}})),oe=t((e=>{var t=B().getSymbolSize,n=7;e.getPositions=function(e){let r=t(e);return[[0,0],[r-n,0],[0,r-n]]}})),W=t((e=>{e.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var t={N1:3,N2:3,N3:40,N4:10};e.isValid=function(e){return e!=null&&e!==``&&!isNaN(e)&&e>=0&&e<=7},e.from=function(t){return e.isValid(t)?parseInt(t,10):void 0},e.getPenaltyN1=function(e){let n=e.size,r=0,i=0,a=0,o=null,s=null;for(let c=0;c<n;c++){i=a=0,o=s=null;for(let l=0;l<n;l++){let n=e.get(c,l);n===o?i++:(i>=5&&(r+=t.N1+(i-5)),o=n,i=1),n=e.get(l,c),n===s?a++:(a>=5&&(r+=t.N1+(a-5)),s=n,a=1)}i>=5&&(r+=t.N1+(i-5)),a>=5&&(r+=t.N1+(a-5))}return r},e.getPenaltyN2=function(e){let n=e.size,r=0;for(let t=0;t<n-1;t++)for(let i=0;i<n-1;i++){let n=e.get(t,i)+e.get(t,i+1)+e.get(t+1,i)+e.get(t+1,i+1);(n===4||n===0)&&r++}return r*t.N2},e.getPenaltyN3=function(e){let n=e.size,r=0,i=0,a=0;for(let t=0;t<n;t++){i=a=0;for(let o=0;o<n;o++)i=i<<1&2047|e.get(t,o),o>=10&&(i===1488||i===93)&&r++,a=a<<1&2047|e.get(o,t),o>=10&&(a===1488||a===93)&&r++}return r*t.N3},e.getPenaltyN4=function(e){let n=0,r=e.data.length;for(let t=0;t<r;t++)n+=e.data[t];return Math.abs(Math.ceil(n*100/r/5)-10)*t.N4};function n(t,n,r){switch(t){case e.Patterns.PATTERN000:return(n+r)%2==0;case e.Patterns.PATTERN001:return n%2==0;case e.Patterns.PATTERN010:return r%3==0;case e.Patterns.PATTERN011:return(n+r)%3==0;case e.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(r/3))%2==0;case e.Patterns.PATTERN101:return n*r%2+n*r%3==0;case e.Patterns.PATTERN110:return(n*r%2+n*r%3)%2==0;case e.Patterns.PATTERN111:return(n*r%3+(n+r)%2)%2==0;default:throw Error(`bad maskPattern:`+t)}}e.applyMask=function(e,t){let r=t.size;for(let i=0;i<r;i++)for(let a=0;a<r;a++)t.isReserved(a,i)||t.xor(a,i,n(e,a,i))},e.getBestMask=function(t,n){let r=Object.keys(e.Patterns).length,i=0,a=1/0;for(let o=0;o<r;o++){n(o),e.applyMask(o,t);let r=e.getPenaltyN1(t)+e.getPenaltyN2(t)+e.getPenaltyN3(t)+e.getPenaltyN4(t);e.applyMask(o,t),r<a&&(a=r,i=o)}return i}})),G=t((e=>{var t=V(),n=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],r=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];e.getBlocksCount=function(e,r){switch(r){case t.L:return n[(e-1)*4+0];case t.M:return n[(e-1)*4+1];case t.Q:return n[(e-1)*4+2];case t.H:return n[(e-1)*4+3];default:return}},e.getTotalCodewordsCount=function(e,n){switch(n){case t.L:return r[(e-1)*4+0];case t.M:return r[(e-1)*4+1];case t.Q:return r[(e-1)*4+2];case t.H:return r[(e-1)*4+3];default:return}}})),se=t((e=>{var t=new Uint8Array(512),n=new Uint8Array(256);(function(){let e=1;for(let r=0;r<255;r++)t[r]=e,n[e]=r,e<<=1,e&256&&(e^=285);for(let e=255;e<512;e++)t[e]=t[e-255]})(),e.log=function(e){if(e<1)throw Error(`log(`+e+`)`);return n[e]},e.exp=function(e){return t[e]},e.mul=function(e,r){return e===0||r===0?0:t[n[e]+n[r]]}})),ce=t((e=>{var t=se();e.mul=function(e,n){let r=new Uint8Array(e.length+n.length-1);for(let i=0;i<e.length;i++)for(let a=0;a<n.length;a++)r[i+a]^=t.mul(e[i],n[a]);return r},e.mod=function(e,n){let r=new Uint8Array(e);for(;r.length-n.length>=0;){let e=r[0];for(let i=0;i<n.length;i++)r[i]^=t.mul(n[i],e);let i=0;for(;i<r.length&&r[i]===0;)i++;r=r.slice(i)}return r},e.generateECPolynomial=function(n){let r=new Uint8Array([1]);for(let i=0;i<n;i++)r=e.mul(r,new Uint8Array([1,t.exp(i)]));return r}})),le=t(((e,t)=>{var n=ce();function r(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}r.prototype.initialize=function(e){this.degree=e,this.genPoly=n.generateECPolynomial(this.degree)},r.prototype.encode=function(e){if(!this.genPoly)throw Error(`Encoder not initialized`);let t=new Uint8Array(e.length+this.degree);t.set(e);let r=n.mod(t,this.genPoly),i=this.degree-r.length;if(i>0){let e=new Uint8Array(this.degree);return e.set(r,i),e}return r},t.exports=r})),K=t((e=>{e.isValid=function(e){return!isNaN(e)&&e>=1&&e<=40}})),ue=t((e=>{var t=`[0-9]+`,n=`[A-Z $%*+\\-./:]+`,r=`(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+`;r=r.replace(/u/g,`\\u`);var i=`(?:(?![A-Z0-9 $%*+\\-./:]|`+r+`)(?:.|[\r
]))+`;e.KANJI=new RegExp(r,`g`),e.BYTE_KANJI=RegExp(`[^A-Z0-9 $%*+\\-./:]+`,`g`),e.BYTE=new RegExp(i,`g`),e.NUMERIC=new RegExp(t,`g`),e.ALPHANUMERIC=new RegExp(n,`g`);var a=RegExp(`^`+r+`$`),o=RegExp(`^[0-9]+$`),s=RegExp(`^[A-Z0-9 $%*+\\-./:]+$`);e.testKanji=function(e){return a.test(e)},e.testNumeric=function(e){return o.test(e)},e.testAlphanumeric=function(e){return s.test(e)}})),q=t((e=>{var t=K(),n=ue();e.NUMERIC={id:`Numeric`,bit:1,ccBits:[10,12,14]},e.ALPHANUMERIC={id:`Alphanumeric`,bit:2,ccBits:[9,11,13]},e.BYTE={id:`Byte`,bit:4,ccBits:[8,16,16]},e.KANJI={id:`Kanji`,bit:8,ccBits:[8,10,12]},e.MIXED={bit:-1},e.getCharCountIndicator=function(e,n){if(!e.ccBits)throw Error(`Invalid mode: `+e);if(!t.isValid(n))throw Error(`Invalid version: `+n);return n>=1&&n<10?e.ccBits[0]:n<27?e.ccBits[1]:e.ccBits[2]},e.getBestModeForData=function(t){return n.testNumeric(t)?e.NUMERIC:n.testAlphanumeric(t)?e.ALPHANUMERIC:n.testKanji(t)?e.KANJI:e.BYTE},e.toString=function(e){if(e&&e.id)return e.id;throw Error(`Invalid mode`)},e.isValid=function(e){return e&&e.bit&&e.ccBits};function r(t){if(typeof t!=`string`)throw Error(`Param is not a string`);switch(t.toLowerCase()){case`numeric`:return e.NUMERIC;case`alphanumeric`:return e.ALPHANUMERIC;case`kanji`:return e.KANJI;case`byte`:return e.BYTE;default:throw Error(`Unknown mode: `+t)}}e.from=function(t,n){if(e.isValid(t))return t;try{return r(t)}catch{return n}}})),de=t((e=>{var t=B(),n=G(),r=V(),i=q(),a=K(),o=7973,s=t.getBCHDigit(o);function c(t,n,r){for(let i=1;i<=40;i++)if(n<=e.getCapacity(i,r,t))return i}function l(e,t){return i.getCharCountIndicator(e,t)+4}function u(e,t){let n=0;return e.forEach(function(e){let r=l(e.mode,t);n+=r+e.getBitsLength()}),n}function d(t,n){for(let r=1;r<=40;r++)if(u(t,r)<=e.getCapacity(r,n,i.MIXED))return r}e.from=function(e,t){return a.isValid(e)?parseInt(e,10):t},e.getCapacity=function(e,r,o){if(!a.isValid(e))throw Error(`Invalid QR Code version`);o===void 0&&(o=i.BYTE);let s=(t.getSymbolTotalCodewords(e)-n.getTotalCodewordsCount(e,r))*8;if(o===i.MIXED)return s;let c=s-l(o,e);switch(o){case i.NUMERIC:return Math.floor(c/10*3);case i.ALPHANUMERIC:return Math.floor(c/11*2);case i.KANJI:return Math.floor(c/13);case i.BYTE:default:return Math.floor(c/8)}},e.getBestVersionForData=function(e,t){let n,i=r.from(t,r.M);if(Array.isArray(e)){if(e.length>1)return d(e,i);if(e.length===0)return 1;n=e[0]}else n=e;return c(n.mode,n.getLength(),i)},e.getEncodedBits=function(e){if(!a.isValid(e)||e<7)throw Error(`Invalid QR Code version`);let n=e<<12;for(;t.getBCHDigit(n)-s>=0;)n^=o<<t.getBCHDigit(n)-s;return e<<12|n}})),fe=t((e=>{var t=B(),n=1335,r=21522,i=t.getBCHDigit(n);e.getEncodedBits=function(e,a){let o=e.bit<<3|a,s=o<<10;for(;t.getBCHDigit(s)-i>=0;)s^=n<<t.getBCHDigit(s)-i;return(o<<10|s)^r}})),pe=t(((e,t)=>{var n=q();function r(e){this.mode=n.NUMERIC,this.data=e.toString()}r.getBitsLength=function(e){return 10*Math.floor(e/3)+(e%3?e%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){let t,n,r;for(t=0;t+3<=this.data.length;t+=3)n=this.data.substr(t,3),r=parseInt(n,10),e.put(r,10);let i=this.data.length-t;i>0&&(n=this.data.substr(t),r=parseInt(n,10),e.put(r,i*3+1))},t.exports=r})),me=t(((e,t)=>{var n=q(),r=`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`.split(``);function i(e){this.mode=n.ALPHANUMERIC,this.data=e}i.getBitsLength=function(e){return 11*Math.floor(e/2)+e%2*6},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(e){let t=0;for(;t+2<=this.data.length;t+=2){let n=r.indexOf(this.data[t])*45;n+=r.indexOf(this.data[t+1]),e.put(n,11)}this.data.length%2&&e.put(r.indexOf(this.data[t]),6)},t.exports=i})),he=t(((e,t)=>{var n=q();function r(e){this.mode=n.BYTE,this.data=typeof e==`string`?new TextEncoder().encode(e):new Uint8Array(e)}r.getBitsLength=function(e){return e*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){for(let t=0,n=this.data.length;t<n;t++)e.put(this.data[t],8)},t.exports=r})),ge=t(((e,t)=>{var n=q(),r=B();function i(e){this.mode=n.KANJI,this.data=e}i.getBitsLength=function(e){return e*13},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(e){let t=0;for(;t<this.data.length;t++){let n=r.toSJIS(this.data[t]);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw Error(`Invalid SJIS character: `+this.data[t]+`
Make sure your charset is UTF-8`);n=(n>>>8&255)*192+(n&255),e.put(n,13)}},t.exports=i})),_e=t(((e,t)=>{var n={single_source_shortest_paths:function(e,t,r){var i={},a={};a[t]=0;var o=n.PriorityQueue.make();o.push(t,0);for(var s,c,l,u,d,f,p,m,h;!o.empty();)for(l in s=o.pop(),c=s.value,u=s.cost,d=e[c]||{},d)d.hasOwnProperty(l)&&(f=d[l],p=u+f,m=a[l],h=a[l]===void 0,(h||m>p)&&(a[l]=p,o.push(l,p),i[l]=c));if(r!==void 0&&a[r]===void 0){var g=[`Could not find a path from `,t,` to `,r,`.`].join(``);throw Error(g)}return i},extract_shortest_path_from_predecessor_list:function(e,t){for(var n=[],r=t;r;)n.push(r),e[r],r=e[r];return n.reverse(),n},find_path:function(e,t,r){var i=n.single_source_shortest_paths(e,t,r);return n.extract_shortest_path_from_predecessor_list(i,r)},PriorityQueue:{make:function(e){var t=n.PriorityQueue,r={},i;for(i in e||={},t)t.hasOwnProperty(i)&&(r[i]=t[i]);return r.queue=[],r.sorter=e.sorter||t.default_sorter,r},default_sorter:function(e,t){return e.cost-t.cost},push:function(e,t){var n={value:e,cost:t};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t!==void 0&&(t.exports=n)})),ve=t((e=>{var t=q(),n=pe(),r=me(),i=he(),a=ge(),o=ue(),s=B(),c=_e();function l(e){return unescape(encodeURIComponent(e)).length}function u(e,t,n){let r=[],i;for(;(i=e.exec(n))!==null;)r.push({data:i[0],index:i.index,mode:t,length:i[0].length});return r}function d(e){let n=u(o.NUMERIC,t.NUMERIC,e),r=u(o.ALPHANUMERIC,t.ALPHANUMERIC,e),i,a;return s.isKanjiModeEnabled()?(i=u(o.BYTE,t.BYTE,e),a=u(o.KANJI,t.KANJI,e)):(i=u(o.BYTE_KANJI,t.BYTE,e),a=[]),n.concat(r,i,a).sort(function(e,t){return e.index-t.index}).map(function(e){return{data:e.data,mode:e.mode,length:e.length}})}function f(e,o){switch(o){case t.NUMERIC:return n.getBitsLength(e);case t.ALPHANUMERIC:return r.getBitsLength(e);case t.KANJI:return a.getBitsLength(e);case t.BYTE:return i.getBitsLength(e)}}function p(e){return e.reduce(function(e,t){let n=e.length-1>=0?e[e.length-1]:null;return n&&n.mode===t.mode?(e[e.length-1].data+=t.data,e):(e.push(t),e)},[])}function m(e){let n=[];for(let r=0;r<e.length;r++){let i=e[r];switch(i.mode){case t.NUMERIC:n.push([i,{data:i.data,mode:t.ALPHANUMERIC,length:i.length},{data:i.data,mode:t.BYTE,length:i.length}]);break;case t.ALPHANUMERIC:n.push([i,{data:i.data,mode:t.BYTE,length:i.length}]);break;case t.KANJI:n.push([i,{data:i.data,mode:t.BYTE,length:l(i.data)}]);break;case t.BYTE:n.push([{data:i.data,mode:t.BYTE,length:l(i.data)}])}}return n}function h(e,n){let r={},i={start:{}},a=[`start`];for(let o=0;o<e.length;o++){let s=e[o],c=[];for(let e=0;e<s.length;e++){let l=s[e],u=``+o+e;c.push(u),r[u]={node:l,lastCount:0},i[u]={};for(let e=0;e<a.length;e++){let o=a[e];r[o]&&r[o].node.mode===l.mode?(i[o][u]=f(r[o].lastCount+l.length,l.mode)-f(r[o].lastCount,l.mode),r[o].lastCount+=l.length):(r[o]&&(r[o].lastCount=l.length),i[o][u]=f(l.length,l.mode)+4+t.getCharCountIndicator(l.mode,n))}}a=c}for(let e=0;e<a.length;e++)i[a[e]].end=0;return{map:i,table:r}}function g(e,o){let c,l=t.getBestModeForData(e);if(c=t.from(o,l),c!==t.BYTE&&c.bit<l.bit)throw Error(`"`+e+`" cannot be encoded with mode `+t.toString(c)+`.
 Suggested mode is: `+t.toString(l));switch(c===t.KANJI&&!s.isKanjiModeEnabled()&&(c=t.BYTE),c){case t.NUMERIC:return new n(e);case t.ALPHANUMERIC:return new r(e);case t.KANJI:return new a(e);case t.BYTE:return new i(e)}}e.fromArray=function(e){return e.reduce(function(e,t){return typeof t==`string`?e.push(g(t,null)):t.data&&e.push(g(t.data,t.mode)),e},[])},e.fromString=function(t,n){let r=h(m(d(t,s.isKanjiModeEnabled())),n),i=c.find_path(r.map,`start`,`end`),a=[];for(let e=1;e<i.length-1;e++)a.push(r.table[i[e]].node);return e.fromArray(p(a))},e.rawSplit=function(t){return e.fromArray(d(t,s.isKanjiModeEnabled()))}})),ye=t((e=>{var t=B(),n=V(),r=H(),i=U(),a=ae(),o=oe(),s=W(),c=G(),l=le(),u=de(),d=fe(),f=q(),p=ve();function m(e,t){let n=e.size,r=o.getPositions(t);for(let t=0;t<r.length;t++){let i=r[t][0],a=r[t][1];for(let t=-1;t<=7;t++)if(!(i+t<=-1||n<=i+t))for(let r=-1;r<=7;r++)a+r<=-1||n<=a+r||(t>=0&&t<=6&&(r===0||r===6)||r>=0&&r<=6&&(t===0||t===6)||t>=2&&t<=4&&r>=2&&r<=4?e.set(i+t,a+r,!0,!0):e.set(i+t,a+r,!1,!0))}}function h(e){let t=e.size;for(let n=8;n<t-8;n++){let t=n%2==0;e.set(n,6,t,!0),e.set(6,n,t,!0)}}function g(e,t){let n=a.getPositions(t);for(let t=0;t<n.length;t++){let r=n[t][0],i=n[t][1];for(let t=-2;t<=2;t++)for(let n=-2;n<=2;n++)t===-2||t===2||n===-2||n===2||t===0&&n===0?e.set(r+t,i+n,!0,!0):e.set(r+t,i+n,!1,!0)}}function _(e,t){let n=e.size,r=u.getEncodedBits(t),i,a,o;for(let t=0;t<18;t++)i=Math.floor(t/3),a=t%3+n-8-3,o=(r>>t&1)==1,e.set(i,a,o,!0),e.set(a,i,o,!0)}function v(e,t,n){let r=e.size,i=d.getEncodedBits(t,n),a,o;for(a=0;a<15;a++)o=(i>>a&1)==1,a<6?e.set(a,8,o,!0):a<8?e.set(a+1,8,o,!0):e.set(r-15+a,8,o,!0),a<8?e.set(8,r-a-1,o,!0):a<9?e.set(8,15-a-1+1,o,!0):e.set(8,15-a-1,o,!0);e.set(r-8,8,1,!0)}function y(e,t){let n=e.size,r=-1,i=n-1,a=7,o=0;for(let s=n-1;s>0;s-=2)for(s===6&&s--;;){for(let n=0;n<2;n++)if(!e.isReserved(i,s-n)){let r=!1;o<t.length&&(r=(t[o]>>>a&1)==1),e.set(i,s-n,r),a--,a===-1&&(o++,a=7)}if(i+=r,i<0||n<=i){i-=r,r=-r;break}}}function b(e,n,i){let a=new r;i.forEach(function(t){a.put(t.mode.bit,4),a.put(t.getLength(),f.getCharCountIndicator(t.mode,e)),t.write(a)});let o=(t.getSymbolTotalCodewords(e)-c.getTotalCodewordsCount(e,n))*8;for(a.getLengthInBits()+4<=o&&a.put(0,4);a.getLengthInBits()%8!=0;)a.putBit(0);let s=(o-a.getLengthInBits())/8;for(let e=0;e<s;e++)a.put(e%2?17:236,8);return x(a,e,n)}function x(e,n,r){let i=t.getSymbolTotalCodewords(n),a=i-c.getTotalCodewordsCount(n,r),o=c.getBlocksCount(n,r),s=o-i%o,u=Math.floor(i/o),d=Math.floor(a/o),f=d+1,p=u-d,m=new l(p),h=0,g=Array(o),_=Array(o),v=0,y=new Uint8Array(e.buffer);for(let e=0;e<o;e++){let t=e<s?d:f;g[e]=y.slice(h,h+t),_[e]=m.encode(g[e]),h+=t,v=Math.max(v,t)}let b=new Uint8Array(i),x=0,S,C;for(S=0;S<v;S++)for(C=0;C<o;C++)S<g[C].length&&(b[x++]=g[C][S]);for(S=0;S<p;S++)for(C=0;C<o;C++)b[x++]=_[C][S];return b}function S(e,n,r,a){let o;if(Array.isArray(e))o=p.fromArray(e);else if(typeof e==`string`){let t=n;if(!t){let n=p.rawSplit(e);t=u.getBestVersionForData(n,r)}o=p.fromString(e,t||40)}else throw Error(`Invalid data`);let c=u.getBestVersionForData(o,r);if(!c)throw Error(`The amount of data is too big to be stored in a QR Code`);if(!n)n=c;else if(n<c)throw Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+c+`.
`);let l=b(n,r,o),d=new i(t.getSymbolSize(n));return m(d,n),h(d),g(d,n),v(d,r,0),n>=7&&_(d,n),y(d,l),isNaN(a)&&(a=s.getBestMask(d,v.bind(null,d,r))),s.applyMask(a,d),v(d,r,a),{modules:d,version:n,errorCorrectionLevel:r,maskPattern:a,segments:o}}e.create=function(e,r){if(e===void 0||e===``)throw Error(`No input text`);let i=n.M,a,o;return r!==void 0&&(i=n.from(r.errorCorrectionLevel,n.M),a=u.from(r.version),o=s.from(r.maskPattern),r.toSJISFunc&&t.setToSJISFunction(r.toSJISFunc)),S(e,a,i,o)}})),be=t((e=>{function t(e){if(typeof e==`number`&&(e=e.toString()),typeof e!=`string`)throw Error(`Color should be defined as hex string`);let t=e.slice().replace(`#`,``).split(``);if(t.length<3||t.length===5||t.length>8)throw Error(`Invalid hex color: `+e);(t.length===3||t.length===4)&&(t=Array.prototype.concat.apply([],t.map(function(e){return[e,e]}))),t.length===6&&t.push(`F`,`F`);let n=parseInt(t.join(``),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:`#`+t.slice(0,6).join(``)}}e.getOptions=function(e){e||={},e.color||(e.color={});let n=e.margin===void 0||e.margin===null||e.margin<0?4:e.margin,r=e.width&&e.width>=21?e.width:void 0,i=e.scale||4;return{width:r,scale:r?4:i,margin:n,color:{dark:t(e.color.dark||`#000000ff`),light:t(e.color.light||`#ffffffff`)},type:e.type,rendererOpts:e.rendererOpts||{}}},e.getScale=function(e,t){return t.width&&t.width>=e+t.margin*2?t.width/(e+t.margin*2):t.scale},e.getImageWidth=function(t,n){let r=e.getScale(t,n);return Math.floor((t+n.margin*2)*r)},e.qrToImageData=function(t,n,r){let i=n.modules.size,a=n.modules.data,o=e.getScale(i,r),s=Math.floor((i+r.margin*2)*o),c=r.margin*o,l=[r.color.light,r.color.dark];for(let e=0;e<s;e++)for(let n=0;n<s;n++){let u=(e*s+n)*4,d=r.color.light;if(e>=c&&n>=c&&e<s-c&&n<s-c){let t=Math.floor((e-c)/o),r=Math.floor((n-c)/o);d=l[+!!a[t*i+r]]}t[u++]=d.r,t[u++]=d.g,t[u++]=d.b,t[u]=d.a}}})),xe=t((e=>{var t=be();function n(e,t,n){e.clearRect(0,0,t.width,t.height),t.style||={},t.height=n,t.width=n,t.style.height=n+`px`,t.style.width=n+`px`}function r(){try{return document.createElement(`canvas`)}catch{throw Error(`You need to specify a canvas element`)}}e.render=function(e,i,a){let o=a,s=i;o===void 0&&(!i||!i.getContext)&&(o=i,i=void 0),i||(s=r()),o=t.getOptions(o);let c=t.getImageWidth(e.modules.size,o),l=s.getContext(`2d`),u=l.createImageData(c,c);return t.qrToImageData(u.data,e,o),n(l,s,c),l.putImageData(u,0,0),s},e.renderToDataURL=function(t,n,r){let i=r;i===void 0&&(!n||!n.getContext)&&(i=n,n=void 0),i||={};let a=e.render(t,n,i),o=i.type||`image/png`,s=i.rendererOpts||{};return a.toDataURL(o,s.quality)}})),Se=t((e=>{var t=be();function n(e,t){let n=e.a/255,r=t+`="`+e.hex+`"`;return n<1?r+` `+t+`-opacity="`+n.toFixed(2).slice(1)+`"`:r}function r(e,t,n){let r=e+t;return n!==void 0&&(r+=` `+n),r}function i(e,t,n){let i=``,a=0,o=!1,s=0;for(let c=0;c<e.length;c++){let l=Math.floor(c%t),u=Math.floor(c/t);!l&&!o&&(o=!0),e[c]?(s++,c>0&&l>0&&e[c-1]||(i+=o?r(`M`,l+n,.5+u+n):r(`m`,a,0),a=0,o=!1),l+1<t&&e[c+1]||(i+=r(`h`,s),s=0)):a++}return i}e.render=function(e,r,a){let o=t.getOptions(r),s=e.modules.size,c=e.modules.data,l=s+o.margin*2,u=o.color.light.a?`<path `+n(o.color.light,`fill`)+` d="M0 0h`+l+`v`+l+`H0z"/>`:``,d=`<path `+n(o.color.dark,`stroke`)+` d="`+i(c,s,o.margin)+`"/>`,f=`viewBox="0 0 `+l+` `+l+`"`,p=`<svg xmlns="http://www.w3.org/2000/svg" `+(o.width?`width="`+o.width+`" height="`+o.width+`" `:``)+f+` shape-rendering="crispEdges">`+u+d+`</svg>
`;return typeof a==`function`&&a(null,p),p}})),Ce=t((e=>{var t=ie(),n=ye(),r=xe(),i=Se();function a(e,r,i,a,o){let s=[].slice.call(arguments,1),c=s.length,l=typeof s[c-1]==`function`;if(!l&&!t())throw Error(`Callback required as last argument`);if(l){if(c<2)throw Error(`Too few arguments provided`);c===2?(o=i,i=r,r=a=void 0):c===3&&(r.getContext&&o===void 0?(o=a,a=void 0):(o=a,a=i,i=r,r=void 0))}else{if(c<1)throw Error(`Too few arguments provided`);return c===1?(i=r,r=a=void 0):c===2&&!r.getContext&&(a=i,i=r,r=void 0),new Promise(function(t,o){try{t(e(n.create(i,a),r,a))}catch(e){o(e)}})}try{let t=n.create(i,a);o(null,e(t,r,a))}catch(e){o(e)}}e.create=n.create,e.toCanvas=a.bind(null,r.render),e.toDataURL=a.bind(null,r.renderToDataURL),e.toString=a.bind(null,function(e,t,n){return i.render(e,n)})})),J=e(f(),1),we=Ce(),Y=c();function Te({value:e,size:t=220,className:n}){let[r,i]=(0,J.useState)(``);return(0,J.useEffect)(()=>{let n=!0;return(0,we.toString)(e,{type:`svg`,margin:1,width:t,errorCorrectionLevel:`M`}).then(e=>{n&&i(e)}).catch(()=>{n&&i(``)}),()=>{n=!1}},[e,t]),r?(0,Y.jsx)(`div`,{className:`qr`+(n?` ${n}`:``),style:{width:t,height:t,margin:`0 auto`,justifyContent:`center`,alignItems:`center`},dangerouslySetInnerHTML:{__html:r}}):(0,Y.jsx)(`div`,{className:`qr qr--loading`,style:{width:t,height:t,margin:`0 auto`,justifyContent:`center`,alignItems:`center`},role:`img`,"aria-label":`Generando código QR`})}var Ee=()=>({buffer:``,lastAt:0});function De(e,t,n){let r=n-e.lastAt>70?``:e.buffer;if(t===`Enter`||t===`Tab`){let e=r.trim();return{state:{buffer:``,lastAt:n},code:e.length>=5?e:null}}return t.length===1?{state:{buffer:r+t,lastAt:n},code:null}:{state:{buffer:r,lastAt:n},code:null}}var Oe=(0,J.createContext)(null);function X(){let e=(0,J.useContext)(Oe);if(!e)throw Error(`useScanner debe usarse dentro de <ScannerProvider>`);return e}function ke(e){let{register:t}=X(),n=(0,J.useRef)(e);n.current=e,(0,J.useEffect)(()=>t((e,t)=>n.current(e,t)),[t])}var Ae=2e4;function je({children:e}){let{user:t}=O(),n=t?.id??``,[r,i]=(0,J.useState)(null),[a,o]=(0,J.useState)(!1),[s,c]=(0,J.useState)(!1),l=(0,J.useRef)([]),u=(0,J.useRef)(0),d=(0,J.useRef)(()=>{}),f=(0,J.useRef)(null),p=(0,J.useRef)(new Map),m=(0,J.useCallback)(e=>(l.current.push(e),()=>{l.current=l.current.filter(t=>t!==e)}),[]),h=(0,J.useCallback)((e,t=`hardware`)=>{let n=e.trim();if(!n)return;P();let r=l.current[l.current.length-1];r&&r(n,t)},[]);d.current=h,(0,J.useEffect)(()=>{let e=()=>te();return window.addEventListener(`pointerdown`,e,{once:!0}),window.addEventListener(`touchstart`,e,{once:!0}),window.addEventListener(`keydown`,e,{once:!0}),()=>{window.removeEventListener(`pointerdown`,e),window.removeEventListener(`touchstart`,e),window.removeEventListener(`keydown`,e)}},[]),(0,J.useEffect)(()=>{let e=Ee();function t(t){if(t.ctrlKey||t.altKey||t.metaKey)return;let n=De(e,t.key,Date.now());e=n.state,n.code&&(t.preventDefault(),d.current(n.code,`hardware`))}return window.addEventListener(`keydown`,t,!0),()=>window.removeEventListener(`keydown`,t,!0)},[]),(0,J.useEffect)(()=>{if(!n){i(null);return}let e=j(n);i(e&&!I(e)?e:null)},[n]);let g=(0,J.useCallback)(()=>{let e=(r&&!I(r)?r:null)??R();return n&&L(n,e),i(e),e},[n,r]),_=(0,J.useCallback)(()=>{let e=R(r?.label);return n&&L(n,e),i(e),c(!1),e},[n,r]),v=(0,J.useCallback)(()=>{n&&ne(n),i(null),c(!1),o(!1)},[n]),y=r?.id??``,b=r?.token??``;(0,J.useEffect)(()=>{if(!y||!b){o(!1);return}let e=F.channel(`scanner:${y}`,{config:{broadcast:{self:!1}}});return f.current=e,e.on(`broadcast`,{event:`hello`},t=>{t.payload?.token===b&&(u.current=Date.now(),c(!0),e?.send({type:`broadcast`,event:`pong`,payload:{token:b}}))}),e.on(`broadcast`,{event:`barcode`},e=>{let t=e.payload;t?.token===b&&t.code&&(u.current=Date.now(),c(!0),d.current(t.code,`remote`))}),e.on(`broadcast`,{event:`names`},e=>{let t=e.payload;t&&t.token===b&&(u.current=Date.now(),c(!0),p.current.get(`names`)?.forEach(e=>e(t)))}),e.subscribe(e=>o(e===`SUBSCRIBED`)),()=>{let t=e;e=null,f.current=null,t&&F.removeChannel(t),o(!1)}},[y,b]);let x=(0,J.useCallback)((e,t)=>{let n=p.current.get(e);return n||(n=new Set,p.current.set(e,n)),n.add(t),()=>{n?.delete(t)}},[]),S=(0,J.useCallback)((e,t)=>{let n=f.current;n&&n.send({type:`broadcast`,event:e,payload:t})},[]);(0,J.useEffect)(()=>{let e=window.setInterval(()=>{c(e=>{let t=Date.now()-u.current<Ae;return e===t?e:t})},5e3);return()=>window.clearInterval(e)},[]);let C=(0,J.useMemo)(()=>r?M(r):``,[r]),w=(0,J.useMemo)(()=>({pairing:r,pairingUrl:C,remoteActive:s,connected:a,ensurePairing:g,rotatePairing:_,forgetPairing:v,dispatch:h,register:m,subscribeRemote:x,sendToRemote:S}),[r,C,s,a,g,_,v,h,m,x,S]);return(0,Y.jsx)(Oe.Provider,{value:w,children:e})}function Me({active:e}){return(0,Y.jsxs)(`span`,{className:`row gap-8`,style:{alignItems:`center`},children:[(0,Y.jsx)(`span`,{className:`dot`+(e?` dot--on`:``),"aria-hidden":!0}),(0,Y.jsx)(`span`,{children:e?`Escáner móvil activo`:`Esperando al celular…`})]})}function Ne({onClose:e}){let{pairing:t,pairingUrl:n,remoteActive:r,connected:i,ensurePairing:a,rotatePairing:o}=X(),s=(0,J.useRef)(a);s.current=a,(0,J.useEffect)(()=>{try{s.current()}catch{}},[]);let c=t?.expiresAt?new Date(t.expiresAt):null;return(0,Y.jsxs)(E,{title:`Celular como escáner`,onClose:e,children:[(0,Y.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.85rem`,marginBottom:`0.75rem`},children:[`Escanea este código con la cámara del celular. Quedará vinculado`,` `,30,` días: no tendrás que volver a escanearlo cada mañana.`]}),n?(0,Y.jsxs)(`div`,{className:`scan-pair`,style:{justifyContent:`center`,gap:`1.25rem`,flexWrap:`wrap`},children:[(0,Y.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`,width:`100%`},children:(0,Y.jsx)(Te,{value:n,size:208})}),(0,Y.jsxs)(`div`,{className:`scan-pair__info stack gap-8`,children:[(0,Y.jsx)(Me,{active:r}),(0,Y.jsx)(`span`,{className:`dim`,style:{fontSize:`0.8rem`},children:i?`Caja conectada al canal.`:`Sin conexión con el servidor.`}),c&&(0,Y.jsxs)(`span`,{className:`dim`,style:{fontSize:`0.8rem`},children:[`Vence el `,c.toLocaleDateString(),`.`]}),(0,Y.jsxs)(`button`,{className:`btn btn--soft btn--sm`,onClick:()=>{o()},children:[(0,Y.jsx)(g,{name:`close`}),` Regenerar código`]})]})]}):(0,Y.jsx)(`p`,{className:`muted`,children:`Preparando el código…`}),(0,Y.jsx)(`p`,{className:`field__hint`,style:{marginTop:`0.9rem`},children:`El celular debe poder abrir esta misma dirección. “Regenerar” desvincula los teléfonos anteriores.`})]})}function Pe({onScan:e,onClose:t,continuous:n=!1,hint:r=`Apunta al código de barras. Si tu navegador no puede decodificar, usa el lector USB o vincula un celular.`,footer:i}){return(0,Y.jsxs)(E,{title:`Escanear con cámara`,onClose:t,children:[(0,Y.jsx)(N,{onScan:r=>{e(r),n||t()},continuous:n}),i,(0,Y.jsx)(`p`,{className:`field__hint`,style:{marginTop:`0.75rem`},children:r})]})}var Fe=[{to:`/app/inicio`,label:`General`,icon:`grid2x2`},{to:`/app/ventas`,label:`Ventas`,icon:`cart`,sub:[{to:`/app/ventas`,label:`Vender`,icon:`cart`},{to:`/app/ventas/historial`,label:`Historial`,icon:`clock`}]},{to:`/app/catalogo`,label:`Catálogo`,icon:`tag`},{to:`/app/inventario`,label:`Inventario`,icon:`box`,feature:`inventory`},{to:`/app/contactos`,label:`Contactos`,icon:`users`,feature:`providers`},{to:`/app/finanzas`,label:`Finanzas`,icon:`wallet`,feature:`expenses`},{to:`/app/informes`,label:`Informes`,icon:`chart`,feature:`reports`}],Ie=[{to:`/app/inicio`,label:`Inicio`,icon:`grid2x2`},{to:`/app/catalogo`,label:`Catálogo`,icon:`tag`}],Le=[{to:`/app/inventario`,label:`Inventario`,icon:`box`,feature:`inventory`},{to:`/app/finanzas`,label:`Finanzas`,icon:`wallet`,feature:`expenses`},{to:`/app/contactos`,label:`Contactos`,icon:`users`,feature:`providers`},{to:`/app/informes`,label:`Informes`,icon:`chart`,feature:`reports`}];function Re(){let{remoteActive:e,pairing:t}=X(),[n,r]=(0,J.useState)(!1);return(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsxs)(`button`,{className:`btn btn--plain btn--sm scan-topbtn`+(e?` scan-topbtn--on`:``),onClick:()=>r(!0),title:`Escáner móvil`,children:[(0,Y.jsx)(g,{name:`scan`}),(0,Y.jsx)(`span`,{className:`scan-topbtn__label`,children:e?`Escáner activo`:t?`Escáner`:`Vincular`}),e&&(0,Y.jsx)(`span`,{className:`dot dot--on`,"aria-hidden":!0})]}),n&&(0,Y.jsx)(Ne,{onClose:()=>r(!1)})]})}function ze(){let{user:e,logout:t}=D(),r=n(),[i,a]=(0,J.useState)(!1),o=(0,J.useRef)(null),s=e&&(e.firstName||e.lastName)?[e.firstName,e.lastName].filter(Boolean).join(` `):e?.email??``,c=(s||`?`).slice(0,2).toUpperCase(),l=!!(e&&(e.firstName||e.lastName));(0,J.useEffect)(()=>{if(!i)return;let e=e=>{o.current&&!o.current.contains(e.target)&&a(!1)},t=e=>{e.key===`Escape`&&a(!1)};return document.addEventListener(`mousedown`,e),document.addEventListener(`keydown`,t),()=>{document.removeEventListener(`mousedown`,e),document.removeEventListener(`keydown`,t)}},[i]);let u=e=>{a(!1),r(e)};return(0,Y.jsxs)(`div`,{className:`avatarmenu__wrap`,ref:o,children:[(0,Y.jsxs)(`button`,{type:`button`,className:`userchip userchip--button`,onClick:()=>a(e=>!e),"aria-haspopup":`menu`,"aria-expanded":i,"aria-label":`Cuenta y ajustes`,children:[(0,Y.jsx)(`span`,{className:`avatar`,children:c}),(0,Y.jsxs)(`div`,{className:`stack`,style:{lineHeight:1.15},children:[(0,Y.jsx)(`strong`,{style:{fontSize:`0.8rem`},children:s||`Sesión activa`}),(0,Y.jsx)(`span`,{className:`dim`,style:{fontSize:`0.7rem`},children:`Dueño`})]})]}),i&&(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(`div`,{className:`avatarmenu__scrim`,onClick:()=>a(!1)}),(0,Y.jsxs)(`div`,{className:`avatarmenu`,role:`menu`,"aria-label":`Cuenta y ajustes`,children:[(0,Y.jsxs)(`div`,{className:`avatarmenu__head`,children:[(0,Y.jsx)(`span`,{className:`avatar avatar--lg`,children:c}),(0,Y.jsxs)(`div`,{className:`avatarmenu__id`,children:[(0,Y.jsx)(`strong`,{children:l?s:`Tu cuenta`}),(0,Y.jsx)(`span`,{className:`dim`,children:l?e?.email:`Dueño del comercio`})]})]}),(0,Y.jsx)(`div`,{className:`avatarmenu__sep`,role:`separator`}),(0,Y.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`avatarmenu__item`,onClick:()=>u(`/app/ajustes?tab=Negocio`),children:[(0,Y.jsx)(g,{name:`store`}),(0,Y.jsx)(`span`,{children:`Datos del comercio`})]}),(0,Y.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`avatarmenu__item`,onClick:()=>u(`/app/ajustes?tab=Perfil`),children:[(0,Y.jsx)(g,{name:`person`}),(0,Y.jsx)(`span`,{children:`Tu perfil`})]}),(0,Y.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`avatarmenu__item`,onClick:()=>u(`/app/ajustes`),children:[(0,Y.jsx)(g,{name:`settings`}),(0,Y.jsx)(`span`,{children:`Ajustes`})]}),(0,Y.jsx)(`div`,{className:`avatarmenu__sep`,role:`separator`}),(0,Y.jsxs)(`button`,{type:`button`,role:`menuitem`,className:`avatarmenu__item avatarmenu__item--danger`,onClick:()=>{a(!1),t(),r(`/app/entrar`)},children:[(0,Y.jsx)(g,{name:`logout`}),(0,Y.jsx)(`span`,{children:`Cerrar sesión`})]})]})]})]})}function Be({izquierda:e,derecha:t}){let n=o(),r=e=>n.pathname===e||n.pathname.startsWith(e+`/`),i=e=>(0,Y.jsxs)(a,{to:e.to,className:`tabbar__item`+(r(e.to)?` is-active`:``),"aria-current":r(e.to)?`page`:void 0,children:[(0,Y.jsx)(`span`,{className:`tabbar__glyph`,"aria-hidden":!0,children:(0,Y.jsx)(g,{name:e.icon,size:`lg`})}),(0,Y.jsx)(`span`,{className:`tabbar__label`,children:e.label})]},e.to);return(0,Y.jsx)(d,{className:`shell__tabbar-float`,children:(0,Y.jsxs)(`nav`,{className:`tabbar`,"aria-label":`Navegación principal`,children:[(0,Y.jsx)(`div`,{className:`tabbar__side`,children:e.map(i)}),(0,Y.jsxs)(a,{to:`/app/ventas`,className:`tabbar__main`+(r(`/app/ventas`)?` is-active`:``),"aria-label":`Vender`,children:[(0,Y.jsx)(`span`,{className:`tabbar__main-glyph`,"aria-hidden":!0,children:(0,Y.jsx)(g,{name:`dollarsign`,size:`xl`})}),(0,Y.jsx)(`span`,{className:`tabbar__main-label`,children:`Vender`})]}),(0,Y.jsx)(`div`,{className:`tabbar__side`,children:t.map(i)})]})})}function Ve({children:e}){let{state:t,openCash:n,closeCash:r}=D(),[o,s]=(0,J.useState)(!1),[c,l]=(0,J.useState)(`0`),[u,d]=(0,J.useState)(`0`),[f,p]=(0,J.useState)(!1),[m,h]=(0,J.useState)(`0`),[v,y]=(0,J.useState)(`0`),[b,x]=(0,J.useState)(``),S=t.business.features,w=Fe.filter(e=>!e.feature||S[e.feature]),T=Le.filter(e=>!e.feature||S[e.feature]).slice(0,2),O=t.cashSession,k=O?_(t):{usd:0,bs:0},j=Number(m)||0,M=Number(v)||0,N=ee(j-k.usd),P=ee(M-k.bs),F=N!==0||P!==0;return(0,Y.jsx)(je,{children:(0,Y.jsxs)(`div`,{className:`shell`,children:[(0,Y.jsxs)(`aside`,{className:`shell__sidebar`,children:[(0,Y.jsx)(`div`,{className:`sidenav__brand`,children:(0,Y.jsxs)(i,{to:`/app/ventas`,className:`brand brand--lg`,"aria-label":`Ir a ventas`,children:[(0,Y.jsx)(`span`,{className:`brand__blink`,children:`BLINK`}),(0,Y.jsx)(`span`,{className:`brand__pos`,children:`POS`})]})}),(0,Y.jsx)(`div`,{className:`nav-group`,children:`Principal`}),(0,Y.jsx)(`nav`,{className:`nav`,children:w.map(e=>(0,Y.jsxs)(`div`,{children:[(0,Y.jsxs)(a,{to:e.to,end:!!e.sub,className:({isActive:t})=>t&&!e.sub?`nav__link active`:`nav__link`,children:[(0,Y.jsx)(`span`,{className:`nav__icon`,"aria-hidden":!0,children:(0,Y.jsx)(g,{name:e.icon})}),e.label]}),e.sub&&(0,Y.jsx)(`div`,{className:`nav__sub`,children:e.sub.map(e=>(0,Y.jsxs)(a,{to:e.to,end:e.label===`Vender`,className:({isActive:e})=>e?`nav__link active`:`nav__link`,children:[(0,Y.jsx)(`span`,{className:`nav__icon`,"aria-hidden":!0,children:(0,Y.jsx)(g,{name:e.icon})}),e.label]},e.label))})]},e.to))})]}),(0,Y.jsxs)(`div`,{className:`shell__content`,children:[(0,Y.jsxs)(`header`,{className:`shell__topbar`,children:[(0,Y.jsx)(`strong`,{className:`topbar__name`,children:t.business.name}),(0,Y.jsx)(Re,{}),(0,Y.jsx)(`span`,{className:`rate-chip rate-chip--live`,title:`Tasa de referencia BCV`,children:t.rate>0?(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(`strong`,{children:re(t.rate)}),(0,Y.jsx)(`span`,{className:`rate-chip__suffix`,children:` / $ · BCV`})]}):(0,Y.jsx)(`strong`,{style:{fontSize:`0.8rem`},children:`Sin tasa`})}),(0,Y.jsx)(`span`,{className:`grow`}),O?(0,Y.jsxs)(`button`,{className:`btn btn--plain btn--sm`,onClick:()=>{h(String(O.openingUsd)),y(String(O.openingBs)),x(``),p(!0)},title:`Abierta ${new Date(O.openedAt).toLocaleTimeString()}`,children:[(0,Y.jsx)(g,{name:`cash`}),(0,Y.jsx)(`span`,{className:`btn__label`,children:`Cerrar caja`})]}):(0,Y.jsxs)(`button`,{className:`btn btn--plain btn--sm`,onClick:()=>s(!0),children:[(0,Y.jsx)(g,{name:`cash`}),(0,Y.jsx)(`span`,{className:`btn__label`,children:`Abrir caja`})]}),(0,Y.jsx)(ze,{})]}),(0,Y.jsx)(`main`,{className:`shell__main`,children:(0,Y.jsx)(`div`,{className:`page`+(location.pathname===`/app/ventas`?` page--pos`:``),children:e})})]}),(0,Y.jsx)(Be,{izquierda:Ie,derecha:T}),(0,Y.jsx)(`div`,{id:`printable-report`,"aria-hidden":`true`}),o&&(0,Y.jsxs)(E,{title:`Abrir caja`,onClose:()=>s(!1),children:[(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Fondo inicial (USD)`,hint:`Efectivo con el que abre la caja.`,children:(0,Y.jsx)(`input`,{className:`input`,type:`number`,value:c,onChange:e=>l(e.target.value)})}),(0,Y.jsx)(C,{label:`Fondo inicial (Bs)`,children:(0,Y.jsx)(`input`,{className:`input`,type:`number`,value:u,onChange:e=>d(e.target.value)})})]}),(0,Y.jsxs)(`button`,{className:`btn btn--primary btn--block`,onClick:()=>{n(Number(c)||0,Number(u)||0),s(!1)},children:[(0,Y.jsx)(g,{name:`check`}),`Confirmar apertura`]}),(0,Y.jsxs)(`p`,{className:`field__hint`,style:{marginTop:`0.6rem`},children:[`Fondo: `,z(Number(c)||0),` · `,A(Number(u)||0)]})]}),f&&O&&(0,Y.jsxs)(E,{title:`Cerrar caja (arqueo)`,onClose:()=>p(!1),children:[(0,Y.jsx)(`p`,{className:`muted`,style:{fontSize:`0.85rem`,marginBottom:`0.75rem`},children:`Cuenta el efectivo y las bolívares contados para registrar el arqueo y la diferencia.`}),(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Contado (USD)`,children:(0,Y.jsx)(`input`,{className:`input`,type:`number`,value:m,onChange:e=>h(e.target.value)})}),(0,Y.jsx)(C,{label:`Contado (Bs)`,children:(0,Y.jsx)(`input`,{className:`input`,type:`number`,value:v,onChange:e=>y(e.target.value)})})]}),(0,Y.jsxs)(`div`,{className:`breakdown`,style:{marginTop:`0.75rem`},children:[(0,Y.jsxs)(`div`,{className:`breakdown__row`,children:[(0,Y.jsx)(`span`,{children:`Esperado (USD)`}),(0,Y.jsx)(`span`,{className:`tabular`,children:z(k.usd)})]}),(0,Y.jsxs)(`div`,{className:`breakdown__row`,children:[(0,Y.jsx)(`span`,{children:`Contado (USD)`}),(0,Y.jsx)(`span`,{className:`tabular`,children:z(j)})]}),(0,Y.jsxs)(`div`,{className:`breakdown__row`,children:[(0,Y.jsx)(`span`,{children:`Esperado (Bs)`}),(0,Y.jsx)(`span`,{className:`tabular`,children:A(k.bs)})]}),(0,Y.jsxs)(`div`,{className:`breakdown__row`,children:[(0,Y.jsx)(`span`,{children:`Contado (Bs)`}),(0,Y.jsx)(`span`,{className:`tabular`,children:A(M)})]}),(0,Y.jsxs)(`div`,{className:`breakdown__row breakdown__row--strong`,children:[(0,Y.jsx)(`span`,{children:`Diferencia`}),(0,Y.jsxs)(`span`,{className:`tabular`,children:[z(N),` · `,A(P)]})]})]}),F&&(0,Y.jsx)(C,{label:`Motivo de la diferencia`,hint:`Obligatorio cuando no cuadra.`,children:(0,Y.jsx)(`input`,{className:`input`,value:b,onChange:e=>x(e.target.value),placeholder:`Ej.: vuelto de más en la mañana`})}),(0,Y.jsxs)(`button`,{className:`btn btn--primary btn--block`,style:{marginTop:`1rem`},disabled:F&&!b.trim(),onClick:()=>{r(j,M,b.trim()||(F?`Arqueo de cierre · diferencia ${z(N)} / ${A(P)}`:`Arqueo de cierre sin diferencia`)),p(!1)},children:[(0,Y.jsx)(g,{name:`check`}),`Confirmar cierre`]})]})]})})}var He={home:{viewBox:`0 0 78.955 84.24`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.240234375)'>
<path fill='currentColor' d='
    M 31.947,17.102
    L 47.008,17.102
    L 47.008,33.709
    Q 47.008,34.611 46.471,35.148
    Q 45.934,35.686 45.031,35.686
    L 33.945,35.686
    Q 33.043,35.686 32.495,35.148
    Q 31.947,34.611 31.947,33.709
    Z
    M 15.275,19.1
    L 15.275,42.26
    L 37.77,61.102
    Q 38.564,61.789 39.445,61.8
    Q 40.326,61.811 41.164,61.102
    L 63.68,42.217
    L 63.68,19.1
    Q 63.68,16.35 62.122,14.824
    Q 60.564,13.299 57.793,13.299
    L 21.162,13.299
    Q 18.391,13.299 16.833,14.824
    Q 15.275,16.35 15.275,19.1
    Z
    M 9.109,42.303
    Q 8.143,42.303 7.605,42.883
    Q 7.068,43.463 7.068,44.172
    Q 7.068,44.602 7.251,45.01
    Q 7.434,45.418 7.842,45.762
    L 36.373,69.695
    Q 37.834,70.941 39.467,70.941
    Q 41.121,70.941 42.582,69.695
    L 71.113,45.762
    Q 71.521,45.418 71.704,45.01
    Q 71.887,44.602 71.887,44.172
    Q 71.887,43.463 71.35,42.883
    Q 70.813,42.303 69.846,42.303
    Q 69.352,42.303 68.954,42.528
    Q 68.557,42.754 68.191,43.055
    L 40.52,66.279
    Q 40.025,66.688 39.467,66.688
    Q 38.93,66.688 38.436,66.279
    L 10.764,43.055
    Q 10.398,42.754 10.001,42.528
    Q 9.604,42.303 9.109,42.303
    Z
    M 57.793,55.752
    L 57.793,62.648
    Q 57.793,63.443 58.298,63.927
    Q 58.803,64.41 59.598,64.41
    L 62.326,64.41
    Q 63.143,64.41 63.626,63.927
    Q 64.109,63.443 64.109,62.648
    L 64.109,50.424
    Z
' />
</g>`},cart:{viewBox:`0 0 74.809 81.082`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.08203125)'>
<path fill='currentColor' d='
    M 5.672,65.807
    Q 5.672,66.537 6.177,67.063
    Q 6.682,67.59 7.412,67.59
    L 17.381,67.59
    Q 19.207,67.59 19.873,66.892
    Q 20.539,66.193 20.732,64.84
    L 21.334,60.779
    L 66.816,60.779
    Q 67.891,60.779 68.514,60.21
    Q 69.137,59.641 69.137,58.717
    Q 69.137,58.545 69.104,58.255
    Q 69.072,57.965 69.029,57.729
    L 66.752,42.797
    Q 66.344,39.961 64.84,38.328
    Q 63.336,36.695 60.436,36.695
    L 24.879,36.695
    L 25.395,33.344
    Q 25.588,32.012 26.351,31.228
    Q 27.113,30.443 28.381,30.443
    L 60.564,30.443
    Q 61.252,30.443 61.768,29.938
    Q 62.283,29.434 62.283,28.66
    Q 62.283,27.887 61.768,27.382
    Q 61.252,26.877 60.564,26.877
    L 27.908,26.877
    Q 25.094,26.877 23.59,28.478
    Q 22.086,30.078 21.678,32.828
    L 17.123,64.023
    L 7.412,64.023
    Q 6.682,64.023 6.177,64.561
    Q 5.672,65.098 5.672,65.807
    Z
    M 26.125,17.875
    Q 26.125,19.1 26.716,20.099
    Q 27.307,21.098 28.306,21.678
    Q 29.305,22.258 30.529,22.258
    Q 31.754,22.258 32.742,21.678
    Q 33.73,21.098 34.321,20.099
    Q 34.912,19.1 34.912,17.875
    Q 34.912,16.65 34.321,15.651
    Q 33.73,14.652 32.742,14.072
    Q 31.754,13.492 30.529,13.492
    Q 29.305,13.492 28.306,14.072
    Q 27.307,14.652 26.716,15.651
    Q 26.125,16.65 26.125,17.875
    Z
    M 51.734,17.875
    Q 51.734,19.1 52.336,20.099
    Q 52.938,21.098 53.937,21.678
    Q 54.936,22.258 56.16,22.258
    Q 57.385,22.258 58.384,21.678
    Q 59.383,21.098 59.974,20.099
    Q 60.564,19.1 60.564,17.875
    Q 60.564,16.65 59.974,15.651
    Q 59.383,14.652 58.384,14.072
    Q 57.385,13.492 56.16,13.492
    Q 54.936,13.492 53.937,14.072
    Q 52.938,14.652 52.336,15.651
    Q 51.734,16.65 51.734,17.875
    Z
' />
</g>`},tag:{viewBox:`0 0 74.186 94.896`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-94.896484375)'>
<path fill='currentColor' d='
    M 38.586,19.637
    Q 35.707,16.758 32.764,16.747
    Q 29.82,16.736 26.898,19.658
    L 9.281,37.232
    Q 6.359,40.133 6.381,43.087
    Q 6.402,46.041 9.26,48.92
    L 36.502,76.055
    Q 37.49,77.043 38.274,77.483
    Q 39.059,77.924 40.015,78.042
    Q 40.971,78.16 42.432,78.16
    L 52.98,78.16
    Q 54.377,78.16 55.258,77.924
    Q 56.139,77.688 56.901,77.107
    Q 57.664,76.527 58.717,75.475
    L 65.141,69.029
    Q 66.193,67.998 66.773,67.225
    Q 67.354,66.451 67.59,65.581
    Q 67.826,64.711 67.826,63.314
    L 67.826,52.766
    Q 67.826,51.305 67.708,50.349
    Q 67.59,49.393 67.149,48.598
    Q 66.709,47.803 65.721,46.836
    Z
    M 48.383,56.611
    Q 49.908,56.611 50.918,57.632
    Q 51.928,58.652 51.928,60.135
    Q 51.928,61.617 50.918,62.638
    Q 49.908,63.658 48.383,63.658
    Q 46.879,63.658 45.869,62.638
    Q 44.859,61.617 44.859,60.135
    Q 44.859,58.652 45.869,57.632
    Q 46.879,56.611 48.383,56.611
    Z
' />
</g>`},box:{viewBox:`0 0 69.953 88.688`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-88.6875)'>
<path fill='currentColor' d='
    M 36.695,14.502
    L 36.695,42.646
    L 62.67,57.342
    Q 62.885,56.59 62.885,55.43
    L 62.885,33.516
    Q 62.885,30.83 61.972,29.498
    Q 61.059,28.166 59.232,27.135
    L 37.275,14.76
    Q 37.146,14.695 36.996,14.62
    Q 36.846,14.545 36.695,14.502
    Z
    M 33.258,14.502
    Q 33.107,14.545 32.957,14.62
    Q 32.807,14.695 32.678,14.76
    L 10.721,27.135
    Q 8.895,28.166 7.981,29.498
    Q 7.068,30.83 7.068,33.516
    L 7.068,55.43
    Q 7.068,56.59 7.283,57.342
    L 33.258,42.646
    Z
    M 34.977,45.654
    L 8.852,60.393
    Q 9.367,60.908 10.27,61.402
    L 20.625,67.268
    L 46.965,52.4
    Z
    M 50.467,54.377
    L 24.084,69.244
    L 30.443,72.854
    Q 32.807,74.186 34.977,74.186
    Q 37.146,74.186 39.51,72.854
    L 59.684,61.402
    Q 60.156,61.166 60.489,60.919
    Q 60.822,60.672 61.102,60.393
    Z
' />
</g>`},users:{viewBox:`0 0 89.547 68.063`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-68.0625)'>
<path fill='currentColor' d='
    M 41.508,9.26
    Q 38.521,9.26 37.254,10.13
    Q 35.986,11 35.986,12.805
    Q 35.986,14.953 37.018,17.295
    Q 38.049,19.637 40.036,21.86
    Q 42.023,24.084 44.859,25.867
    Q 47.695,27.65 51.315,28.714
    Q 54.936,29.777 59.232,29.777
    Q 63.529,29.777 67.139,28.714
    Q 70.748,27.65 73.595,25.867
    Q 76.441,24.084 78.418,21.86
    Q 80.395,19.637 81.437,17.295
    Q 82.479,14.953 82.479,12.805
    Q 82.479,11 81.2,10.13
    Q 79.922,9.26 76.936,9.26
    Z
    M 59.254,34.74
    Q 57.02,34.74 55.021,35.675
    Q 53.023,36.609 51.509,38.264
    Q 49.994,39.918 49.124,42.131
    Q 48.254,44.344 48.254,46.9
    Q 48.254,49.414 49.124,51.573
    Q 49.994,53.732 51.52,55.365
    Q 53.045,56.998 55.032,57.9
    Q 57.02,58.803 59.254,58.803
    Q 61.488,58.803 63.465,57.911
    Q 65.441,57.02 66.978,55.408
    Q 68.514,53.797 69.384,51.638
    Q 70.254,49.479 70.254,46.943
    Q 70.254,43.506 68.75,40.745
    Q 67.246,37.984 64.743,36.362
    Q 62.24,34.74 59.254,34.74
    Z
    M 11.688,9.26
    Q 9.238,9.26 8.153,10.216
    Q 7.068,11.172 7.068,13.02
    Q 7.068,15.92 8.465,18.885
    Q 9.861,21.85 12.504,24.342
    Q 15.146,26.834 18.885,28.359
    Q 22.623,29.885 27.307,29.885
    Q 31.303,29.885 34.386,28.8
    Q 37.469,27.715 39.789,26.061
    Q 37.512,24.277 35.847,21.957
    Q 34.182,19.637 33.279,17.23
    Q 32.377,14.824 32.388,12.719
    Q 32.398,10.613 33.494,9.26
    Z
    M 27.328,34.117
    Q 24.729,34.117 22.548,35.524
    Q 20.367,36.932 19.057,39.327
    Q 17.746,41.723 17.746,44.709
    Q 17.746,47.609 19.067,49.962
    Q 20.389,52.314 22.569,53.689
    Q 24.75,55.064 27.328,55.064
    Q 29.906,55.064 32.087,53.711
    Q 34.268,52.357 35.589,50.016
    Q 36.91,47.674 36.91,44.752
    Q 36.91,41.744 35.6,39.338
    Q 34.289,36.932 32.108,35.524
    Q 29.928,34.117 27.328,34.117
    Z
' />
</g>`},wallet:{viewBox:`0 0 78.869 81.383`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.3828125)'>
<path fill='currentColor' d='
    M 15.018,12.826
    Q 11.064,12.826 9.066,14.803
    Q 7.068,16.779 7.068,20.689
    L 7.068,49.457
    Q 7.068,53.367 9.066,55.344
    Q 11.064,57.32 15.018,57.32
    L 60.221,57.32
    Q 64.195,57.32 66.183,55.333
    Q 68.17,53.346 68.17,49.457
    L 68.17,45.139
    L 58.201,45.139
    Q 54.828,45.139 52.411,43.86
    Q 49.994,42.582 48.684,40.305
    Q 47.373,38.027 47.373,35.063
    Q 47.373,32.098 48.684,29.831
    Q 49.994,27.564 52.411,26.286
    Q 54.828,25.008 58.201,25.008
    L 68.17,25.008
    L 68.17,20.689
    Q 68.17,16.801 66.183,14.813
    Q 64.195,12.826 60.221,12.826
    Z
    M 57.492,32.162
    Q 58.695,32.162 59.544,33.011
    Q 60.393,33.859 60.393,35.063
    Q 60.393,36.266 59.544,37.114
    Q 58.695,37.963 57.492,37.963
    Q 56.268,37.963 55.419,37.114
    Q 54.57,36.266 54.57,35.063
    Q 54.57,33.859 55.419,33.011
    Q 56.268,32.162 57.492,32.162
    Z
    M 58.201,28.273
    Q 55.881,28.273 54.184,29.058
    Q 52.486,29.842 51.563,31.356
    Q 50.639,32.871 50.639,35.063
    Q 50.639,37.254 51.563,38.779
    Q 52.486,40.305 54.184,41.089
    Q 55.881,41.873 58.201,41.873
    L 67.934,41.873
    Q 69.76,41.873 70.78,40.777
    Q 71.801,39.682 71.801,38.049
    L 71.801,32.098
    Q 71.801,30.465 70.78,29.369
    Q 69.76,28.273 67.934,28.273
    Z
    M 24.256,60.736
    L 49.178,67.762
    Q 51.992,68.557 54.151,68.181
    Q 56.311,67.805 57.589,66.236
    Q 58.867,64.668 58.975,61.896
    Q 58.975,61.596 58.975,61.316
    Q 58.975,61.037 58.975,60.736
    Z
' />
</g>`},chart:{viewBox:`0 0 75.518 70.619`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.619140625)'>
<path fill='currentColor' d='
    M 9.41,20.324
    L 9.41,45.525
    Q 9.41,46.6 10.076,47.244
    Q 10.742,47.889 11.881,47.889
    L 18.584,47.889
    Q 19.723,47.889 20.399,47.244
    Q 21.076,46.6 21.076,45.525
    L 21.076,20.324
    Q 21.076,19.207 20.399,18.584
    Q 19.723,17.961 18.584,17.961
    L 11.881,17.961
    Q 10.742,17.961 10.076,18.584
    Q 9.41,19.207 9.41,20.324
    Z
    M 24.406,20.324
    L 24.406,58.352
    Q 24.406,59.447 25.083,60.081
    Q 25.76,60.715 26.877,60.715
    L 33.58,60.715
    Q 34.74,60.715 35.406,60.081
    Q 36.072,59.447 36.072,58.352
    L 36.072,20.324
    Q 36.072,19.207 35.406,18.584
    Q 34.74,17.961 33.58,17.961
    L 26.877,17.961
    Q 25.76,17.961 25.083,18.584
    Q 24.406,19.207 24.406,20.324
    Z
    M 39.424,20.324
    L 39.424,51.949
    Q 39.424,53.066 40.101,53.7
    Q 40.777,54.334 41.916,54.334
    L 48.598,54.334
    Q 49.736,54.334 50.413,53.7
    Q 51.09,53.066 51.09,51.949
    L 51.09,20.324
    Q 51.09,19.207 50.413,18.584
    Q 49.736,17.961 48.598,17.961
    L 41.916,17.961
    Q 40.777,17.961 40.101,18.584
    Q 39.424,19.207 39.424,20.324
    Z
    M 54.441,20.324
    L 54.441,39.295
    Q 54.441,40.391 55.107,41.024
    Q 55.773,41.658 56.934,41.658
    L 63.637,41.658
    Q 64.754,41.658 65.431,41.024
    Q 66.107,40.391 66.107,39.295
    L 66.107,20.324
    Q 66.107,19.207 65.431,18.584
    Q 64.754,17.961 63.637,17.961
    L 56.934,17.961
    Q 55.773,17.961 55.107,18.584
    Q 54.441,19.207 54.441,20.324
    Z
    M 7.068,11.795
    Q 7.068,12.59 7.638,13.138
    Q 8.207,13.686 8.98,13.686
    L 66.537,13.686
    Q 67.311,13.686 67.88,13.138
    Q 68.449,12.59 68.449,11.795
    Q 68.449,11 67.88,10.452
    Q 67.311,9.904 66.537,9.904
    L 8.98,9.904
    Q 8.207,9.904 7.638,10.452
    Q 7.068,11 7.068,11.795
    Z
' />
</g>`},settings:{viewBox:`0 0 67.547 84.283`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.283203125)'>
<path fill='currentColor' d='
    M 31.174,13.32
    Q 30.057,13.32 29.315,13.933
    Q 28.574,14.545 28.316,15.662
    L 26.898,21.656
    Q 26.146,21.914 25.427,22.204
    Q 24.707,22.494 24.041,22.795
    L 18.799,19.551
    Q 17.854,18.949 16.887,19.046
    Q 15.92,19.143 15.168,19.916
    L 11.516,23.547
    Q 10.742,24.32 10.646,25.309
    Q 10.549,26.297 11.172,27.242
    L 14.395,32.441
    Q 14.094,33.129 13.814,33.838
    Q 13.535,34.547 13.299,35.256
    L 7.262,36.674
    Q 6.166,36.932 5.564,37.673
    Q 4.963,38.414 4.963,39.531
    L 4.963,44.666
    Q 4.963,45.762 5.564,46.492
    Q 6.166,47.223 7.262,47.502
    L 13.256,48.941
    Q 13.514,49.715 13.804,50.424
    Q 14.094,51.133 14.352,51.756
    L 11.129,57.041
    Q 10.527,57.986 10.603,58.932
    Q 10.678,59.877 11.473,60.672
    L 15.168,64.324
    Q 15.92,65.098 16.854,65.205
    Q 17.789,65.313 18.734,64.711
    L 24.02,61.445
    Q 24.686,61.789 25.416,62.068
    Q 26.146,62.348 26.898,62.605
    L 28.316,68.621
    Q 28.574,69.738 29.315,70.351
    Q 30.057,70.963 31.174,70.963
    L 36.373,70.963
    Q 37.49,70.963 38.231,70.351
    Q 38.973,69.738 39.23,68.621
    L 40.648,62.563
    Q 41.422,62.305 42.142,62.025
    Q 42.861,61.746 43.506,61.424
    L 48.813,64.711
    Q 49.736,65.313 50.671,65.184
    Q 51.605,65.055 52.379,64.324
    L 56.074,60.672
    Q 56.869,59.877 56.934,58.932
    Q 56.998,57.986 56.418,57.041
    L 53.195,51.756
    Q 53.453,51.133 53.743,50.424
    Q 54.033,49.715 54.291,48.941
    L 60.285,47.502
    Q 61.402,47.223 61.993,46.492
    Q 62.584,45.762 62.584,44.666
    L 62.584,39.531
    Q 62.584,38.414 61.993,37.673
    Q 61.402,36.932 60.285,36.674
    L 54.248,35.256
    Q 54.012,34.547 53.732,33.838
    Q 53.453,33.129 53.152,32.441
    L 56.375,27.242
    Q 56.998,26.297 56.901,25.309
    Q 56.805,24.32 56.031,23.547
    L 52.379,19.916
    Q 51.605,19.143 50.639,19.046
    Q 49.672,18.949 48.748,19.551
    L 43.506,22.795
    Q 42.84,22.494 42.12,22.204
    Q 41.4,21.914 40.648,21.656
    L 39.23,15.662
    Q 38.973,14.545 38.231,13.933
    Q 37.49,13.32 36.373,13.32
    Z
    M 33.773,32.291
    Q 36.502,32.291 38.736,33.623
    Q 40.971,34.955 42.303,37.2
    Q 43.635,39.445 43.635,42.152
    Q 43.635,44.881 42.303,47.115
    Q 40.971,49.35 38.736,50.682
    Q 36.502,52.014 33.773,52.014
    Q 31.066,52.014 28.821,50.682
    Q 26.576,49.35 25.244,47.115
    Q 23.912,44.881 23.912,42.152
    Q 23.912,39.445 25.244,37.2
    Q 26.576,34.955 28.821,33.623
    Q 31.066,32.291 33.773,32.291
    Z
' />
</g>`},logout:{viewBox:`0 0 77.623 87.441`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.44140625)'>
<path fill='currentColor' d='
    M 15.34,14.115
    Q 11.215,14.115 9.142,16.21
    Q 7.068,18.305 7.068,22.473
    L 7.068,64.969
    Q 7.068,69.115 9.142,71.221
    Q 11.215,73.326 15.34,73.326
    L 44.924,73.326
    Q 49.049,73.326 51.122,71.221
    Q 53.195,69.115 53.195,64.969
    L 53.195,50.467
    L 49.393,50.467
    L 49.393,64.883
    Q 49.393,67.139 48.211,68.331
    Q 47.029,69.523 44.709,69.523
    L 15.555,69.523
    Q 13.234,69.523 12.053,68.331
    Q 10.871,67.139 10.871,64.883
    L 10.871,22.559
    Q 10.871,20.303 12.053,19.11
    Q 13.234,17.918 15.555,17.918
    L 44.709,17.918
    Q 47.029,17.918 48.211,19.11
    Q 49.393,20.303 49.393,22.559
    L 49.393,37.018
    L 53.195,37.018
    L 53.195,22.473
    Q 53.195,18.305 51.122,16.21
    Q 49.049,14.115 44.924,14.115
    Z
    M 30.572,43.742
    Q 30.572,44.516 31.109,45.074
    Q 31.646,45.633 32.398,45.633
    L 61.23,45.633
    L 65.313,45.482
    L 63.551,47.201
    L 58.631,51.863
    Q 58.072,52.379 58.072,53.174
    Q 58.072,53.926 58.545,54.409
    Q 59.018,54.893 59.748,54.893
    Q 60.113,54.893 60.414,54.742
    Q 60.715,54.592 60.973,54.313
    L 69.932,45.117
    Q 70.275,44.773 70.415,44.44
    Q 70.555,44.107 70.555,43.742
    Q 70.555,43.398 70.415,43.065
    Q 70.275,42.732 69.932,42.389
    L 60.973,33.193
    Q 60.715,32.914 60.414,32.774
    Q 60.113,32.635 59.748,32.635
    Q 59.018,32.635 58.545,33.129
    Q 58.072,33.623 58.072,34.354
    Q 58.072,35.127 58.631,35.643
    L 63.551,40.326
    L 65.313,42.002
    L 61.23,41.873
    L 32.398,41.873
    Q 31.646,41.873 31.109,42.432
    Q 30.572,42.99 30.572,43.742
    Z
' />
</g>`},plus:{viewBox:`0 0 59.361 59.404`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-59.404296875)'>
<path fill='currentColor' d='
    M 7.068,29.691
    Q 7.068,30.271 7.358,30.744
    Q 7.648,31.217 8.121,31.507
    Q 8.594,31.797 9.174,31.797
    L 27.586,31.797
    L 27.586,50.209
    Q 27.586,50.768 27.865,51.251
    Q 28.145,51.734 28.628,52.024
    Q 29.111,52.314 29.67,52.314
    Q 30.25,52.314 30.733,52.024
    Q 31.217,51.734 31.496,51.251
    Q 31.775,50.768 31.775,50.209
    L 31.775,31.797
    L 50.188,31.797
    Q 50.768,31.797 51.24,31.507
    Q 51.713,31.217 52.003,30.744
    Q 52.293,30.271 52.293,29.691
    Q 52.293,29.133 52.003,28.649
    Q 51.713,28.166 51.24,27.887
    Q 50.768,27.607 50.188,27.607
    L 31.775,27.607
    L 31.775,9.195
    Q 31.775,8.615 31.496,8.143
    Q 31.217,7.67 30.733,7.38
    Q 30.25,7.09 29.67,7.09
    Q 29.111,7.09 28.628,7.38
    Q 28.145,7.67 27.865,8.143
    Q 27.586,8.615 27.586,9.195
    L 27.586,27.607
    L 9.174,27.607
    Q 8.594,27.607 8.121,27.887
    Q 7.648,28.166 7.358,28.649
    Q 7.068,29.133 7.068,29.691
    Z
' />
</g>`},minus:{viewBox:`0 0 59.361 30.938`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-30.9375)'>
<path fill='currentColor' d='
    M 9.174,13.363
    Q 8.594,13.363 8.121,13.653
    Q 7.648,13.943 7.358,14.416
    Q 7.068,14.889 7.068,15.469
    Q 7.068,16.049 7.358,16.521
    Q 7.648,16.994 8.121,17.284
    Q 8.594,17.574 9.174,17.574
    L 50.188,17.574
    Q 50.768,17.574 51.24,17.284
    Q 51.713,16.994 52.003,16.521
    Q 52.293,16.049 52.293,15.469
    Q 52.293,14.889 52.003,14.416
    Q 51.713,13.943 51.24,13.653
    Q 50.768,13.363 50.188,13.363
    Z
' />
</g>`},check:{viewBox:`0 0 61.037 63.852`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-63.8515625)'>
<path fill='currentColor' d='
    M 24.449,8.508
    Q 23.074,8.508 22.043,9.818
    L 7.756,27.65
    Q 7.412,28.08 7.24,28.521
    Q 7.068,28.961 7.068,29.369
    Q 7.068,30.336 7.691,30.948
    Q 8.314,31.561 9.303,31.561
    Q 10.484,31.561 11.322,30.422
    L 24.342,13.879
    L 49.822,54.141
    Q 50.23,54.807 50.682,55.075
    Q 51.133,55.344 51.799,55.344
    Q 52.787,55.344 53.378,54.753
    Q 53.969,54.162 53.969,53.174
    Q 53.969,52.787 53.829,52.379
    Q 53.689,51.971 53.367,51.477
    L 26.77,9.775
    Q 26.361,9.152 25.781,8.83
    Q 25.201,8.508 24.449,8.508
    Z
' />
</g>`},close:{viewBox:`0 0 57.6 56.225`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-56.224609375)'>
<path fill='currentColor' d='
    M 7.67,6.982
    Q 7.262,7.391 7.133,7.928
    Q 7.004,8.465 7.144,9.013
    Q 7.283,9.561 7.67,9.947
    L 25.824,28.102
    L 7.67,46.256
    Q 7.283,46.643 7.144,47.18
    Q 7.004,47.717 7.144,48.265
    Q 7.283,48.813 7.67,49.221
    Q 8.078,49.629 8.626,49.769
    Q 9.174,49.908 9.711,49.769
    Q 10.248,49.629 10.656,49.221
    L 28.789,31.066
    L 46.943,49.221
    Q 47.352,49.629 47.889,49.758
    Q 48.426,49.887 48.963,49.758
    Q 49.5,49.629 49.908,49.221
    Q 50.316,48.813 50.456,48.275
    Q 50.596,47.738 50.456,47.19
    Q 50.316,46.643 49.908,46.256
    L 31.775,28.102
    L 49.908,9.947
    Q 50.316,9.561 50.445,9.023
    Q 50.574,8.486 50.445,7.938
    Q 50.316,7.391 49.908,6.982
    Q 49.5,6.574 48.963,6.445
    Q 48.426,6.316 47.889,6.445
    Q 47.352,6.574 46.943,6.982
    L 28.789,25.137
    L 10.656,6.982
    Q 10.248,6.574 9.711,6.445
    Q 9.174,6.316 8.637,6.445
    Q 8.1,6.574 7.67,6.982
    Z
' />
</g>`},search:{viewBox:`0 0 66.451 77.408`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-77.408203125)'>
<path fill='currentColor' d='
    M 6.381,44.064
    Q 6.381,48.576 8.067,52.508
    Q 9.754,56.439 12.751,59.437
    Q 15.748,62.434 19.69,64.12
    Q 23.633,65.807 28.123,65.807
    Q 32.613,65.807 36.556,64.12
    Q 40.498,62.434 43.484,59.437
    Q 46.471,56.439 48.168,52.508
    Q 49.865,48.576 49.865,44.064
    Q 49.865,40.283 48.619,36.856
    Q 47.373,33.43 45.182,30.68
    L 59.275,16.521
    Q 59.662,16.113 59.866,15.598
    Q 60.07,15.082 60.07,14.502
    Q 60.07,13.707 59.716,13.041
    Q 59.361,12.375 58.717,11.988
    Q 58.072,11.602 57.234,11.602
    Q 56.654,11.602 56.117,11.816
    Q 55.58,12.031 55.172,12.439
    L 41.014,26.619
    Q 38.307,24.6 35.03,23.472
    Q 31.754,22.344 28.123,22.344
    Q 23.633,22.344 19.69,24.03
    Q 15.748,25.717 12.751,28.714
    Q 9.754,31.711 8.067,35.643
    Q 6.381,39.574 6.381,44.064
    Z
    M 10.398,44.064
    Q 10.398,40.412 11.784,37.2
    Q 13.17,33.988 15.598,31.55
    Q 18.025,29.111 21.237,27.736
    Q 24.449,26.361 28.123,26.361
    Q 31.775,26.361 34.987,27.736
    Q 38.199,29.111 40.638,31.55
    Q 43.076,33.988 44.451,37.2
    Q 45.826,40.412 45.826,44.064
    Q 45.826,47.738 44.451,50.95
    Q 43.076,54.162 40.638,56.601
    Q 38.199,59.039 34.987,60.414
    Q 31.775,61.789 28.123,61.789
    Q 24.449,61.789 21.237,60.414
    Q 18.025,59.039 15.598,56.601
    Q 13.17,54.162 11.784,50.95
    Q 10.398,47.738 10.398,44.064
    Z
' />
</g>`},store:{viewBox:`0 0 74.314 87.27`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.26953125)'>
<path fill='currentColor' d='
    M 16.801,14.051
    Q 13.965,14.051 12.418,15.565
    Q 10.871,17.08 10.871,19.873
    L 10.871,41.658
    Q 12.031,41.121 13.353,40.82
    Q 14.674,40.52 16.092,40.52
    Q 18.154,40.52 19.959,41.186
    Q 21.764,41.852 23.203,43.012
    Q 24.621,41.852 26.437,41.186
    Q 28.252,40.52 30.314,40.52
    Q 32.377,40.52 34.192,41.186
    Q 36.008,41.852 37.404,43.012
    Q 38.822,41.852 40.638,41.186
    Q 42.453,40.52 44.516,40.52
    Q 46.578,40.52 48.394,41.186
    Q 50.209,41.852 51.648,43.012
    Q 53.066,41.852 54.871,41.186
    Q 56.676,40.52 58.738,40.52
    Q 60.178,40.52 61.499,40.863
    Q 62.82,41.207 63.959,41.787
    L 63.959,19.873
    Q 63.959,17.102 62.412,15.576
    Q 60.865,14.051 58.029,14.051
    Z
    M 19.98,17.854
    L 34.783,17.854
    L 34.783,33.172
    Q 34.783,34.074 34.246,34.611
    Q 33.709,35.148 32.807,35.148
    L 21.979,35.148
    Q 21.076,35.148 20.528,34.611
    Q 19.98,34.074 19.98,33.172
    Z
    M 42.84,24.836
    L 54.248,24.836
    Q 55.15,24.836 55.688,25.373
    Q 56.225,25.91 56.225,26.813
    L 56.225,34.311
    Q 56.225,35.213 55.688,35.761
    Q 55.15,36.309 54.248,36.309
    L 42.84,36.309
    Q 41.938,36.309 41.39,35.761
    Q 40.842,35.213 40.842,34.311
    L 40.842,26.813
    Q 40.842,25.91 41.39,25.373
    Q 41.938,24.836 42.84,24.836
    Z
    M 14.008,67.375
    L 14.008,67.977
    Q 14.008,70.469 15.415,71.844
    Q 16.822,73.219 19.336,73.219
    L 54.957,73.219
    Q 57.471,73.219 58.878,71.844
    Q 60.285,70.469 60.285,67.977
    L 60.285,67.375
    Z
    M 7.541,53.518
    Q 7.627,53.646 7.702,53.808
    Q 7.777,53.969 7.863,54.119
    L 13.428,64.818
    L 60.865,64.818
    L 66.408,54.119
    Q 66.516,53.969 66.591,53.808
    Q 66.666,53.646 66.73,53.518
    Z
    M 15.834,43.119
    Q 13.406,43.119 11.419,44.097
    Q 9.432,45.074 8.25,46.664
    Q 7.068,48.254 7.068,50.102
    L 7.068,50.961
    L 67.246,50.961
    L 67.246,50.531
    Q 67.246,48.684 66.064,46.986
    Q 64.883,45.289 62.896,44.204
    Q 60.908,43.119 58.48,43.119
    Q 56.182,43.119 54.334,44.129
    Q 52.486,45.139 51.391,46.857
    Q 50.273,45.139 48.404,44.129
    Q 46.535,43.119 44.258,43.119
    Q 41.959,43.119 40.111,44.14
    Q 38.264,45.16 37.146,46.857
    Q 36.051,45.16 34.203,44.14
    Q 32.355,43.119 30.057,43.119
    Q 27.758,43.119 25.899,44.129
    Q 24.041,45.139 22.945,46.857
    Q 21.828,45.139 19.97,44.129
    Q 18.111,43.119 15.834,43.119
    Z
' />
</g>`},cash:{viewBox:`0 0 85.98 58.609`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-58.609375)'>
<path fill='currentColor' d='
    M 7.068,8.895
    L 7.068,49.715
    Q 7.068,50.617 7.616,51.165
    Q 8.164,51.713 9.066,51.713
    L 76.893,51.713
    Q 77.816,51.713 78.364,51.165
    Q 78.912,50.617 78.912,49.715
    L 78.912,8.895
    Q 78.912,7.971 78.364,7.434
    Q 77.816,6.896 76.893,6.896
    L 9.066,6.896
    Q 8.164,6.896 7.616,7.434
    Q 7.068,7.971 7.068,8.895
    Z
    M 11.967,13.299
    Q 11.967,11.795 13.449,11.795
    L 72.51,11.795
    Q 74.014,11.795 74.014,13.299
    L 74.014,45.289
    Q 74.014,46.814 72.51,46.814
    L 13.449,46.814
    Q 11.967,46.814 11.967,45.289
    Z
    M 14.523,14.953
    L 14.523,43.635
    Q 14.523,44.236 15.125,44.236
    L 37.018,44.236
    Q 34.719,42.109 33.419,38.253
    Q 32.119,34.396 32.119,29.326
    Q 32.119,24.234 33.43,20.367
    Q 34.74,16.5 37.061,14.352
    L 15.125,14.352
    Q 14.523,14.352 14.523,14.953
    Z
    M 35.02,29.326
    Q 35.02,33.666 36.008,36.932
    Q 36.996,40.197 38.769,42.013
    Q 40.541,43.828 42.904,43.828
    Q 45.332,43.828 47.147,42.013
    Q 48.963,40.197 49.973,36.932
    Q 50.982,33.666 50.982,29.326
    Q 50.982,24.986 49.973,21.71
    Q 48.963,18.434 47.147,16.618
    Q 45.332,14.803 42.904,14.803
    Q 40.541,14.803 38.769,16.618
    Q 36.996,18.434 36.008,21.71
    Q 35.02,24.986 35.02,29.326
    Z
    M 48.877,14.352
    Q 51.219,16.5 52.54,20.367
    Q 53.861,24.234 53.861,29.326
    Q 53.861,34.396 52.551,38.253
    Q 51.24,42.109 48.898,44.236
    L 70.834,44.236
    Q 71.436,44.236 71.436,43.635
    L 71.436,14.953
    Q 71.436,14.352 70.834,14.352
    Z
' />
</g>`},alert:{viewBox:`0 0 69.18 73.563`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-73.5625)'>
<path fill='currentColor' d='
    M 12.848,10.527
    Q 10.613,10.527 9.002,11.473
    Q 7.391,12.418 6.531,14.04
    Q 5.672,15.662 5.672,17.639
    Q 5.672,18.605 5.93,19.583
    Q 6.188,20.561 6.746,21.484
    L 28.467,59.469
    Q 29.477,61.252 31.131,62.144
    Q 32.785,63.035 34.59,63.035
    Q 36.373,63.035 38.027,62.144
    Q 39.682,61.252 40.713,59.469
    L 62.434,21.484
    Q 62.971,20.561 63.239,19.583
    Q 63.508,18.605 63.508,17.639
    Q 63.508,15.662 62.638,14.04
    Q 61.768,12.418 60.167,11.473
    Q 58.566,10.527 56.311,10.527
    Z
    M 34.59,28.918
    Q 36.459,28.918 36.502,30.938
    L 36.846,46.041
    Q 36.867,47.008 36.212,47.642
    Q 35.557,48.275 34.568,48.275
    Q 33.559,48.275 32.925,47.652
    Q 32.291,47.029 32.291,46.063
    L 32.635,30.938
    Q 32.656,28.918 34.59,28.918
    Z
    M 34.59,19.959
    Q 35.729,19.959 36.566,20.754
    Q 37.404,21.549 37.404,22.666
    Q 37.404,23.805 36.566,24.6
    Q 35.729,25.395 34.59,25.395
    Q 33.43,25.395 32.603,24.589
    Q 31.775,23.783 31.775,22.666
    Q 31.775,21.549 32.613,20.754
    Q 33.451,19.959 34.59,19.959
    Z
' />
</g>`},trash:{viewBox:`0 0 61.768 87.012`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.01171875)'>
<path fill='currentColor' d='
    M 22.43,21.141
    Q 23.139,21.141 23.568,21.549
    Q 23.998,21.957 23.977,22.623
    L 23.053,53.625
    Q 23.053,54.291 22.612,54.678
    Q 22.172,55.064 21.527,55.064
    Q 20.797,55.064 20.378,54.667
    Q 19.959,54.27 19.98,53.604
    L 20.861,22.602
    Q 20.904,21.936 21.323,21.538
    Q 21.742,21.141 22.43,21.141
    Z
    M 30.895,21.141
    Q 31.604,21.141 32.044,21.549
    Q 32.484,21.957 32.484,22.623
    L 32.484,53.604
    Q 32.484,54.27 32.044,54.667
    Q 31.604,55.064 30.895,55.064
    Q 30.186,55.064 29.745,54.667
    Q 29.305,54.27 29.305,53.604
    L 29.305,22.623
    Q 29.305,21.957 29.745,21.549
    Q 30.186,21.141 30.895,21.141
    Z
    M 39.338,21.141
    Q 40.047,21.141 40.466,21.527
    Q 40.885,21.914 40.906,22.602
    L 41.787,53.582
    Q 41.809,54.248 41.39,54.656
    Q 40.971,55.064 40.262,55.064
    Q 39.596,55.064 39.166,54.678
    Q 38.736,54.291 38.715,53.604
    L 37.813,22.602
    Q 37.791,21.957 38.21,21.549
    Q 38.629,21.141 39.338,21.141
    Z
    M 18.928,61.896
    L 18.928,68.02
    Q 18.928,70.898 20.679,72.542
    Q 22.43,74.186 25.502,74.186
    L 36.223,74.186
    Q 39.295,74.186 41.046,72.542
    Q 42.797,70.898 42.797,68.02
    L 42.797,61.896
    L 39.037,61.896
    L 39.037,67.805
    Q 39.037,69.094 38.221,69.867
    Q 37.404,70.641 36.008,70.641
    L 25.717,70.641
    Q 24.32,70.641 23.504,69.867
    Q 22.688,69.094 22.688,67.805
    L 22.688,61.896
    Z
    M 6.037,60.027
    Q 5.328,60.027 4.791,60.554
    Q 4.254,61.08 4.254,61.811
    Q 4.254,62.541 4.791,63.078
    Q 5.328,63.615 6.037,63.615
    L 55.73,63.615
    Q 56.461,63.615 56.987,63.089
    Q 57.514,62.563 57.514,61.811
    Q 57.514,61.08 56.998,60.554
    Q 56.482,60.027 55.73,60.027
    Z
    M 18.283,12.826
    Q 16.393,12.826 14.964,13.6
    Q 13.535,14.373 12.697,15.77
    Q 11.859,17.166 11.773,19.014
    L 9.732,60.586
    L 52.057,60.586
    L 50.016,19.035
    Q 49.93,17.188 49.081,15.791
    Q 48.232,14.395 46.804,13.61
    Q 45.375,12.826 43.527,12.826
    Z
' />
</g>`},arrowRight:{viewBox:`0 0 65.613 52.164`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-52.1640625)'>
<path fill='currentColor' d='
    M 58.545,26.082
    Q 58.545,25.201 57.836,24.535
    L 39.273,5.93
    Q 38.586,5.285 37.748,5.285
    Q 36.867,5.285 36.276,5.865
    Q 35.686,6.445 35.686,7.305
    Q 35.686,7.734 35.836,8.132
    Q 35.986,8.529 36.266,8.809
    L 43.785,16.414
    L 53.818,25.674
    L 54.313,24.471
    L 45.869,23.998
    L 9.131,23.998
    Q 8.229,23.998 7.648,24.589
    Q 7.068,25.18 7.068,26.082
    Q 7.068,27.006 7.648,27.586
    Q 8.229,28.166 9.131,28.166
    L 45.869,28.166
    L 54.313,27.715
    L 53.818,26.49
    L 43.785,35.75
    L 36.266,43.377
    Q 35.965,43.656 35.825,44.054
    Q 35.686,44.451 35.686,44.859
    Q 35.686,45.74 36.276,46.31
    Q 36.867,46.879 37.748,46.879
    Q 38.156,46.879 38.564,46.707
    Q 38.973,46.535 39.381,46.127
    L 57.836,27.65
    Q 58.545,26.963 58.545,26.082
    Z
' />
</g>`},receipt:{viewBox:`0 0 60.264 87.441`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.44140625)'>
<path fill='currentColor' d='
    M 19.143,36.201
    L 41.229,36.201
    Q 41.938,36.201 42.399,36.663
    Q 42.861,37.125 42.861,37.791
    Q 42.861,38.457 42.399,38.908
    Q 41.938,39.359 41.229,39.359
    L 19.143,39.359
    Q 18.412,39.359 17.95,38.908
    Q 17.488,38.457 17.488,37.791
    Q 17.488,37.125 17.95,36.663
    Q 18.412,36.201 19.143,36.201
    Z
    M 19.143,25.846
    L 41.229,25.846
    Q 41.938,25.846 42.399,26.297
    Q 42.861,26.748 42.861,27.436
    Q 42.861,28.102 42.399,28.553
    Q 41.938,29.004 41.229,29.004
    L 19.143,29.004
    Q 18.412,29.004 17.95,28.553
    Q 17.488,28.102 17.488,27.436
    Q 17.488,26.748 17.95,26.297
    Q 18.412,25.846 19.143,25.846
    Z
    M 15.34,14.115
    Q 11.215,14.115 9.142,16.21
    Q 7.068,18.305 7.068,22.473
    L 7.068,64.969
    Q 7.068,69.115 9.152,71.221
    Q 11.236,73.326 15.34,73.326
    L 28.338,73.326
    L 28.338,53.217
    Q 28.338,48.254 33.279,48.254
    L 53.195,48.254
    L 53.195,22.473
    Q 53.195,18.326 51.122,16.221
    Q 49.049,14.115 44.924,14.115
    Z
    M 33.408,51.691
    Q 31.775,51.691 31.775,53.324
    L 31.775,73.004
    Q 32.527,72.875 33.301,72.338
    Q 34.074,71.801 34.891,70.941
    L 50.811,54.807
    Q 51.67,53.947 52.196,53.195
    Q 52.723,52.443 52.852,51.691
    Z
' />
</g>`},printer:{viewBox:`0 0 75.668 87.613`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.61328125)'>
<path fill='currentColor' d='
    M 58.566,50.596
    Q 59.941,50.596 60.93,51.584
    Q 61.918,52.572 61.918,53.969
    Q 61.918,55.344 60.93,56.332
    Q 59.941,57.32 58.566,57.32
    Q 57.17,57.32 56.182,56.332
    Q 55.193,55.344 55.193,53.969
    Q 55.193,52.572 56.182,51.584
    Q 57.17,50.596 58.566,50.596
    Z
    M 14.953,24.557
    Q 11.086,24.557 9.077,26.501
    Q 7.068,28.445 7.068,32.334
    L 7.068,55.516
    Q 7.068,59.404 9.152,61.359
    Q 11.236,63.314 14.953,63.314
    L 60.693,63.314
    Q 64.582,63.314 66.591,61.359
    Q 68.6,59.404 68.6,55.516
    L 68.6,32.334
    Q 68.6,28.445 66.591,26.501
    Q 64.582,24.557 60.693,24.557
    L 59.813,24.557
    L 59.813,40.605
    Q 59.813,43.506 58.126,45.192
    Q 56.439,46.879 53.518,46.879
    L 22.172,46.879
    Q 19.25,46.879 17.553,45.192
    Q 15.855,43.506 15.855,40.605
    L 15.855,24.557
    Z
    M 17.961,66.602
    L 17.961,67.311
    Q 17.961,69.352 18.906,70.662
    Q 19.852,71.973 21.495,72.596
    Q 23.139,73.219 25.244,73.219
    L 50.402,73.219
    Q 52.615,73.219 54.248,72.596
    Q 55.881,71.973 56.783,70.662
    Q 57.686,69.352 57.686,67.311
    L 57.686,66.602
    Z
    M 19.293,18.133
    L 19.293,40.605
    Q 19.293,41.895 20.088,42.679
    Q 20.883,43.463 22.172,43.463
    L 53.518,43.463
    Q 54.807,43.463 55.602,42.679
    Q 56.396,41.895 56.396,40.605
    L 56.396,18.133
    Q 56.396,16.436 55.365,15.415
    Q 54.334,14.395 52.658,14.395
    L 23.031,14.395
    Q 21.355,14.395 20.324,15.415
    Q 19.293,16.436 19.293,18.133
    Z
    M 28.252,32.334
    L 47.48,32.334
    Q 48.125,32.334 48.576,32.785
    Q 49.027,33.236 49.027,33.902
    Q 49.027,34.547 48.576,34.987
    Q 48.125,35.428 47.48,35.428
    L 28.252,35.428
    Q 27.586,35.428 27.135,34.987
    Q 26.684,34.547 26.684,33.902
    Q 26.684,33.236 27.135,32.785
    Q 27.586,32.334 28.252,32.334
    Z
    M 28.252,22.43
    L 47.48,22.43
    Q 48.125,22.43 48.576,22.87
    Q 49.027,23.311 49.027,23.934
    Q 49.027,24.6 48.576,25.062
    Q 48.125,25.523 47.48,25.523
    L 28.252,25.523
    Q 27.586,25.523 27.135,25.062
    Q 26.684,24.6 26.684,23.934
    Q 26.684,23.311 27.135,22.87
    Q 27.586,22.43 28.252,22.43
    Z
' />
</g>`},menu:{viewBox:`0 0 69.824 30.895`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-30.89453125)'>
<path fill='currentColor' d='
    M 8.873,1.268
    Q 8.121,1.268 7.595,1.794
    Q 7.068,2.32 7.068,3.094
    Q 7.068,3.824 7.595,4.351
    Q 8.121,4.877 8.873,4.877
    L 60.93,4.877
    Q 61.682,4.877 62.219,4.351
    Q 62.756,3.824 62.756,3.094
    Q 62.756,2.32 62.219,1.794
    Q 61.682,1.268 60.93,1.268
    Z
    M 8.873,13.643
    Q 8.121,13.643 7.595,14.169
    Q 7.068,14.695 7.068,15.447
    Q 7.068,16.199 7.595,16.726
    Q 8.121,17.252 8.873,17.252
    L 60.93,17.252
    Q 61.682,17.252 62.219,16.726
    Q 62.756,16.199 62.756,15.447
    Q 62.756,14.695 62.219,14.169
    Q 61.682,13.643 60.93,13.643
    Z
    M 8.873,26.039
    Q 8.121,26.039 7.595,26.555
    Q 7.068,27.07 7.068,27.822
    Q 7.068,28.574 7.595,29.101
    Q 8.121,29.627 8.873,29.627
    L 60.93,29.627
    Q 61.682,29.627 62.219,29.101
    Q 62.756,28.574 62.756,27.822
    Q 62.756,27.07 62.219,26.555
    Q 61.682,26.039 60.93,26.039
    Z
' />
</g>`},mail:{viewBox:`0 0 80.438 63.379`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-63.37890625)'>
<path fill='currentColor' d='
    M 40.219,28.316
    Q 38.822,28.316 37.469,29.52
    L 9.969,53.84
    Q 12.074,55.279 15.426,55.279
    L 64.99,55.279
    Q 68.342,55.279 70.447,53.84
    L 42.969,29.52
    Q 41.615,28.316 40.219,28.316
    Z
    M 7.928,12.16
    Q 7.52,12.955 7.294,13.986
    Q 7.068,15.018 7.068,16.393
    L 7.068,47.008
    Q 7.068,48.447 7.305,49.5
    Q 7.541,50.553 7.842,51.047
    L 28.531,32.742
    Z
    M 14.781,8.1
    Q 13.191,8.1 12.031,8.443
    Q 10.871,8.787 10.098,9.346
    L 31.195,30.422
    L 35.342,26.748
    Q 36.502,25.717 37.727,25.201
    Q 38.951,24.686 40.219,24.686
    Q 41.465,24.686 42.689,25.201
    Q 43.914,25.717 45.096,26.748
    L 49.242,30.422
    L 70.318,9.346
    Q 69.545,8.787 68.385,8.443
    Q 67.225,8.1 65.656,8.1
    Z
    M 72.51,12.16
    L 51.885,32.742
    L 72.574,51.047
    Q 72.875,50.553 73.122,49.5
    Q 73.369,48.447 73.369,47.008
    L 73.369,16.393
    Q 73.369,15.018 73.144,13.986
    Q 72.918,12.955 72.51,12.16
    Z
' />
</g>`},lock:{viewBox:`0 0 53.26 75.539`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-75.5390625)'>
<path fill='currentColor' d='
    M 13.793,10.764
    Q 10.893,10.764 9.335,12.396
    Q 7.777,14.029 7.777,17.123
    L 7.777,36.674
    Q 7.777,39.746 9.335,41.379
    Q 10.893,43.012 13.793,43.012
    L 39.467,43.012
    Q 42.367,43.012 43.925,41.379
    Q 45.482,39.746 45.482,36.674
    L 45.482,17.123
    Q 45.482,14.029 43.925,12.396
    Q 42.367,10.764 39.467,10.764
    Z
    M 12.697,41.186
    L 12.697,49.521
    Q 12.697,54.527 14.631,57.922
    Q 16.564,61.316 19.744,63.046
    Q 22.924,64.775 26.619,64.775
    Q 29.412,64.775 31.926,63.798
    Q 34.439,62.82 36.384,60.897
    Q 38.328,58.975 39.456,56.128
    Q 40.584,53.281 40.584,49.521
    L 40.584,41.186
    L 36.803,41.186
    L 36.803,49.973
    Q 36.803,53.539 35.428,56.042
    Q 34.053,58.545 31.743,59.866
    Q 29.434,61.188 26.619,61.188
    Q 23.826,61.188 21.517,59.866
    Q 19.207,58.545 17.843,56.042
    Q 16.479,53.539 16.479,49.973
    L 16.479,41.186
    Z
' />
</g>`},scan:{viewBox:`0 0 67.633 76.055`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-76.0546875)'>
<path fill='currentColor' d='
    M 8.98,47.566
    Q 8.057,47.566 7.563,48.071
    Q 7.068,48.576 7.068,49.5
    L 7.068,56.504
    Q 7.068,60.629 9.174,62.702
    Q 11.279,64.775 15.426,64.775
    L 22.43,64.775
    Q 23.354,64.775 23.858,64.281
    Q 24.363,63.787 24.363,62.863
    Q 24.363,61.961 23.858,61.467
    Q 23.354,60.973 22.43,60.973
    L 15.512,60.973
    Q 13.256,60.973 12.063,59.791
    Q 10.871,58.609 10.871,56.289
    L 10.871,49.5
    Q 10.871,48.576 10.388,48.071
    Q 9.904,47.566 8.98,47.566
    Z
    M 58.652,47.566
    Q 57.75,47.566 57.256,48.071
    Q 56.762,48.576 56.762,49.5
    L 56.762,56.289
    Q 56.762,58.609 55.548,59.791
    Q 54.334,60.973 52.121,60.973
    L 45.203,60.973
    Q 44.279,60.973 43.774,61.467
    Q 43.27,61.961 43.27,62.863
    Q 43.27,63.787 43.774,64.281
    Q 44.279,64.775 45.203,64.775
    L 52.207,64.775
    Q 56.375,64.775 58.47,62.691
    Q 60.564,60.607 60.564,56.504
    L 60.564,49.5
    Q 60.564,47.566 58.652,47.566
    Z
    M 15.426,11.279
    Q 11.279,11.279 9.174,13.353
    Q 7.068,15.426 7.068,19.551
    L 7.068,26.555
    Q 7.068,28.488 8.98,28.488
    Q 9.883,28.488 10.377,27.983
    Q 10.871,27.479 10.871,26.555
    L 10.871,19.766
    Q 10.871,17.445 12.063,16.264
    Q 13.256,15.082 15.512,15.082
    L 22.43,15.082
    Q 23.354,15.082 23.858,14.588
    Q 24.363,14.094 24.363,13.191
    Q 24.363,12.268 23.858,11.773
    Q 23.354,11.279 22.43,11.279
    Z
    M 45.203,11.279
    Q 44.279,11.279 43.774,11.773
    Q 43.27,12.268 43.27,13.191
    Q 43.27,14.094 43.774,14.588
    Q 44.279,15.082 45.203,15.082
    L 52.121,15.082
    Q 54.334,15.082 55.548,16.264
    Q 56.762,17.445 56.762,19.766
    L 56.762,26.555
    Q 56.762,27.479 57.245,27.983
    Q 57.729,28.488 58.652,28.488
    Q 59.576,28.488 60.07,27.983
    Q 60.564,27.479 60.564,26.555
    L 60.564,19.551
    Q 60.564,15.447 58.47,13.363
    Q 56.375,11.279 52.207,11.279
    Z
    M 21.033,26.877
    L 21.033,49.178
    L 22.988,49.178
    L 22.988,26.877
    Z
    M 25.502,26.877
    L 25.502,49.178
    L 29.305,49.178
    L 29.305,26.877
    Z
    M 30.98,26.877
    L 30.98,49.178
    L 33.344,49.178
    L 33.344,26.877
    Z
    M 35.471,26.877
    L 35.471,49.178
    L 39.145,49.178
    L 39.145,26.877
    Z
    M 40.648,26.877
    L 40.648,49.178
    L 43.57,49.178
    L 43.57,26.877
    Z
    M 44.666,26.877
    L 44.666,49.178
    L 46.514,49.178
    L 46.514,26.877
    Z
' />
</g>`},phone:{viewBox:`0 0 55.688 84.326`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.326171875)'>
<path fill='currentColor' d='
    M 17.939,13.32
    Q 15.705,13.32 14.062,14.19
    Q 12.418,15.061 11.516,16.65
    Q 10.613,18.24 10.613,20.41
    L 10.613,63.916
    Q 10.613,66.086 11.516,67.676
    Q 12.418,69.266 14.062,70.136
    Q 15.705,71.006 17.939,71.006
    L 37.727,71.006
    Q 39.982,71.006 41.626,70.136
    Q 43.27,69.266 44.172,67.676
    Q 45.074,66.086 45.074,63.916
    L 45.074,20.41
    Q 45.074,18.24 44.172,16.65
    Q 43.27,15.061 41.626,14.19
    Q 39.982,13.32 37.727,13.32
    Z
    M 18.412,17.123
    L 37.275,17.123
    Q 39.23,17.123 40.24,18.101
    Q 41.25,19.078 41.25,20.969
    L 41.25,63.357
    Q 41.25,65.248 40.24,66.226
    Q 39.23,67.203 37.275,67.203
    L 18.412,67.203
    Q 16.457,67.203 15.437,66.226
    Q 14.416,65.248 14.416,63.357
    L 14.416,20.969
    Q 14.416,19.078 15.437,18.101
    Q 16.457,17.123 18.412,17.123
    Z
    M 22.043,19.121
    Q 21.549,19.121 21.216,19.443
    Q 20.883,19.766 20.883,20.281
    Q 20.883,20.797 21.216,21.119
    Q 21.549,21.441 22.043,21.441
    L 33.645,21.441
    Q 34.16,21.441 34.482,21.119
    Q 34.805,20.797 34.805,20.281
    Q 34.805,19.766 34.482,19.443
    Q 34.16,19.121 33.645,19.121
    Z
    M 24.578,61.811
    Q 23.826,61.811 23.311,62.326
    Q 22.795,62.842 22.795,63.594
    Q 22.795,64.324 23.311,64.829
    Q 23.826,65.334 24.578,65.334
    L 31.131,65.334
    Q 31.861,65.334 32.377,64.829
    Q 32.893,64.324 32.893,63.594
    Q 32.893,62.842 32.377,62.326
    Q 31.861,61.811 31.131,61.811
    Z
' />
</g>`},download:{viewBox:`0 0 55.73 81.705`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.705078125)'>
<path fill='currentColor' d='
    M 48.662,37.684
    Q 48.662,36.846 48.018,36.158
    L 29.434,17.574
    Q 29.09,17.23 28.692,17.048
    Q 28.295,16.865 27.865,16.865
    Q 27.436,16.865 27.038,17.048
    Q 26.641,17.23 26.297,17.574
    L 7.713,36.158
    Q 7.068,36.846 7.068,37.684
    Q 7.068,38.543 7.648,39.134
    Q 8.229,39.725 9.088,39.725
    Q 9.518,39.725 9.904,39.585
    Q 10.291,39.445 10.57,39.166
    L 18.197,31.625
    L 27.285,21.764
    L 26.018,21.313
    L 25.781,29.133
    L 25.781,66.945
    Q 25.781,67.848 26.372,68.428
    Q 26.963,69.008 27.865,69.008
    Q 28.768,69.008 29.358,68.428
    Q 29.949,67.848 29.949,66.945
    L 29.949,29.133
    L 29.713,21.313
    L 28.467,21.764
    L 37.533,31.625
    L 45.16,39.166
    Q 45.439,39.445 45.826,39.585
    Q 46.213,39.725 46.643,39.725
    Q 47.502,39.725 48.082,39.134
    Q 48.662,38.543 48.662,37.684
    Z
    M 48.662,14.803
    Q 48.662,13.879 48.093,13.288
    Q 47.523,12.697 46.621,12.697
    L 9.152,12.697
    Q 8.229,12.697 7.648,13.288
    Q 7.068,13.879 7.068,14.803
    Q 7.068,15.705 7.648,16.307
    Q 8.229,16.908 9.152,16.908
    L 46.621,16.908
    Q 47.523,16.908 48.093,16.307
    Q 48.662,15.705 48.662,14.803
    Z
' />
</g>`},fileText:{viewBox:`0 0 60.264 87.441`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-87.44140625)'>
<path fill='currentColor' d='
    M 15.34,14.115
    Q 11.215,14.115 9.142,16.21
    Q 7.068,18.305 7.068,22.473
    L 7.068,64.969
    Q 7.068,69.115 9.152,71.221
    Q 11.236,73.326 15.34,73.326
    L 28.338,73.326
    L 28.338,53.217
    Q 28.338,48.254 33.279,48.254
    L 53.195,48.254
    L 53.195,22.473
    Q 53.195,18.326 51.122,16.221
    Q 49.049,14.115 44.924,14.115
    Z
    M 33.408,51.691
    Q 31.775,51.691 31.775,53.324
    L 31.775,73.004
    Q 32.527,72.875 33.301,72.338
    Q 34.074,71.801 34.891,70.941
    L 50.811,54.807
    Q 51.67,53.947 52.196,53.195
    Q 52.723,52.443 52.852,51.691
    Z
' />
</g>`},table:{viewBox:`0 0 79.234 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 8.207,40.885
    L 8.207,44.688
    L 71.242,44.688
    L 71.242,40.885
    Z
    M 8.207,25.309
    L 8.207,29.111
    L 71.242,29.111
    L 71.242,25.309
    Z
    M 37.705,10.893
    L 37.705,59.125
    L 41.508,59.125
    L 41.508,10.893
    Z
    M 15.426,9.754
    Q 11.279,9.754 9.174,11.827
    Q 7.068,13.9 7.068,18.025
    L 7.068,51.971
    Q 7.068,56.096 9.174,58.18
    Q 11.279,60.264 15.426,60.264
    L 63.787,60.264
    Q 67.955,60.264 70.061,58.169
    Q 72.166,56.074 72.166,51.971
    L 72.166,18.025
    Q 72.166,13.922 70.061,11.838
    Q 67.955,9.754 63.787,9.754
    Z
    M 15.512,13.557
    L 63.723,13.557
    Q 65.936,13.557 67.139,14.738
    Q 68.342,15.92 68.342,18.24
    L 68.342,51.777
    Q 68.342,54.098 67.139,55.279
    Q 65.936,56.461 63.723,56.461
    L 15.512,56.461
    Q 13.256,56.461 12.063,55.279
    Q 10.871,54.098 10.871,51.777
    L 10.871,18.24
    Q 10.871,15.92 12.063,14.738
    Q 13.256,13.557 15.512,13.557
    Z
' />
</g>`},calendar:{viewBox:`0 0 69.18 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.426,9.775
    Q 11.279,9.775 9.174,11.849
    Q 7.068,13.922 7.068,18.047
    L 7.068,51.992
    Q 7.068,56.117 9.174,58.19
    Q 11.279,60.264 15.426,60.264
    L 53.732,60.264
    Q 57.9,60.264 60.006,58.18
    Q 62.111,56.096 62.111,51.992
    L 62.111,18.047
    Q 62.111,13.943 60.006,11.859
    Q 57.9,9.775 53.732,9.775
    Z
    M 15.125,13.578
    L 54.012,13.578
    Q 56.053,13.578 57.17,14.663
    Q 58.287,15.748 58.287,17.875
    L 58.287,43.506
    Q 58.287,45.633 57.17,46.718
    Q 56.053,47.803 54.012,47.803
    L 15.125,47.803
    Q 13.063,47.803 11.967,46.718
    Q 10.871,45.633 10.871,43.506
    L 10.871,17.875
    Q 10.871,15.748 11.967,14.663
    Q 13.063,13.578 15.125,13.578
    Z
    M 29.111,37.92
    Q 28.424,37.92 28.177,38.156
    Q 27.93,38.393 27.93,39.059
    L 27.93,40.691
    Q 27.93,41.357 28.177,41.594
    Q 28.424,41.83 29.111,41.83
    L 30.744,41.83
    Q 31.432,41.83 31.679,41.594
    Q 31.926,41.357 31.926,40.691
    L 31.926,39.059
    Q 31.926,38.393 31.679,38.156
    Q 31.432,37.92 30.744,37.92
    Z
    M 38.436,37.92
    Q 37.77,37.92 37.522,38.156
    Q 37.275,38.393 37.275,39.059
    L 37.275,40.691
    Q 37.275,41.357 37.522,41.594
    Q 37.77,41.83 38.436,41.83
    L 40.068,41.83
    Q 40.756,41.83 41.003,41.594
    Q 41.25,41.357 41.25,40.691
    L 41.25,39.059
    Q 41.25,38.393 41.003,38.156
    Q 40.756,37.92 40.068,37.92
    Z
    M 47.781,37.92
    Q 47.094,37.92 46.847,38.156
    Q 46.6,38.393 46.6,39.059
    L 46.6,40.691
    Q 46.6,41.357 46.847,41.594
    Q 47.094,41.83 47.781,41.83
    L 49.414,41.83
    Q 50.08,41.83 50.327,41.594
    Q 50.574,41.357 50.574,40.691
    L 50.574,39.059
    Q 50.574,38.393 50.327,38.156
    Q 50.08,37.92 49.414,37.92
    Z
    M 19.787,28.725
    Q 19.1,28.725 18.853,28.961
    Q 18.605,29.197 18.605,29.863
    L 18.605,31.496
    Q 18.605,32.184 18.853,32.409
    Q 19.1,32.635 19.787,32.635
    L 21.42,32.635
    Q 22.086,32.635 22.333,32.409
    Q 22.58,32.184 22.58,31.496
    L 22.58,29.863
    Q 22.58,29.197 22.333,28.961
    Q 22.086,28.725 21.42,28.725
    Z
    M 29.111,28.725
    Q 28.424,28.725 28.177,28.961
    Q 27.93,29.197 27.93,29.863
    L 27.93,31.496
    Q 27.93,32.184 28.177,32.409
    Q 28.424,32.635 29.111,32.635
    L 30.744,32.635
    Q 31.432,32.635 31.679,32.409
    Q 31.926,32.184 31.926,31.496
    L 31.926,29.863
    Q 31.926,29.197 31.679,28.961
    Q 31.432,28.725 30.744,28.725
    Z
    M 38.436,28.725
    Q 37.77,28.725 37.522,28.961
    Q 37.275,29.197 37.275,29.863
    L 37.275,31.496
    Q 37.275,32.184 37.522,32.409
    Q 37.77,32.635 38.436,32.635
    L 40.068,32.635
    Q 40.756,32.635 41.003,32.409
    Q 41.25,32.184 41.25,31.496
    L 41.25,29.863
    Q 41.25,29.197 41.003,28.961
    Q 40.756,28.725 40.068,28.725
    Z
    M 47.781,28.725
    Q 47.094,28.725 46.847,28.961
    Q 46.6,29.197 46.6,29.863
    L 46.6,31.496
    Q 46.6,32.184 46.847,32.409
    Q 47.094,32.635 47.781,32.635
    L 49.414,32.635
    Q 50.08,32.635 50.327,32.409
    Q 50.574,32.184 50.574,31.496
    L 50.574,29.863
    Q 50.574,29.197 50.327,28.961
    Q 50.08,28.725 49.414,28.725
    Z
    M 19.787,19.551
    Q 19.1,19.551 18.853,19.776
    Q 18.605,20.002 18.605,20.689
    L 18.605,22.301
    Q 18.605,22.988 18.853,23.225
    Q 19.1,23.461 19.787,23.461
    L 21.42,23.461
    Q 22.086,23.461 22.333,23.225
    Q 22.58,22.988 22.58,22.301
    L 22.58,20.689
    Q 22.58,20.002 22.333,19.776
    Q 22.086,19.551 21.42,19.551
    Z
    M 29.111,19.551
    Q 28.424,19.551 28.177,19.776
    Q 27.93,20.002 27.93,20.689
    L 27.93,22.301
    Q 27.93,22.988 28.177,23.225
    Q 28.424,23.461 29.111,23.461
    L 30.744,23.461
    Q 31.432,23.461 31.679,23.225
    Q 31.926,22.988 31.926,22.301
    L 31.926,20.689
    Q 31.926,20.002 31.679,19.776
    Q 31.432,19.551 30.744,19.551
    Z
    M 38.436,19.551
    Q 37.77,19.551 37.522,19.776
    Q 37.275,20.002 37.275,20.689
    L 37.275,22.301
    Q 37.275,22.988 37.522,23.225
    Q 37.77,23.461 38.436,23.461
    L 40.068,23.461
    Q 40.756,23.461 41.003,23.225
    Q 41.25,22.988 41.25,22.301
    L 41.25,20.689
    Q 41.25,20.002 41.003,19.776
    Q 40.756,19.551 40.068,19.551
    Z
' />
</g>`},filter:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.116,13.868
    Q 19.916,15.275 16.425,17.854
    Q 12.934,20.432 10.355,23.923
    Q 7.777,27.414 6.37,31.614
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.37,49.264
    Q 7.777,53.453 10.355,56.955
    Q 12.934,60.457 16.425,63.024
    Q 19.916,65.592 24.116,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.457,63.024
    Q 52.959,60.457 55.526,56.955
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.614
    Q 58.094,27.414 55.526,23.923
    Q 52.959,20.432 49.457,17.854
    Q 45.955,15.275 41.766,13.868
    Q 37.576,12.461 32.936,12.461
    Z
    M 32.936,16.457
    Q 36.91,16.457 40.509,17.671
    Q 44.107,18.885 47.104,21.087
    Q 50.102,23.289 52.304,26.286
    Q 54.506,29.283 55.709,32.871
    Q 56.912,36.459 56.912,40.434
    Q 56.912,44.408 55.709,48.007
    Q 54.506,51.605 52.304,54.603
    Q 50.102,57.6 47.104,59.802
    Q 44.107,62.004 40.509,63.207
    Q 36.91,64.41 32.936,64.41
    Q 28.961,64.41 25.373,63.207
    Q 21.785,62.004 18.788,59.802
    Q 15.791,57.6 13.589,54.603
    Q 11.387,51.605 10.173,48.007
    Q 8.959,44.408 8.959,40.434
    Q 8.959,36.459 10.173,32.871
    Q 11.387,29.283 13.589,26.286
    Q 15.791,23.289 18.788,21.087
    Q 21.785,18.885 25.373,17.671
    Q 28.961,16.457 32.936,16.457
    Z
    M 17.682,46.277
    Q 16.887,46.277 16.382,46.739
    Q 15.877,47.201 15.877,47.953
    Q 15.877,48.705 16.382,49.178
    Q 16.887,49.65 17.682,49.65
    L 48.232,49.65
    Q 49.027,49.65 49.532,49.178
    Q 50.037,48.705 50.037,47.953
    Q 50.037,47.201 49.532,46.739
    Q 49.027,46.277 48.232,46.277
    Z
    M 21.764,37.104
    Q 20.969,37.104 20.464,37.576
    Q 19.959,38.049 19.959,38.801
    Q 19.959,39.553 20.464,40.015
    Q 20.969,40.477 21.764,40.477
    L 44.15,40.477
    Q 44.924,40.477 45.439,40.015
    Q 45.955,39.553 45.955,38.801
    Q 45.955,38.049 45.439,37.576
    Q 44.924,37.104 44.15,37.104
    Z
    M 26.039,27.908
    Q 25.244,27.908 24.739,28.37
    Q 24.234,28.832 24.234,29.605
    Q 24.234,30.357 24.739,30.819
    Q 25.244,31.281 26.039,31.281
    L 39.896,31.281
    Q 40.67,31.281 41.175,30.819
    Q 41.68,30.357 41.68,29.605
    Q 41.68,28.832 41.175,28.37
    Q 40.67,27.908 39.896,27.908
    Z
' />
</g>`},share:{viewBox:`0 0 62.734 89.096`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-89.095703125)'>
<path fill='currentColor' d='
    M 15.426,13.814
    Q 11.279,13.814 9.174,15.888
    Q 7.068,17.961 7.068,22.086
    L 7.068,49.65
    Q 7.068,53.775 9.174,55.859
    Q 11.279,57.943 15.426,57.943
    L 24.643,57.943
    L 24.643,54.119
    L 15.512,54.119
    Q 13.256,54.119 12.063,52.938
    Q 10.871,51.756 10.871,49.457
    L 10.871,22.301
    Q 10.871,19.98 12.063,18.799
    Q 13.256,17.617 15.512,17.617
    L 47.223,17.617
    Q 49.436,17.617 50.649,18.799
    Q 51.863,19.98 51.863,22.301
    L 51.863,49.457
    Q 51.863,51.756 50.649,52.938
    Q 49.436,54.119 47.223,54.119
    L 38.092,54.119
    L 38.092,57.943
    L 47.309,57.943
    Q 51.477,57.943 53.571,55.849
    Q 55.666,53.754 55.666,49.65
    L 55.666,22.086
    Q 55.666,17.982 53.571,15.898
    Q 51.477,13.814 47.309,13.814
    Z
    M 31.367,35.299
    Q 30.594,35.299 30.035,35.847
    Q 29.477,36.395 29.477,37.146
    L 29.477,65.979
    L 29.627,70.061
    L 27.93,68.277
    L 23.246,63.379
    Q 22.73,62.799 21.936,62.799
    Q 21.205,62.799 20.722,63.271
    Q 20.238,63.744 20.238,64.475
    Q 20.238,64.861 20.378,65.151
    Q 20.518,65.441 20.797,65.721
    L 29.992,74.658
    Q 30.357,75.023 30.68,75.152
    Q 31.002,75.281 31.367,75.281
    Q 31.732,75.281 32.055,75.152
    Q 32.377,75.023 32.742,74.658
    L 41.938,65.721
    Q 42.195,65.441 42.346,65.151
    Q 42.496,64.861 42.496,64.475
    Q 42.496,63.744 41.991,63.271
    Q 41.486,62.799 40.756,62.799
    Q 39.982,62.799 39.467,63.379
    L 34.805,68.277
    L 33.107,70.039
    L 33.258,65.979
    L 33.258,37.146
    Q 33.258,36.395 32.699,35.847
    Q 32.141,35.299 31.367,35.299
    Z
' />
</g>`},tabHome:{viewBox:`0 0 78.955 84.24`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.240234375)'>
<path fill='currentColor' d='
    M 31.518,15.705
    L 31.518,33.709
    Q 31.518,34.611 32.065,35.148
    Q 32.613,35.686 33.516,35.686
    L 45.461,35.686
    Q 46.363,35.686 46.9,35.148
    Q 47.438,34.611 47.438,33.709
    L 47.438,15.705
    Z
    M 9.109,42.303
    Q 8.143,42.303 7.605,42.883
    Q 7.068,43.463 7.068,44.172
    Q 7.068,44.602 7.251,45.01
    Q 7.434,45.418 7.842,45.762
    L 36.373,69.695
    Q 37.834,70.941 39.467,70.941
    Q 41.121,70.941 42.582,69.695
    L 71.113,45.762
    Q 71.521,45.418 71.704,45.01
    Q 71.887,44.602 71.887,44.172
    Q 71.887,43.463 71.35,42.883
    Q 70.813,42.303 69.846,42.303
    Q 69.352,42.303 68.954,42.528
    Q 68.557,42.754 68.191,43.055
    L 40.52,66.279
    Q 40.025,66.688 39.467,66.688
    Q 38.93,66.688 38.436,66.279
    L 10.764,43.055
    Q 10.398,42.754 10.001,42.528
    Q 9.604,42.303 9.109,42.303
    Z
    M 57.793,55.752
    L 57.793,62.648
    Q 57.793,63.443 58.298,63.927
    Q 58.803,64.41 59.598,64.41
    L 62.326,64.41
    Q 63.143,64.41 63.626,63.927
    Q 64.109,63.443 64.109,62.648
    L 64.109,50.424
    Z
    M 20.775,13.299
    Q 17.939,13.299 16.393,14.813
    Q 14.846,16.328 14.846,19.143
    L 14.846,49.779
    L 18.648,52.379
    L 18.648,20.066
    Q 18.648,18.605 19.39,17.854
    Q 20.131,17.102 21.57,17.102
    L 57.363,17.102
    Q 58.824,17.102 59.565,17.854
    Q 60.307,18.605 60.307,20.066
    L 60.307,52.422
    L 64.109,49.779
    L 64.109,19.143
    Q 64.109,16.35 62.563,14.824
    Q 61.016,13.299 58.18,13.299
    Z
' />
</g>`},tabVentas:{viewBox:`0 0 74.809 81.082`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.08203125)'>
<path fill='currentColor' d='
    M 27.908,26.877
    Q 25.094,26.877 23.59,28.478
    Q 22.086,30.078 21.678,32.828
    L 17.123,64.023
    L 7.412,64.023
    Q 6.682,64.023 6.177,64.561
    Q 5.672,65.098 5.672,65.807
    Q 5.672,66.537 6.177,67.063
    Q 6.682,67.59 7.412,67.59
    L 17.381,67.59
    Q 19.207,67.59 19.873,66.892
    Q 20.539,66.193 20.732,64.84
    L 25.395,33.344
    Q 25.588,32.012 26.351,31.228
    Q 27.113,30.443 28.381,30.443
    L 60.564,30.443
    Q 61.252,30.443 61.768,29.938
    Q 62.283,29.434 62.283,28.66
    Q 62.283,27.887 61.768,27.382
    Q 61.252,26.877 60.564,26.877
    Z
    M 22.924,36.695
    L 22.838,40.262
    L 60.156,40.262
    Q 61.424,40.262 62.133,41.046
    Q 62.842,41.83 63.035,43.184
    L 65.119,57.213
    L 20.346,57.213
    L 20.281,60.779
    L 66.816,60.779
    Q 67.891,60.779 68.514,60.21
    Q 69.137,59.641 69.137,58.717
    Q 69.137,58.545 69.104,58.255
    Q 69.072,57.965 69.029,57.729
    L 66.752,42.797
    Q 66.344,39.961 64.84,38.328
    Q 63.336,36.695 60.436,36.695
    Z
    M 30.529,13.492
    Q 29.305,13.492 28.306,14.072
    Q 27.307,14.652 26.716,15.651
    Q 26.125,16.65 26.125,17.875
    Q 26.125,19.1 26.716,20.099
    Q 27.307,21.098 28.306,21.678
    Q 29.305,22.258 30.529,22.258
    Q 31.754,22.258 32.742,21.678
    Q 33.73,21.098 34.321,20.099
    Q 34.912,19.1 34.912,17.875
    Q 34.912,16.65 34.321,15.651
    Q 33.73,14.652 32.742,14.072
    Q 31.754,13.492 30.529,13.492
    Z
    M 56.16,13.492
    Q 54.936,13.492 53.937,14.072
    Q 52.938,14.652 52.336,15.651
    Q 51.734,16.65 51.734,17.875
    Q 51.734,19.1 52.336,20.099
    Q 52.938,21.098 53.937,21.678
    Q 54.936,22.258 56.16,22.258
    Q 57.385,22.258 58.384,21.678
    Q 59.383,21.098 59.974,20.099
    Q 60.564,19.1 60.564,17.875
    Q 60.564,16.65 59.974,15.651
    Q 59.383,14.652 58.384,14.072
    Q 57.385,13.492 56.16,13.492
    Z
' />
</g>`},tabCatalogo:{viewBox:`0 0 74.207 94.896`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-94.896484375)'>
<path fill='currentColor' d='
    M 38.586,19.637
    Q 35.707,16.758 32.774,16.747
    Q 29.842,16.736 26.898,19.658
    L 9.303,37.232
    Q 6.359,40.133 6.381,43.087
    Q 6.402,46.041 9.281,48.92
    L 36.502,76.055
    Q 37.49,77.043 38.285,77.483
    Q 39.08,77.924 40.025,78.042
    Q 40.971,78.16 42.453,78.16
    L 52.98,78.16
    Q 54.377,78.16 55.258,77.924
    Q 56.139,77.688 56.901,77.107
    Q 57.664,76.527 58.717,75.475
    L 65.141,69.029
    Q 66.193,67.998 66.784,67.225
    Q 67.375,66.451 67.611,65.581
    Q 67.848,64.711 67.848,63.314
    L 67.848,52.766
    Q 67.848,51.305 67.719,50.349
    Q 67.59,49.393 67.149,48.598
    Q 66.709,47.803 65.721,46.836
    Z
    M 36.029,22.473
    L 63.035,49.521
    Q 63.508,49.994 63.766,50.531
    Q 64.023,51.068 64.023,51.82
    L 64.023,63.486
    Q 64.023,64.754 63.035,65.764
    L 55.43,73.369
    Q 54.441,74.357 53.174,74.357
    L 41.486,74.357
    Q 40.734,74.357 40.197,74.1
    Q 39.66,73.842 39.188,73.369
    L 12.117,46.363
    Q 10.527,44.773 10.517,43.098
    Q 10.506,41.422 12.139,39.789
    L 29.434,22.494
    Q 32.742,19.186 36.029,22.473
    Z
    M 49.822,56.611
    Q 48.297,56.611 47.287,57.632
    Q 46.277,58.652 46.277,60.135
    Q 46.277,61.617 47.287,62.638
    Q 48.297,63.658 49.822,63.658
    Q 51.326,63.658 52.336,62.638
    Q 53.346,61.617 53.346,60.135
    Q 53.346,58.652 52.336,57.632
    Q 51.326,56.611 49.822,56.611
    Z
' />
</g>`},tabInventario:{viewBox:`0 0 69.738 88.945`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-88.9453125)'>
<path fill='currentColor' d='
    M 10.656,27.564
    Q 8.852,28.596 7.96,29.906
    Q 7.068,31.217 7.068,33.859
    L 7.068,56.418
    Q 7.068,58.287 7.81,59.533
    Q 8.551,60.779 10.098,61.639
    L 30.379,73.111
    Q 32.635,74.379 34.869,74.379
    Q 37.104,74.379 39.338,73.111
    L 59.641,61.639
    Q 61.188,60.779 61.929,59.533
    Q 62.67,58.287 62.67,56.418
    L 62.67,33.859
    Q 62.67,31.217 61.778,29.906
    Q 60.887,28.596 59.082,27.564
    L 37.061,15.189
    Q 35.922,14.566 34.858,14.566
    Q 33.795,14.566 32.678,15.189
    Z
    M 12.869,30.637
    L 33,19.336
    L 33,43.033
    L 10.721,55.602
    L 10.721,34.01
    Q 10.721,32.85 11.172,32.087
    Q 11.623,31.324 12.869,30.637
    Z
    M 56.869,30.637
    Q 58.115,31.324 58.566,32.087
    Q 59.018,32.85 59.018,34.01
    L 59.018,55.602
    L 36.738,43.033
    L 36.738,19.336
    Z
    M 34.869,46.363
    L 44.236,51.584
    L 21.979,64.088
    L 12.654,58.803
    Z
    M 48.039,53.732
    L 57.084,58.803
    L 37.662,69.781
    Q 34.891,71.393 32.076,69.781
    L 25.717,66.215
    Z
' />
</g>`},tabContactos:{viewBox:`0 0 90.965 70.727`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.7265625)'>
<path fill='currentColor' d='
    M 42.152,9.926
    Q 35.879,9.926 35.879,14.137
    Q 35.879,16.307 36.942,18.734
    Q 38.006,21.162 40.036,23.472
    Q 42.066,25.781 44.999,27.65
    Q 47.932,29.52 51.67,30.647
    Q 55.408,31.775 59.877,31.775
    Q 64.346,31.775 68.084,30.647
    Q 71.822,29.52 74.755,27.65
    Q 77.688,25.781 79.729,23.472
    Q 81.77,21.162 82.833,18.734
    Q 83.896,16.307 83.896,14.137
    Q 83.896,9.926 77.602,9.926
    Z
    M 41.121,13.514
    L 78.633,13.514
    Q 79.428,13.514 79.75,13.75
    Q 80.072,13.986 80.072,14.566
    Q 80.072,16.07 79.213,17.886
    Q 78.354,19.701 76.688,21.506
    Q 75.023,23.311 72.574,24.825
    Q 70.125,26.34 66.935,27.253
    Q 63.744,28.166 59.877,28.166
    Q 56.01,28.166 52.819,27.253
    Q 49.629,26.34 47.18,24.825
    Q 44.73,23.311 43.065,21.506
    Q 41.4,19.701 40.541,17.886
    Q 39.682,16.07 39.682,14.566
    Q 39.682,13.986 40.004,13.75
    Q 40.326,13.514 41.121,13.514
    Z
    M 59.898,35.428
    Q 57.471,35.428 55.333,36.416
    Q 53.195,37.404 51.584,39.166
    Q 49.973,40.928 49.06,43.248
    Q 48.146,45.568 48.146,48.232
    Q 48.146,50.832 49.06,53.109
    Q 49.973,55.387 51.595,57.116
    Q 53.217,58.846 55.344,59.823
    Q 57.471,60.801 59.898,60.801
    Q 62.348,60.801 64.475,59.834
    Q 66.602,58.867 68.224,57.148
    Q 69.846,55.43 70.759,53.163
    Q 71.672,50.896 71.672,48.275
    Q 71.672,45.611 70.759,43.28
    Q 69.846,40.949 68.234,39.188
    Q 66.623,37.426 64.485,36.427
    Q 62.348,35.428 59.898,35.428
    Z
    M 59.898,39.016
    Q 62.09,39.016 63.895,40.251
    Q 65.699,41.486 66.784,43.592
    Q 67.869,45.697 67.869,48.275
    Q 67.869,50.811 66.784,52.83
    Q 65.699,54.85 63.895,56.031
    Q 62.09,57.213 59.898,57.213
    Q 57.729,57.213 55.913,56.01
    Q 54.098,54.807 53.023,52.776
    Q 51.949,50.746 51.949,48.232
    Q 51.949,45.654 53.034,43.56
    Q 54.119,41.465 55.924,40.24
    Q 57.729,39.016 59.898,39.016
    Z
    M 12.332,9.926
    Q 9.689,9.926 8.379,11.021
    Q 7.068,12.117 7.068,14.33
    Q 7.068,17.682 8.658,20.818
    Q 10.248,23.955 13.084,26.437
    Q 15.92,28.918 19.712,30.368
    Q 23.504,31.818 27.93,31.818
    Q 30.314,31.818 32.57,31.389
    Q 34.826,30.959 36.889,30.1
    Q 38.951,29.24 40.777,27.951
    Q 39.982,27.393 39.327,26.77
    Q 38.672,26.146 38.092,25.459
    Q 36.674,26.383 35.052,27.027
    Q 33.43,27.672 31.646,27.994
    Q 29.863,28.316 27.93,28.316
    Q 24.449,28.316 21.323,27.188
    Q 18.197,26.061 15.78,24.127
    Q 13.363,22.193 11.988,19.712
    Q 10.613,17.23 10.613,14.523
    Q 10.613,13.943 10.893,13.696
    Q 11.172,13.449 11.795,13.449
    L 32.785,13.449
    Q 32.742,12.719 33.011,12.031
    Q 33.279,11.344 33.741,10.796
    Q 34.203,10.248 34.783,9.926
    Z
    M 27.973,35.105
    Q 25.137,35.105 22.816,36.62
    Q 20.496,38.135 19.121,40.681
    Q 17.746,43.227 17.746,46.342
    Q 17.746,48.598 18.541,50.596
    Q 19.336,52.594 20.743,54.108
    Q 22.15,55.623 24.009,56.493
    Q 25.867,57.363 27.973,57.363
    Q 30.1,57.363 31.947,56.504
    Q 33.795,55.645 35.202,54.141
    Q 36.609,52.637 37.404,50.649
    Q 38.199,48.662 38.199,46.385
    Q 38.199,43.248 36.824,40.691
    Q 35.449,38.135 33.129,36.62
    Q 30.809,35.105 27.973,35.105
    Z
    M 27.973,38.65
    Q 29.799,38.65 31.324,39.682
    Q 32.85,40.713 33.763,42.464
    Q 34.676,44.215 34.676,46.385
    Q 34.676,48.447 33.773,50.134
    Q 32.871,51.82 31.346,52.819
    Q 29.82,53.818 27.973,53.818
    Q 26.146,53.818 24.621,52.809
    Q 23.096,51.799 22.193,50.102
    Q 21.291,48.404 21.291,46.342
    Q 21.291,44.193 22.193,42.453
    Q 23.096,40.713 24.621,39.682
    Q 26.146,38.65 27.973,38.65
    Z
' />
</g>`},tabFinanzas:{viewBox:`0 0 79.943 81.232`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.232421875)'>
<path fill='currentColor' d='
    M 15.125,12.762
    Q 11.15,12.762 9.109,14.771
    Q 7.068,16.779 7.068,20.732
    L 7.068,49.371
    Q 7.068,52.594 8.476,54.517
    Q 9.883,56.439 12.826,57.299
    L 49.135,67.654
    Q 52.057,68.471 54.302,68.041
    Q 56.547,67.611 57.825,65.882
    Q 59.104,64.152 59.104,61.145
    L 59.104,56.01
    L 55.236,55.709
    L 55.236,61.445
    Q 55.236,63.379 54.098,64.195
    Q 52.959,65.012 50.811,64.389
    L 27.07,57.9
    Q 26.705,57.814 26.737,57.578
    Q 26.77,57.342 27.113,57.342
    L 60.07,57.342
    Q 64.088,57.342 66.107,55.322
    Q 68.127,53.303 68.127,49.371
    L 68.127,42.539
    L 64.281,42.539
    L 64.281,49.178
    Q 64.281,51.326 63.164,52.422
    Q 62.047,53.518 60.006,53.518
    L 15.189,53.518
    Q 13.105,53.518 12.01,52.422
    Q 10.914,51.326 10.914,49.178
    L 10.914,20.926
    Q 10.914,18.777 12.01,17.692
    Q 13.105,16.607 15.189,16.607
    L 60.006,16.607
    Q 62.047,16.607 63.164,17.692
    Q 64.281,18.777 64.281,20.926
    L 64.281,28.359
    L 68.127,28.359
    L 68.127,20.732
    Q 68.127,16.801 66.107,14.781
    Q 64.088,12.762 60.07,12.762
    Z
    M 57.342,32.227
    Q 56.139,32.227 55.29,33.064
    Q 54.441,33.902 54.441,35.105
    Q 54.441,36.309 55.29,37.146
    Q 56.139,37.984 57.342,37.984
    Q 58.523,37.984 59.372,37.146
    Q 60.221,36.309 60.221,35.105
    Q 60.221,33.902 59.372,33.064
    Q 58.523,32.227 57.342,32.227
    Z
    M 57.449,26.404
    Q 54.57,26.404 52.433,27.382
    Q 50.295,28.359 49.124,30.282
    Q 47.953,32.205 47.953,35.084
    Q 47.953,37.963 49.124,39.896
    Q 50.295,41.83 52.433,42.797
    Q 54.57,43.764 57.449,43.764
    L 67.439,43.764
    Q 69.953,43.764 71.414,42.238
    Q 72.875,40.713 72.875,38.328
    L 72.875,31.84
    Q 72.875,29.455 71.414,27.93
    Q 69.953,26.404 67.439,26.404
    Z
    M 57.664,29.627
    L 66.752,29.627
    Q 68.191,29.627 68.922,30.4
    Q 69.652,31.174 69.652,32.527
    L 69.652,37.641
    Q 69.652,39.016 68.922,39.778
    Q 68.191,40.541 66.752,40.541
    L 57.664,40.541
    Q 54.506,40.541 52.927,39.102
    Q 51.348,37.662 51.348,35.084
    Q 51.348,32.527 52.927,31.077
    Q 54.506,29.627 57.664,29.627
    Z
' />
</g>`},sidebar:{viewBox:`0 0 79.234 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.426,9.775
    Q 11.279,9.775 9.174,11.849
    Q 7.068,13.922 7.068,18.047
    L 7.068,51.992
    Q 7.068,56.117 9.174,58.19
    Q 11.279,60.264 15.426,60.264
    L 63.787,60.264
    Q 67.955,60.264 70.061,58.18
    Q 72.166,56.096 72.166,51.992
    L 72.166,18.047
    Q 72.166,13.943 70.061,11.859
    Q 67.955,9.775 63.787,9.775
    Z
    M 15.512,13.578
    L 63.723,13.578
    Q 65.936,13.578 67.139,14.76
    Q 68.342,15.941 68.342,18.24
    L 68.342,51.799
    Q 68.342,54.098 67.139,55.279
    Q 65.936,56.461 63.723,56.461
    L 15.512,56.461
    Q 13.256,56.461 12.063,55.279
    Q 10.871,54.098 10.871,51.799
    L 10.871,18.24
    Q 10.871,15.941 12.063,14.76
    Q 13.256,13.578 15.512,13.578
    Z
    M 27.865,12.826
    L 27.865,57.277
    L 31.582,57.277
    L 31.582,12.826
    Z
    M 22.559,46.148
    L 16.242,46.148
    Q 15.662,46.148 15.254,46.567
    Q 14.846,46.986 14.846,47.523
    Q 14.846,48.082 15.254,48.49
    Q 15.662,48.898 16.242,48.898
    L 22.559,48.898
    Q 23.117,48.898 23.536,48.49
    Q 23.955,48.082 23.955,47.523
    Q 23.955,46.986 23.536,46.567
    Q 23.117,46.148 22.559,46.148
    Z
    M 22.559,38.887
    L 16.242,38.887
    Q 15.662,38.887 15.254,39.295
    Q 14.846,39.703 14.846,40.262
    Q 14.846,40.82 15.254,41.218
    Q 15.662,41.615 16.242,41.615
    L 22.559,41.615
    Q 23.117,41.615 23.536,41.218
    Q 23.955,40.82 23.955,40.262
    Q 23.955,39.703 23.536,39.295
    Q 23.117,38.887 22.559,38.887
    Z
    M 22.559,31.625
    L 16.242,31.625
    Q 15.662,31.625 15.254,32.022
    Q 14.846,32.42 14.846,32.979
    Q 14.846,33.537 15.254,33.935
    Q 15.662,34.332 16.242,34.332
    L 22.559,34.332
    Q 23.117,34.332 23.536,33.935
    Q 23.955,33.537 23.955,32.979
    Q 23.955,32.42 23.536,32.022
    Q 23.117,31.625 22.559,31.625
    Z
' />
</g>`},sidebarSquares:{viewBox:`0 0 79.234 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.426,9.775
    Q 11.279,9.775 9.174,11.849
    Q 7.068,13.922 7.068,18.047
    L 7.068,51.992
    Q 7.068,56.117 9.174,58.19
    Q 11.279,60.264 15.426,60.264
    L 63.787,60.264
    Q 67.955,60.264 70.061,58.18
    Q 72.166,56.096 72.166,51.992
    L 72.166,18.047
    Q 72.166,13.943 70.061,11.859
    Q 67.955,9.775 63.787,9.775
    Z
    M 15.512,13.578
    L 63.723,13.578
    Q 65.936,13.578 67.139,14.76
    Q 68.342,15.941 68.342,18.24
    L 68.342,51.799
    Q 68.342,54.098 67.139,55.279
    Q 65.936,56.461 63.723,56.461
    L 15.512,56.461
    Q 13.256,56.461 12.063,55.279
    Q 10.871,54.098 10.871,51.799
    L 10.871,18.24
    Q 10.871,15.941 12.063,14.76
    Q 13.256,13.578 15.512,13.578
    Z
    M 27.865,12.826
    L 27.865,57.277
    L 31.582,57.277
    L 31.582,12.826
    Z
    M 16.693,43.076
    Q 16.178,43.076 15.845,43.398
    Q 15.512,43.721 15.512,44.215
    L 15.512,49.607
    Q 15.512,50.768 16.693,50.768
    L 22.107,50.768
    Q 23.268,50.768 23.268,49.607
    L 23.268,44.215
    Q 23.268,43.721 22.935,43.398
    Q 22.602,43.076 22.107,43.076
    Z
    M 16.693,31.195
    Q 16.178,31.195 15.845,31.528
    Q 15.512,31.861 15.512,32.334
    L 15.512,37.748
    Q 15.512,38.264 15.834,38.597
    Q 16.156,38.93 16.693,38.93
    L 22.107,38.93
    Q 22.623,38.93 22.945,38.597
    Q 23.268,38.264 23.268,37.748
    L 23.268,32.334
    Q 23.268,31.861 22.935,31.528
    Q 22.602,31.195 22.107,31.195
    Z
    M 16.693,19.357
    Q 16.178,19.357 15.845,19.68
    Q 15.512,20.002 15.512,20.496
    L 15.512,25.889
    Q 15.512,26.404 15.834,26.727
    Q 16.156,27.049 16.693,27.049
    L 22.107,27.049
    Q 22.623,27.049 22.945,26.727
    Q 23.268,26.404 23.268,25.889
    L 23.268,20.496
    Q 23.268,20.002 22.935,19.68
    Q 22.602,19.357 22.107,19.357
    Z
' />
</g>`},inspector:{viewBox:`0 0 79.234 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.426,9.775
    Q 11.279,9.775 9.174,11.849
    Q 7.068,13.922 7.068,18.047
    L 7.068,51.992
    Q 7.068,56.117 9.174,58.19
    Q 11.279,60.264 15.426,60.264
    L 63.787,60.264
    Q 67.955,60.264 70.061,58.18
    Q 72.166,56.096 72.166,51.992
    L 72.166,18.047
    Q 72.166,13.943 70.061,11.859
    Q 67.955,9.775 63.787,9.775
    Z
    M 15.512,13.578
    L 63.723,13.578
    Q 65.936,13.578 67.139,14.76
    Q 68.342,15.941 68.342,18.24
    L 68.342,51.799
    Q 68.342,54.098 67.139,55.279
    Q 65.936,56.461 63.723,56.461
    L 15.512,56.461
    Q 13.256,56.461 12.063,55.279
    Q 10.871,54.098 10.871,51.799
    L 10.871,18.24
    Q 10.871,15.941 12.063,14.76
    Q 13.256,13.578 15.512,13.578
    Z
    M 47.674,12.826
    L 47.674,57.277
    L 51.391,57.277
    L 51.391,12.826
    Z
    M 56.719,46.148
    Q 56.16,46.148 55.741,46.567
    Q 55.322,46.986 55.322,47.523
    Q 55.322,48.082 55.741,48.49
    Q 56.16,48.898 56.719,48.898
    L 63.035,48.898
    Q 63.615,48.898 64.023,48.49
    Q 64.432,48.082 64.432,47.523
    Q 64.432,46.986 64.023,46.567
    Q 63.615,46.148 63.035,46.148
    Z
    M 56.719,38.887
    Q 56.16,38.887 55.741,39.295
    Q 55.322,39.703 55.322,40.262
    Q 55.322,40.82 55.741,41.218
    Q 56.16,41.615 56.719,41.615
    L 63.035,41.615
    Q 63.615,41.615 64.023,41.218
    Q 64.432,40.82 64.432,40.262
    Q 64.432,39.703 64.023,39.295
    Q 63.615,38.887 63.035,38.887
    Z
    M 56.719,31.625
    Q 56.16,31.625 55.741,32.022
    Q 55.322,32.42 55.322,32.979
    Q 55.322,33.537 55.741,33.935
    Q 56.16,34.332 56.719,34.332
    L 63.035,34.332
    Q 63.615,34.332 64.023,33.935
    Q 64.432,33.537 64.432,32.979
    Q 64.432,32.42 64.023,32.022
    Q 63.615,31.625 63.035,31.625
    Z
' />
</g>`},splitView:{viewBox:`0 0 79.234 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 37.705,10.291
    L 37.705,59.662
    L 41.508,59.662
    L 41.508,10.291
    Z
    M 15.426,9.754
    Q 11.279,9.754 9.174,11.827
    Q 7.068,13.9 7.068,18.025
    L 7.068,51.971
    Q 7.068,56.096 9.174,58.18
    Q 11.279,60.264 15.426,60.264
    L 63.787,60.264
    Q 67.955,60.264 70.061,58.169
    Q 72.166,56.074 72.166,51.971
    L 72.166,18.025
    Q 72.166,13.922 70.061,11.838
    Q 67.955,9.754 63.787,9.754
    Z
    M 15.512,13.557
    L 63.723,13.557
    Q 65.936,13.557 67.139,14.738
    Q 68.342,15.92 68.342,18.24
    L 68.342,51.777
    Q 68.342,54.098 67.139,55.279
    Q 65.936,56.461 63.723,56.461
    L 15.512,56.461
    Q 13.256,56.461 12.063,55.279
    Q 10.871,54.098 10.871,51.777
    L 10.871,18.24
    Q 10.871,15.92 12.063,14.738
    Q 13.256,13.557 15.512,13.557
    Z
' />
</g>`},splitView3:{viewBox:`0 0 79.234 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 27.479,12.203
    L 27.479,57.814
    L 31.303,57.814
    L 31.303,12.203
    Z
    M 47.932,12.203
    L 47.932,57.814
    L 51.734,57.814
    L 51.734,12.203
    Z
    M 15.426,9.754
    Q 11.279,9.754 9.174,11.827
    Q 7.068,13.9 7.068,18.025
    L 7.068,51.971
    Q 7.068,56.096 9.174,58.18
    Q 11.279,60.264 15.426,60.264
    L 63.787,60.264
    Q 67.955,60.264 70.061,58.169
    Q 72.166,56.074 72.166,51.971
    L 72.166,18.025
    Q 72.166,13.922 70.061,11.838
    Q 67.955,9.754 63.787,9.754
    Z
    M 15.512,13.557
    L 63.723,13.557
    Q 65.936,13.557 67.139,14.738
    Q 68.342,15.92 68.342,18.24
    L 68.342,51.777
    Q 68.342,54.098 67.139,55.279
    Q 65.936,56.461 63.723,56.461
    L 15.512,56.461
    Q 13.256,56.461 12.063,55.279
    Q 10.871,54.098 10.871,51.777
    L 10.871,18.24
    Q 10.871,15.92 12.063,14.738
    Q 13.256,13.557 15.512,13.557
    Z
' />
</g>`},groupPanel:{viewBox:`0 0 90.857 67.955`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-67.955078125)'>
<path fill='currentColor' d='
    M 12.848,35.148
    Q 9.969,35.148 8.519,36.556
    Q 7.068,37.963 7.068,40.885
    L 7.068,53.023
    Q 7.068,55.924 8.519,57.331
    Q 9.969,58.738 12.848,58.738
    L 38.93,58.738
    Q 41.809,58.738 43.259,57.331
    Q 44.709,55.924 44.709,53.023
    L 44.709,40.885
    Q 44.709,37.963 43.259,36.556
    Q 41.809,35.148 38.93,35.148
    Z
    M 13.127,38.736
    L 38.65,38.736
    Q 39.875,38.736 40.498,39.359
    Q 41.121,39.982 41.121,41.25
    L 41.121,52.658
    Q 41.121,53.947 40.498,54.549
    Q 39.875,55.15 38.65,55.15
    L 13.127,55.15
    Q 11.902,55.15 11.279,54.549
    Q 10.656,53.947 10.656,52.658
    L 10.656,41.25
    Q 10.656,39.982 11.279,39.359
    Q 11.902,38.736 13.127,38.736
    Z
    M 19.938,9.217
    Q 17.059,9.217 15.598,10.624
    Q 14.137,12.031 14.137,14.953
    L 14.137,23.439
    Q 14.137,26.34 15.598,27.747
    Q 17.059,29.154 19.938,29.154
    L 42.389,29.154
    Q 45.268,29.154 46.718,27.747
    Q 48.168,26.34 48.168,23.439
    L 48.168,14.953
    Q 48.168,12.031 46.718,10.624
    Q 45.268,9.217 42.389,9.217
    Z
    M 20.195,12.805
    L 42.088,12.805
    Q 43.334,12.805 43.957,13.417
    Q 44.58,14.029 44.58,15.297
    L 44.58,23.074
    Q 44.58,24.363 43.957,24.965
    Q 43.334,25.566 42.088,25.566
    L 20.195,25.566
    Q 18.971,25.566 18.348,24.965
    Q 17.725,24.363 17.725,23.074
    L 17.725,15.297
    Q 17.725,14.029 18.348,13.417
    Q 18.971,12.805 20.195,12.805
    Z
    M 59.34,12.332
    Q 56.461,12.332 55.011,13.75
    Q 53.561,15.168 53.561,18.09
    L 53.561,49.414
    Q 53.561,52.314 55.011,53.722
    Q 56.461,55.129 59.34,55.129
    L 78.01,55.129
    Q 80.889,55.129 82.339,53.722
    Q 83.789,52.314 83.789,49.414
    L 83.789,18.09
    Q 83.789,15.168 82.339,13.75
    Q 80.889,12.332 78.01,12.332
    Z
    M 59.598,15.941
    L 77.709,15.941
    Q 78.955,15.941 79.578,16.554
    Q 80.201,17.166 80.201,18.434
    L 80.201,49.027
    Q 80.201,50.316 79.578,50.929
    Q 78.955,51.541 77.709,51.541
    L 59.598,51.541
    Q 58.373,51.541 57.761,50.929
    Q 57.148,50.316 57.148,49.027
    L 57.148,18.434
    Q 57.148,17.166 57.761,16.554
    Q 58.373,15.941 59.598,15.941
    Z
' />
</g>`},grid:{viewBox:`0 0 64.646 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 12.01,37.383
    Q 9.561,37.383 8.314,38.607
    Q 7.068,39.832 7.068,42.389
    L 7.068,55.258
    Q 7.068,57.814 8.314,59.039
    Q 9.561,60.264 12.01,60.264
    L 25.029,60.264
    Q 27.479,60.264 28.725,59.039
    Q 29.971,57.814 29.971,55.258
    L 29.971,42.389
    Q 29.971,39.832 28.725,38.607
    Q 27.479,37.383 25.029,37.383
    Z
    M 39.617,37.383
    Q 37.146,37.383 35.911,38.607
    Q 34.676,39.832 34.676,42.389
    L 34.676,55.258
    Q 34.676,57.814 35.911,59.039
    Q 37.146,60.264 39.617,60.264
    L 52.637,60.264
    Q 55.086,60.264 56.332,59.039
    Q 57.578,57.814 57.578,55.258
    L 57.578,42.389
    Q 57.578,39.832 56.332,38.607
    Q 55.086,37.383 52.637,37.383
    Z
    M 12.01,9.775
    Q 9.561,9.775 8.314,11
    Q 7.068,12.225 7.068,14.781
    L 7.068,27.65
    Q 7.068,30.207 8.314,31.442
    Q 9.561,32.678 12.01,32.678
    L 25.029,32.678
    Q 27.479,32.678 28.725,31.442
    Q 29.971,30.207 29.971,27.65
    L 29.971,14.781
    Q 29.971,12.225 28.725,11
    Q 27.479,9.775 25.029,9.775
    Z
    M 39.617,9.775
    Q 37.146,9.775 35.911,11
    Q 34.676,12.225 34.676,14.781
    L 34.676,27.65
    Q 34.676,30.207 35.911,31.442
    Q 37.146,32.678 39.617,32.678
    L 52.637,32.678
    Q 55.086,32.678 56.332,31.442
    Q 57.578,30.207 57.578,27.65
    L 57.578,14.781
    Q 57.578,12.225 56.332,11
    Q 55.086,9.775 52.637,9.775
    Z
' />
</g>`},layers:{viewBox:`0 0 68.17 93.414`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-93.4140625)'>
<path fill='currentColor' d='
    M 30.078,45.461
    Q 30.078,46.75 30.368,47.685
    Q 30.658,48.619 31.324,49.35
    Q 31.99,50.08 33.107,50.725
    L 55.473,63.658
    Q 56.439,64.195 57.428,64.281
    Q 58.416,64.367 59.254,63.991
    Q 60.092,63.615 60.597,62.788
    Q 61.102,61.961 61.102,60.672
    L 61.102,34.568
    Q 61.102,33.258 60.844,32.323
    Q 60.586,31.389 59.909,30.647
    Q 59.232,29.906 58.008,29.197
    L 36.051,16.521
    Q 34.354,15.533 32.989,15.619
    Q 31.625,15.705 30.852,16.812
    Q 30.078,17.918 30.078,19.98
    Z
    M 35.063,47.287
    Q 34.439,46.922 34.182,46.535
    Q 33.924,46.148 33.924,45.332
    L 33.924,20.453
    Q 33.924,20.195 34.074,20.109
    Q 34.225,20.023 34.482,20.152
    L 56.139,32.656
    Q 56.805,33.043 57.03,33.451
    Q 57.256,33.859 57.256,34.633
    L 57.256,59.404
    Q 57.256,59.684 57.063,59.791
    Q 56.869,59.898 56.611,59.748
    Z
    M 32.162,28.102
    L 24.17,23.482
    Q 22.473,22.494 21.108,22.58
    Q 19.744,22.666 18.971,23.772
    Q 18.197,24.879 18.197,26.963
    L 18.197,52.443
    Q 18.197,53.711 18.487,54.646
    Q 18.777,55.58 19.443,56.311
    Q 20.109,57.041 21.227,57.686
    L 43.592,70.619
    Q 44.559,71.156 45.547,71.242
    Q 46.535,71.328 47.373,70.952
    Q 48.211,70.576 48.716,69.749
    Q 49.221,68.922 49.221,67.633
    L 49.221,57.729
    L 45.375,55.709
    L 45.375,66.365
    Q 45.375,66.645 45.182,66.752
    Q 44.988,66.859 44.73,66.709
    L 23.182,54.27
    Q 22.559,53.883 22.301,53.507
    Q 22.043,53.131 22.043,52.314
    L 22.043,27.414
    Q 22.043,27.178 22.193,27.081
    Q 22.344,26.984 22.602,27.135
    L 32.162,32.635
    Z
    M 20.109,34.074
    L 13.063,30.014
    Q 11.344,29.025 9.99,29.111
    Q 8.637,29.197 7.853,30.304
    Q 7.068,31.41 7.068,33.494
    L 7.068,58.975
    Q 7.068,60.242 7.369,61.188
    Q 7.67,62.133 8.336,62.853
    Q 9.002,63.572 10.119,64.238
    L 32.484,77.15
    Q 33.43,77.709 34.429,77.795
    Q 35.428,77.881 36.255,77.505
    Q 37.082,77.129 37.598,76.291
    Q 38.113,75.453 38.113,74.164
    L 38.113,64.904
    L 34.246,62.992
    L 34.246,72.896
    Q 34.246,73.176 34.053,73.294
    Q 33.859,73.412 33.623,73.262
    L 12.053,60.801
    Q 11.43,60.414 11.172,60.038
    Q 10.914,59.662 10.914,58.846
    L 10.914,33.967
    Q 10.914,33.709 11.064,33.612
    Q 11.215,33.516 11.473,33.666
    L 20.109,38.65
    Z
' />
</g>`},squareStack:{viewBox:`0 0 69.889 84.283`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.283203125)'>
<path fill='currentColor' d='
    M 34.934,36.373
    Q 34.182,36.373 33.44,36.631
    Q 32.699,36.889 31.797,37.404
    L 9.84,50.145
    Q 8.357,51.004 7.713,51.777
    Q 7.068,52.551 7.068,53.582
    Q 7.068,54.613 7.713,55.387
    Q 8.357,56.16 9.84,57.02
    L 31.797,69.76
    Q 32.699,70.275 33.44,70.533
    Q 34.182,70.791 34.934,70.791
    Q 35.686,70.791 36.427,70.533
    Q 37.168,70.275 38.07,69.76
    L 60.049,57.02
    Q 61.51,56.16 62.165,55.387
    Q 62.82,54.613 62.82,53.582
    Q 62.82,52.551 62.165,51.777
    Q 61.51,51.004 60.049,50.145
    L 38.07,37.404
    Q 37.168,36.889 36.427,36.631
    Q 35.686,36.373 34.934,36.373
    Z
    M 34.934,13.492
    Q 34.182,13.492 33.44,13.739
    Q 32.699,13.986 31.797,14.502
    L 9.84,27.242
    Q 8.357,28.102 7.713,28.875
    Q 7.068,29.648 7.068,30.68
    Q 7.068,31.711 7.713,32.484
    Q 8.357,33.258 9.84,34.117
    L 20.26,40.133
    L 30.1,34.439
    Q 31.475,33.645 32.646,33.301
    Q 33.816,32.957 34.934,32.957
    Q 36.051,32.957 37.222,33.301
    Q 38.393,33.645 39.789,34.439
    L 49.629,40.133
    L 60.049,34.117
    Q 61.51,33.258 62.165,32.484
    Q 62.82,31.711 62.82,30.68
    Q 62.82,29.648 62.165,28.875
    Q 61.51,28.102 60.049,27.242
    L 38.07,14.502
    Q 37.168,13.986 36.427,13.739
    Q 35.686,13.492 34.934,13.492
    Z
' />
</g>`},camera:{viewBox:`0 0 67.633 76.055`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-76.0546875)'>
<path fill='currentColor' d='
    M 8.98,47.566
    Q 8.057,47.566 7.563,48.071
    Q 7.068,48.576 7.068,49.5
    L 7.068,56.504
    Q 7.068,60.629 9.174,62.702
    Q 11.279,64.775 15.426,64.775
    L 22.43,64.775
    Q 23.354,64.775 23.858,64.281
    Q 24.363,63.787 24.363,62.863
    Q 24.363,61.961 23.858,61.467
    Q 23.354,60.973 22.43,60.973
    L 15.512,60.973
    Q 13.256,60.973 12.063,59.791
    Q 10.871,58.609 10.871,56.289
    L 10.871,49.5
    Q 10.871,48.576 10.388,48.071
    Q 9.904,47.566 8.98,47.566
    Z
    M 58.652,47.566
    Q 57.75,47.566 57.256,48.071
    Q 56.762,48.576 56.762,49.5
    L 56.762,56.289
    Q 56.762,58.609 55.548,59.791
    Q 54.334,60.973 52.121,60.973
    L 45.203,60.973
    Q 44.279,60.973 43.774,61.467
    Q 43.27,61.961 43.27,62.863
    Q 43.27,63.787 43.774,64.281
    Q 44.279,64.775 45.203,64.775
    L 52.207,64.775
    Q 56.375,64.775 58.47,62.691
    Q 60.564,60.607 60.564,56.504
    L 60.564,49.5
    Q 60.564,47.566 58.652,47.566
    Z
    M 15.426,11.279
    Q 11.279,11.279 9.174,13.353
    Q 7.068,15.426 7.068,19.551
    L 7.068,26.555
    Q 7.068,28.488 8.98,28.488
    Q 9.883,28.488 10.377,27.983
    Q 10.871,27.479 10.871,26.555
    L 10.871,19.766
    Q 10.871,17.445 12.063,16.264
    Q 13.256,15.082 15.512,15.082
    L 22.43,15.082
    Q 23.354,15.082 23.858,14.588
    Q 24.363,14.094 24.363,13.191
    Q 24.363,12.268 23.858,11.773
    Q 23.354,11.279 22.43,11.279
    Z
    M 45.203,11.279
    Q 44.279,11.279 43.774,11.773
    Q 43.27,12.268 43.27,13.191
    Q 43.27,14.094 43.774,14.588
    Q 44.279,15.082 45.203,15.082
    L 52.121,15.082
    Q 54.334,15.082 55.548,16.264
    Q 56.762,17.445 56.762,19.766
    L 56.762,26.555
    Q 56.762,27.479 57.245,27.983
    Q 57.729,28.488 58.652,28.488
    Q 59.576,28.488 60.07,27.983
    Q 60.564,27.479 60.564,26.555
    L 60.564,19.551
    Q 60.564,15.447 58.47,13.363
    Q 56.375,11.279 52.207,11.279
    Z
    M 21.291,25.523
    Q 19.186,25.523 18.111,26.587
    Q 17.037,27.65 17.037,29.734
    L 17.037,44.494
    Q 17.037,46.6 18.111,47.663
    Q 19.186,48.727 21.291,48.727
    L 24.879,48.727
    Q 25.717,48.727 26.104,48.92
    Q 26.49,49.113 26.984,49.65
    L 28.166,50.939
    Q 28.703,51.541 29.315,51.81
    Q 29.928,52.078 30.959,52.078
    L 36.523,52.078
    Q 37.576,52.078 38.178,51.799
    Q 38.779,51.52 39.316,50.939
    L 40.477,49.65
    Q 40.992,49.092 41.379,48.909
    Q 41.766,48.727 42.604,48.727
    L 46.363,48.727
    Q 48.469,48.727 49.543,47.663
    Q 50.617,46.6 50.617,44.494
    L 50.617,29.734
    Q 50.617,27.65 49.543,26.587
    Q 48.469,25.523 46.363,25.523
    Z
    M 33.859,28.961
    Q 36.158,28.961 38.038,30.057
    Q 39.918,31.152 41.035,33.043
    Q 42.152,34.934 42.152,37.275
    Q 42.152,39.596 41.035,41.476
    Q 39.918,43.355 38.038,44.473
    Q 36.158,45.59 33.859,45.59
    Q 31.561,45.59 29.67,44.473
    Q 27.779,43.355 26.651,41.476
    Q 25.523,39.596 25.523,37.275
    Q 25.523,34.955 26.651,33.064
    Q 27.779,31.174 29.67,30.067
    Q 31.561,28.961 33.859,28.961
    Z
    M 33.838,31.066
    Q 32.119,31.066 30.723,31.904
    Q 29.326,32.742 28.488,34.149
    Q 27.65,35.557 27.65,37.275
    Q 27.65,38.994 28.488,40.391
    Q 29.326,41.787 30.723,42.625
    Q 32.119,43.463 33.838,43.463
    Q 35.535,43.463 36.942,42.625
    Q 38.35,41.787 39.177,40.391
    Q 40.004,38.994 40.004,37.275
    Q 40.004,35.557 39.177,34.149
    Q 38.35,32.742 36.942,31.904
    Q 35.535,31.066 33.838,31.066
    Z
    M 45.461,41.766
    Q 46.191,41.766 46.707,42.292
    Q 47.223,42.818 47.223,43.549
    Q 47.223,44.279 46.707,44.795
    Q 46.191,45.311 45.461,45.311
    Q 44.73,45.311 44.204,44.795
    Q 43.678,44.279 43.678,43.549
    Q 43.678,42.818 44.204,42.292
    Q 44.73,41.766 45.461,41.766
    Z
' />
</g>`},pencil:{viewBox:`0 0 56.848 57.084`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-57.083984375)'>
<path fill='currentColor' d='
    M 13.535,9.217
    L 7.434,6.682
    Q 7.133,6.553 6.854,6.692
    Q 6.574,6.832 6.445,7.122
    Q 6.316,7.412 6.445,7.713
    L 9.131,13.643
    L 40.111,44.58
    L 44.516,40.154
    Z
    M 46.814,42.389
    L 42.346,46.836
    L 44.967,49.414
    Q 45.934,50.381 46.954,50.456
    Q 47.975,50.531 48.855,49.65
    L 49.629,48.877
    Q 50.531,47.996 50.478,46.976
    Q 50.424,45.955 49.414,44.967
    Z
' />
</g>`},archive:{viewBox:`0 0 69.072 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 19.207,9.775
    Q 15.254,9.775 13.181,11.806
    Q 11.107,13.836 11.107,17.789
    L 11.107,44.623
    L 57.965,44.623
    L 57.965,17.789
    Q 57.965,13.836 55.892,11.806
    Q 53.818,9.775 49.844,9.775
    Z
    M 25.266,34.912
    L 43.807,34.912
    Q 44.645,34.912 45.149,35.428
    Q 45.654,35.943 45.654,36.803
    L 45.654,37.641
    Q 45.654,38.5 45.149,39.005
    Q 44.645,39.51 43.807,39.51
    L 25.266,39.51
    Q 24.449,39.51 23.944,39.005
    Q 23.439,38.5 23.439,37.641
    L 23.439,36.803
    Q 23.439,35.943 23.944,35.428
    Q 24.449,34.912 25.266,34.912
    Z
    M 11.559,48.061
    Q 9.346,48.061 8.207,49.328
    Q 7.068,50.596 7.068,52.787
    L 7.068,55.537
    Q 7.068,57.75 8.261,59.007
    Q 9.453,60.264 11.559,60.264
    L 57.492,60.264
    Q 59.705,60.264 60.854,59.007
    Q 62.004,57.75 62.004,55.537
    L 62.004,52.787
    Q 62.004,50.596 60.854,49.328
    Q 59.705,48.061 57.492,48.061
    Z
' />
</g>`},clock:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 18.068,37.619
    Q 17.359,37.619 16.887,38.103
    Q 16.414,38.586 16.414,39.295
    Q 16.414,39.982 16.887,40.466
    Q 17.359,40.949 18.068,40.949
    L 31.26,40.949
    L 31.26,58.459
    Q 31.26,59.146 31.743,59.63
    Q 32.227,60.113 32.914,60.113
    Q 33.623,60.113 34.106,59.63
    Q 34.59,59.146 34.59,58.459
    L 34.59,39.295
    Q 34.59,38.586 34.106,38.103
    Q 33.623,37.619 32.914,37.619
    Z
    M 32.936,12.461
    Q 28.316,12.461 24.116,13.868
    Q 19.916,15.275 16.425,17.854
    Q 12.934,20.432 10.355,23.923
    Q 7.777,27.414 6.37,31.614
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.37,49.264
    Q 7.777,53.453 10.355,56.955
    Q 12.934,60.457 16.425,63.024
    Q 19.916,65.592 24.116,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.457,63.024
    Q 52.959,60.457 55.526,56.955
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.614
    Q 58.094,27.414 55.526,23.923
    Q 52.959,20.432 49.457,17.854
    Q 45.955,15.275 41.766,13.868
    Q 37.576,12.461 32.936,12.461
    Z
    M 32.936,16.457
    Q 36.91,16.457 40.509,17.671
    Q 44.107,18.885 47.104,21.087
    Q 50.102,23.289 52.304,26.286
    Q 54.506,29.283 55.709,32.871
    Q 56.912,36.459 56.912,40.434
    Q 56.912,44.408 55.709,48.007
    Q 54.506,51.605 52.304,54.603
    Q 50.102,57.6 47.104,59.802
    Q 44.107,62.004 40.509,63.207
    Q 36.91,64.41 32.936,64.41
    Q 28.961,64.41 25.373,63.207
    Q 21.785,62.004 18.788,59.802
    Q 15.791,57.6 13.589,54.603
    Q 11.387,51.605 10.173,48.007
    Q 8.959,44.408 8.959,40.434
    Q 8.959,36.459 10.173,32.871
    Q 11.387,29.283 13.589,26.286
    Q 15.791,23.289 18.788,21.087
    Q 21.785,18.885 25.373,17.671
    Q 28.961,16.457 32.936,16.457
    Z
' />
</g>`},location:{viewBox:`0 0 61.811 73.348`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-73.34765625)'>
<path fill='currentColor' d='
    M 7.971,35.32
    Q 6.854,35.32 6.123,35.782
    Q 5.393,36.244 5.049,36.964
    Q 4.705,37.684 4.77,38.479
    Q 4.834,39.273 5.317,39.993
    Q 5.801,40.713 6.746,41.143
    L 51.885,62.133
    Q 53.152,62.734 54.259,62.638
    Q 55.365,62.541 56.085,61.896
    Q 56.805,61.252 56.955,60.188
    Q 57.105,59.125 56.482,57.771
    L 35.535,12.869
    Q 35.041,11.838 34.3,11.301
    Q 33.559,10.764 32.731,10.688
    Q 31.904,10.613 31.185,10.957
    Q 30.465,11.301 30.003,12.031
    Q 29.541,12.762 29.541,13.857
    L 29.477,34.719
    Q 29.477,35.234 28.982,35.234
    Z
' />
</g>`},note:{viewBox:`0 0 69.18 70.039`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.0390625)'>
<path fill='currentColor' d='
    M 15.426,9.775
    Q 11.279,9.775 9.174,11.849
    Q 7.068,13.922 7.068,18.047
    L 7.068,51.992
    Q 7.068,56.117 9.174,58.19
    Q 11.279,60.264 15.426,60.264
    L 53.732,60.264
    Q 57.9,60.264 60.006,58.18
    Q 62.111,56.096 62.111,51.992
    L 62.111,18.047
    Q 62.111,13.943 60.006,11.859
    Q 57.9,9.775 53.732,9.775
    Z
    M 15.125,13.578
    L 54.012,13.578
    Q 56.053,13.578 57.17,14.663
    Q 58.287,15.748 58.287,17.875
    L 58.287,43.506
    Q 58.287,45.633 57.17,46.718
    Q 56.053,47.803 54.012,47.803
    L 15.125,47.803
    Q 13.063,47.803 11.967,46.718
    Q 10.871,45.633 10.871,43.506
    L 10.871,17.875
    Q 10.871,15.748 11.967,14.663
    Q 13.063,13.578 15.125,13.578
    Z
    M 19.701,37.662
    Q 19.035,37.662 18.605,38.103
    Q 18.176,38.543 18.176,39.188
    Q 18.176,39.789 18.605,40.219
    Q 19.035,40.648 19.701,40.648
    L 49.521,40.648
    Q 50.166,40.648 50.596,40.219
    Q 51.025,39.789 51.025,39.188
    Q 51.025,38.543 50.596,38.103
    Q 50.166,37.662 49.521,37.662
    Z
    M 19.701,29.197
    Q 19.035,29.197 18.605,29.627
    Q 18.176,30.057 18.176,30.658
    Q 18.176,31.303 18.605,31.743
    Q 19.035,32.184 19.701,32.184
    L 49.521,32.184
    Q 50.166,32.184 50.596,31.743
    Q 51.025,31.303 51.025,30.658
    Q 51.025,30.057 50.596,29.627
    Q 50.166,29.197 49.521,29.197
    Z
    M 19.701,20.732
    Q 19.035,20.732 18.605,21.151
    Q 18.176,21.57 18.176,22.193
    Q 18.176,22.838 18.605,23.278
    Q 19.035,23.719 19.701,23.719
    L 38.908,23.719
    Q 39.553,23.719 39.982,23.278
    Q 40.412,22.838 40.412,22.193
    Q 40.412,21.57 39.982,21.151
    Q 39.553,20.732 38.908,20.732
    Z
' />
</g>`},chevronRight:{viewBox:`0 0 47.674 62.734`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.734375)'>
<path fill='currentColor' d='
    M 37.061,31.367
    Q 37.061,30.916 36.889,30.519
    Q 36.717,30.121 36.373,29.799
    L 14.287,8.551
    Q 13.664,7.928 12.762,7.928
    Q 12.16,7.928 11.677,8.207
    Q 11.193,8.486 10.903,8.97
    Q 10.613,9.453 10.613,10.076
    Q 10.613,10.936 11.236,11.58
    L 31.818,31.367
    L 11.236,51.176
    Q 10.613,51.82 10.613,52.68
    Q 10.613,53.281 10.903,53.765
    Q 11.193,54.248 11.677,54.527
    Q 12.16,54.807 12.762,54.807
    Q 13.664,54.807 14.287,54.184
    L 36.373,32.936
    Q 36.717,32.613 36.889,32.227
    Q 37.061,31.84 37.061,31.367
    Z
' />
</g>`},chevronLeft:{viewBox:`0 0 33.537 62.734`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.734375)'>
<path fill='currentColor' d='
    M 3.545,31.367
    Q 3.545,31.84 3.717,32.227
    Q 3.889,32.613 4.232,32.936
    L 26.318,54.184
    Q 26.941,54.807 27.844,54.807
    Q 28.445,54.807 28.929,54.527
    Q 29.412,54.248 29.702,53.765
    Q 29.992,53.281 29.992,52.68
    Q 29.992,51.82 29.369,51.176
    L 8.787,31.367
    L 29.369,11.58
    Q 29.992,10.936 29.992,10.076
    Q 29.992,9.453 29.702,8.97
    Q 29.412,8.486 28.929,8.207
    Q 28.445,7.928 27.844,7.928
    Q 26.941,7.928 26.318,8.551
    L 4.232,29.799
    Q 3.889,30.121 3.717,30.519
    Q 3.545,30.916 3.545,31.367
    Z
' />
</g>`},chevronUpDown:{viewBox:`0 0 50.961 74.701`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-74.701171875)'>
<path fill='currentColor' d='
    M 25.48,63.787
    Q 25.953,63.787 26.361,63.594
    Q 26.77,63.4 27.135,63.035
    L 43.27,47.523
    Q 43.549,47.244 43.721,46.857
    Q 43.893,46.471 43.893,45.955
    Q 43.893,45.354 43.613,44.87
    Q 43.334,44.387 42.84,44.107
    Q 42.346,43.828 41.744,43.828
    Q 41.379,43.828 40.971,43.968
    Q 40.563,44.107 40.176,44.473
    L 25.48,58.867
    L 10.785,44.473
    Q 10.398,44.107 9.99,43.968
    Q 9.582,43.828 9.217,43.828
    Q 8.594,43.828 8.11,44.107
    Q 7.627,44.387 7.348,44.87
    Q 7.068,45.354 7.068,45.955
    Q 7.068,46.471 7.24,46.857
    Q 7.412,47.244 7.691,47.523
    L 23.826,63.035
    Q 24.191,63.4 24.6,63.594
    Q 25.008,63.787 25.48,63.787
    Z
    M 25.48,10.914
    Q 25.008,10.914 24.6,11.107
    Q 24.191,11.301 23.826,11.645
    L 7.691,27.178
    Q 7.412,27.457 7.24,27.844
    Q 7.068,28.23 7.068,28.725
    Q 7.068,29.326 7.348,29.81
    Q 7.627,30.293 8.11,30.572
    Q 8.594,30.852 9.217,30.852
    Q 9.582,30.852 9.99,30.723
    Q 10.398,30.594 10.785,30.229
    L 25.48,15.834
    L 40.176,30.229
    Q 40.563,30.572 40.971,30.712
    Q 41.379,30.852 41.744,30.852
    Q 42.346,30.852 42.84,30.572
    Q 43.334,30.293 43.613,29.81
    Q 43.893,29.326 43.893,28.725
    Q 43.893,28.23 43.721,27.844
    Q 43.549,27.457 43.27,27.178
    L 27.135,11.645
    Q 26.77,11.301 26.361,11.107
    Q 25.953,10.914 25.48,10.914
    Z
' />
</g>`},creditcard:{viewBox:`0 0 78.826 62.477`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.4765625)'>
<path fill='currentColor' d='
    M 18.24,16.328
    L 25.029,16.328
    Q 26.254,16.328 27.006,17.069
    Q 27.758,17.811 27.758,18.992
    L 27.758,24.127
    Q 27.758,25.287 27.006,26.039
    Q 26.254,26.791 25.029,26.791
    L 18.24,26.791
    Q 17.016,26.791 16.264,26.039
    Q 15.512,25.287 15.512,24.127
    L 15.512,18.992
    Q 15.512,17.811 16.264,17.069
    Q 17.016,16.328 18.24,16.328
    Z
    M 7.068,37.619
    L 71.758,37.619
    L 71.758,43.85
    L 7.068,43.85
    Z
    M 15.426,7.885
    Q 11.279,7.885 9.174,9.969
    Q 7.068,12.053 7.068,16.178
    L 7.068,46.299
    Q 7.068,50.424 9.174,52.508
    Q 11.279,54.592 15.426,54.592
    L 63.379,54.592
    Q 67.547,54.592 69.652,52.497
    Q 71.758,50.402 71.758,46.299
    L 71.758,16.178
    Q 71.758,12.074 69.652,9.979
    Q 67.547,7.885 63.379,7.885
    Z
' />
</g>`},qr:{viewBox:`0 0 67.633 76.055`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-76.0546875)'>
<path fill='currentColor' d='
    M 8.98,47.566
    Q 8.057,47.566 7.563,48.071
    Q 7.068,48.576 7.068,49.5
    L 7.068,56.504
    Q 7.068,60.629 9.174,62.702
    Q 11.279,64.775 15.426,64.775
    L 22.43,64.775
    Q 23.354,64.775 23.858,64.281
    Q 24.363,63.787 24.363,62.863
    Q 24.363,61.961 23.858,61.467
    Q 23.354,60.973 22.43,60.973
    L 15.512,60.973
    Q 13.256,60.973 12.063,59.791
    Q 10.871,58.609 10.871,56.289
    L 10.871,49.5
    Q 10.871,48.576 10.388,48.071
    Q 9.904,47.566 8.98,47.566
    Z
    M 58.652,47.566
    Q 57.75,47.566 57.256,48.071
    Q 56.762,48.576 56.762,49.5
    L 56.762,56.289
    Q 56.762,58.609 55.548,59.791
    Q 54.334,60.973 52.121,60.973
    L 45.203,60.973
    Q 44.279,60.973 43.774,61.467
    Q 43.27,61.961 43.27,62.863
    Q 43.27,63.787 43.774,64.281
    Q 44.279,64.775 45.203,64.775
    L 52.207,64.775
    Q 56.375,64.775 58.47,62.691
    Q 60.564,60.607 60.564,56.504
    L 60.564,49.5
    Q 60.564,47.566 58.652,47.566
    Z
    M 15.426,11.279
    Q 11.279,11.279 9.174,13.353
    Q 7.068,15.426 7.068,19.551
    L 7.068,26.555
    Q 7.068,28.488 8.98,28.488
    Q 9.883,28.488 10.377,27.983
    Q 10.871,27.479 10.871,26.555
    L 10.871,19.766
    Q 10.871,17.445 12.063,16.264
    Q 13.256,15.082 15.512,15.082
    L 22.43,15.082
    Q 23.354,15.082 23.858,14.588
    Q 24.363,14.094 24.363,13.191
    Q 24.363,12.268 23.858,11.773
    Q 23.354,11.279 22.43,11.279
    Z
    M 45.203,11.279
    Q 44.279,11.279 43.774,11.773
    Q 43.27,12.268 43.27,13.191
    Q 43.27,14.094 43.774,14.588
    Q 44.279,15.082 45.203,15.082
    L 52.121,15.082
    Q 54.334,15.082 55.548,16.264
    Q 56.762,17.445 56.762,19.766
    L 56.762,26.555
    Q 56.762,27.479 57.245,27.983
    Q 57.729,28.488 58.652,28.488
    Q 59.576,28.488 60.07,27.983
    Q 60.564,27.479 60.564,26.555
    L 60.564,19.551
    Q 60.564,15.447 58.47,13.363
    Q 56.375,11.279 52.207,11.279
    Z
    M 21.527,24.557
    Q 21.012,24.557 20.657,24.9
    Q 20.303,25.244 20.303,25.781
    L 20.303,35.578
    Q 20.303,36.094 20.657,36.448
    Q 21.012,36.803 21.527,36.803
    L 31.324,36.803
    Q 31.861,36.803 32.205,36.448
    Q 32.549,36.094 32.549,35.578
    L 32.549,25.781
    Q 32.549,25.244 32.205,24.9
    Q 31.861,24.557 31.324,24.557
    Z
    M 22.752,27.006
    L 30.1,27.006
    L 30.1,34.375
    L 22.752,34.375
    Z
    M 24.9,29.154
    L 24.9,32.227
    L 27.973,32.227
    L 27.973,29.154
    Z
    M 21.527,39.252
    Q 21.012,39.252 20.657,39.596
    Q 20.303,39.939 20.303,40.477
    L 20.303,50.273
    Q 20.303,50.789 20.657,51.144
    Q 21.012,51.498 21.527,51.498
    L 31.324,51.498
    Q 31.861,51.498 32.205,51.144
    Q 32.549,50.789 32.549,50.273
    L 32.549,40.477
    Q 32.549,39.939 32.205,39.596
    Q 31.861,39.252 31.324,39.252
    Z
    M 22.752,41.68
    L 30.1,41.68
    L 30.1,49.049
    L 22.752,49.049
    Z
    M 24.9,43.85
    L 24.9,46.922
    L 27.973,46.922
    L 27.973,43.85
    Z
    M 36.201,39.252
    Q 35.686,39.252 35.331,39.596
    Q 34.977,39.939 34.977,40.477
    L 34.977,50.273
    Q 34.977,50.789 35.331,51.144
    Q 35.686,51.498 36.201,51.498
    L 45.998,51.498
    Q 46.535,51.498 46.879,51.144
    Q 47.223,50.789 47.223,50.273
    L 47.223,40.477
    Q 47.223,39.939 46.879,39.596
    Q 46.535,39.252 45.998,39.252
    Z
    M 37.426,41.68
    L 44.773,41.68
    L 44.773,49.049
    L 37.426,49.049
    Z
    M 39.574,43.85
    L 39.574,46.922
    L 42.646,46.922
    L 42.646,43.85
    Z
    M 35.342,24.922
    L 35.342,27.994
    L 38.393,27.994
    L 38.393,24.922
    Z
    M 43.807,24.922
    L 43.807,27.994
    L 46.857,27.994
    L 46.857,24.922
    Z
    M 39.553,29.154
    L 39.553,32.227
    L 42.625,32.227
    L 42.625,29.154
    Z
    M 35.342,33.408
    L 35.342,36.459
    L 38.393,36.459
    L 38.393,33.408
    Z
    M 43.807,33.408
    L 43.807,36.459
    L 46.857,36.459
    L 46.857,33.408
    Z
' />
</g>`},checkmarkCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.127,13.879
    Q 19.938,15.297 16.436,17.864
    Q 12.934,20.432 10.366,23.934
    Q 7.799,27.436 6.381,31.625
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.381,49.264
    Q 7.799,53.453 10.366,56.944
    Q 12.934,60.436 16.436,63.014
    Q 19.938,65.592 24.127,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.446,63.014
    Q 52.938,60.436 55.516,56.944
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.625
    Q 58.094,27.436 55.516,23.934
    Q 52.938,20.432 49.446,17.864
    Q 45.955,15.297 41.766,13.879
    Q 37.576,12.461 32.936,12.461
    Z
    M 29.863,26.984
    Q 30.465,26.984 30.97,27.264
    Q 31.475,27.543 31.84,28.123
    L 45.289,49.221
    Q 45.504,49.564 45.687,49.973
    Q 45.869,50.381 45.869,50.768
    Q 45.869,51.584 45.257,52.078
    Q 44.645,52.572 43.871,52.572
    Q 43.398,52.572 42.958,52.304
    Q 42.518,52.035 42.195,51.498
    L 29.756,31.732
    L 23.568,39.467
    Q 23.16,40.047 22.73,40.251
    Q 22.301,40.455 21.807,40.455
    Q 20.99,40.455 20.442,39.886
    Q 19.895,39.316 19.895,38.521
    Q 19.895,38.113 20.045,37.716
    Q 20.195,37.318 20.475,36.975
    L 27.779,28.123
    Q 28.252,27.5 28.757,27.242
    Q 29.262,26.984 29.863,26.984
    Z
' />
</g>`},xmarkCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.127,13.879
    Q 19.938,15.297 16.436,17.864
    Q 12.934,20.432 10.366,23.934
    Q 7.799,27.436 6.381,31.625
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.381,49.264
    Q 7.799,53.453 10.366,56.944
    Q 12.934,60.436 16.436,63.014
    Q 19.938,65.592 24.127,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.446,63.014
    Q 52.938,60.436 55.516,56.944
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.625
    Q 58.094,27.436 55.516,23.934
    Q 52.938,20.432 49.446,17.864
    Q 45.955,15.297 41.766,13.879
    Q 37.576,12.461 32.936,12.461
    Z
    M 23.611,29.09
    Q 24.449,29.09 25.051,29.691
    L 32.936,37.619
    L 40.842,29.691
    Q 41.4,29.09 42.26,29.09
    Q 43.098,29.09 43.678,29.67
    Q 44.258,30.25 44.258,31.088
    Q 44.258,31.947 43.678,32.506
    L 35.75,40.412
    L 43.699,48.361
    Q 44.279,48.941 44.279,49.779
    Q 44.279,50.574 43.699,51.144
    Q 43.119,51.713 42.303,51.713
    Q 41.529,51.713 40.928,51.111
    L 32.936,43.162
    L 24.986,51.09
    Q 24.385,51.67 23.611,51.67
    Q 22.773,51.67 22.204,51.111
    Q 21.635,50.553 21.635,49.736
    Q 21.635,48.92 22.215,48.34
    L 30.143,40.412
    L 22.215,32.484
    Q 21.635,31.883 21.635,31.088
    Q 21.635,30.25 22.204,29.67
    Q 22.773,29.09 23.611,29.09
    Z
' />
</g>`},info:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.127,13.879
    Q 19.938,15.297 16.436,17.864
    Q 12.934,20.432 10.366,23.934
    Q 7.799,27.436 6.381,31.625
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.381,49.264
    Q 7.799,53.453 10.366,56.944
    Q 12.934,60.436 16.436,63.014
    Q 19.938,65.592 24.127,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.446,63.014
    Q 52.938,60.436 55.516,56.944
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.625
    Q 58.094,27.436 55.516,23.934
    Q 52.938,20.432 49.446,17.864
    Q 45.955,15.297 41.766,13.879
    Q 37.576,12.461 32.936,12.461
    Z
    M 27.908,24.643
    L 39.51,24.643
    Q 40.283,24.643 40.799,25.137
    Q 41.314,25.631 41.314,26.404
    Q 41.314,27.113 40.799,27.629
    Q 40.283,28.145 39.51,28.145
    L 35.664,28.145
    L 35.664,43.484
    Q 35.664,44.451 35.17,45.063
    Q 34.676,45.676 33.73,45.676
    L 28.316,45.676
    Q 27.564,45.676 27.049,45.16
    Q 26.533,44.645 26.533,43.936
    Q 26.533,43.162 27.049,42.668
    Q 27.564,42.174 28.316,42.174
    L 31.754,42.174
    L 31.754,28.145
    L 27.908,28.145
    Q 27.135,28.145 26.619,27.629
    Q 26.104,27.113 26.104,26.404
    Q 26.104,25.631 26.619,25.137
    Q 27.135,24.643 27.908,24.643
    Z
    M 32.742,50.66
    Q 33.688,50.66 34.439,51.111
    Q 35.191,51.563 35.643,52.325
    Q 36.094,53.088 36.094,54.012
    Q 36.094,55.43 35.127,56.418
    Q 34.16,57.406 32.742,57.406
    Q 31.346,57.406 30.368,56.418
    Q 29.391,55.43 29.391,54.012
    Q 29.391,53.088 29.842,52.325
    Q 30.293,51.563 31.056,51.111
    Q 31.818,50.66 32.742,50.66
    Z
' />
</g>`},bolt:{viewBox:`0 0 54.141 90.836`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-90.8359375)'>
<path fill='currentColor' d='
    M 8.035,41.916
    Q 8.035,42.346 8.218,42.722
    Q 8.4,43.098 8.701,43.506
    L 33.773,74.873
    Q 34.375,75.646 35.084,75.818
    Q 35.793,75.99 36.362,75.7
    Q 36.932,75.41 37.146,74.733
    Q 37.361,74.057 37.018,73.111
    L 28.66,50.51
    L 44.43,50.51
    Q 45.182,50.51 45.644,50.048
    Q 46.105,49.586 46.105,48.92
    Q 46.105,48.512 45.934,48.125
    Q 45.762,47.738 45.461,47.33
    L 20.389,15.963
    Q 19.787,15.211 19.078,15.028
    Q 18.369,14.846 17.8,15.146
    Q 17.23,15.447 17.005,16.113
    Q 16.779,16.779 17.145,17.725
    L 25.48,40.348
    L 9.732,40.348
    Q 8.959,40.348 8.497,40.799
    Q 8.035,41.25 8.035,41.916
    Z
' />
</g>`},wifi:{viewBox:`0 0 73.82 60.543`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-60.54296875)'>
<path fill='currentColor' d='
    M 36.91,7.391
    Q 36.48,7.391 36.029,7.659
    Q 35.578,7.928 34.805,8.68
    L 28.123,15.104
    Q 27.822,15.404 27.747,15.737
    Q 27.672,16.07 27.887,16.414
    Q 28.746,17.574 30.121,18.563
    Q 31.496,19.551 33.236,20.163
    Q 34.977,20.775 36.91,20.775
    Q 38.801,20.775 40.52,20.185
    Q 42.238,19.594 43.613,18.627
    Q 44.988,17.66 45.848,16.543
    Q 46.127,16.178 46.073,15.791
    Q 46.02,15.404 45.719,15.104
    L 39.016,8.68
    Q 38.242,7.906 37.791,7.648
    Q 37.34,7.391 36.91,7.391
    Z
    M 20.754,22.494
    L 16.586,26.662
    Q 16.242,27.006 16.221,27.393
    Q 16.199,27.779 16.5,28.145
    Q 18.584,30.68 21.742,32.678
    Q 24.9,34.676 28.778,35.825
    Q 32.656,36.975 36.91,36.975
    Q 41.164,36.975 45.053,35.825
    Q 48.941,34.676 52.1,32.688
    Q 55.258,30.701 57.32,28.145
    Q 57.621,27.779 57.6,27.371
    Q 57.578,26.963 57.234,26.662
    L 53.066,22.516
    Q 52.658,22.129 52.196,22.129
    Q 51.734,22.129 51.369,22.537
    Q 49.65,24.385 47.341,25.846
    Q 45.031,27.307 42.367,28.134
    Q 39.703,28.961 36.91,28.939
    Q 34.16,28.961 31.496,28.145
    Q 28.832,27.328 26.533,25.889
    Q 24.234,24.449 22.559,22.602
    Q 22.15,22.172 21.667,22.129
    Q 21.184,22.086 20.754,22.494
    Z
    M 9.238,34.074
    L 5.543,37.834
    Q 5.221,38.178 5.199,38.586
    Q 5.178,38.994 5.457,39.359
    Q 7.885,42.346 11.301,44.87
    Q 14.717,47.395 18.853,49.253
    Q 22.988,51.111 27.575,52.132
    Q 32.162,53.152 36.91,53.152
    Q 41.68,53.152 46.256,52.121
    Q 50.832,51.09 54.957,49.242
    Q 59.082,47.395 62.498,44.87
    Q 65.914,42.346 68.363,39.359
    Q 68.643,38.994 68.643,38.586
    Q 68.643,38.178 68.277,37.834
    L 64.582,34.139
    Q 64.195,33.752 63.723,33.741
    Q 63.25,33.73 62.863,34.096
    Q 57.814,39.51 51.165,42.324
    Q 44.516,45.139 36.91,45.139
    Q 29.348,45.139 22.72,42.324
    Q 16.092,39.51 11,34.117
    Q 10.613,33.709 10.119,33.709
    Q 9.625,33.709 9.238,34.074
    Z
' />
</g>`},cellular:{viewBox:`0 0 87.441 63.508`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-63.5078125)'>
<path fill='currentColor' d='
    M 9.797,8.121
    Q 8.572,8.121 7.82,8.895
    Q 7.068,9.668 7.068,10.914
    L 7.068,23.203
    Q 7.068,24.449 7.82,25.212
    Q 8.572,25.975 9.797,25.975
    L 15.984,25.975
    Q 17.209,25.975 17.961,25.212
    Q 18.713,24.449 18.713,23.203
    L 18.713,10.914
    Q 18.713,9.668 17.961,8.895
    Q 17.209,8.121 15.984,8.121
    Z
    M 30.357,8.121
    Q 29.133,8.121 28.381,8.895
    Q 27.629,9.668 27.629,10.914
    L 27.629,31.775
    Q 27.629,33.043 28.381,33.806
    Q 29.133,34.568 30.357,34.568
    L 36.545,34.568
    Q 37.77,34.568 38.521,33.806
    Q 39.273,33.043 39.273,31.775
    L 39.273,10.914
    Q 39.273,9.668 38.521,8.895
    Q 37.77,8.121 36.545,8.121
    Z
    M 50.896,8.121
    Q 49.672,8.121 48.92,8.895
    Q 48.168,9.668 48.168,10.914
    L 48.168,41.723
    Q 48.168,42.969 48.92,43.742
    Q 49.672,44.516 50.896,44.516
    L 57.105,44.516
    Q 58.309,44.516 59.061,43.742
    Q 59.813,42.969 59.813,41.723
    L 59.813,10.914
    Q 59.813,9.668 59.061,8.895
    Q 58.309,8.121 57.105,8.121
    Z
    M 71.457,8.121
    Q 70.232,8.121 69.48,8.895
    Q 68.729,9.668 68.729,10.914
    L 68.729,52.594
    Q 68.729,53.84 69.48,54.613
    Q 70.232,55.387 71.457,55.387
    L 77.666,55.387
    Q 78.891,55.387 79.632,54.613
    Q 80.373,53.84 80.373,52.594
    L 80.373,10.914
    Q 80.373,9.668 79.632,8.895
    Q 78.891,8.121 77.666,8.121
    Z
' />
</g>`},person:{viewBox:`0 0 60.629 68.063`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-68.0625)'>
<path fill='currentColor' d='
    M 11.602,9.26
    Q 9.496,9.26 8.282,10.216
    Q 7.068,11.172 7.068,12.805
    Q 7.068,14.953 8.11,17.295
    Q 9.152,19.637 11.129,21.86
    Q 13.105,24.084 15.941,25.867
    Q 18.777,27.65 22.397,28.714
    Q 26.018,29.777 30.314,29.777
    Q 34.611,29.777 38.231,28.714
    Q 41.852,27.65 44.688,25.867
    Q 47.523,24.084 49.511,21.86
    Q 51.498,19.637 52.529,17.295
    Q 53.561,14.953 53.561,12.805
    Q 53.561,11.172 52.357,10.216
    Q 51.154,9.26 49.027,9.26
    Z
    M 30.336,34.74
    Q 28.102,34.74 26.114,35.675
    Q 24.127,36.609 22.602,38.264
    Q 21.076,39.918 20.206,42.131
    Q 19.336,44.344 19.336,46.9
    Q 19.336,49.414 20.206,51.573
    Q 21.076,53.732 22.612,55.365
    Q 24.148,56.998 26.136,57.9
    Q 28.123,58.803 30.336,58.803
    Q 32.57,58.803 34.558,57.911
    Q 36.545,57.02 38.07,55.408
    Q 39.596,53.797 40.477,51.638
    Q 41.357,49.479 41.357,46.943
    Q 41.357,43.506 39.843,40.745
    Q 38.328,37.984 35.825,36.362
    Q 33.322,34.74 30.336,34.74
    Z
' />
</g>`},bell:{viewBox:`0 0 64.109 84.025`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.025390625)'>
<path fill='currentColor' d='
    M 9.711,23.762
    Q 8.057,23.762 7.101,24.567
    Q 6.145,25.373 6.145,26.705
    Q 6.145,28.102 6.929,29.391
    Q 7.713,30.68 8.884,31.926
    Q 10.055,33.172 11.236,34.396
    Q 12.031,35.256 12.515,36.48
    Q 12.998,37.705 13.277,39.166
    Q 13.557,40.627 13.729,42.163
    Q 13.9,43.699 14.029,45.182
    Q 14.223,50.08 15.297,53.947
    Q 16.371,57.814 18.573,60.457
    Q 20.775,63.1 24.363,64.324
    Q 25.072,67.074 27.081,68.922
    Q 29.09,70.77 32.055,70.77
    Q 34.998,70.77 37.018,68.922
    Q 39.037,67.074 39.746,64.324
    Q 43.313,63.1 45.525,60.457
    Q 47.738,57.814 48.813,53.947
    Q 49.887,50.08 50.08,45.182
    Q 50.209,43.699 50.37,42.163
    Q 50.531,40.627 50.821,39.166
    Q 51.111,37.705 51.595,36.48
    Q 52.078,35.256 52.873,34.396
    Q 54.055,33.172 55.226,31.926
    Q 56.396,30.68 57.181,29.391
    Q 57.965,28.102 57.965,26.705
    Q 57.965,25.373 57.009,24.567
    Q 56.053,23.762 54.377,23.762
    Z
    M 32.055,13.256
    Q 29.777,13.256 27.983,14.244
    Q 26.189,15.232 25.083,16.844
    Q 23.977,18.455 23.762,20.346
    L 40.348,20.346
    Q 40.133,18.455 39.026,16.844
    Q 37.92,15.232 36.126,14.244
    Q 34.332,13.256 32.055,13.256
    Z
' />
</g>`},bellBadge:{viewBox:`0 0 64.109 84.176`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-84.17578125)'>
<path fill='currentColor' d='
    M 9.711,23.762
    Q 8.057,23.762 7.101,24.567
    Q 6.145,25.373 6.145,26.705
    Q 6.145,28.102 6.929,29.391
    Q 7.713,30.68 8.884,31.926
    Q 10.055,33.172 11.236,34.396
    Q 12.031,35.256 12.515,36.48
    Q 12.998,37.705 13.277,39.166
    Q 13.557,40.627 13.729,42.163
    Q 13.9,43.699 14.029,45.182
    Q 14.223,50.08 15.297,53.947
    Q 16.371,57.814 18.573,60.457
    Q 20.775,63.1 24.363,64.324
    Q 25.072,67.074 27.081,68.922
    Q 29.09,70.77 32.055,70.77
    Q 33.859,70.77 35.406,69.996
    Q 33.924,68.32 33.064,66.172
    Q 32.205,64.023 32.205,61.596
    Q 32.205,58.975 33.204,56.665
    Q 34.203,54.355 35.954,52.604
    Q 37.705,50.854 40.015,49.854
    Q 42.324,48.855 44.945,48.855
    Q 46.213,48.855 47.405,49.135
    Q 48.598,49.414 49.693,49.93
    Q 49.844,48.791 49.94,47.609
    Q 50.037,46.428 50.08,45.182
    Q 50.209,43.699 50.37,42.163
    Q 50.531,40.627 50.821,39.166
    Q 51.111,37.705 51.595,36.48
    Q 52.078,35.256 52.873,34.396
    Q 54.055,33.172 55.226,31.926
    Q 56.396,30.68 57.181,29.391
    Q 57.965,28.102 57.965,26.705
    Q 57.965,25.373 57.009,24.567
    Q 56.053,23.762 54.377,23.762
    Z
    M 32.055,13.256
    Q 29.777,13.256 27.983,14.244
    Q 26.189,15.232 25.083,16.844
    Q 23.977,18.455 23.762,20.346
    L 40.348,20.346
    Q 40.133,18.455 39.026,16.844
    Q 37.92,15.232 36.126,14.244
    Q 34.332,13.256 32.055,13.256
    Z
    M 44.967,52.271
    Q 42.41,52.271 40.294,53.539
    Q 38.178,54.807 36.91,56.923
    Q 35.643,59.039 35.643,61.596
    Q 35.643,64.152 36.91,66.279
    Q 38.178,68.406 40.294,69.663
    Q 42.41,70.92 44.967,70.92
    Q 47.523,70.92 49.64,69.663
    Q 51.756,68.406 53.023,66.279
    Q 54.291,64.152 54.291,61.596
    Q 54.291,59.039 53.023,56.923
    Q 51.756,54.807 49.64,53.539
    Q 47.523,52.271 44.967,52.271
    Z
' />
</g>`},ellipsis:{viewBox:`0 0 60.092 31.045`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-31.044921875)'>
<path fill='currentColor' d='
    M 9.99,10.506
    Q 8.594,10.506 7.455,11.183
    Q 6.316,11.859 5.64,12.998
    Q 4.963,14.137 4.963,15.512
    Q 4.963,16.908 5.64,18.047
    Q 6.316,19.186 7.455,19.862
    Q 8.594,20.539 9.99,20.539
    Q 11.365,20.539 12.515,19.862
    Q 13.664,19.186 14.341,18.047
    Q 15.018,16.908 15.018,15.512
    Q 15.018,14.137 14.341,12.998
    Q 13.664,11.859 12.515,11.183
    Q 11.365,10.506 9.99,10.506
    Z
    M 30.035,10.506
    Q 28.66,10.506 27.521,11.183
    Q 26.383,11.859 25.706,12.998
    Q 25.029,14.137 25.029,15.512
    Q 25.029,16.908 25.706,18.047
    Q 26.383,19.186 27.521,19.862
    Q 28.66,20.539 30.035,20.539
    Q 31.432,20.539 32.57,19.862
    Q 33.709,19.186 34.386,18.047
    Q 35.063,16.908 35.063,15.512
    Q 35.063,14.137 34.386,12.998
    Q 33.709,11.859 32.57,11.183
    Q 31.432,10.506 30.035,10.506
    Z
    M 50.102,10.506
    Q 48.727,10.506 47.577,11.183
    Q 46.428,11.859 45.751,12.998
    Q 45.074,14.137 45.074,15.512
    Q 45.074,16.908 45.751,18.047
    Q 46.428,19.186 47.577,19.862
    Q 48.727,20.539 50.102,20.539
    Q 51.498,20.539 52.637,19.862
    Q 53.775,19.186 54.452,18.047
    Q 55.129,16.908 55.129,15.512
    Q 55.129,14.137 54.452,12.998
    Q 53.775,11.859 52.637,11.183
    Q 51.498,10.506 50.102,10.506
    Z
' />
</g>`},plusCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.127,13.879
    Q 19.938,15.297 16.436,17.864
    Q 12.934,20.432 10.366,23.934
    Q 7.799,27.436 6.381,31.625
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.381,49.264
    Q 7.799,53.453 10.366,56.944
    Q 12.934,60.436 16.436,63.014
    Q 19.938,65.592 24.127,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.446,63.014
    Q 52.938,60.436 55.516,56.944
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.625
    Q 58.094,27.436 55.516,23.934
    Q 52.938,20.432 49.446,17.864
    Q 45.955,15.297 41.766,13.879
    Q 37.576,12.461 32.936,12.461
    Z
    M 19.701,40.412
    Q 19.701,39.531 20.292,38.973
    Q 20.883,38.414 21.785,38.414
    L 30.895,38.414
    L 30.895,29.283
    Q 30.895,28.402 31.453,27.812
    Q 32.012,27.221 32.893,27.221
    Q 33.816,27.221 34.396,27.801
    Q 34.977,28.381 34.977,29.283
    L 34.977,38.414
    L 44.086,38.414
    Q 44.988,38.414 45.579,38.973
    Q 46.17,39.531 46.17,40.412
    Q 46.17,41.336 45.59,41.916
    Q 45.01,42.496 44.086,42.496
    L 34.977,42.496
    L 34.977,51.605
    Q 34.977,52.508 34.396,53.099
    Q 33.816,53.689 32.893,53.689
    Q 32.012,53.689 31.453,53.099
    Q 30.895,52.508 30.895,51.605
    L 30.895,42.496
    L 21.785,42.496
    Q 20.861,42.496 20.281,41.916
    Q 19.701,41.336 19.701,40.412
    Z
' />
</g>`},minusCircle:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.127,13.879
    Q 19.938,15.297 16.436,17.864
    Q 12.934,20.432 10.366,23.934
    Q 7.799,27.436 6.381,31.625
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.381,49.264
    Q 7.799,53.453 10.366,56.944
    Q 12.934,60.436 16.436,63.014
    Q 19.938,65.592 24.127,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.446,63.014
    Q 52.938,60.436 55.516,56.944
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.625
    Q 58.094,27.436 55.516,23.934
    Q 52.938,20.432 49.446,17.864
    Q 45.955,15.297 41.766,13.879
    Q 37.576,12.461 32.936,12.461
    Z
    M 21.334,38.35
    L 44.58,38.35
    Q 45.59,38.35 46.224,38.887
    Q 46.857,39.424 46.857,40.369
    Q 46.857,41.357 46.245,41.905
    Q 45.633,42.453 44.58,42.453
    L 21.334,42.453
    Q 20.281,42.453 19.658,41.905
    Q 19.035,41.357 19.035,40.369
    Q 19.035,39.424 19.68,38.887
    Q 20.324,38.35 21.334,38.35
    Z
' />
</g>`},arrowsUpDown:{viewBox:`0 0 77.645 71.65`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-71.650390625)'>
<path fill='currentColor' d='
    M 21.785,60.779
    Q 22.473,61.488 23.375,61.478
    Q 24.277,61.467 24.943,60.779
    L 38.973,46.535
    Q 39.295,46.213 39.478,45.783
    Q 39.66,45.354 39.66,44.945
    Q 39.66,44.021 39.069,43.441
    Q 38.479,42.861 37.576,42.861
    Q 36.695,42.861 36.072,43.484
    L 29.971,49.758
    L 25.244,55.043
    L 25.459,48.791
    L 25.459,12.311
    Q 25.459,11.387 24.868,10.785
    Q 24.277,10.184 23.354,10.184
    Q 22.43,10.184 21.85,10.785
    Q 21.27,11.387 21.27,12.311
    L 21.27,48.791
    L 21.484,55.043
    L 16.758,49.758
    L 10.635,43.484
    Q 10.012,42.861 9.152,42.861
    Q 8.229,42.861 7.648,43.441
    Q 7.068,44.021 7.068,44.945
    Q 7.068,45.354 7.251,45.783
    Q 7.434,46.213 7.756,46.535
    Z
    M 55.859,10.871
    Q 55.172,10.162 54.259,10.173
    Q 53.346,10.184 52.701,10.871
    L 38.672,25.158
    Q 38.35,25.48 38.167,25.899
    Q 37.984,26.318 37.984,26.727
    Q 37.984,27.672 38.564,28.241
    Q 39.145,28.811 40.068,28.811
    Q 40.928,28.811 41.551,28.188
    L 47.674,21.936
    L 52.4,16.629
    L 52.186,22.902
    L 52.186,59.361
    Q 52.186,60.264 52.766,60.865
    Q 53.346,61.467 54.27,61.467
    Q 55.193,61.467 55.784,60.865
    Q 56.375,60.264 56.375,59.361
    L 56.375,22.902
    L 56.16,16.629
    L 60.887,21.936
    L 66.988,28.188
    Q 67.611,28.811 68.492,28.811
    Q 69.395,28.811 69.985,28.241
    Q 70.576,27.672 70.576,26.727
    Q 70.576,26.318 70.394,25.899
    Q 70.211,25.48 69.889,25.158
    Z
' />
</g>`},cartBadge:{viewBox:`0 0 85.551 85.336`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-85.3359375)'>
<path fill='currentColor' d='
    M 27.908,26.877
    Q 25.094,26.877 23.59,28.478
    Q 22.086,30.078 21.678,32.828
    L 17.123,64.023
    L 7.412,64.023
    Q 6.682,64.023 6.177,64.561
    Q 5.672,65.098 5.672,65.807
    Q 5.672,66.537 6.177,67.063
    Q 6.682,67.59 7.412,67.59
    L 17.381,67.59
    Q 19.207,67.59 19.873,66.892
    Q 20.539,66.193 20.732,64.84
    L 25.395,33.344
    Q 25.588,32.012 26.351,31.228
    Q 27.113,30.443 28.381,30.443
    L 60.564,30.443
    Q 61.252,30.443 61.768,29.938
    Q 62.283,29.434 62.283,28.66
    Q 62.283,27.887 61.768,27.382
    Q 61.252,26.877 60.564,26.877
    Z
    M 20.346,57.213
    L 20.346,60.779
    L 48.877,60.779
    Q 48.748,59.984 48.705,59.007
    Q 48.662,58.029 48.727,57.213
    Z
    M 22.924,36.695
    L 22.924,40.262
    L 58.395,40.283
    Q 59.189,40.283 59.673,40.638
    Q 60.156,40.992 60.479,41.701
    Q 61.768,41.164 63.164,40.885
    Q 64.561,40.605 66.043,40.605
    Q 65.334,38.629 63.98,37.662
    Q 62.627,36.695 60.436,36.695
    Z
    M 30.529,13.492
    Q 29.305,13.492 28.306,14.072
    Q 27.307,14.652 26.716,15.651
    Q 26.125,16.65 26.125,17.875
    Q 26.125,19.1 26.716,20.099
    Q 27.307,21.098 28.306,21.678
    Q 29.305,22.258 30.529,22.258
    Q 31.754,22.258 32.742,21.678
    Q 33.73,21.098 34.321,20.099
    Q 34.912,19.1 34.912,17.875
    Q 34.912,16.65 34.321,15.651
    Q 33.73,14.652 32.742,14.072
    Q 31.754,13.492 30.529,13.492
    Z
    M 56.16,13.492
    Q 54.936,13.492 53.937,14.072
    Q 52.938,14.652 52.336,15.651
    Q 51.734,16.65 51.734,17.875
    Q 51.734,19.1 52.336,20.099
    Q 52.938,21.098 53.937,21.678
    Q 54.936,22.258 56.16,22.258
    Q 57.385,22.258 58.384,21.678
    Q 59.383,21.098 59.974,20.099
    Q 60.564,19.1 60.564,17.875
    Q 60.564,16.65 59.974,15.651
    Q 59.383,14.652 58.384,14.072
    Q 57.385,13.492 56.16,13.492
    Z
    M 66,44.064
    Q 63.143,44.064 60.629,45.139
    Q 58.115,46.213 56.192,48.136
    Q 54.27,50.059 53.185,52.572
    Q 52.1,55.086 52.1,57.943
    Q 52.1,60.801 53.185,63.314
    Q 54.27,65.828 56.192,67.751
    Q 58.115,69.674 60.629,70.759
    Q 63.143,71.844 66,71.844
    Q 68.857,71.844 71.371,70.759
    Q 73.885,69.674 75.797,67.762
    Q 77.709,65.85 78.794,63.325
    Q 79.879,60.801 79.879,57.943
    Q 79.879,55.107 78.783,52.594
    Q 77.688,50.08 75.765,48.157
    Q 73.842,46.234 71.328,45.149
    Q 68.814,44.064 66,44.064
    Z
    M 66,49.178
    Q 66.73,49.178 67.149,49.607
    Q 67.568,50.037 67.568,50.746
    L 67.568,56.396
    L 73.197,56.396
    Q 73.906,56.396 74.336,56.815
    Q 74.766,57.234 74.766,57.943
    Q 74.766,58.674 74.336,59.093
    Q 73.906,59.512 73.197,59.512
    L 67.568,59.512
    L 67.568,65.141
    Q 67.568,65.828 67.149,66.269
    Q 66.73,66.709 66,66.709
    Q 65.291,66.709 64.872,66.269
    Q 64.453,65.828 64.453,65.141
    L 64.453,59.512
    L 58.803,59.512
    Q 58.115,59.512 57.675,59.093
    Q 57.234,58.674 57.234,57.943
    Q 57.234,57.234 57.675,56.815
    Q 58.115,56.396 58.803,56.396
    L 64.453,56.396
    L 64.453,50.746
    Q 64.453,50.037 64.872,49.607
    Q 65.291,49.178 66,49.178
    Z
' />
</g>`},boxBadge:{viewBox:`0 0 89.955 88.688`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-88.6875)'>
<path fill='currentColor' d='
    M 39.896,41.379
    Q 39.896,42.152 39.359,42.711
    Q 38.822,43.27 38.07,43.27
    L 14.975,43.27
    L 10.893,43.119
    L 12.676,44.838
    L 17.574,49.5
    Q 18.154,50.016 18.154,50.811
    Q 18.154,51.563 17.682,52.046
    Q 17.209,52.529 16.479,52.529
    Q 16.092,52.529 15.802,52.379
    Q 15.512,52.229 15.232,51.971
    L 6.295,42.754
    Q 5.93,42.41 5.801,42.077
    Q 5.672,41.744 5.672,41.379
    Q 5.672,41.035 5.801,40.702
    Q 5.93,40.369 6.295,40.025
    L 15.232,30.83
    Q 15.512,30.551 15.802,30.411
    Q 16.092,30.271 16.479,30.271
    Q 17.209,30.271 17.682,30.766
    Q 18.154,31.26 18.154,31.99
    Q 18.154,32.785 17.574,33.279
    L 12.676,37.963
    L 10.914,39.66
    L 14.975,39.51
    L 38.07,39.51
    Q 38.822,39.51 39.359,40.068
    Q 39.896,40.627 39.896,41.379
    Z
    M 58.094,14.502
    L 58.094,42.646
    L 84.09,57.342
    Q 84.283,56.59 84.283,55.43
    L 84.283,33.516
    Q 84.283,30.83 83.37,29.498
    Q 82.457,28.166 80.631,27.135
    L 58.674,14.76
    Q 58.545,14.695 58.395,14.62
    Q 58.244,14.545 58.094,14.502
    Z
    M 54.656,14.502
    Q 54.506,14.545 54.355,14.62
    Q 54.205,14.695 54.076,14.76
    L 32.119,27.135
    Q 30.314,28.166 29.391,29.498
    Q 28.467,30.83 28.467,33.516
    L 28.467,55.43
    Q 28.467,56.59 28.682,57.342
    L 54.656,42.646
    Z
    M 56.375,45.654
    L 30.25,60.393
    Q 30.766,60.908 31.668,61.402
    L 42.023,67.268
    L 68.363,52.4
    Z
    M 71.865,54.377
    L 45.482,69.244
    L 51.863,72.854
    Q 54.205,74.186 56.375,74.186
    Q 58.566,74.186 60.908,72.854
    L 81.104,61.402
    Q 81.555,61.166 81.888,60.919
    Q 82.221,60.672 82.5,60.393
    Z
' />
</g>`},percent:{viewBox:`0 0 63.68 74.873`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-74.873046875)'>
<path fill='currentColor' d='
    M 16.35,38.393
    Q 13.471,38.393 11.387,39.918
    Q 9.303,41.443 8.186,44.258
    Q 7.068,47.072 7.068,50.918
    Q 7.068,54.764 8.186,57.567
    Q 9.303,60.371 11.387,61.886
    Q 13.471,63.4 16.35,63.4
    Q 19.229,63.4 21.302,61.886
    Q 23.375,60.371 24.492,57.578
    Q 25.609,54.785 25.609,50.918
    Q 25.609,47.072 24.503,44.269
    Q 23.396,41.465 21.323,39.929
    Q 19.25,38.393 16.35,38.393
    Z
    M 16.35,41.701
    Q 18.928,41.701 20.378,44.14
    Q 21.828,46.578 21.828,50.918
    Q 21.828,55.258 20.367,57.686
    Q 18.906,60.113 16.35,60.113
    Q 13.793,60.113 12.332,57.675
    Q 10.871,55.236 10.871,50.918
    Q 10.871,46.578 12.321,44.14
    Q 13.771,41.701 16.35,41.701
    Z
    M 47.352,11.43
    Q 44.451,11.43 42.378,12.955
    Q 40.305,14.48 39.188,17.284
    Q 38.07,20.088 38.07,23.955
    Q 38.07,27.801 39.188,30.594
    Q 40.305,33.387 42.389,34.912
    Q 44.473,36.438 47.352,36.438
    Q 50.23,36.438 52.304,34.923
    Q 54.377,33.408 55.494,30.604
    Q 56.611,27.801 56.611,23.955
    Q 56.611,20.109 55.505,17.295
    Q 54.398,14.48 52.314,12.955
    Q 50.23,11.43 47.352,11.43
    Z
    M 47.352,14.717
    Q 49.908,14.717 51.358,17.166
    Q 52.809,19.615 52.809,23.955
    Q 52.809,28.273 51.358,30.701
    Q 49.908,33.129 47.352,33.129
    Q 44.773,33.129 43.323,30.69
    Q 41.873,28.252 41.873,23.955
    Q 41.873,19.615 43.323,17.166
    Q 44.773,14.717 47.352,14.717
    Z
    M 14.48,11.322
    Q 13.814,11.709 13.61,12.504
    Q 13.406,13.299 14.008,14.18
    L 46.32,62.756
    Q 46.922,63.615 47.706,63.766
    Q 48.49,63.916 49.113,63.572
    Q 49.779,63.186 50.016,62.358
    Q 50.252,61.531 49.65,60.672
    L 17.359,11.967
    Q 16.801,11.193 15.963,11.075
    Q 15.125,10.957 14.48,11.322
    Z
' />
</g>`},dollarsign:{viewBox:`0 0 49.07 93.178`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-93.177734375)'>
<path fill='currentColor' d='
    M 24.664,22.322
    Q 22.086,22.322 19.54,22.849
    Q 16.994,23.375 14.695,24.492
    Q 12.396,25.609 10.57,27.393
    Q 9.174,28.746 8.121,30.787
    Q 7.068,32.828 7.068,34.719
    Q 7.068,35.6 7.67,36.201
    Q 8.271,36.803 9.26,36.803
    Q 10.936,36.803 11.473,34.955
    Q 11.988,32.742 13.202,31.12
    Q 14.416,29.498 16.178,28.435
    Q 17.939,27.371 20.12,26.845
    Q 22.301,26.318 24.729,26.318
    Q 27.264,26.318 29.563,26.855
    Q 31.861,27.393 33.655,28.499
    Q 35.449,29.605 36.48,31.324
    Q 37.512,33.043 37.512,35.406
    Q 37.512,37.555 36.685,39.059
    Q 35.857,40.563 34.396,41.583
    Q 32.936,42.604 31.056,43.28
    Q 29.176,43.957 27.092,44.451
    L 21.764,45.697
    Q 19.121,46.299 16.672,47.276
    Q 14.223,48.254 12.3,49.736
    Q 10.377,51.219 9.26,53.303
    Q 8.143,55.387 8.143,58.201
    Q 8.143,61.359 9.496,63.776
    Q 10.85,66.193 13.191,67.848
    Q 15.533,69.502 18.487,70.351
    Q 21.441,71.199 24.621,71.199
    Q 28.359,71.199 31.851,69.985
    Q 35.342,68.771 37.877,66.236
    Q 38.801,65.291 39.542,64.088
    Q 40.283,62.885 40.713,61.628
    Q 41.143,60.371 41.143,59.275
    Q 41.143,58.352 40.552,57.771
    Q 39.961,57.191 39.016,57.191
    Q 38.092,57.191 37.522,57.718
    Q 36.953,58.244 36.695,59.082
    Q 36.201,61.059 35.084,62.552
    Q 33.967,64.045 32.377,65.076
    Q 30.787,66.107 28.811,66.634
    Q 26.834,67.16 24.621,67.16
    Q 22.408,67.16 20.281,66.612
    Q 18.154,66.064 16.425,64.969
    Q 14.695,63.873 13.675,62.262
    Q 12.654,60.65 12.654,58.523
    Q 12.654,56.633 13.438,55.226
    Q 14.223,53.818 15.608,52.809
    Q 16.994,51.799 18.777,51.101
    Q 20.561,50.402 22.537,49.93
    L 27.887,48.641
    Q 30.701,47.975 33.247,47.008
    Q 35.793,46.041 37.759,44.58
    Q 39.725,43.119 40.863,40.96
    Q 42.002,38.801 42.002,35.729
    Q 42.002,32.463 40.605,29.949
    Q 39.209,27.436 36.792,25.738
    Q 34.375,24.041 31.249,23.182
    Q 28.123,22.322 24.664,22.322
    Z
    M 24.535,15.533
    Q 23.891,15.533 23.429,15.995
    Q 22.967,16.457 22.967,17.08
    L 22.967,76.076
    Q 22.967,76.721 23.429,77.183
    Q 23.891,77.645 24.535,77.645
    Q 25.18,77.645 25.642,77.183
    Q 26.104,76.721 26.104,76.076
    L 26.104,17.08
    Q 26.104,16.457 25.642,15.995
    Q 25.18,15.533 24.535,15.533
    Z
' />
</g>`},chartLine:{viewBox:`0 0 73.455 71.736`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-71.736328125)'>
<path fill='currentColor' d='
    M 7.068,12.246
    L 7.068,59.576
    Q 7.068,60.328 7.616,60.908
    Q 8.164,61.488 8.98,61.488
    Q 9.797,61.488 10.334,60.908
    Q 10.871,60.328 10.871,59.576
    L 10.871,14.738
    Q 10.871,14.029 11.58,14.029
    L 64.475,14.029
    Q 65.248,14.029 65.817,13.481
    Q 66.387,12.934 66.387,12.139
    Q 66.387,11.344 65.817,10.796
    Q 65.248,10.248 64.475,10.248
    L 9.066,10.248
    Q 8.164,10.248 7.616,10.796
    Q 7.068,11.344 7.068,12.246
    Z
    M 9.475,29.627
    L 9.475,32.979
    L 27.758,43.549
    L 40.627,32.334
    L 61.51,45.096
    L 63.078,42.625
    L 40.434,28.811
    L 27.5,40.09
    Z
    M 27.221,36.48
    Q 25.932,36.48 24.89,37.104
    Q 23.848,37.727 23.214,38.779
    Q 22.58,39.832 22.58,41.1
    Q 22.58,42.367 23.214,43.42
    Q 23.848,44.473 24.89,45.096
    Q 25.932,45.719 27.221,45.719
    Q 28.488,45.719 29.541,45.096
    Q 30.594,44.473 31.217,43.42
    Q 31.84,42.367 31.84,41.1
    Q 31.84,39.832 31.217,38.779
    Q 30.594,37.727 29.541,37.104
    Q 28.488,36.48 27.221,36.48
    Z
    M 40.348,26.039
    Q 39.059,26.039 38.017,26.662
    Q 36.975,27.285 36.352,28.338
    Q 35.729,29.391 35.729,30.658
    Q 35.729,31.947 36.352,32.989
    Q 36.975,34.031 38.017,34.654
    Q 39.059,35.277 40.348,35.277
    Q 41.615,35.277 42.668,34.654
    Q 43.721,34.031 44.344,32.989
    Q 44.967,31.947 44.967,30.658
    Q 44.967,29.391 44.344,28.338
    Q 43.721,27.285 42.668,26.662
    Q 41.615,26.039 40.348,26.039
    Z
    M 61.188,38.887
    Q 59.92,38.887 58.867,39.521
    Q 57.814,40.154 57.191,41.196
    Q 56.568,42.238 56.568,43.527
    Q 56.568,44.795 57.191,45.848
    Q 57.814,46.9 58.867,47.523
    Q 59.92,48.146 61.188,48.146
    Q 62.477,48.146 63.519,47.523
    Q 64.561,46.9 65.184,45.848
    Q 65.807,44.795 65.807,43.527
    Q 65.807,42.238 65.184,41.196
    Q 64.561,40.154 63.519,39.521
    Q 62.477,38.887 61.188,38.887
    Z
' />
</g>`},listBullets:{viewBox:`0 0 69.395 49.049`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-49.048828125)'>
<path fill='currentColor' d='
    M 10.441,37.791
    Q 9.496,37.791 8.733,38.242
    Q 7.971,38.693 7.52,39.456
    Q 7.068,40.219 7.068,41.164
    Q 7.068,42.088 7.52,42.861
    Q 7.971,43.635 8.733,44.086
    Q 9.496,44.537 10.441,44.537
    Q 11.365,44.537 12.139,44.086
    Q 12.912,43.635 13.363,42.861
    Q 13.814,42.088 13.814,41.164
    Q 13.814,40.219 13.363,39.456
    Q 12.912,38.693 12.139,38.242
    Q 11.365,37.791 10.441,37.791
    Z
    M 22.387,39.252
    Q 21.592,39.252 21.044,39.8
    Q 20.496,40.348 20.496,41.164
    Q 20.496,41.959 21.044,42.507
    Q 21.592,43.055 22.387,43.055
    L 60.393,43.055
    Q 61.209,43.055 61.768,42.507
    Q 62.326,41.959 62.326,41.164
    Q 62.326,40.348 61.768,39.8
    Q 61.209,39.252 60.393,39.252
    Z
    M 10.441,21.141
    Q 9.496,21.141 8.733,21.603
    Q 7.971,22.064 7.52,22.827
    Q 7.068,23.59 7.068,24.514
    Q 7.068,25.459 7.52,26.222
    Q 7.971,26.984 8.733,27.436
    Q 9.496,27.887 10.441,27.887
    Q 11.365,27.887 12.139,27.436
    Q 12.912,26.984 13.363,26.222
    Q 13.814,25.459 13.814,24.514
    Q 13.814,23.59 13.363,22.827
    Q 12.912,22.064 12.139,21.603
    Q 11.365,21.141 10.441,21.141
    Z
    M 22.387,22.623
    Q 21.592,22.623 21.044,23.171
    Q 20.496,23.719 20.496,24.514
    Q 20.496,25.33 21.044,25.878
    Q 21.592,26.426 22.387,26.426
    L 60.393,26.426
    Q 61.209,26.426 61.768,25.878
    Q 62.326,25.33 62.326,24.514
    Q 62.326,23.719 61.768,23.171
    Q 61.209,22.623 60.393,22.623
    Z
    M 10.441,4.512
    Q 9.496,4.512 8.733,4.963
    Q 7.971,5.414 7.52,6.177
    Q 7.068,6.939 7.068,7.885
    Q 7.068,8.809 7.52,9.571
    Q 7.971,10.334 8.733,10.796
    Q 9.496,11.258 10.441,11.258
    Q 11.365,11.258 12.139,10.796
    Q 12.912,10.334 13.363,9.571
    Q 13.814,8.809 13.814,7.885
    Q 13.814,6.939 13.363,6.177
    Q 12.912,5.414 12.139,4.963
    Q 11.365,4.512 10.441,4.512
    Z
    M 22.387,5.973
    Q 21.592,5.973 21.044,6.521
    Q 20.496,7.068 20.496,7.885
    Q 20.496,8.68 21.044,9.228
    Q 21.592,9.775 22.387,9.775
    L 60.393,9.775
    Q 61.209,9.775 61.768,9.228
    Q 62.326,8.68 62.326,7.885
    Q 62.326,7.068 61.768,6.521
    Q 61.209,5.973 60.393,5.973
    Z
' />
</g>`},checkmarkSquare:{viewBox:`0 0 64.646 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 15.426,9.754
    Q 11.279,9.754 9.174,11.827
    Q 7.068,13.9 7.068,18.025
    L 7.068,51.971
    Q 7.068,56.096 9.174,58.18
    Q 11.279,60.264 15.426,60.264
    L 49.199,60.264
    Q 53.389,60.264 55.483,58.169
    Q 57.578,56.074 57.578,51.971
    L 57.578,18.025
    Q 57.578,13.922 55.483,11.838
    Q 53.389,9.754 49.199,9.754
    Z
    M 29.262,21.57
    Q 29.863,21.57 30.368,21.85
    Q 30.873,22.129 31.238,22.709
    L 44.688,43.807
    Q 44.902,44.15 45.085,44.559
    Q 45.268,44.967 45.268,45.354
    Q 45.268,46.17 44.655,46.664
    Q 44.043,47.158 43.27,47.158
    Q 42.797,47.158 42.356,46.89
    Q 41.916,46.621 41.594,46.084
    L 29.154,26.318
    L 22.967,34.053
    Q 22.559,34.633 22.129,34.837
    Q 21.699,35.041 21.205,35.041
    Q 20.389,35.041 19.841,34.472
    Q 19.293,33.902 19.293,33.107
    Q 19.293,32.699 19.443,32.302
    Q 19.594,31.904 19.873,31.561
    L 27.178,22.709
    Q 27.65,22.086 28.155,21.828
    Q 28.66,21.57 29.262,21.57
    Z
' />
</g>`},calendarBadge:{viewBox:`0 0 81.189 85.895`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-85.89453125)'>
<path fill='currentColor' d='
    M 15.426,20.346
    Q 11.279,20.346 9.174,22.419
    Q 7.068,24.492 7.068,28.617
    L 7.068,62.563
    Q 7.068,66.688 9.174,68.761
    Q 11.279,70.834 15.426,70.834
    L 53.732,70.834
    Q 57.9,70.834 60.006,68.75
    Q 62.111,66.666 62.111,62.563
    L 62.111,46.17
    Q 61.639,46.213 61.177,46.245
    Q 60.715,46.277 60.264,46.277
    Q 59.77,46.277 59.308,46.245
    Q 58.846,46.213 58.287,46.148
    L 58.287,54.076
    Q 58.287,56.203 57.17,57.288
    Q 56.053,58.373 54.012,58.373
    L 15.125,58.373
    Q 13.063,58.373 11.967,57.288
    Q 10.871,56.203 10.871,54.076
    L 10.871,28.445
    Q 10.871,26.318 11.967,25.233
    Q 13.063,24.148 15.125,24.148
    L 43.656,24.148
    Q 43.914,23.139 44.301,22.183
    Q 44.688,21.227 45.203,20.346
    Z
    M 29.111,48.49
    Q 28.424,48.49 28.177,48.727
    Q 27.93,48.963 27.93,49.65
    L 27.93,51.262
    Q 27.93,51.949 28.177,52.175
    Q 28.424,52.4 29.111,52.4
    L 30.744,52.4
    Q 31.41,52.4 31.657,52.175
    Q 31.904,51.949 31.904,51.262
    L 31.904,49.65
    Q 31.904,48.963 31.657,48.727
    Q 31.41,48.49 30.744,48.49
    Z
    M 38.436,48.49
    Q 37.748,48.49 37.501,48.727
    Q 37.254,48.963 37.254,49.65
    L 37.254,51.262
    Q 37.254,51.949 37.501,52.175
    Q 37.748,52.4 38.436,52.4
    L 40.068,52.4
    Q 40.756,52.4 41.003,52.175
    Q 41.25,51.949 41.25,51.262
    L 41.25,49.65
    Q 41.25,48.963 41.003,48.727
    Q 40.756,48.49 40.068,48.49
    Z
    M 47.76,48.49
    Q 47.094,48.49 46.847,48.727
    Q 46.6,48.963 46.6,49.65
    L 46.6,51.262
    Q 46.6,51.949 46.847,52.175
    Q 47.094,52.4 47.76,52.4
    L 49.393,52.4
    Q 50.08,52.4 50.327,52.175
    Q 50.574,51.949 50.574,51.262
    L 50.574,49.65
    Q 50.574,48.963 50.327,48.727
    Q 50.08,48.49 49.393,48.49
    Z
    M 19.766,39.316
    Q 19.1,39.316 18.853,39.542
    Q 18.605,39.768 18.605,40.455
    L 18.605,42.088
    Q 18.605,42.754 18.853,42.99
    Q 19.1,43.227 19.766,43.227
    L 21.398,43.227
    Q 22.086,43.227 22.333,42.99
    Q 22.58,42.754 22.58,42.088
    L 22.58,40.455
    Q 22.58,39.768 22.333,39.542
    Q 22.086,39.316 21.398,39.316
    Z
    M 29.111,39.316
    Q 28.424,39.316 28.177,39.542
    Q 27.93,39.768 27.93,40.455
    L 27.93,42.088
    Q 27.93,42.754 28.177,42.99
    Q 28.424,43.227 29.111,43.227
    L 30.744,43.227
    Q 31.41,43.227 31.657,42.99
    Q 31.904,42.754 31.904,42.088
    L 31.904,40.455
    Q 31.904,39.768 31.657,39.542
    Q 31.41,39.316 30.744,39.316
    Z
    M 38.436,39.316
    Q 37.748,39.316 37.501,39.542
    Q 37.254,39.768 37.254,40.455
    L 37.254,42.088
    Q 37.254,42.754 37.501,42.99
    Q 37.748,43.227 38.436,43.227
    L 40.068,43.227
    Q 40.756,43.227 41.003,42.99
    Q 41.25,42.754 41.25,42.088
    L 41.25,40.455
    Q 41.25,39.768 41.003,39.542
    Q 40.756,39.316 40.068,39.316
    Z
    M 19.766,30.121
    Q 19.1,30.121 18.853,30.357
    Q 18.605,30.594 18.605,31.26
    L 18.605,32.893
    Q 18.605,33.559 18.853,33.795
    Q 19.1,34.031 19.766,34.031
    L 21.398,34.031
    Q 22.086,34.031 22.333,33.795
    Q 22.58,33.559 22.58,32.893
    L 22.58,31.26
    Q 22.58,30.594 22.333,30.357
    Q 22.086,30.121 21.398,30.121
    Z
    M 29.111,30.121
    Q 28.424,30.121 28.177,30.357
    Q 27.93,30.594 27.93,31.26
    L 27.93,32.893
    Q 27.93,33.559 28.177,33.795
    Q 28.424,34.031 29.111,34.031
    L 30.744,34.031
    Q 31.41,34.031 31.657,33.795
    Q 31.904,33.559 31.904,32.893
    L 31.904,31.26
    Q 31.904,30.594 31.657,30.357
    Q 31.41,30.121 30.744,30.121
    Z
    M 38.436,30.121
    Q 37.748,30.121 37.501,30.357
    Q 37.254,30.594 37.254,31.26
    L 37.254,32.893
    Q 37.254,33.559 37.501,33.795
    Q 37.748,34.031 38.436,34.031
    L 40.068,34.031
    Q 40.756,34.031 41.003,33.795
    Q 41.25,33.559 41.25,32.893
    L 41.25,31.26
    Q 41.25,30.594 41.003,30.357
    Q 40.756,30.121 40.068,30.121
    Z
    M 60.242,15.061
    Q 57.385,15.061 54.871,16.135
    Q 52.357,17.209 50.435,19.132
    Q 48.512,21.055 47.427,23.568
    Q 46.342,26.082 46.342,28.939
    Q 46.342,31.797 47.427,34.311
    Q 48.512,36.824 50.435,38.747
    Q 52.357,40.67 54.871,41.755
    Q 57.385,42.84 60.242,42.84
    Q 63.1,42.84 65.613,41.755
    Q 68.127,40.67 70.039,38.758
    Q 71.951,36.846 73.036,34.321
    Q 74.121,31.797 74.121,28.939
    Q 74.121,26.104 73.025,23.59
    Q 71.93,21.076 70.007,19.153
    Q 68.084,17.23 65.57,16.146
    Q 63.057,15.061 60.242,15.061
    Z
    M 53.582,26.855
    L 60.35,26.855
    Q 61.016,26.855 61.467,27.307
    Q 61.918,27.758 61.918,28.424
    L 61.918,37.275
    Q 61.918,37.898 61.467,38.35
    Q 61.016,38.801 60.35,38.801
    Q 59.705,38.801 59.243,38.35
    Q 58.781,37.898 58.781,37.275
    L 58.781,29.971
    L 53.582,29.971
    Q 52.938,29.971 52.465,29.52
    Q 51.992,29.068 51.992,28.424
    Q 51.992,27.779 52.454,27.317
    Q 52.916,26.855 53.582,26.855
    Z
' />
</g>`},lockShield:{viewBox:`0 0 58.953 79.514`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-79.513671875)'>
<path fill='currentColor' d='
    M 29.477,12.375
    Q 29.111,12.375 28.628,12.515
    Q 28.145,12.654 27.65,12.934
    Q 23.031,15.598 19.594,17.725
    Q 16.156,19.852 13.761,21.731
    Q 11.365,23.611 9.894,25.534
    Q 8.422,27.457 7.745,29.702
    Q 7.068,31.947 7.068,34.826
    L 7.068,55.73
    Q 7.068,57.191 7.455,58.072
    Q 7.842,58.953 8.637,59.522
    Q 9.432,60.092 10.656,60.586
    Q 11.752,61.016 13.417,61.649
    Q 15.082,62.283 17.016,63.014
    Q 18.949,63.744 20.883,64.453
    Q 22.816,65.162 24.481,65.764
    Q 26.146,66.365 27.264,66.73
    Q 27.801,66.902 28.349,67.021
    Q 28.896,67.139 29.477,67.139
    Q 30.035,67.139 30.594,67.031
    Q 31.152,66.924 31.689,66.73
    Q 32.785,66.344 34.461,65.753
    Q 36.137,65.162 38.07,64.453
    Q 40.004,63.744 41.938,63.024
    Q 43.871,62.305 45.536,61.66
    Q 47.201,61.016 48.297,60.586
    Q 49.521,60.07 50.316,59.512
    Q 51.111,58.953 51.498,58.072
    Q 51.885,57.191 51.885,55.73
    L 51.885,34.826
    Q 51.885,31.947 51.229,29.659
    Q 50.574,27.371 49.124,25.405
    Q 47.674,23.439 45.289,21.538
    Q 42.904,19.637 39.445,17.553
    Q 35.986,15.469 31.303,12.934
    Q 30.809,12.676 30.325,12.525
    Q 29.842,12.375 29.477,12.375
    Z
    M 19.207,29.541
    Q 19.207,27.93 19.938,27.156
    Q 20.668,26.383 22.172,26.383
    L 36.824,26.383
    Q 38.328,26.383 39.059,27.156
    Q 39.789,27.93 39.789,29.541
    L 39.789,40.992
    Q 39.789,42.539 39.123,43.313
    Q 38.457,44.086 37.146,44.15
    L 37.146,47.674
    Q 37.146,50.23 36.18,52.143
    Q 35.213,54.055 33.494,55.118
    Q 31.775,56.182 29.498,56.182
    Q 27.221,56.182 25.491,55.118
    Q 23.762,54.055 22.806,52.143
    Q 21.85,50.23 21.85,47.674
    L 21.85,44.15
    Q 20.518,44.086 19.862,43.313
    Q 19.207,42.539 19.207,40.992
    Z
    M 24.492,44.172
    L 24.492,47.932
    Q 24.492,50.488 25.867,52.057
    Q 27.242,53.625 29.498,53.625
    Q 31.732,53.625 33.107,52.057
    Q 34.482,50.488 34.482,47.932
    L 34.482,44.172
    Z
' />
</g>`},shield:{viewBox:`0 0 58.953 79.514`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-79.513671875)'>
<path fill='currentColor' d='
    M 29.477,12.375
    Q 29.111,12.375 28.628,12.515
    Q 28.145,12.654 27.65,12.934
    Q 23.031,15.598 19.594,17.725
    Q 16.156,19.852 13.761,21.731
    Q 11.365,23.611 9.894,25.534
    Q 8.422,27.457 7.745,29.702
    Q 7.068,31.947 7.068,34.826
    L 7.068,55.73
    Q 7.068,57.191 7.455,58.072
    Q 7.842,58.953 8.637,59.522
    Q 9.432,60.092 10.656,60.586
    Q 11.752,61.016 13.417,61.649
    Q 15.082,62.283 17.016,63.014
    Q 18.949,63.744 20.883,64.453
    Q 22.816,65.162 24.481,65.764
    Q 26.146,66.365 27.264,66.73
    Q 27.801,66.902 28.349,67.021
    Q 28.896,67.139 29.477,67.139
    Q 30.035,67.139 30.594,67.031
    Q 31.152,66.924 31.689,66.73
    Q 32.785,66.344 34.461,65.753
    Q 36.137,65.162 38.07,64.453
    Q 40.004,63.744 41.938,63.024
    Q 43.871,62.305 45.536,61.66
    Q 47.201,61.016 48.297,60.586
    Q 49.521,60.07 50.316,59.512
    Q 51.111,58.953 51.498,58.072
    Q 51.885,57.191 51.885,55.73
    L 51.885,34.826
    Q 51.885,31.947 51.229,29.659
    Q 50.574,27.371 49.124,25.405
    Q 47.674,23.439 45.289,21.538
    Q 42.904,19.637 39.445,17.553
    Q 35.986,15.469 31.303,12.934
    Q 30.809,12.676 30.325,12.525
    Q 29.842,12.375 29.477,12.375
    Z
' />
</g>`},eye:{viewBox:`0 0 85.787 62.756`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.755859375)'>
<path fill='currentColor' d='
    M 42.904,7.928
    Q 37.49,7.928 32.635,9.249
    Q 27.779,10.57 23.622,12.751
    Q 19.465,14.932 16.156,17.563
    Q 12.848,20.195 10.506,22.838
    Q 8.164,25.48 6.918,27.736
    Q 5.672,29.992 5.672,31.367
    Q 5.672,32.764 6.918,35.02
    Q 8.164,37.275 10.506,39.918
    Q 12.848,42.561 16.167,45.182
    Q 19.486,47.803 23.633,49.994
    Q 27.779,52.186 32.635,53.507
    Q 37.49,54.828 42.904,54.828
    Q 48.361,54.828 53.238,53.507
    Q 58.115,52.186 62.262,49.994
    Q 66.408,47.803 69.706,45.182
    Q 73.004,42.561 75.324,39.918
    Q 77.645,37.275 78.88,35.02
    Q 80.115,32.764 80.115,31.367
    Q 80.115,29.992 78.891,27.736
    Q 77.666,25.48 75.346,22.838
    Q 73.025,20.195 69.728,17.563
    Q 66.43,14.932 62.283,12.751
    Q 58.137,10.57 53.26,9.249
    Q 48.383,7.928 42.904,7.928
    Z
    M 42.904,15.941
    Q 46.105,15.941 48.898,17.145
    Q 51.691,18.348 53.818,20.464
    Q 55.945,22.58 57.138,25.384
    Q 58.33,28.188 58.33,31.367
    Q 58.33,34.568 57.138,37.361
    Q 55.945,40.154 53.818,42.281
    Q 51.691,44.408 48.898,45.611
    Q 46.105,46.814 42.904,46.814
    Q 39.703,46.814 36.91,45.611
    Q 34.117,44.408 31.99,42.281
    Q 29.863,40.154 28.671,37.361
    Q 27.479,34.568 27.479,31.367
    Q 27.479,28.188 28.671,25.384
    Q 29.863,22.58 31.99,20.464
    Q 34.117,18.348 36.91,17.145
    Q 39.703,15.941 42.904,15.941
    Z
    M 42.904,25.953
    Q 41.4,25.953 40.176,26.684
    Q 38.951,27.414 38.21,28.639
    Q 37.469,29.863 37.469,31.367
    Q 37.469,32.871 38.21,34.106
    Q 38.951,35.342 40.176,36.072
    Q 41.4,36.803 42.904,36.803
    Q 44.408,36.803 45.644,36.072
    Q 46.879,35.342 47.609,34.106
    Q 48.34,32.871 48.34,31.367
    Q 48.34,29.863 47.609,28.639
    Q 46.879,27.414 45.644,26.684
    Q 44.408,25.953 42.904,25.953
    Z
' />
</g>`},star:{viewBox:`0 0 72.145 81.684`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.68359375)'>
<path fill='currentColor' d='
    M 17.316,12.289
    Q 16.564,12.848 16.403,13.793
    Q 16.242,14.738 16.693,16.092
    L 22.559,33.666
    L 7.498,44.494
    Q 6.359,45.311 5.919,46.17
    Q 5.479,47.029 5.779,47.932
    Q 6.059,48.813 6.918,49.253
    Q 7.777,49.693 9.195,49.693
    L 27.693,49.693
    L 33.344,67.246
    Q 33.773,68.6 34.45,69.276
    Q 35.127,69.953 36.072,69.953
    Q 37.018,69.953 37.684,69.276
    Q 38.35,68.6 38.801,67.246
    L 44.43,49.693
    L 62.928,49.693
    Q 64.367,49.693 65.216,49.253
    Q 66.064,48.813 66.365,47.932
    Q 66.666,47.029 66.226,46.17
    Q 65.785,45.311 64.625,44.494
    L 49.564,33.666
    L 55.43,16.092
    Q 55.902,14.738 55.73,13.793
    Q 55.559,12.848 54.828,12.289
    Q 54.055,11.73 53.109,11.892
    Q 52.164,12.053 51.004,12.891
    L 36.072,23.848
    L 21.119,12.891
    Q 19.959,12.053 19.014,11.892
    Q 18.068,11.73 17.316,12.289
    Z
' />
</g>`},exclamation:{viewBox:`0 0 21.055 74.314`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-74.314453125)'>
<path fill='currentColor' d='
    M 10.549,25.975
    Q 9.604,25.975 9.023,26.544
    Q 8.443,27.113 8.422,28.08
    L 8.186,61.166
    Q 8.186,61.166 8.186,61.166
    Q 8.186,61.166 8.186,61.166
    Q 8.186,62.176 8.873,62.799
    Q 9.561,63.422 10.527,63.422
    Q 11.494,63.422 12.182,62.799
    Q 12.869,62.176 12.869,61.166
    Q 12.869,61.166 12.869,61.166
    Q 12.869,61.166 12.869,61.166
    L 12.676,28.08
    Q 12.654,27.113 12.063,26.544
    Q 11.473,25.975 10.549,25.975
    Z
    M 10.527,10.893
    Q 9.582,10.893 8.798,11.365
    Q 8.014,11.838 7.541,12.622
    Q 7.068,13.406 7.068,14.352
    Q 7.068,15.318 7.541,16.103
    Q 8.014,16.887 8.798,17.349
    Q 9.582,17.811 10.527,17.811
    Q 11.494,17.811 12.278,17.349
    Q 13.063,16.887 13.524,16.103
    Q 13.986,15.318 13.986,14.352
    Q 13.986,13.406 13.524,12.622
    Q 13.063,11.838 12.278,11.365
    Q 11.494,10.893 10.527,10.893
    Z
' />
</g>`},questionmark:{viewBox:`0 0 43.549 74.422`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-74.421875)'>
<path fill='currentColor' d='
    M 20.475,25.781
    Q 19.271,25.781 18.659,26.49
    Q 18.047,27.199 18.047,28.316
    Q 18.047,28.832 18.047,29.337
    Q 18.047,29.842 18.047,30.357
    Q 18.047,32.785 18.938,34.687
    Q 19.83,36.588 21.495,38.231
    Q 23.16,39.875 25.438,41.486
    Q 27.371,42.883 28.778,44.226
    Q 30.186,45.568 30.938,47.104
    Q 31.689,48.641 31.689,50.617
    Q 31.689,53.217 30.336,55.14
    Q 28.982,57.063 26.684,58.126
    Q 24.385,59.189 21.549,59.189
    Q 19.1,59.189 17.08,58.33
    Q 15.061,57.471 13.643,55.688
    Q 12.225,53.904 11.58,51.154
    Q 11.322,50.273 10.731,49.769
    Q 10.141,49.264 9.238,49.264
    Q 8.186,49.264 7.627,49.887
    Q 7.068,50.51 7.068,51.52
    Q 7.068,52.25 7.24,53.12
    Q 7.412,53.99 7.82,54.936
    Q 8.916,57.643 10.979,59.565
    Q 13.041,61.488 15.802,62.509
    Q 18.563,63.529 21.699,63.529
    Q 25.824,63.529 29.176,61.972
    Q 32.527,60.414 34.504,57.524
    Q 36.48,54.635 36.48,50.596
    Q 36.48,48.018 35.578,45.891
    Q 34.676,43.764 32.946,41.938
    Q 31.217,40.111 28.746,38.414
    Q 26.469,36.846 25.19,35.61
    Q 23.912,34.375 23.386,33.032
    Q 22.859,31.689 22.838,29.777
    Q 22.838,29.434 22.838,29.09
    Q 22.838,28.746 22.838,28.381
    Q 22.838,27.264 22.258,26.522
    Q 21.678,25.781 20.475,25.781
    Z
    M 20.496,10.893
    Q 19.551,10.893 18.767,11.365
    Q 17.982,11.838 17.51,12.622
    Q 17.037,13.406 17.037,14.352
    Q 17.037,15.318 17.51,16.103
    Q 17.982,16.887 18.767,17.349
    Q 19.551,17.811 20.496,17.811
    Q 21.463,17.811 22.247,17.349
    Q 23.031,16.887 23.493,16.103
    Q 23.955,15.318 23.955,14.352
    Q 23.955,13.406 23.493,12.622
    Q 23.031,11.838 22.247,11.365
    Q 21.463,10.893 20.496,10.893
    Z
' />
</g>`},arrowLeft:{viewBox:`0 0 65.613 52.164`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-52.1640625)'>
<path fill='currentColor' d='
    M 7.068,26.082
    Q 7.068,26.963 7.777,27.65
    L 26.232,46.127
    Q 26.662,46.535 27.06,46.707
    Q 27.457,46.879 27.865,46.879
    Q 28.746,46.879 29.337,46.31
    Q 29.928,45.74 29.928,44.859
    Q 29.928,44.451 29.788,44.054
    Q 29.648,43.656 29.369,43.377
    L 21.828,35.75
    L 11.795,26.49
    L 11.301,27.715
    L 19.766,28.166
    L 56.482,28.166
    Q 57.385,28.166 57.965,27.586
    Q 58.545,27.006 58.545,26.082
    Q 58.545,25.18 57.965,24.589
    Q 57.385,23.998 56.482,23.998
    L 19.766,23.998
    L 11.301,24.471
    L 11.795,25.674
    L 21.828,16.414
    L 29.369,8.809
    Q 29.648,8.529 29.788,8.132
    Q 29.928,7.734 29.928,7.305
    Q 29.928,6.445 29.337,5.865
    Q 28.746,5.285 27.865,5.285
    Q 27.027,5.285 26.361,5.93
    L 7.777,24.535
    Q 7.068,25.201 7.068,26.082
    Z
' />
</g>`},refresh:{viewBox:`0 0 58.459 81.061`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.060546875)'>
<path fill='currentColor' d='
    M 4.963,35.041
    Q 4.963,39.059 6.188,42.689
    Q 7.412,46.32 9.636,49.36
    Q 11.859,52.4 14.899,54.624
    Q 17.939,56.848 21.57,58.072
    Q 25.201,59.297 29.219,59.297
    Q 30.766,59.297 32.205,59.125
    Q 33.645,58.953 34.826,58.695
    L 26.555,66.988
    Q 26.297,67.289 26.168,67.633
    Q 26.039,67.977 26.039,68.363
    Q 26.039,69.18 26.565,69.738
    Q 27.092,70.297 27.887,70.297
    Q 28.768,70.297 29.283,69.717
    L 40.949,57.836
    Q 41.615,57.17 41.615,56.332
    Q 41.615,55.945 41.465,55.569
    Q 41.314,55.193 40.949,54.828
    L 29.283,43.055
    Q 28.703,42.518 27.908,42.518
    Q 27.113,42.518 26.576,43.055
    Q 26.039,43.592 26.039,44.408
    Q 26.039,44.773 26.168,45.128
    Q 26.297,45.482 26.576,45.762
    L 35.686,54.85
    Q 34.332,55.193 32.678,55.354
    Q 31.023,55.516 29.219,55.516
    Q 24.986,55.516 21.28,53.926
    Q 17.574,52.336 14.76,49.521
    Q 11.945,46.707 10.355,43.001
    Q 8.766,39.295 8.766,35.063
    Q 8.766,30.809 10.355,27.103
    Q 11.945,23.396 14.76,20.582
    Q 17.574,17.768 21.28,16.178
    Q 24.986,14.588 29.219,14.588
    Q 33.473,14.588 37.179,16.178
    Q 40.885,17.768 43.699,20.582
    Q 46.514,23.396 48.104,27.103
    Q 49.693,30.809 49.693,35.063
    Q 49.693,35.9 50.188,36.459
    Q 50.682,37.018 51.52,37.018
    Q 52.4,37.018 52.948,36.459
    Q 53.496,35.9 53.496,35.041
    Q 53.496,31.002 52.271,27.371
    Q 51.047,23.74 48.813,20.711
    Q 46.578,17.682 43.549,15.447
    Q 40.52,13.213 36.889,11.988
    Q 33.258,10.764 29.219,10.764
    Q 25.201,10.764 21.57,11.988
    Q 17.939,13.213 14.899,15.447
    Q 11.859,17.682 9.636,20.711
    Q 7.412,23.74 6.188,27.371
    Q 4.963,31.002 4.963,35.041
    Z
' />
</g>`},transfer:{viewBox:`0 0 66.816 98.205`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-98.205078125)'>
<path fill='currentColor' d='
    M 7.777,66.666
    L 22.021,80.695
    Q 22.344,81.018 22.763,81.211
    Q 23.182,81.404 23.611,81.404
    Q 24.535,81.404 25.104,80.813
    Q 25.674,80.223 25.674,79.32
    Q 25.674,78.439 25.051,77.816
    L 18.799,71.715
    L 13.492,66.988
    L 19.766,67.203
    L 57.643,67.203
    Q 58.545,67.203 59.146,66.612
    Q 59.748,66.021 59.748,65.098
    Q 59.748,64.174 59.146,63.594
    Q 58.545,63.014 57.643,63.014
    L 19.766,63.014
    L 13.492,63.229
    L 18.799,58.502
    L 25.051,52.379
    Q 25.674,51.756 25.674,50.896
    Q 25.674,49.973 25.104,49.393
    Q 24.535,48.813 23.611,48.813
    Q 23.182,48.813 22.763,48.995
    Q 22.344,49.178 22.021,49.5
    L 7.777,63.529
    Q 7.09,64.174 7.068,65.087
    Q 7.047,66 7.777,66.666
    Z
    M 59.061,31.518
    L 44.816,17.488
    Q 44.494,17.166 44.064,16.983
    Q 43.635,16.801 43.227,16.801
    Q 42.303,16.801 41.723,17.381
    Q 41.143,17.961 41.143,18.885
    Q 41.143,19.766 41.766,20.389
    L 48.039,26.49
    L 53.324,31.217
    L 47.072,31.002
    L 9.174,31.002
    Q 8.271,31.002 7.67,31.582
    Q 7.068,32.162 7.068,33.086
    Q 7.068,34.01 7.67,34.601
    Q 8.271,35.191 9.174,35.191
    L 47.072,35.191
    L 53.324,34.977
    L 48.039,39.703
    L 41.766,45.805
    Q 41.143,46.428 41.143,47.309
    Q 41.143,48.211 41.723,48.802
    Q 42.303,49.393 43.227,49.393
    Q 43.635,49.393 44.064,49.21
    Q 44.494,49.027 44.816,48.705
    L 59.061,34.676
    Q 59.748,34.01 59.759,33.107
    Q 59.77,32.205 59.061,31.518
    Z
' />
</g>`},importData:{viewBox:`0 0 79.234 91.266`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-91.265625)'>
<path fill='currentColor' d='
    M 46.342,60.049
    L 51.605,60.049
    Q 53.904,60.049 55.344,59.619
    Q 56.783,59.189 57.954,58.137
    Q 59.125,57.084 60.629,55.236
    L 70.727,42.604
    Q 71.285,41.895 71.597,41.239
    Q 71.908,40.584 72.037,39.778
    Q 72.166,38.973 72.166,37.834
    L 72.166,21.764
    Q 72.166,17.66 70.061,15.565
    Q 67.955,13.471 63.787,13.471
    L 15.426,13.471
    Q 11.279,13.471 9.174,15.555
    Q 7.068,17.639 7.068,21.764
    L 7.068,37.834
    Q 7.068,38.973 7.197,39.778
    Q 7.326,40.584 7.638,41.239
    Q 7.949,41.895 8.486,42.604
    L 18.605,55.236
    Q 20.088,57.084 21.259,58.137
    Q 22.43,59.189 23.869,59.619
    Q 25.309,60.049 27.629,60.049
    L 32.893,60.049
    L 32.893,56.697
    L 27.307,56.697
    Q 25.738,56.697 24.535,56.139
    Q 23.332,55.58 22.322,54.291
    L 11.559,40.648
    Q 11.258,40.262 11.397,39.854
    Q 11.537,39.445 12.117,39.445
    L 30.98,39.445
    Q 31.926,39.445 32.398,38.833
    Q 32.871,38.221 32.871,37.447
    L 32.871,37.318
    Q 32.871,35.557 33.72,33.978
    Q 34.568,32.398 36.083,31.399
    Q 37.598,30.4 39.617,30.4
    Q 41.637,30.4 43.151,31.399
    Q 44.666,32.398 45.515,33.978
    Q 46.363,35.557 46.363,37.318
    L 46.363,37.447
    Q 46.363,38.221 46.825,38.833
    Q 47.287,39.445 48.254,39.445
    L 67.117,39.445
    Q 67.719,39.445 67.848,39.854
    Q 67.977,40.262 67.676,40.648
    L 56.912,54.291
    Q 55.881,55.58 54.688,56.139
    Q 53.496,56.697 51.928,56.697
    L 46.342,56.697
    Z
    M 15.512,17.295
    L 63.723,17.295
    Q 65.936,17.295 67.139,18.466
    Q 68.342,19.637 68.342,21.957
    L 68.342,35.965
    L 49.973,35.965
    Q 49.715,33.344 48.297,31.292
    Q 46.879,29.24 44.623,28.059
    Q 42.367,26.877 39.617,26.877
    Q 36.846,26.877 34.601,28.059
    Q 32.355,29.24 30.938,31.292
    Q 29.52,33.344 29.24,35.965
    L 10.871,35.965
    L 10.871,21.957
    Q 10.871,19.637 12.063,18.466
    Q 13.256,17.295 15.512,17.295
    Z
    M 39.617,77.795
    Q 40.369,77.795 40.928,77.247
    Q 41.486,76.699 41.486,75.969
    L 41.486,49.307
    L 41.357,45.225
    L 43.055,46.986
    L 47.717,51.885
    Q 48.232,52.465 49.006,52.465
    Q 49.736,52.465 50.23,51.992
    Q 50.725,51.52 50.725,50.789
    Q 50.725,50.123 50.166,49.543
    L 40.971,40.605
    Q 40.627,40.262 40.305,40.122
    Q 39.982,39.982 39.617,39.982
    Q 39.252,39.982 38.93,40.122
    Q 38.607,40.262 38.242,40.605
    L 29.047,49.543
    Q 28.488,50.123 28.488,50.789
    Q 28.488,51.52 28.961,51.992
    Q 29.434,52.465 30.186,52.465
    Q 30.98,52.465 31.496,51.885
    L 36.158,46.986
    L 37.877,45.225
    L 37.727,49.307
    L 37.727,75.969
    Q 37.727,76.699 38.285,77.247
    Q 38.844,77.795 39.617,77.795
    Z
' />
</g>`},exportData:{viewBox:`0 0 62.734 89.096`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-89.095703125)'>
<path fill='currentColor' d='
    M 15.426,13.814
    Q 11.279,13.814 9.174,15.888
    Q 7.068,17.961 7.068,22.086
    L 7.068,49.65
    Q 7.068,53.775 9.174,55.859
    Q 11.279,57.943 15.426,57.943
    L 24.643,57.943
    L 24.643,54.119
    L 15.512,54.119
    Q 13.256,54.119 12.063,52.938
    Q 10.871,51.756 10.871,49.457
    L 10.871,22.301
    Q 10.871,19.98 12.063,18.799
    Q 13.256,17.617 15.512,17.617
    L 47.223,17.617
    Q 49.436,17.617 50.649,18.799
    Q 51.863,19.98 51.863,22.301
    L 51.863,49.457
    Q 51.863,51.756 50.649,52.938
    Q 49.436,54.119 47.223,54.119
    L 38.092,54.119
    L 38.092,57.943
    L 47.309,57.943
    Q 51.477,57.943 53.571,55.849
    Q 55.666,53.754 55.666,49.65
    L 55.666,22.086
    Q 55.666,17.982 53.571,15.898
    Q 51.477,13.814 47.309,13.814
    Z
    M 31.367,35.299
    Q 30.594,35.299 30.035,35.847
    Q 29.477,36.395 29.477,37.146
    L 29.477,65.979
    L 29.627,70.061
    L 27.93,68.277
    L 23.246,63.379
    Q 22.73,62.799 21.936,62.799
    Q 21.205,62.799 20.722,63.271
    Q 20.238,63.744 20.238,64.475
    Q 20.238,64.861 20.378,65.151
    Q 20.518,65.441 20.797,65.721
    L 29.992,74.658
    Q 30.357,75.023 30.68,75.152
    Q 31.002,75.281 31.367,75.281
    Q 31.732,75.281 32.055,75.152
    Q 32.377,75.023 32.742,74.658
    L 41.938,65.721
    Q 42.195,65.441 42.346,65.151
    Q 42.496,64.861 42.496,64.475
    Q 42.496,63.744 41.991,63.271
    Q 41.486,62.799 40.756,62.799
    Q 39.982,62.799 39.467,63.379
    L 34.805,68.277
    L 33.107,70.039
    L 33.258,65.979
    L 33.258,37.146
    Q 33.258,36.395 32.699,35.847
    Q 32.141,35.299 31.367,35.299
    Z
' />
</g>`},copy:{viewBox:`0 0 72.145 82.93`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-82.9296875)'>
<path fill='currentColor' d='
    M 15.426,25.352
    Q 11.258,25.352 9.163,27.436
    Q 7.068,29.52 7.068,33.645
    L 7.068,61.66
    Q 7.068,65.764 9.163,67.848
    Q 11.258,69.932 15.426,69.932
    L 43.27,69.932
    Q 47.438,69.932 49.543,67.837
    Q 51.648,65.742 51.648,61.66
    L 51.648,55.816
    L 47.824,55.816
    L 47.824,61.445
    Q 47.824,63.766 46.621,64.947
    Q 45.418,66.129 43.205,66.129
    L 15.512,66.129
    Q 13.256,66.129 12.063,64.947
    Q 10.871,63.766 10.871,61.445
    L 10.871,33.838
    Q 10.871,31.518 12.063,30.336
    Q 13.256,29.154 15.512,29.154
    L 22.387,29.154
    L 22.387,25.352
    Z
    M 28.875,12.998
    Q 24.707,12.998 22.612,15.082
    Q 20.518,17.166 20.518,21.291
    L 20.518,49.285
    Q 20.518,53.41 22.612,55.494
    Q 24.707,57.578 28.875,57.578
    L 56.719,57.578
    Q 60.865,57.578 62.971,55.483
    Q 65.076,53.389 65.076,49.285
    L 65.076,21.291
    Q 65.076,17.188 62.971,15.093
    Q 60.865,12.998 56.719,12.998
    Z
    M 28.961,16.801
    L 56.654,16.801
    Q 58.846,16.801 60.06,17.982
    Q 61.273,19.164 61.273,21.484
    L 61.273,49.092
    Q 61.273,51.412 60.06,52.594
    Q 58.846,53.775 56.654,53.775
    L 28.961,53.775
    Q 26.705,53.775 25.513,52.594
    Q 24.32,51.412 24.32,49.092
    L 24.32,21.484
    Q 24.32,19.164 25.513,17.982
    Q 26.705,16.801 28.961,16.801
    Z
    M 30.121,35.277
    Q 30.121,36.18 30.68,36.738
    Q 31.238,37.297 32.141,37.297
    L 40.82,37.297
    L 40.82,45.977
    Q 40.82,46.879 41.368,47.448
    Q 41.916,48.018 42.775,48.018
    Q 43.656,48.018 44.226,47.448
    Q 44.795,46.879 44.795,45.977
    L 44.795,37.297
    L 53.496,37.297
    Q 54.377,37.297 54.936,36.738
    Q 55.494,36.18 55.494,35.277
    Q 55.494,34.439 54.936,33.892
    Q 54.377,33.344 53.496,33.344
    L 44.795,33.344
    L 44.795,24.643
    Q 44.795,23.74 44.226,23.182
    Q 43.656,22.623 42.775,22.623
    Q 41.916,22.623 41.368,23.192
    Q 40.82,23.762 40.82,24.643
    L 40.82,33.344
    L 32.141,33.344
    Q 31.26,33.344 30.69,33.892
    Q 30.121,34.439 30.121,35.277
    Z
' />
</g>`},folder:{viewBox:`0 0 76.549 69.029`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-69.029296875)'>
<path fill='currentColor' d='
    M 15.426,9.432
    Q 11.279,9.432 9.174,11.516
    Q 7.068,13.6 7.068,17.703
    L 7.068,51.734
    Q 7.068,55.666 8.97,57.632
    Q 10.871,59.598 14.395,59.598
    L 22.279,59.598
    Q 23.654,59.598 24.643,59.415
    Q 25.631,59.232 26.458,58.781
    Q 27.285,58.33 28.188,57.535
    L 29.82,56.16
    Q 30.895,55.215 31.883,54.85
    Q 32.871,54.484 34.375,54.484
    L 61.123,54.484
    Q 65.27,54.484 67.375,52.4
    Q 69.48,50.316 69.48,46.213
    L 69.48,17.703
    Q 69.48,13.621 67.472,11.526
    Q 65.463,9.432 61.768,9.432
    Z
    M 15.512,13.234
    L 61.059,13.234
    Q 63.25,13.234 64.464,14.416
    Q 65.678,15.598 65.678,17.896
    L 65.678,46.02
    Q 65.678,48.318 64.464,49.5
    Q 63.25,50.682 61.059,50.682
    L 33.43,50.682
    Q 32.055,50.682 31.045,50.875
    Q 30.035,51.068 29.197,51.509
    Q 28.359,51.949 27.479,52.723
    L 25.846,54.098
    Q 25.115,54.742 24.46,55.118
    Q 23.805,55.494 23.063,55.655
    Q 22.322,55.816 21.334,55.816
    L 15.146,55.816
    Q 13.063,55.816 11.967,54.742
    Q 10.871,53.668 10.871,51.498
    L 10.871,17.918
    Q 10.871,15.598 12.063,14.416
    Q 13.256,13.234 15.512,13.234
    Z
    M 9.367,40.498
    L 9.367,44.086
    L 67.203,44.086
    L 67.203,40.498
    Z
' />
</g>`},adjust:{viewBox:`0 0 69.395 62.52`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.51953125)'>
<path fill='currentColor' d='
    M 44.924,7.906
    Q 43.162,7.906 41.712,8.776
    Q 40.262,9.646 39.402,11.097
    Q 38.543,12.547 38.543,14.309
    Q 38.543,16.049 39.402,17.51
    Q 40.262,18.971 41.712,19.83
    Q 43.162,20.689 44.924,20.689
    Q 46.686,20.689 48.136,19.83
    Q 49.586,18.971 50.456,17.51
    Q 51.326,16.049 51.326,14.309
    Q 51.326,12.547 50.456,11.097
    Q 49.586,9.646 48.136,8.776
    Q 46.686,7.906 44.924,7.906
    Z
    M 44.924,10.957
    Q 46.342,10.957 47.309,11.935
    Q 48.275,12.912 48.275,14.309
    Q 48.275,15.727 47.309,16.693
    Q 46.342,17.66 44.924,17.66
    Q 43.527,17.66 42.561,16.693
    Q 41.594,15.727 41.594,14.309
    Q 41.594,12.912 42.561,11.935
    Q 43.527,10.957 44.924,10.957
    Z
    M 40.498,16.221
    L 40.498,12.418
    L 8.98,12.418
    Q 8.164,12.418 7.616,12.966
    Q 7.068,13.514 7.068,14.309
    Q 7.068,15.104 7.616,15.662
    Q 8.164,16.221 8.98,16.221
    Z
    M 60.5,16.221
    Q 61.23,16.221 61.778,15.662
    Q 62.326,15.104 62.326,14.309
    Q 62.326,13.514 61.778,12.966
    Q 61.23,12.418 60.5,12.418
    L 49.672,12.418
    L 49.672,16.221
    Z
    M 25.008,24.857
    Q 23.268,24.857 21.807,25.717
    Q 20.346,26.576 19.486,28.026
    Q 18.627,29.477 18.627,31.238
    Q 18.627,33 19.486,34.45
    Q 20.346,35.9 21.807,36.771
    Q 23.268,37.641 25.008,37.641
    Q 26.77,37.641 28.22,36.771
    Q 29.67,35.9 30.54,34.45
    Q 31.41,33 31.41,31.238
    Q 31.41,29.477 30.54,28.026
    Q 29.67,26.576 28.22,25.717
    Q 26.77,24.857 25.008,24.857
    Z
    M 25.008,27.887
    Q 26.426,27.887 27.393,28.864
    Q 28.359,29.842 28.359,31.26
    Q 28.359,32.678 27.393,33.645
    Q 26.426,34.611 25.008,34.611
    Q 23.611,34.611 22.645,33.645
    Q 21.678,32.678 21.678,31.26
    Q 21.678,29.842 22.645,28.864
    Q 23.611,27.887 25.008,27.887
    Z
    M 8.895,33.15
    L 20.324,33.15
    L 20.324,29.348
    L 8.895,29.348
    Q 8.143,29.348 7.605,29.906
    Q 7.068,30.465 7.068,31.26
    Q 7.068,32.055 7.605,32.603
    Q 8.143,33.15 8.895,33.15
    Z
    M 60.414,33.15
    Q 61.209,33.15 61.768,32.603
    Q 62.326,32.055 62.326,31.26
    Q 62.326,30.465 61.768,29.906
    Q 61.209,29.348 60.414,29.348
    L 29.455,29.348
    L 29.455,33.15
    Z
    M 44.924,41.83
    Q 43.162,41.83 41.712,42.7
    Q 40.262,43.57 39.402,45.021
    Q 38.543,46.471 38.543,48.232
    Q 38.543,49.973 39.402,51.434
    Q 40.262,52.895 41.712,53.754
    Q 43.162,54.613 44.924,54.613
    Q 46.686,54.613 48.136,53.754
    Q 49.586,52.895 50.456,51.434
    Q 51.326,49.973 51.326,48.232
    Q 51.326,46.471 50.456,45.021
    Q 49.586,43.57 48.136,42.7
    Q 46.686,41.83 44.924,41.83
    Z
    M 44.924,44.881
    Q 46.342,44.881 47.309,45.858
    Q 48.275,46.836 48.275,48.232
    Q 48.275,49.65 47.309,50.617
    Q 46.342,51.584 44.924,51.584
    Q 43.527,51.584 42.561,50.617
    Q 41.594,49.65 41.594,48.232
    Q 41.594,46.836 42.561,45.858
    Q 43.527,44.881 44.924,44.881
    Z
    M 40.563,50.102
    L 40.563,46.299
    L 8.98,46.299
    Q 8.164,46.299 7.616,46.847
    Q 7.068,47.395 7.068,48.189
    Q 7.068,48.984 7.616,49.543
    Q 8.164,50.102 8.98,50.102
    Z
    M 60.5,50.102
    Q 61.23,50.102 61.778,49.543
    Q 62.326,48.984 62.326,48.189
    Q 62.326,47.395 61.778,46.847
    Q 61.23,46.299 60.5,46.299
    L 49.436,46.299
    L 49.436,50.102
    Z
' />
</g>`},listView:{viewBox:`0 0 79.234 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 19.68,45.568
    Q 18.648,45.568 17.896,46.331
    Q 17.145,47.094 17.145,48.125
    Q 17.145,49.156 17.896,49.919
    Q 18.648,50.682 19.68,50.682
    Q 20.754,50.682 21.495,49.93
    Q 22.236,49.178 22.236,48.125
    Q 22.236,47.072 21.495,46.32
    Q 20.754,45.568 19.68,45.568
    Z
    M 19.68,36.953
    Q 18.648,36.953 17.896,37.705
    Q 17.145,38.457 17.145,39.488
    Q 17.145,40.541 17.896,41.293
    Q 18.648,42.045 19.68,42.045
    Q 20.754,42.045 21.495,41.304
    Q 22.236,40.563 22.236,39.488
    Q 22.236,38.436 21.495,37.694
    Q 20.754,36.953 19.68,36.953
    Z
    M 19.68,28.338
    Q 18.627,28.338 17.886,29.09
    Q 17.145,29.842 17.145,30.895
    Q 17.145,31.926 17.886,32.667
    Q 18.627,33.408 19.68,33.408
    Q 20.754,33.408 21.495,32.678
    Q 22.236,31.947 22.236,30.895
    Q 22.236,29.842 21.495,29.09
    Q 20.754,28.338 19.68,28.338
    Z
    M 19.68,19.4
    Q 18.648,19.4 17.896,20.152
    Q 17.145,20.904 17.145,21.957
    Q 17.145,22.988 17.896,23.751
    Q 18.648,24.514 19.68,24.514
    Q 20.754,24.514 21.495,23.762
    Q 22.236,23.01 22.236,21.957
    Q 22.236,20.904 21.495,20.152
    Q 20.754,19.4 19.68,19.4
    Z
    M 28.424,46.643
    Q 27.779,46.643 27.35,47.072
    Q 26.92,47.502 26.92,48.125
    Q 26.92,48.748 27.36,49.188
    Q 27.801,49.629 28.424,49.629
    L 60.865,49.629
    Q 61.51,49.629 61.95,49.188
    Q 62.391,48.748 62.391,48.125
    Q 62.391,47.502 61.95,47.072
    Q 61.51,46.643 60.865,46.643
    Z
    M 28.424,37.984
    Q 27.801,37.984 27.36,38.425
    Q 26.92,38.865 26.92,39.488
    Q 26.92,40.133 27.36,40.573
    Q 27.801,41.014 28.424,41.014
    L 46.729,41.014
    Q 47.352,41.014 47.792,40.573
    Q 48.232,40.133 48.232,39.488
    Q 48.232,38.865 47.792,38.425
    Q 47.352,37.984 46.729,37.984
    Z
    M 28.424,29.369
    Q 27.779,29.369 27.35,29.81
    Q 26.92,30.25 26.92,30.895
    Q 26.92,31.518 27.35,31.947
    Q 27.779,32.377 28.424,32.377
    L 60.865,32.377
    Q 61.51,32.377 61.95,31.947
    Q 62.391,31.518 62.391,30.895
    Q 62.391,30.25 61.95,29.81
    Q 61.51,29.369 60.865,29.369
    Z
    M 28.424,20.453
    Q 27.801,20.453 27.36,20.894
    Q 26.92,21.334 26.92,21.957
    Q 26.92,22.58 27.35,23.01
    Q 27.779,23.439 28.424,23.439
    L 46.729,23.439
    Q 47.373,23.439 47.803,23.01
    Q 48.232,22.58 48.232,21.957
    Q 48.232,21.334 47.792,20.894
    Q 47.352,20.453 46.729,20.453
    Z
    M 15.426,9.754
    Q 11.279,9.754 9.174,11.827
    Q 7.068,13.9 7.068,18.025
    L 7.068,51.971
    Q 7.068,56.096 9.174,58.18
    Q 11.279,60.264 15.426,60.264
    L 63.787,60.264
    Q 67.955,60.264 70.061,58.169
    Q 72.166,56.074 72.166,51.971
    L 72.166,18.025
    Q 72.166,13.922 70.061,11.838
    Q 67.955,9.754 63.787,9.754
    Z
    M 15.512,13.557
    L 63.723,13.557
    Q 65.936,13.557 67.139,14.738
    Q 68.342,15.92 68.342,18.24
    L 68.342,51.777
    Q 68.342,54.098 67.139,55.279
    Q 65.936,56.461 63.723,56.461
    L 15.512,56.461
    Q 13.256,56.461 12.063,55.279
    Q 10.871,54.098 10.871,51.777
    L 10.871,18.24
    Q 10.871,15.92 12.063,14.738
    Q 13.256,13.557 15.512,13.557
    Z
' />
</g>`},more:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.116,13.868
    Q 19.916,15.275 16.425,17.854
    Q 12.934,20.432 10.355,23.923
    Q 7.777,27.414 6.37,31.614
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.37,49.264
    Q 7.777,53.453 10.355,56.955
    Q 12.934,60.457 16.425,63.024
    Q 19.916,65.592 24.116,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.457,63.024
    Q 52.959,60.457 55.526,56.955
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.614
    Q 58.094,27.414 55.526,23.923
    Q 52.959,20.432 49.457,17.854
    Q 45.955,15.275 41.766,13.868
    Q 37.576,12.461 32.936,12.461
    Z
    M 32.936,16.457
    Q 36.91,16.457 40.509,17.671
    Q 44.107,18.885 47.104,21.087
    Q 50.102,23.289 52.304,26.286
    Q 54.506,29.283 55.709,32.871
    Q 56.912,36.459 56.912,40.434
    Q 56.912,44.408 55.709,48.007
    Q 54.506,51.605 52.304,54.603
    Q 50.102,57.6 47.104,59.802
    Q 44.107,62.004 40.509,63.207
    Q 36.91,64.41 32.936,64.41
    Q 28.961,64.41 25.373,63.207
    Q 21.785,62.004 18.788,59.802
    Q 15.791,57.6 13.589,54.603
    Q 11.387,51.605 10.173,48.007
    Q 8.959,44.408 8.959,40.434
    Q 8.959,36.459 10.173,32.871
    Q 11.387,29.283 13.589,26.286
    Q 15.791,23.289 18.788,21.087
    Q 21.785,18.885 25.373,17.671
    Q 28.961,16.457 32.936,16.457
    Z
    M 20.088,36.631
    Q 18.498,36.631 17.37,37.748
    Q 16.242,38.865 16.242,40.455
    Q 16.242,42.045 17.37,43.173
    Q 18.498,44.301 20.088,44.301
    Q 21.656,44.301 22.784,43.173
    Q 23.912,42.045 23.912,40.455
    Q 23.912,38.865 22.784,37.748
    Q 21.656,36.631 20.088,36.631
    Z
    M 32.914,36.631
    Q 31.324,36.631 30.207,37.748
    Q 29.09,38.865 29.09,40.455
    Q 29.09,42.045 30.207,43.173
    Q 31.324,44.301 32.914,44.301
    Q 34.504,44.301 35.632,43.173
    Q 36.76,42.045 36.76,40.455
    Q 36.76,38.865 35.632,37.748
    Q 34.504,36.631 32.914,36.631
    Z
    M 45.762,36.631
    Q 44.172,36.631 43.044,37.748
    Q 41.916,38.865 41.916,40.455
    Q 41.916,42.045 43.044,43.173
    Q 44.172,44.301 45.762,44.301
    Q 47.352,44.301 48.469,43.173
    Q 49.586,42.045 49.586,40.455
    Q 49.586,38.865 48.469,37.748
    Q 47.352,36.631 45.762,36.631
    Z
' />
</g>`},dollars:{viewBox:`0 0 65.893 80.889`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-80.888671875)'>
<path fill='currentColor' d='
    M 32.936,12.461
    Q 28.316,12.461 24.116,13.868
    Q 19.916,15.275 16.425,17.854
    Q 12.934,20.432 10.355,23.923
    Q 7.777,27.414 6.37,31.614
    Q 4.963,35.814 4.963,40.434
    Q 4.963,45.074 6.37,49.264
    Q 7.777,53.453 10.355,56.955
    Q 12.934,60.457 16.425,63.024
    Q 19.916,65.592 24.116,67.01
    Q 28.316,68.428 32.936,68.428
    Q 37.576,68.428 41.766,67.01
    Q 45.955,65.592 49.457,63.024
    Q 52.959,60.457 55.526,56.955
    Q 58.094,53.453 59.512,49.264
    Q 60.93,45.074 60.93,40.434
    Q 60.93,35.814 59.512,31.614
    Q 58.094,27.414 55.526,23.923
    Q 52.959,20.432 49.457,17.854
    Q 45.955,15.275 41.766,13.868
    Q 37.576,12.461 32.936,12.461
    Z
    M 32.936,16.457
    Q 36.91,16.457 40.509,17.671
    Q 44.107,18.885 47.104,21.087
    Q 50.102,23.289 52.304,26.286
    Q 54.506,29.283 55.709,32.871
    Q 56.912,36.459 56.912,40.434
    Q 56.912,44.408 55.709,48.007
    Q 54.506,51.605 52.304,54.603
    Q 50.102,57.6 47.104,59.802
    Q 44.107,62.004 40.509,63.207
    Q 36.91,64.41 32.936,64.41
    Q 28.961,64.41 25.373,63.207
    Q 21.785,62.004 18.788,59.802
    Q 15.791,57.6 13.589,54.603
    Q 11.387,51.605 10.173,48.007
    Q 8.959,44.408 8.959,40.434
    Q 8.959,36.459 10.173,32.871
    Q 11.387,29.283 13.589,26.286
    Q 15.791,23.289 18.788,21.087
    Q 21.785,18.885 25.373,17.671
    Q 28.961,16.457 32.936,16.457
    Z
    M 32.957,28.488
    Q 31.131,28.488 29.326,29.036
    Q 27.521,29.584 26.168,30.733
    Q 24.814,31.883 24.299,33.709
    Q 24.17,34.203 24.17,34.525
    Q 24.17,35.127 24.557,35.46
    Q 24.943,35.793 25.48,35.793
    Q 25.975,35.793 26.308,35.546
    Q 26.641,35.299 26.855,34.74
    Q 27.521,32.678 29.122,31.786
    Q 30.723,30.895 33.021,30.895
    Q 34.482,30.895 35.847,31.292
    Q 37.211,31.689 38.081,32.592
    Q 38.951,33.494 38.951,35.041
    Q 38.951,36.352 38.253,37.157
    Q 37.555,37.963 36.448,38.425
    Q 35.342,38.887 34.053,39.188
    L 31.432,39.811
    Q 29.734,40.219 28.177,40.938
    Q 26.619,41.658 25.631,42.915
    Q 24.643,44.172 24.643,46.17
    Q 24.643,48.254 25.824,49.726
    Q 27.006,51.197 28.896,51.981
    Q 30.787,52.766 32.957,52.766
    Q 34.955,52.766 36.856,51.981
    Q 38.758,51.197 40.004,49.844
    Q 41.25,48.49 41.25,46.793
    Q 41.25,46.17 40.831,45.858
    Q 40.412,45.547 39.918,45.547
    Q 39.424,45.547 39.069,45.826
    Q 38.715,46.105 38.543,46.664
    Q 38.027,48.49 36.545,49.403
    Q 35.063,50.316 32.957,50.316
    Q 31.646,50.316 30.357,49.897
    Q 29.068,49.479 28.23,48.608
    Q 27.393,47.738 27.393,46.363
    Q 27.393,45.16 28.048,44.387
    Q 28.703,43.613 29.756,43.141
    Q 30.809,42.668 32.012,42.389
    L 34.654,41.766
    Q 36.523,41.336 38.124,40.584
    Q 39.725,39.832 40.702,38.554
    Q 41.68,37.275 41.68,35.256
    Q 41.68,32.936 40.455,31.432
    Q 39.23,29.928 37.243,29.208
    Q 35.256,28.488 32.957,28.488
    Z
    M 32.914,25.18
    Q 32.57,25.18 32.334,25.427
    Q 32.098,25.674 32.098,26.018
    L 32.098,55.107
    Q 32.098,55.451 32.334,55.698
    Q 32.57,55.945 32.914,55.945
    Q 33.258,55.945 33.505,55.698
    Q 33.752,55.451 33.752,55.107
    L 33.752,26.018
    Q 33.752,25.674 33.505,25.427
    Q 33.258,25.18 32.914,25.18
    Z
' />
</g>`},tray:{viewBox:`0 0 79.234 62.219`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-62.21875)'>
<path fill='currentColor' d='
    M 15.426,7.82
    Q 11.279,7.82 9.174,9.904
    Q 7.068,11.988 7.068,16.113
    L 7.068,32.184
    Q 7.068,33.322 7.197,34.128
    Q 7.326,34.934 7.638,35.589
    Q 7.949,36.244 8.486,36.953
    L 18.605,49.586
    Q 20.088,51.434 21.259,52.486
    Q 22.43,53.539 23.869,53.969
    Q 25.309,54.398 27.629,54.398
    L 51.605,54.398
    Q 53.904,54.398 55.344,53.969
    Q 56.783,53.539 57.954,52.486
    Q 59.125,51.434 60.629,49.586
    L 70.727,36.953
    Q 71.285,36.244 71.597,35.589
    Q 71.908,34.934 72.037,34.128
    Q 72.166,33.322 72.166,32.184
    L 72.166,16.113
    Q 72.166,12.01 70.061,9.915
    Q 67.955,7.82 63.787,7.82
    Z
    M 12.117,33.795
    L 30.98,33.795
    Q 31.926,33.795 32.398,33.193
    Q 32.871,32.592 32.871,31.797
    L 32.871,31.668
    Q 32.871,29.906 33.72,28.327
    Q 34.568,26.748 36.083,25.749
    Q 37.598,24.75 39.617,24.75
    Q 41.637,24.75 43.151,25.749
    Q 44.666,26.748 45.515,28.327
    Q 46.363,29.906 46.363,31.668
    L 46.363,31.797
    Q 46.363,32.592 46.825,33.193
    Q 47.287,33.795 48.254,33.795
    L 67.117,33.795
    Q 67.719,33.795 67.848,34.203
    Q 67.977,34.611 67.676,34.998
    L 56.912,48.641
    Q 55.881,49.93 54.688,50.488
    Q 53.496,51.047 51.928,51.047
    L 27.307,51.047
    Q 25.738,51.047 24.535,50.488
    Q 23.332,49.93 22.322,48.641
    L 11.559,34.998
    Q 11.258,34.611 11.397,34.203
    Q 11.537,33.795 12.117,33.795
    Z
    M 15.512,11.645
    L 63.723,11.645
    Q 65.936,11.645 67.139,12.815
    Q 68.342,13.986 68.342,16.307
    L 68.342,30.314
    L 49.973,30.314
    Q 49.715,27.693 48.297,25.642
    Q 46.879,23.59 44.623,22.408
    Q 42.367,21.227 39.617,21.227
    Q 36.846,21.227 34.601,22.408
    Q 32.355,23.59 30.938,25.642
    Q 29.52,27.693 29.24,30.314
    L 10.871,30.314
    L 10.871,16.307
    Q 10.871,13.986 12.063,12.815
    Q 13.256,11.645 15.512,11.645
    Z
' />
</g>`},grid2x2:{viewBox:`0 0 64.646 70.018`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-70.017578125)'>
<path fill='currentColor' d='
    M 12.01,37.361
    Q 9.561,37.361 8.314,38.586
    Q 7.068,39.811 7.068,42.389
    L 7.068,55.236
    Q 7.068,57.793 8.314,59.028
    Q 9.561,60.264 12.01,60.264
    L 25.029,60.264
    Q 27.479,60.264 28.725,59.028
    Q 29.971,57.793 29.971,55.236
    L 29.971,42.389
    Q 29.971,39.811 28.725,38.586
    Q 27.479,37.361 25.029,37.361
    Z
    M 12.053,40.734
    L 24.965,40.734
    Q 25.781,40.734 26.189,41.143
    Q 26.598,41.551 26.598,42.41
    L 26.598,55.236
    Q 26.598,56.074 26.189,56.482
    Q 25.781,56.891 24.965,56.891
    L 12.053,56.891
    Q 11.215,56.891 10.828,56.482
    Q 10.441,56.074 10.441,55.236
    L 10.441,42.41
    Q 10.441,41.551 10.828,41.143
    Q 11.215,40.734 12.053,40.734
    Z
    M 39.617,37.361
    Q 37.146,37.361 35.911,38.586
    Q 34.676,39.811 34.676,42.389
    L 34.676,55.236
    Q 34.676,57.793 35.911,59.028
    Q 37.146,60.264 39.617,60.264
    L 52.637,60.264
    Q 55.086,60.264 56.332,59.028
    Q 57.578,57.793 57.578,55.236
    L 57.578,42.389
    Q 57.578,39.811 56.332,38.586
    Q 55.086,37.361 52.637,37.361
    Z
    M 39.682,40.734
    L 52.594,40.734
    Q 53.41,40.734 53.808,41.143
    Q 54.205,41.551 54.205,42.41
    L 54.205,55.236
    Q 54.205,56.074 53.808,56.482
    Q 53.41,56.891 52.594,56.891
    L 39.682,56.891
    Q 38.822,56.891 38.436,56.482
    Q 38.049,56.074 38.049,55.236
    L 38.049,42.41
    Q 38.049,41.551 38.436,41.143
    Q 38.822,40.734 39.682,40.734
    Z
    M 12.01,9.754
    Q 9.561,9.754 8.314,10.979
    Q 7.068,12.203 7.068,14.781
    L 7.068,27.629
    Q 7.068,30.186 8.314,31.421
    Q 9.561,32.656 12.01,32.656
    L 25.029,32.656
    Q 27.479,32.656 28.725,31.421
    Q 29.971,30.186 29.971,27.629
    L 29.971,14.781
    Q 29.971,12.203 28.725,10.979
    Q 27.479,9.754 25.029,9.754
    Z
    M 12.053,13.127
    L 24.965,13.127
    Q 25.781,13.127 26.189,13.535
    Q 26.598,13.943 26.598,14.781
    L 26.598,27.607
    Q 26.598,28.467 26.189,28.875
    Q 25.781,29.283 24.965,29.283
    L 12.053,29.283
    Q 11.215,29.283 10.828,28.875
    Q 10.441,28.467 10.441,27.607
    L 10.441,14.781
    Q 10.441,13.943 10.828,13.535
    Q 11.215,13.127 12.053,13.127
    Z
    M 39.617,9.754
    Q 37.146,9.754 35.911,10.979
    Q 34.676,12.203 34.676,14.781
    L 34.676,27.629
    Q 34.676,30.186 35.911,31.421
    Q 37.146,32.656 39.617,32.656
    L 52.637,32.656
    Q 55.086,32.656 56.332,31.421
    Q 57.578,30.186 57.578,27.629
    L 57.578,14.781
    Q 57.578,12.203 56.332,10.979
    Q 55.086,9.754 52.637,9.754
    Z
    M 39.682,13.127
    L 52.594,13.127
    Q 53.41,13.127 53.808,13.535
    Q 54.205,13.943 54.205,14.781
    L 54.205,27.607
    Q 54.205,28.467 53.808,28.875
    Q 53.41,29.283 52.594,29.283
    L 39.682,29.283
    Q 38.822,29.283 38.436,28.875
    Q 38.049,28.467 38.049,27.607
    L 38.049,14.781
    Q 38.049,13.943 38.436,13.535
    Q 38.822,13.127 39.682,13.127
    Z
' />
</g>`},sun:{viewBox:`0 0 69.588 88.537`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-88.537109375)'>
<path fill='currentColor' d='
    M 34.783,63.83
    Q 33.945,63.83 33.354,64.432
    Q 32.764,65.033 32.764,65.871
    L 32.764,72.123
    Q 32.764,72.961 33.354,73.563
    Q 33.945,74.164 34.783,74.164
    Q 35.621,74.164 36.223,73.563
    Q 36.824,72.961 36.824,72.123
    L 36.824,65.871
    Q 36.824,65.033 36.223,64.432
    Q 35.621,63.83 34.783,63.83
    Z
    M 48.598,58.072
    Q 48.018,58.674 48.018,59.512
    Q 48.018,60.35 48.598,60.951
    L 53.045,65.398
    Q 53.646,65.979 54.484,65.979
    Q 55.322,65.979 55.924,65.398
    Q 56.504,64.797 56.504,63.948
    Q 56.504,63.1 55.924,62.498
    L 51.498,58.072
    Q 50.896,57.471 50.048,57.481
    Q 49.199,57.492 48.598,58.072
    Z
    M 54.313,44.258
    Q 54.313,45.096 54.914,45.697
    Q 55.516,46.299 56.354,46.299
    L 62.584,46.299
    Q 63.422,46.299 64.023,45.697
    Q 64.625,45.096 64.625,44.258
    Q 64.625,43.42 64.023,42.829
    Q 63.422,42.238 62.584,42.238
    L 56.354,42.238
    Q 55.516,42.238 54.914,42.829
    Q 54.313,43.42 54.313,44.258
    Z
    M 48.598,30.443
    Q 49.199,31.023 50.037,31.023
    Q 50.875,31.023 51.477,30.443
    L 55.924,25.996
    Q 56.504,25.416 56.504,24.567
    Q 56.504,23.719 55.924,23.139
    Q 55.322,22.559 54.484,22.537
    Q 53.646,22.516 53.045,23.117
    L 48.598,27.564
    Q 48.018,28.145 48.018,28.993
    Q 48.018,29.842 48.598,30.443
    Z
    M 34.783,24.686
    Q 35.621,24.686 36.223,24.095
    Q 36.824,23.504 36.824,22.666
    L 36.824,16.414
    Q 36.824,15.555 36.223,14.964
    Q 35.621,14.373 34.783,14.373
    Q 33.945,14.373 33.354,14.964
    Q 32.764,15.555 32.764,16.414
    L 32.764,22.666
    Q 32.764,23.504 33.354,24.095
    Q 33.945,24.686 34.783,24.686
    Z
    M 20.99,30.443
    Q 21.549,29.842 21.549,28.993
    Q 21.549,28.145 20.969,27.564
    L 16.521,23.139
    Q 15.941,22.537 15.082,22.559
    Q 14.223,22.58 13.643,23.16
    Q 13.084,23.74 13.073,24.589
    Q 13.063,25.438 13.664,26.018
    L 18.09,30.443
    Q 18.67,31.023 19.529,31.023
    Q 20.389,31.023 20.99,30.443
    Z
    M 15.254,44.258
    Q 15.254,43.42 14.663,42.829
    Q 14.072,42.238 13.234,42.238
    L 7.004,42.238
    Q 6.166,42.238 5.564,42.829
    Q 4.963,43.42 4.963,44.258
    Q 4.963,45.096 5.564,45.697
    Q 6.166,46.299 7.004,46.299
    L 13.234,46.299
    Q 14.072,46.299 14.663,45.697
    Q 15.254,45.096 15.254,44.258
    Z
    M 20.969,58.072
    Q 20.367,57.492 19.519,57.492
    Q 18.67,57.492 18.09,58.072
    L 13.664,62.52
    Q 13.084,63.1 13.095,63.948
    Q 13.105,64.797 13.686,65.398
    Q 14.266,65.979 15.125,65.979
    Q 15.984,65.979 16.543,65.398
    L 20.99,60.951
    Q 21.549,60.371 21.549,59.512
    Q 21.549,58.652 20.969,58.072
    Z
    M 34.762,30.443
    Q 31.904,30.443 29.401,31.518
    Q 26.898,32.592 24.997,34.493
    Q 23.096,36.395 22.021,38.897
    Q 20.947,41.4 20.947,44.258
    Q 20.947,47.115 22.021,49.629
    Q 23.096,52.143 24.997,54.044
    Q 26.898,55.945 29.401,57.02
    Q 31.904,58.094 34.762,58.094
    Q 37.619,58.094 40.122,57.02
    Q 42.625,55.945 44.537,54.044
    Q 46.449,52.143 47.523,49.629
    Q 48.598,47.115 48.598,44.258
    Q 48.598,41.4 47.523,38.897
    Q 46.449,36.395 44.537,34.493
    Q 42.625,32.592 40.122,31.518
    Q 37.619,30.443 34.762,30.443
    Z
' />
</g>`},moon:{viewBox:`0 0 68.836 79.063`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-79.0625)'>
<path fill='currentColor' d='
    M 30.357,11.129
    Q 26.318,11.129 22.784,12.3
    Q 19.25,13.471 16.36,15.619
    Q 13.471,17.768 11.397,20.679
    Q 9.324,23.59 8.196,27.103
    Q 7.068,30.615 7.068,34.504
    Q 7.068,38.113 8.067,41.422
    Q 9.066,44.73 10.903,47.566
    Q 12.74,50.402 15.275,52.615
    Q 17.811,54.828 20.926,56.225
    Q 22.473,56.934 23.16,56.074
    Q 23.848,55.301 23.16,53.926
    Q 22.43,52.379 21.936,50.016
    Q 21.441,47.652 21.441,45.396
    Q 21.441,40.734 22.881,37.007
    Q 24.32,33.279 27.017,30.647
    Q 29.713,28.016 33.505,26.608
    Q 37.297,25.201 41.98,25.201
    Q 44.279,25.201 46.213,25.545
    Q 48.146,25.889 49.844,26.555
    Q 50.445,26.77 50.939,26.727
    Q 51.434,26.684 51.713,26.404
    Q 52.465,25.631 51.842,24.277
    Q 50.467,21.334 48.329,18.917
    Q 46.191,16.5 43.42,14.76
    Q 40.648,13.02 37.351,12.074
    Q 34.053,11.129 30.357,11.129
    Z
    M 51.369,36.223
    Q 51.047,36.223 50.832,36.427
    Q 50.617,36.631 50.574,36.953
    Q 50.252,39.166 49.973,40.584
    Q 49.693,42.002 49.21,42.84
    Q 48.727,43.678 47.846,44.161
    Q 46.965,44.645 45.493,44.999
    Q 44.021,45.354 41.701,45.783
    Q 41.4,45.848 41.186,46.052
    Q 40.971,46.256 40.971,46.6
    Q 40.971,46.943 41.186,47.158
    Q 41.4,47.373 41.701,47.416
    Q 44.021,47.76 45.504,48.071
    Q 46.986,48.383 47.856,48.866
    Q 48.727,49.35 49.21,50.22
    Q 49.693,51.09 49.973,52.529
    Q 50.252,53.969 50.574,56.225
    Q 50.617,56.568 50.832,56.772
    Q 51.047,56.977 51.369,56.977
    Q 51.713,56.977 51.928,56.762
    Q 52.143,56.547 52.186,56.203
    Q 52.486,53.969 52.776,52.551
    Q 53.066,51.133 53.561,50.306
    Q 54.055,49.479 54.946,48.995
    Q 55.838,48.512 57.31,48.179
    Q 58.781,47.846 61.037,47.416
    Q 61.359,47.352 61.563,47.147
    Q 61.768,46.943 61.768,46.6
    Q 61.768,45.912 60.951,45.783
    Q 58.695,45.396 57.234,45.074
    Q 55.773,44.752 54.893,44.269
    Q 54.012,43.785 53.528,42.926
    Q 53.045,42.066 52.766,40.648
    Q 52.486,39.23 52.186,36.996
    Q 52.143,36.631 51.928,36.427
    Q 51.713,36.223 51.369,36.223
    Z
    M 38.113,54.592
    Q 37.727,54.592 37.619,55.043
    Q 37.318,56.783 37.061,57.771
    Q 36.803,58.76 36.298,59.275
    Q 35.793,59.791 34.772,60.092
    Q 33.752,60.393 31.926,60.758
    Q 31.453,60.844 31.453,61.252
    Q 31.453,61.682 31.926,61.768
    Q 33.752,62.133 34.751,62.444
    Q 35.75,62.756 36.233,63.282
    Q 36.717,63.809 36.985,64.786
    Q 37.254,65.764 37.619,67.482
    Q 37.727,67.934 38.113,67.934
    Q 38.521,67.934 38.607,67.482
    Q 38.994,65.764 39.263,64.786
    Q 39.531,63.809 40.025,63.282
    Q 40.52,62.756 41.508,62.444
    Q 42.496,62.133 44.322,61.768
    Q 44.795,61.682 44.795,61.252
    Q 44.795,60.844 44.322,60.758
    Q 42.496,60.414 41.476,60.124
    Q 40.455,59.834 39.95,59.308
    Q 39.445,58.781 39.188,57.782
    Q 38.93,56.783 38.607,55.043
    Q 38.521,54.592 38.113,54.592
    Z
' />
</g>`},userPlus:{viewBox:`0 0 55.408 81.92`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-81.919921875)'>
<path fill='currentColor' d='
    M 32.936,13.148
    Q 29.928,13.148 27.081,13.793
    Q 24.234,14.438 21.635,15.598
    Q 23.547,17.875 24.643,20.722
    Q 25.738,23.568 25.738,26.705
    Q 25.738,27.758 25.609,28.789
    Q 25.48,29.82 25.223,30.787
    Q 26.963,31.26 28.886,31.528
    Q 30.809,31.797 32.914,31.797
    Q 36.158,31.797 38.973,31.206
    Q 41.787,30.615 44.075,29.638
    Q 46.363,28.66 48.028,27.446
    Q 49.693,26.232 50.66,24.965
    Q 53.582,28.145 55.247,32.302
    Q 56.912,36.459 56.912,41.121
    Q 56.912,45.117 55.698,48.716
    Q 54.484,52.314 52.293,55.312
    Q 50.102,58.309 47.104,60.5
    Q 44.107,62.691 40.498,63.895
    Q 36.889,65.098 32.914,65.098
    Q 28.273,65.098 24.191,63.486
    Q 20.109,61.875 16.908,58.996
    Q 13.707,56.117 11.698,52.271
    Q 9.689,48.426 9.195,43.936
    Q 8.25,44.043 7.111,43.979
    Q 5.973,43.914 5.113,43.742
    Q 5.5,47.996 7.101,51.799
    Q 8.701,55.602 11.301,58.771
    Q 13.9,61.939 17.273,64.249
    Q 20.646,66.559 24.61,67.837
    Q 28.574,69.115 32.914,69.115
    Q 37.512,69.115 41.69,67.687
    Q 45.869,66.258 49.382,63.669
    Q 52.895,61.08 55.473,57.578
    Q 58.051,54.076 59.479,49.897
    Q 60.908,45.719 60.908,41.121
    Q 60.908,36.545 59.49,32.355
    Q 58.072,28.166 55.483,24.664
    Q 52.895,21.162 49.393,18.584
    Q 45.891,16.006 41.712,14.577
    Q 37.533,13.148 32.936,13.148
    Z
    M 32.914,36.523
    Q 30.25,36.545 28.112,37.92
    Q 25.975,39.295 24.718,41.647
    Q 23.461,44 23.439,46.965
    Q 23.418,49.758 24.686,52.078
    Q 25.953,54.398 28.112,55.795
    Q 30.271,57.191 32.914,57.191
    Q 35.557,57.191 37.705,55.795
    Q 39.854,54.398 41.121,52.078
    Q 42.389,49.758 42.389,46.965
    Q 42.389,44 41.132,41.626
    Q 39.875,39.252 37.727,37.877
    Q 35.578,36.502 32.914,36.523
    Z
    M 8.4,12.805
    Q 5.543,12.805 3.029,13.879
    Q 0.516,14.953 -1.407,16.876
    Q -3.33,18.799 -4.415,21.313
    Q -5.5,23.826 -5.5,26.684
    Q -5.5,29.541 -4.415,32.055
    Q -3.33,34.568 -1.407,36.491
    Q 0.516,38.414 3.029,39.499
    Q 5.543,40.584 8.4,40.584
    Q 11.258,40.584 13.771,39.499
    Q 16.285,38.414 18.197,36.502
    Q 20.109,34.59 21.194,32.065
    Q 22.279,29.541 22.279,26.684
    Q 22.279,23.848 21.184,21.334
    Q 20.088,18.82 18.165,16.897
    Q 16.242,14.975 13.729,13.89
    Q 11.215,12.805 8.4,12.805
    Z
    M 8.4,17.918
    Q 9.131,17.918 9.55,18.348
    Q 9.969,18.777 9.969,19.486
    L 9.969,25.137
    L 15.598,25.137
    Q 16.307,25.137 16.736,25.556
    Q 17.166,25.975 17.166,26.684
    Q 17.166,27.414 16.736,27.833
    Q 16.307,28.252 15.598,28.252
    L 9.969,28.252
    L 9.969,33.881
    Q 9.969,34.568 9.55,35.009
    Q 9.131,35.449 8.4,35.449
    Q 7.691,35.449 7.272,35.009
    Q 6.854,34.568 6.854,33.881
    L 6.854,28.252
    L 1.203,28.252
    Q 0.516,28.252 0.075,27.833
    Q -0.365,27.414 -0.365,26.684
    Q -0.365,25.975 0.075,25.556
    Q 0.516,25.137 1.203,25.137
    L 6.854,25.137
    L 6.854,19.486
    Q 6.854,18.777 7.272,18.348
    Q 7.691,17.918 8.4,17.918
    Z
' />
</g>`},seal:{viewBox:`0 0 72.252 93.436`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-93.435546875)'>
<path fill='currentColor' d='
    M 19.186,23.031
    Q 15.684,23.031 14.062,24.664
    Q 12.439,26.297 12.439,29.777
    L 12.439,36.029
    Q 12.439,36.889 11.838,37.512
    L 7.412,41.959
    Q 4.963,44.43 4.963,46.718
    Q 4.963,49.006 7.412,51.455
    L 11.838,55.924
    Q 12.439,56.525 12.439,57.385
    L 12.439,63.658
    Q 12.439,67.16 14.062,68.771
    Q 15.684,70.383 19.186,70.383
    L 25.438,70.383
    Q 26.318,70.383 26.92,70.984
    L 31.367,75.41
    Q 33.838,77.881 36.115,77.881
    Q 38.393,77.881 40.863,75.41
    L 45.311,70.984
    Q 45.912,70.383 46.793,70.383
    L 53.045,70.383
    Q 56.547,70.383 58.169,68.75
    Q 59.791,67.117 59.791,63.658
    L 59.791,57.385
    Q 59.791,56.525 60.393,55.924
    L 64.818,51.455
    Q 67.268,49.006 67.278,46.718
    Q 67.289,44.43 64.818,41.959
    L 60.393,37.512
    Q 59.791,36.889 59.791,36.029
    L 59.791,29.777
    Q 59.791,26.275 58.158,24.653
    Q 56.525,23.031 53.045,23.031
    L 46.793,23.031
    Q 45.912,23.031 45.311,22.43
    L 40.863,18.025
    Q 38.393,15.576 36.115,15.565
    Q 33.838,15.555 31.367,18.025
    L 26.92,22.43
    Q 26.318,23.031 25.438,23.031
    Z
    M 19.186,26.791
    L 26.727,26.791
    Q 27.328,26.791 27.812,26.608
    Q 28.295,26.426 28.725,25.953
    L 34.01,20.668
    Q 34.912,19.766 35.514,19.476
    Q 36.115,19.186 36.717,19.476
    Q 37.318,19.766 38.221,20.668
    L 43.506,25.953
    Q 43.936,26.426 44.419,26.608
    Q 44.902,26.791 45.525,26.791
    L 53.045,26.791
    Q 54.936,26.791 55.483,27.339
    Q 56.031,27.887 56.031,29.777
    L 56.031,37.318
    Q 56.031,38.5 56.869,39.338
    L 62.176,44.602
    Q 63.057,45.504 63.357,46.105
    Q 63.658,46.707 63.357,47.309
    Q 63.057,47.91 62.176,48.813
    L 56.869,54.098
    Q 56.031,54.936 56.031,56.117
    L 56.031,63.658
    Q 56.031,65.527 55.483,66.075
    Q 54.936,66.623 53.045,66.623
    L 45.525,66.623
    Q 44.301,66.623 43.506,67.461
    L 38.221,72.768
    Q 37.318,73.648 36.717,73.949
    Q 36.115,74.25 35.514,73.949
    Q 34.912,73.648 34.01,72.768
    L 28.725,67.461
    Q 27.93,66.623 26.727,66.623
    L 19.186,66.623
    Q 17.896,66.623 17.263,66.408
    Q 16.629,66.193 16.414,65.56
    Q 16.199,64.926 16.199,63.658
    L 16.199,56.117
    Q 16.199,54.936 15.361,54.098
    L 10.055,48.813
    Q 9.174,47.91 8.873,47.309
    Q 8.572,46.707 8.873,46.105
    Q 9.174,45.504 10.055,44.602
    L 15.361,39.338
    Q 16.199,38.5 16.199,37.318
    L 16.199,29.777
    Q 16.199,27.887 16.747,27.339
    Q 17.295,26.791 19.186,26.791
    Z
    M 33.129,33.559
    Q 32.527,33.559 32.044,33.816
    Q 31.561,34.074 31.109,34.654
    L 23.955,43.334
    Q 23.396,44.064 23.396,44.816
    Q 23.396,45.611 23.934,46.148
    Q 24.471,46.686 25.244,46.686
    Q 25.717,46.686 26.136,46.492
    Q 26.555,46.299 26.963,45.74
    L 33.021,38.156
    L 45.182,57.492
    Q 45.869,58.545 46.836,58.545
    Q 47.588,58.545 48.179,58.062
    Q 48.77,57.578 48.77,56.805
    Q 48.77,56.418 48.587,56.031
    Q 48.404,55.645 48.211,55.301
    L 35.041,34.654
    Q 34.311,33.559 33.129,33.559
    Z
' />
</g>`},arrowUp:{viewBox:`0 0 55.73 73.197`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-73.197265625)'>
<path fill='currentColor' d='
    M 27.865,10.549
    Q 26.963,10.549 26.372,11.129
    Q 25.781,11.709 25.781,12.611
    L 25.781,50.402
    L 26.018,58.201
    L 27.264,57.75
    L 18.197,47.889
    L 10.57,40.348
    Q 10.291,40.09 9.904,39.939
    Q 9.518,39.789 9.088,39.789
    Q 8.229,39.789 7.648,40.38
    Q 7.068,40.971 7.068,41.852
    Q 7.068,42.689 7.713,43.355
    L 26.297,61.939
    Q 26.641,62.283 27.038,62.466
    Q 27.436,62.648 27.865,62.648
    Q 28.295,62.648 28.692,62.466
    Q 29.09,62.283 29.434,61.939
    L 48.018,43.355
    Q 48.662,42.689 48.662,41.852
    Q 48.662,40.971 48.082,40.38
    Q 47.502,39.789 46.643,39.789
    Q 46.213,39.789 45.826,39.939
    Q 45.439,40.09 45.16,40.348
    L 37.533,47.889
    L 28.445,57.75
    L 29.713,58.201
    L 29.949,50.402
    L 29.949,12.611
    Q 29.949,11.709 29.358,11.129
    Q 28.768,10.549 27.865,10.549
    Z
' />
</g>`},arrowDown:{viewBox:`0 0 55.73 73.197`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-73.197265625)'>
<path fill='currentColor' d='
    M 27.865,62.648
    Q 28.768,62.648 29.358,62.068
    Q 29.949,61.488 29.949,60.586
    L 29.949,22.795
    L 29.713,14.996
    L 28.445,15.447
    L 37.533,25.309
    L 45.16,32.85
    Q 45.439,33.107 45.826,33.258
    Q 46.213,33.408 46.643,33.408
    Q 47.502,33.408 48.082,32.817
    Q 48.662,32.227 48.662,31.346
    Q 48.662,30.508 48.018,29.842
    L 29.434,11.258
    Q 29.09,10.914 28.692,10.731
    Q 28.295,10.549 27.865,10.549
    Q 27.436,10.549 27.038,10.731
    Q 26.641,10.914 26.297,11.258
    L 7.713,29.842
    Q 7.068,30.508 7.068,31.346
    Q 7.068,32.227 7.648,32.817
    Q 8.229,33.408 9.088,33.408
    Q 9.518,33.408 9.904,33.258
    Q 10.291,33.107 10.57,32.85
    L 18.197,25.309
    L 27.264,15.447
    L 26.018,14.996
    L 25.781,22.795
    L 25.781,60.586
    Q 25.781,61.488 26.372,62.068
    Q 26.963,62.648 27.865,62.648
    Z
' />
</g>`},trendUp:{viewBox:`0 0 73.455 71.736`,body:`<g fill-rule='nonzero' transform='scale(1,-1) translate(0,-71.736328125)'>
<path fill='currentColor' d='
    M 7.068,12.246
    L 7.068,59.576
    Q 7.068,60.328 7.616,60.908
    Q 8.164,61.488 8.98,61.488
    Q 9.797,61.488 10.334,60.908
    Q 10.871,60.328 10.871,59.576
    L 10.871,14.738
    Q 10.871,14.029 11.58,14.029
    L 64.475,14.029
    Q 65.248,14.029 65.817,13.481
    Q 66.387,12.934 66.387,12.139
    Q 66.387,11.344 65.817,10.796
    Q 65.248,10.248 64.475,10.248
    L 9.066,10.248
    Q 8.164,10.248 7.616,10.796
    Q 7.068,11.344 7.068,12.246
    Z
    M 10.484,27.371
    L 7.648,30.207
    L 19.83,42.453
    Q 20.732,43.355 21.581,43.764
    Q 22.43,44.172 23.354,44.172
    Q 24.277,44.172 25.147,43.753
    Q 26.018,43.334 26.877,42.453
    L 37.447,31.775
    Q 37.941,31.281 38.436,31.281
    Q 38.908,31.281 39.424,31.775
    L 50.982,43.484
    L 46.17,48.318
    Q 45.74,48.748 45.729,49.21
    Q 45.719,49.672 46.063,50.048
    Q 46.406,50.424 47.008,50.574
    L 63.035,54.398
    Q 63.572,54.549 64.023,54.334
    Q 64.475,54.119 64.7,53.679
    Q 64.926,53.238 64.775,52.658
    L 60.973,36.631
    Q 60.801,36.029 60.425,35.686
    Q 60.049,35.342 59.576,35.342
    Q 59.104,35.342 58.674,35.771
    L 53.84,40.627
    L 41.959,28.682
    Q 40.24,26.941 38.436,26.941
    Q 37.512,26.941 36.631,27.36
    Q 35.75,27.779 34.891,28.682
    L 24.342,39.338
    Q 23.848,39.854 23.354,39.854
    Q 22.881,39.854 22.365,39.338
    Z
' />
</g>`}};function Ue(){let{login:e,sendDeviceCode:t,logout:r}=k(),a=n(),[o,s]=(0,J.useState)(``),[c,l]=(0,J.useState)(``),[u,d]=(0,J.useState)(``),[f,p]=(0,J.useState)(!1),[m,h]=(0,J.useState)(0),[_,v]=(0,J.useState)(`cred`),y=(0,J.useRef)(void 0);(0,J.useEffect)(()=>{if(!(m<=0))return y.current=window.setTimeout(()=>h(e=>e-1),1e3),()=>window.clearTimeout(y.current)},[m]);async function b(t){if(t.preventDefault(),d(``),!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.trim())){d(`Escribe un correo electrónico válido.`);return}if(!c){d(`Escribe tu contraseña.`);return}p(!0);let n=await e(o,c);p(!1),n?d(n):a(`/app/inicio`,{replace:!0})}async function x(){if(d(``),!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.trim())){d(`Escribe tu correo electrónico para enviarte el enlace de acceso.`);return}p(!0);let e=await t(o.trim());p(!1),e?d(e):(v(`link`),h(45))}async function S(){if(m>0)return;p(!0),d(``);let e=await t(o.trim());p(!1),e?d(e):h(45)}async function w(){await r(),l(``),h(0),d(``),v(`cred`)}return(0,Y.jsxs)(`main`,{className:`auth`,children:[(0,Y.jsxs)(`div`,{className:`auth__pitch`,children:[(0,Y.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,Y.jsx)(`span`,{className:`wordmark__blink`,children:`BLINK`}),(0,Y.jsx)(`span`,{className:`wordmark__pos`,children:`POS`})]}),(0,Y.jsx)(`h2`,{children:`Tu punto de venta, rápido y claro.`}),(0,Y.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.2rem`,fontWeight:600},children:`Vende, cobra en dólares y bolívares, y controla tu inventario desde un solo lugar.`})]}),(0,Y.jsx)(`div`,{className:`auth__panel`,children:(0,Y.jsx)(`div`,{className:`auth__card`,children:_===`link`?(0,Y.jsxs)(`div`,{children:[(0,Y.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--sm`,onClick:w,style:{marginBottom:`0.75rem`},children:[(0,Y.jsx)(g,{name:`arrowLeft`}),` Usar otra cuenta`]}),(0,Y.jsx)(`h1`,{children:`Verifica tu correo`}),(0,Y.jsxs)(`p`,{className:`muted`,style:{marginBottom:`1rem`,whiteSpace:`pre-wrap`},children:[`Enviamos un enlace de verificación a `,(0,Y.jsx)(`strong`,{children:o.trim()}),`. Ábrelo desde este navegador para completar el inicio de sesión.`]}),(0,Y.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.9rem`,marginBottom:`1.25rem`},children:[(0,Y.jsx)(g,{name:`mail`}),` Revisa Spam o Promociones si no lo ves.`]}),u&&(0,Y.jsx)(`p`,{className:`field__error`,children:u}),(0,Y.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--block`,style:{marginTop:`0.5rem`},onClick:S,disabled:f||m>0,children:[(0,Y.jsx)(g,{name:`mail`}),m>0?`Reenviar en ${m}s`:`Reenviar enlace`]}),(0,Y.jsx)(`p`,{className:`muted`,style:{fontSize:`0.75rem`,marginTop:`1rem`,textAlign:`center`},children:`Cada comercio usa un correo único. Al abrir el enlace se iniciará sesión automáticamente.`})]}):(0,Y.jsxs)(`form`,{onSubmit:b,children:[(0,Y.jsx)(`h1`,{children:`Qué bueno verte por aquí.`}),(0,Y.jsx)(`p`,{className:`muted`,style:{marginBottom:`1.5rem`},children:`Entra para abrir tu punto de venta.`}),(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Correo electrónico`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,type:`email`,autoComplete:`email`,value:o,onChange:e=>s(e.target.value),placeholder:`tucorreo@dominio.com`})}),(0,Y.jsx)(C,{label:`Contraseña`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,type:`password`,autoComplete:`current-password`,value:c,onChange:e=>l(e.target.value),placeholder:`Tu contraseña`})})]}),u&&(0,Y.jsx)(`p`,{className:`field__error`,children:u}),(0,Y.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:f,children:f?`Entrando…`:`Entrar`}),(0,Y.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--sm btn--block`,style:{marginTop:`0.6rem`},onClick:x,disabled:f,children:[(0,Y.jsx)(g,{name:`mail`}),` Entrar con enlace al correo`]}),(0,Y.jsx)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`0.9rem`,textAlign:`center`},children:(0,Y.jsx)(i,{to:`/app/recuperar`,children:`¿Olvidaste tu contraseña?`})}),(0,Y.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`1.25rem`,textAlign:`center`},children:[`¿Nuevo por aquí? `,(0,Y.jsx)(i,{to:`/app/registro`,children:`Crear mi comercio`})]})]})})})]})}function We(){let{signUp:e,resendCode:t}=k(),[n,r]=(0,J.useState)(`datos`),[a,o]=(0,J.useState)(``),[s,c]=(0,J.useState)(``),[l,u]=(0,J.useState)(``),[d,f]=(0,J.useState)(``),[p,m]=(0,J.useState)(``),[h,_]=(0,J.useState)(``),[v,y]=(0,J.useState)(``),[b,x]=(0,J.useState)(``),[S,w]=(0,J.useState)(!1),[T,E]=(0,J.useState)(0),D=(0,J.useRef)(void 0);(0,J.useEffect)(()=>{if(!(T<=0))return D.current=window.setTimeout(()=>E(e=>e-1),1e3),()=>window.clearTimeout(D.current)},[T]);async function O(t){if(t.preventDefault(),y(``),!a.trim()||!s.trim()){y(`Escribe tu nombre y tu apellido.`);return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.trim())){y(`Escribe un correo electrónico válido.`);return}if(!/^[+()\d\s-]{7,}$/.test(l.trim())){y(`Escribe un número de teléfono válido.`);return}if(p.length<6){y(`La contraseña debe tener al menos 6 caracteres.`);return}if(p!==h){y(`Las contraseñas no coinciden.`);return}w(!0);let n=await e({email:d.trim(),password:p,firstName:a.trim(),lastName:s.trim(),phone:l.trim()});w(!1),n?y(n):(r(`link`),E(45),x(`Enviamos un enlace de verificación a ${d.trim()}. Ábrelo desde el mismo equipo o dispositivo para continuar.`))}async function A(){if(T>0)return;w(!0),y(``);let e=await t(d.trim());w(!1),e?y(e):(E(45),x(`Te enviamos un nuevo enlace de verificación.`))}return(0,Y.jsxs)(`main`,{className:`auth`,children:[(0,Y.jsxs)(`div`,{className:`auth__pitch`,children:[(0,Y.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,Y.jsx)(`span`,{className:`wordmark__blink`,children:`BLINK`}),(0,Y.jsx)(`span`,{className:`wordmark__pos`,children:`POS`})]}),(0,Y.jsx)(`h2`,{children:`Empecemos por lo básico.`}),(0,Y.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.2rem`,fontWeight:600},children:`Crea tu cuenta, verifica tu correo y arma tu punto de venta a tu medida.`})]}),(0,Y.jsx)(`div`,{className:`auth__panel`,children:(0,Y.jsxs)(`div`,{className:`auth__card`,children:[(0,Y.jsxs)(`div`,{className:`auth__steps`,"aria-hidden":!0,children:[(0,Y.jsx)(`span`,{className:n===`datos`?`auth__step auth__step--on`:`auth__step`,children:`1`}),(0,Y.jsx)(`span`,{className:`auth__step-line`}),(0,Y.jsx)(`span`,{className:n===`link`?`auth__step auth__step--on`:`auth__step`,children:`2`})]}),n===`datos`?(0,Y.jsxs)(`form`,{onSubmit:O,children:[(0,Y.jsx)(`h1`,{children:`Crea tu cuenta`}),(0,Y.jsx)(`div`,{className:`row gap-12`,children:(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Nombre`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,value:a,onChange:e=>o(e.target.value),autoComplete:`given-name`})}),(0,Y.jsx)(C,{label:`Apellido`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,value:s,onChange:e=>c(e.target.value),autoComplete:`family-name`})})]})}),(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Teléfono`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,value:l,onChange:e=>u(e.target.value),autoComplete:`tel`,placeholder:`+58 412 000 0000`})}),(0,Y.jsx)(C,{label:`Correo electrónico`,required:!0,hint:`Cada comercio debe usar un correo único. Aquí llegará el enlace de verificación.`,children:(0,Y.jsx)(`input`,{className:`input`,type:`email`,value:d,onChange:e=>f(e.target.value),autoComplete:`email`,placeholder:`tucorreo@dominio.com`})})]}),(0,Y.jsx)(`div`,{className:`row gap-12`,children:(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Contraseña`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,type:`password`,value:p,onChange:e=>m(e.target.value),autoComplete:`new-password`})}),(0,Y.jsx)(C,{label:`Confirmar contraseña`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,type:`password`,value:h,onChange:e=>_(e.target.value),autoComplete:`new-password`})})]})}),v&&(0,Y.jsx)(`p`,{className:`field__error`,children:v}),(0,Y.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:S,children:S?`Enviando enlace…`:`Continuar`}),(0,Y.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`1.25rem`,textAlign:`center`},children:[`¿Ya tienes cuenta? `,(0,Y.jsx)(i,{to:`/app/entrar`,children:`Entrar`})]})]}):(0,Y.jsxs)(`div`,{children:[(0,Y.jsx)(`button`,{type:`button`,className:`btn btn--ghost btn--sm`,onClick:()=>{r(`datos`),y(``)},style:{marginBottom:`0.75rem`},children:`← Cambiar datos`}),(0,Y.jsx)(`h1`,{children:`Verifica tu correo`}),(0,Y.jsx)(`p`,{className:`muted`,style:{marginBottom:`1rem`,whiteSpace:`pre-wrap`},children:b||`Enviamos un enlace de verificación a ${d.trim()}. Ábrelo desde el mismo navegador para continuar.`}),(0,Y.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.9rem`,marginBottom:`1.25rem`},children:[(0,Y.jsx)(g,{name:`mail`}),` Revisa también Spam o Promociones si no lo ves.`]}),v&&(0,Y.jsx)(`p`,{className:`field__error`,style:{marginBottom:`0.75rem`},children:v}),(0,Y.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--block`,style:{marginTop:`0.5rem`},onClick:A,disabled:S||T>0,children:[(0,Y.jsx)(g,{name:`mail`}),T>0?`Reenviar en ${T}s`:`Reenviar enlace`]}),(0,Y.jsx)(`p`,{className:`muted`,style:{fontSize:`0.75rem`,marginTop:`1rem`,textAlign:`center`},children:`Cada comercio usa un correo único. Al abrir el enlace se iniciará sesión automáticamente.`})]})]})})]})}function Ge(){let{resetPassword:e,updatePassword:t,logout:r}=k(),a=x(),o=n(),[s,c]=(0,J.useState)(a?`fijar`:`pedir`),[l,u]=(0,J.useState)(``),[d,f]=(0,J.useState)(``),[p,m]=(0,J.useState)(``),[h,_]=(0,J.useState)(``),[v,y]=(0,J.useState)(``),[b,S]=(0,J.useState)(!1),[w,T]=(0,J.useState)(0),E=(0,J.useRef)(void 0);(0,J.useEffect)(()=>{a&&c(`fijar`)},[a]),(0,J.useEffect)(()=>{if(!(w<=0))return E.current=window.setTimeout(()=>T(e=>e-1),1e3),()=>window.clearTimeout(E.current)},[w]);async function D(t){if(t.preventDefault(),_(``),y(``),!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.trim())){_(`Escribe un correo electrónico válido.`);return}S(!0);let n=await e(l.trim());S(!1),n?_(n):(y(`Si ese correo tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Ábrelo desde este navegador.`),T(45))}async function O(e){if(e.preventDefault(),_(``),d.length<6){_(`La contraseña debe tener al menos 6 caracteres.`);return}if(d!==p){_(`Las contraseñas no coinciden.`);return}S(!0);let n=await t(d);S(!1),n?_(n):(await r(),o(`/app/entrar`,{replace:!0}))}async function A(){if(w>0)return;S(!0),_(``);let t=await e(l.trim());S(!1),t?_(t):T(45)}async function j(){await r(),f(``),m(``),_(``),y(``),c(`pedir`)}return(0,Y.jsxs)(`main`,{className:`auth`,children:[(0,Y.jsxs)(`div`,{className:`auth__pitch`,children:[(0,Y.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,Y.jsx)(`span`,{className:`wordmark__blink`,children:`BLINK`}),(0,Y.jsx)(`span`,{className:`wordmark__pos`,children:`POS`})]}),(0,Y.jsx)(`h2`,{children:`Recupera el acceso a tu comercio.`}),(0,Y.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.2rem`,fontWeight:600},children:`Te enviamos un enlace seguro para crear una nueva contraseña, sin perder tus datos.`})]}),(0,Y.jsx)(`div`,{className:`auth__panel`,children:(0,Y.jsx)(`div`,{className:`auth__card`,children:s===`fijar`?(0,Y.jsxs)(`form`,{onSubmit:O,children:[(0,Y.jsx)(`button`,{type:`button`,className:`btn btn--ghost btn--sm`,onClick:j,style:{marginBottom:`0.75rem`},children:`← Usar otra cuenta`}),(0,Y.jsx)(`h1`,{children:`Crea tu nueva contraseña.`}),(0,Y.jsx)(`p`,{className:`muted`,style:{marginBottom:`1.5rem`},children:`Elige una clave que recuerdes. Al guardar, entrarás con ella.`}),(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Nueva contraseña`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,type:`password`,autoComplete:`new-password`,value:d,onChange:e=>f(e.target.value),placeholder:`Mínimo 6 caracteres`})}),(0,Y.jsx)(C,{label:`Confirmar contraseña`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,type:`password`,autoComplete:`new-password`,value:p,onChange:e=>m(e.target.value),placeholder:`Repítela`})})]}),h&&(0,Y.jsx)(`p`,{className:`field__error`,children:h}),(0,Y.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:b,children:b?`Guardando…`:`Guardar contraseña`})]}):(0,Y.jsxs)(`form`,{onSubmit:D,children:[(0,Y.jsx)(`h1`,{children:`¿Olvidaste tu contraseña?`}),(0,Y.jsx)(`p`,{className:`muted`,style:{marginBottom:`1.5rem`},children:`Escribe tu correo y te enviamos un enlace para crear una nueva.`}),(0,Y.jsx)(C,{label:`Correo electrónico`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,type:`email`,autoComplete:`email`,value:l,onChange:e=>u(e.target.value),placeholder:`tucorreo@dominio.com`})}),h&&(0,Y.jsx)(`p`,{className:`field__error`,children:h}),v&&(0,Y.jsxs)(`p`,{className:`field__hint`,style:{marginBottom:`1rem`,whiteSpace:`pre-wrap`},children:[(0,Y.jsx)(g,{name:`mail`}),` `,v]}),(0,Y.jsx)(`button`,{className:`btn btn--primary btn--block`,type:`submit`,disabled:b||w>0,children:b?`Enviando…`:w>0?`Reenviar en ${w}s`:`Enviar enlace`}),w>0&&(0,Y.jsxs)(`button`,{type:`button`,className:`btn btn--ghost btn--sm btn--block`,style:{marginTop:`0.6rem`},onClick:A,disabled:b,children:[(0,Y.jsx)(g,{name:`mail`}),` Reenviar enlace`]}),(0,Y.jsxs)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`1.25rem`,textAlign:`center`},children:[`¿Ya la recuerdas? `,(0,Y.jsx)(i,{to:`/app/entrar`,children:`Volver a entrar`})]})]})})})]})}var Z=[`Tu comercio`,`Recorrido`,`Cuenta de pagos`,`Categorías`,`Productos`,`Proveedores`],Ke=[`Abarrotes / bodega`,`Panadería / pastelería`,`Restaurante / comida`,`Farmacia`,`Licorería`,`Ropa / calzado`,`Belleza / estética`,`Tecnología / electrónica`,`Servicios`,`Otro`];function qe(e){switch(e){case`Servicios`:return{inventory:!1,providers:!1,credit:!0,expenses:!0,reports:!0};case`Belleza / estética`:return{inventory:!1,providers:!0,credit:!0,expenses:!0,reports:!0};case`Restaurante / comida`:return{inventory:!0,providers:!0,credit:!1,expenses:!0,reports:!0};case`Panadería / pastelería`:return{inventory:!0,providers:!0,credit:!1,expenses:!0,reports:!0};case`Licorería`:return{inventory:!0,providers:!0,credit:!1,expenses:!0,reports:!0};default:return{...y}}}var Je=[{key:`inventory`,label:`Inventario`,hint:`Controlar existencias, compras y ajustes.`},{key:`providers`,label:`Proveedores`,hint:`Registrar a quién le compras mercancía.`},{key:`credit`,label:`Crédito`,hint:`Vender a crédito y llevar cuentas por cobrar.`},{key:`expenses`,label:`Gastos`,hint:`Registrar gastos y gastos recurrentes.`},{key:`reports`,label:`Informes`,hint:`Ver ventas, utilidad y capital.`}];function Ye(){let{state:e}=O(),t=k(),r=n(),[i,a]=(0,J.useState)(0),[o,s]=(0,J.useState)(e.business.name),[c,l]=(0,J.useState)(e.business.type||``),[u,d]=(0,J.useState)(e.business.rif),[f,p]=(0,J.useState)(e.business.phone),[m,h]=(0,J.useState)(e.business.address),[_,v]=(0,J.useState)(e.business.currency),[y,b]=(0,J.useState)(e.business.baseCurrency??`USD`),[x,w]=(0,J.useState)(e.business.features),[T,E]=(0,J.useState)(``),[D,A]=(0,J.useState)(``),[j,ee]=(0,J.useState)(`efectivo`),[M,N]=(0,J.useState)(e.business.currency),[P,F]=(0,J.useState)(!0),[I,L]=(0,J.useState)(``),[te,R]=(0,J.useState)(``),[ne,re]=(0,J.useState)(``),[z,ie]=(0,J.useState)(``),[B,V]=(0,J.useState)(``),[H,U]=(0,J.useState)(``),[ae,oe]=(0,J.useState)(``),[W,G]=(0,J.useState)(``),[se,ce]=(0,J.useState)(``),[le,K]=(0,J.useState)(``),ue=(0,J.useMemo)(()=>e.channels.find(e=>e.isDefault)?.id??e.channels[0]?.id??`ch_principal`,[e.channels]);function q(e){l(e),w(qe(e))}function de(){if(E(``),i===0){if(!o.trim()){E(`Escribe el nombre de tu comercio.`);return}if(!c){E(`Elige el giro de tu comercio.`);return}t.updateBusiness({name:o.trim(),type:c,rif:u.trim(),phone:f.trim(),address:m.trim(),currency:_}),e.business.baseCurrencyLocked||t.setBaseCurrency(y)}i===1&&t.updateBusiness({features:x}),a(e=>Math.min(e+1,Z.length-1))}function fe(){E(``),a(e=>Math.max(e-1,0))}function pe(){t.completeOnboarding(),r(`/app/inicio`,{replace:!0})}function me(){D.trim()?(t.addAccount({name:D.trim(),type:j,currency:M,balance:0,commissionIn:0,commissionOut:0,inCashClose:P,active:!0}),A(``),E(``)):E(`Ponle un nombre a la cuenta (por ejemplo, Caja principal).`)}function he(n){n.preventDefault();let r=I.trim();r&&(e.categories.some(e=>e.name.toLowerCase()===r.toLowerCase())?E(`Ya existe esa categoría.`):(t.addCategory({name:r,active:!0,order:e.categories.length}),L(``),E(``)))}function ge(e){e.preventDefault();let n=te.trim();if(!n){E(`Escribe el nombre del producto.`);return}let r=Number(ne.replace(`,`,`.`))||0;if(r<=0){E(`El precio de venta debe ser mayor que cero.`);return}let i=Number(z.replace(`,`,`.`))||0,a=Number(B.replace(`,`,`.`))||0;t.addProduct({name:n.toUpperCase(),brand:``,sku:``,barcode:``,presentationQty:1,unit:`unidad`,cost:i,price:r,channelPrices:{[ue]:r},category:H,taxRate:.16,active:!0,archived:!1,trackStock:a>0||x.inventory,stock:a,minStock:0}),R(``),re(``),ie(``),V(``),U(``),E(``)}function _e(e){e.preventDefault();let n=ae.trim();n?(t.addContact({name:n,document:W.trim(),docType:W.trim().includes(`-`)?W.trim().split(`-`)[0]:``,phone:se.trim(),email:le.trim(),isClient:!1,isProvider:!0,creditDays:0,address:``,notes:``}),oe(``),G(``),ce(``),K(``),E(``)):E(`Escribe el nombre del proveedor.`)}let ve=e.business.name.trim()!==``&&e.accounts.length>0;return(0,Y.jsxs)(`main`,{className:`auth auth--wizard`,children:[(0,Y.jsxs)(`div`,{className:`auth__pitch`,children:[(0,Y.jsxs)(`span`,{className:`blink-pos-title`,children:[(0,Y.jsx)(`span`,{className:`wordmark__blink`,children:`BLINK`}),(0,Y.jsx)(`span`,{className:`wordmark__pos`,children:`POS`})]}),(0,Y.jsx)(`h2`,{children:`Vamos a dejar tu punto de venta listo.`}),(0,Y.jsx)(`p`,{style:{maxWidth:`34ch`,fontSize:`1.05rem`,fontWeight:600},children:`Cada paso usa tus datos reales. Nada de ejemplos: lo que cargues es lo que verás.`}),(0,Y.jsx)(`ol`,{className:`wizard__steps`,children:Z.map((e,t)=>(0,Y.jsxs)(`li`,{className:t===i?`is-current`:t<i?`is-done`:``,children:[(0,Y.jsx)(`span`,{className:`wizard__dot`,children:t<i?(0,Y.jsx)(g,{name:`check`}):t+1}),e]},e))})]}),(0,Y.jsx)(`div`,{className:`auth__panel`,children:(0,Y.jsxs)(`div`,{className:`wizard__panel`,children:[T&&(0,Y.jsx)(`p`,{className:`field__error`,style:{marginBottom:`0.75rem`},children:T}),i===0&&(0,Y.jsxs)(S,{title:`Datos de tu comercio`,hint:`Así aparecerá en BLINK POS y en tus recibos.`,children:[(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Nombre del comercio`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,value:o,onChange:e=>s(e.target.value),placeholder:`Ej.: Abastos La Esquina`,autoFocus:!0})}),(0,Y.jsx)(C,{label:`Giro del comercio`,required:!0,hint:`Define qué módulos te mostramos.`,children:(0,Y.jsxs)(`select`,{className:`select`,value:c,onChange:e=>q(e.target.value),children:[(0,Y.jsx)(`option`,{value:``,children:`Elige una opción…`}),Ke.map(e=>(0,Y.jsx)(`option`,{value:e,children:e},e))]})})]}),(0,Y.jsx)(`div`,{className:`row gap-12`,children:(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`RIF`,children:(0,Y.jsx)(`input`,{className:`input`,value:u,onChange:e=>d(e.target.value),placeholder:`J-000000000`})}),(0,Y.jsx)(C,{label:`Teléfono`,children:(0,Y.jsx)(`input`,{className:`input`,value:f,onChange:e=>p(e.target.value)})})]})}),(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Dirección`,children:(0,Y.jsx)(`input`,{className:`input`,value:m,onChange:e=>h(e.target.value)})}),(0,Y.jsx)(C,{label:`Moneda principal`,hint:`En la que registras tus precios de venta.`,children:(0,Y.jsxs)(`select`,{className:`select`,value:_,onChange:e=>v(e.target.value),children:[(0,Y.jsx)(`option`,{value:`USD`,children:`Dólares (USD)`}),(0,Y.jsx)(`option`,{value:`VES`,children:`Bolívares (VES)`})]})}),(0,Y.jsx)(C,{label:`Moneda base de operaciones`,hint:`USD o EUR (inmutable tras guardar). Determina la tasa oficial.`,required:!0,children:(0,Y.jsxs)(`select`,{className:`select`,value:y,onChange:e=>b(e.target.value),disabled:e.business.baseCurrencyLocked,children:[(0,Y.jsx)(`option`,{value:`USD`,children:`Dólares (USD)`}),(0,Y.jsx)(`option`,{value:`EUR`,children:`Euro (€)`})]})})]})]}),i===1&&(0,Y.jsxs)(S,{title:`Tu recorrido`,hint:`Esto es lo que BLINK puede hacer por ti. Ajusta lo que necesites.`,children:[(0,Y.jsxs)(`p`,{className:`muted`,style:{marginBottom:`0.75rem`},children:[`Según el giro que elegiste (`,(0,Y.jsx)(`strong`,{children:c||`sin definir`}),`), activamos estos módulos. Puedes cambiarlos ahora o luego en Ajustes.`]}),(0,Y.jsx)(`div`,{className:`feature-list`,children:Je.map(e=>(0,Y.jsxs)(`label`,{className:`feature`,children:[(0,Y.jsx)(`input`,{type:`checkbox`,checked:x[e.key],onChange:t=>w({...x,[e.key]:t.target.checked})}),(0,Y.jsxs)(`span`,{children:[(0,Y.jsx)(`strong`,{children:e.label}),(0,Y.jsx)(`span`,{className:`muted`,style:{display:`block`,fontSize:`0.8rem`},children:e.hint})]})]},e.key))})]}),i===2&&(0,Y.jsxs)(S,{title:`Cuenta para recibir pagos`,hint:`Como una billetera: aquí se registra el dinero que entra.`,children:[(0,Y.jsxs)(`div`,{className:`mini-list`,children:[e.accounts.map(e=>(0,Y.jsxs)(`div`,{className:`mini-list__row`,children:[(0,Y.jsx)(g,{name:`wallet`}),(0,Y.jsxs)(`span`,{children:[e.name,` · `,e.currency,e.inCashClose?` · cierra caja`:``]})]},e.id)),e.accounts.length===0&&(0,Y.jsx)(`p`,{className:`muted`,children:`Aún no tienes cuentas. Crea al menos una.`})]}),(0,Y.jsx)(C,{label:`Nombre de la cuenta`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,value:D,onChange:e=>A(e.target.value),placeholder:`Ej.: Caja principal, Banco, Pago móvil`})}),(0,Y.jsx)(`div`,{className:`row gap-12`,children:(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Tipo`,children:(0,Y.jsxs)(`select`,{className:`select`,value:j,onChange:e=>ee(e.target.value),children:[(0,Y.jsx)(`option`,{value:`efectivo`,children:`Efectivo`}),(0,Y.jsx)(`option`,{value:`banco`,children:`Banco`}),(0,Y.jsx)(`option`,{value:`pago_movil`,children:`Pago móvil`})]})}),(0,Y.jsx)(C,{label:`Divisa`,children:(0,Y.jsxs)(`select`,{className:`select`,value:M,onChange:e=>N(e.target.value),children:[(0,Y.jsx)(`option`,{value:`USD`,children:`Dólares (USD)`}),(0,Y.jsx)(`option`,{value:`VES`,children:`Bolívares (VES)`})]})})]})}),(0,Y.jsxs)(`label`,{className:`feature`,children:[(0,Y.jsx)(`input`,{type:`checkbox`,checked:P,onChange:e=>F(e.target.checked)}),(0,Y.jsxs)(`span`,{children:[(0,Y.jsx)(`strong`,{children:`Participa en el cierre de caja`}),(0,Y.jsx)(`span`,{className:`muted`,style:{display:`block`,fontSize:`0.8rem`},children:`Cuenta su saldo en el arqueo.`})]})]}),(0,Y.jsxs)(`button`,{className:`btn btn--soft`,type:`button`,onClick:me,children:[(0,Y.jsx)(g,{name:`tag`}),(0,Y.jsx)(g,{name:`plus`}),` Agregar cuenta`]})]}),i===3&&(0,Y.jsxs)(S,{title:`Categorías`,hint:`Agrupa tu catálogo como tú lo piensas.`,children:[(0,Y.jsxs)(`div`,{className:`mini-list`,children:[e.categories.map(e=>(0,Y.jsxs)(`div`,{className:`mini-list__row`,children:[(0,Y.jsx)(`span`,{children:e.name}),(0,Y.jsx)(`button`,{className:`icon-btn`,onClick:()=>t.removeCategory(e.id),"aria-label":`Quitar`,children:(0,Y.jsx)(g,{name:`trash`})})]},e.id)),e.categories.length===0&&(0,Y.jsx)(`p`,{className:`muted`,children:`Aún no hay categorías.`})]}),(0,Y.jsxs)(`form`,{className:`row gap-8`,onSubmit:he,children:[(0,Y.jsx)(`input`,{className:`input`,value:I,onChange:e=>L(e.target.value),placeholder:`Ej.: Bebidas`}),(0,Y.jsxs)(`button`,{className:`btn btn--soft`,type:`submit`,children:[(0,Y.jsx)(g,{name:`box`}),(0,Y.jsx)(g,{name:`plus`}),` Añadir`]})]})]}),i===4&&(0,Y.jsxs)(S,{title:`Productos`,hint:`Lo que vendes, con su precio real.`,children:[(0,Y.jsxs)(`div`,{className:`mini-list`,children:[e.products.map(e=>(0,Y.jsxs)(`div`,{className:`mini-list__row`,children:[(0,Y.jsxs)(`span`,{children:[e.name,` · $`,e.price.toFixed(2),e.category?` · ${e.category}`:``]}),(0,Y.jsx)(`button`,{className:`icon-btn`,onClick:()=>t.removeProduct(e.id),"aria-label":`Quitar`,children:(0,Y.jsx)(g,{name:`trash`})})]},e.id)),e.products.length===0&&(0,Y.jsx)(`p`,{className:`muted`,children:`Aún no hay productos.`})]}),(0,Y.jsxs)(`form`,{onSubmit:ge,children:[(0,Y.jsx)(C,{label:`Nombre del producto`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,value:te,onChange:e=>R(e.target.value)})}),(0,Y.jsx)(`div`,{className:`row gap-12`,children:(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Precio de venta (USD)`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,inputMode:`decimal`,value:ne,onChange:e=>re(e.target.value)})}),(0,Y.jsx)(C,{label:`Costo (USD)`,children:(0,Y.jsx)(`input`,{className:`input`,inputMode:`decimal`,value:z,onChange:e=>ie(e.target.value)})})]})}),(0,Y.jsx)(`div`,{className:`row gap-12`,children:(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`Existencia inicial`,children:(0,Y.jsx)(`input`,{className:`input`,inputMode:`decimal`,value:B,onChange:e=>V(e.target.value)})}),(0,Y.jsx)(C,{label:`Categoría`,children:(0,Y.jsxs)(`select`,{className:`select`,value:H,onChange:e=>U(e.target.value),children:[(0,Y.jsx)(`option`,{value:``,children:`Sin categoría`}),e.categories.map(e=>(0,Y.jsx)(`option`,{value:e.name,children:e.name},e.id))]})})]})}),(0,Y.jsxs)(`button`,{className:`btn btn--soft`,type:`submit`,children:[(0,Y.jsx)(g,{name:`users`}),(0,Y.jsx)(g,{name:`plus`}),` Agregar producto`]})]})]}),i===5&&(0,Y.jsxs)(S,{title:`Proveedores`,hint:`A quién le compras. Lo usarás en compras y cuentas por pagar.`,children:[(0,Y.jsxs)(`div`,{className:`mini-list`,children:[e.contacts.filter(e=>e.isProvider).map(e=>(0,Y.jsxs)(`div`,{className:`mini-list__row`,children:[(0,Y.jsxs)(`span`,{children:[e.name,e.phone?` · ${e.phone}`:``]}),(0,Y.jsx)(`button`,{className:`icon-btn`,onClick:()=>t.removeContact(e.id),"aria-label":`Quitar`,children:(0,Y.jsx)(g,{name:`trash`})})]},e.id)),e.contacts.filter(e=>e.isProvider).length===0&&(0,Y.jsx)(`p`,{className:`muted`,children:`Aún no hay proveedores.`})]}),(0,Y.jsxs)(`form`,{onSubmit:_e,children:[(0,Y.jsx)(C,{label:`Nombre o razón social`,required:!0,children:(0,Y.jsx)(`input`,{className:`input`,value:ae,onChange:e=>oe(e.target.value)})}),(0,Y.jsx)(`div`,{className:`row gap-12`,children:(0,Y.jsxs)(`div`,{className:`form-group`,children:[(0,Y.jsx)(C,{label:`RIF / documento`,children:(0,Y.jsx)(`input`,{className:`input`,value:W,onChange:e=>G(e.target.value),placeholder:`J-000000000`})}),(0,Y.jsx)(C,{label:`Teléfono`,children:(0,Y.jsx)(`input`,{className:`input`,value:se,onChange:e=>ce(e.target.value)})})]})}),(0,Y.jsx)(C,{label:`Correo`,children:(0,Y.jsx)(`input`,{className:`input`,type:`email`,value:le,onChange:e=>K(e.target.value)})}),(0,Y.jsxs)(`button`,{className:`btn btn--soft`,type:`submit`,children:[(0,Y.jsx)(g,{name:`plus`}),` Agregar proveedor`]})]})]}),(0,Y.jsxs)(`div`,{className:`wizard__nav`,children:[(0,Y.jsxs)(`button`,{className:`btn btn--ghost`,onClick:fe,disabled:i===0,children:[(0,Y.jsx)(g,{name:`arrowLeft`}),`Atrás`]}),i<Z.length-1?(0,Y.jsxs)(`button`,{className:`btn btn--primary`,onClick:de,children:[`Continuar`,(0,Y.jsx)(g,{name:`arrowRight`})]}):(0,Y.jsxs)(`button`,{className:`btn btn--primary`,onClick:pe,disabled:!ve,children:[`Terminar `,(0,Y.jsx)(g,{name:`check`})]})]}),i===Z.length-1&&!ve&&(0,Y.jsx)(`p`,{className:`muted`,style:{fontSize:`0.8rem`,marginTop:`0.5rem`,textAlign:`right`},children:`Necesitas el nombre del comercio y al menos una cuenta de pagos.`})]})})]})}var Xe={intro:`¡Bienvenido a Blink! Nos alegra mucho que uses nuestra plataforma para gestionar tu negocio. Queremos que tengas la mejor experiencia posible, por lo que hemos redactado estos términos de forma sencilla y transparente. Al registrarte o utilizar nuestros servicios, estás aceptando estas reglas. Tómate un momento para leerlas.`,blocks:[{h:`1. Tu cuenta y tu espacio`,items:[{h:`Tu responsabilidad`,p:`Eres el único responsable de mantener la seguridad de tu contraseña y de todo lo que ocurre dentro de tu cuenta. Si compartes tus datos de acceso o eres descuidado con la seguridad, no podemos hacernos responsables por accesos no autorizados.`},{h:`Tus datos son tuyos`,p:`Toda la información que subas a tu tienda (tu inventario, tus precios, el registro de tus ventas y la información de tus clientes) te pertenece al 100%. Nosotros solo te prestamos la plataforma para que los organices y operes tu negocio.`}]},{h:`2. Pagos, Suscripciones y Política de Reembolsos`,items:[{h:`El costo del servicio`,p:`Blink funciona mediante una suscripción mensual por tienda de $25 USD (o su equivalente en los métodos de pago aceptados).`},{h:`Métodos de pago autorizados`,p:`Los pagos se realizan y se reportan a través de los canales oficiales habilitados en la plataforma (como Pago Móvil o Binance Pay).`},{h:`Vigencia y suspensión`,p:`Cada pago activa tu acceso por 30 días continuos. Si llega la fecha de corte y no se ha verificado tu renovación, el acceso a tu tienda y al sistema de cobro se suspenderá temporalmente hasta que te pongas al día. No borramos tus datos de inmediato, pero no podrás usarlos hasta renovar.`},{h:`Política de No Reembolsos`,p:`Todas las compras y pagos de suscripciones realizados en Blink son definitivos y no son reembolsables. Una vez procesado el pago de tu mensualidad, no se devolverá el dinero total ni parcial, independientemente de si decidiste dejar de usar el servicio antes de que termine el mes o si tu tienda estuvo inactiva.`}]},{h:`3. El funcionamiento del servicio ("Tal cual")`,items:[{h:`Imprevistos fuera de nuestro alcance`,p:`Nos esforzamos muchísimo para que Blink funcione a la perfección todos los días. Sin embargo, el servicio se ofrece "tal cual" y "según disponibilidad". Blink no se hace responsable por interrupciones, retrasos o caídas del servicio causadas por factores externos, tales como fallas en el servicio eléctrico, cortes de internet de tu zona, problemas con los servidores en la nube que utilizamos, o cualquier otra situación de fuerza mayor.`},{h:`No asumimos compensaciones económicas`,p:`No asumimos compensaciones económicas por lucro cesante, ventas perdidas o daños indirectos si la plataforma llegara a fallar temporalmente.`}]},{h:`4. Uso adecuado de la plataforma`,p:`Te comprometes a utilizar Blink de forma honesta y exclusivamente para fines comerciales legales, cumpliendo con las leyes de la República Bolivariana de Venezuela. Queda totalmente prohibido utilizar el sistema para actividades fraudulentas, ilícitas o que pongan en riesgo la seguridad de la plataforma o de otros usuarios.`},{h:`5. Propiedad intelectual de Blink`,p:`Todo el diseño, la imagen visual, los logotipos, el nombre y la tecnología detrás de Blink son propiedad exclusiva de sus creadores. Está totalmente prohibido copiar, modificar, imitar o intentar extraer el código o la estructura de la plataforma sin autorización previa por escrito.`},{h:`6. Privacidad`,p:`Tu información personal y la de tu negocio se manejan con total discreción. No vendemos, alquilamos ni compartimos tus datos internos con terceros. Utilizamos medidas de seguridad estrictas para que la información de cada tienda se mantenga privada y separada de las demás.`},{h:`7. Cambios en los términos`,p:`Podemos actualizar estos Términos y Condiciones de vez en cuando para reflejar mejoras en el servicio. Si hacemos cambios importantes, te avisaremos a través de la plataforma. Si continúas usando Blink después de los cambios, significa que los aceptas.`},{h:`8. Cancelaciones`,p:`Puedes dejar de usar Blink cuando quieras simplemente decidiendo no renovar tu siguiente mes. Si en algún momento deseas cerrar tu cuenta definitivamente y borrar todos tus datos de nuestros registros, puedes solicitarlo directamente a través de nuestro soporte.`}]},Ze={intro:`Tu información personal y la de tu negocio se manejan con total discreción. En esta página explicamos qué datos tratamos, con qué finalidad y cómo los protegemos.`,blocks:[{h:`1. Datos que tratamos`,p:`Datos de la cuenta (correo electrónico, nombre del comercio, RIF, teléfono y dirección), datos operativos de ventas e inventario, y registros de auditoría de las acciones críticas realizadas en la caja.`},{h:`2. Finalidad`,p:`Usamos los datos exclusivamente para prestar el servicio: procesar ventas, emitir comprobantes, mantener el historial contable, calcular la tasa de cambio de referencia y ofrecer soporte técnico.`},{h:`3. Almacenamiento local y nube`,p:`Los datos de operación se guardan primero en el dispositivo para que el POS siga funcionando sin conexión. Se sincronizan de forma cifrada con la nube cuando la señal regresa. La información de cada tienda se mantiene privada y separada de las demás.`},{h:`4. Terceros`,p:`Solo compartimos información con proveedores estrictamente necesarios para operar el servicio: Supabase (alojamiento de base de datos y sincronización) y la fuente de la tasa oficial de cambio. No vendemos, alquilamos ni compartimos tus datos internos con terceros con fines publicitarios.`},{h:`5. Retención y eliminación`,p:`Conservamos los registros contables durante el tiempo que la normativa aplicable exija. Puedes solicitar la eliminación de tu cuenta y de los datos no sujetos a obligación de conservación desde el correo de soporte.`},{h:`6. Tus derechos`,p:`Puedes acceder, corregir, exportar o eliminar tus datos escribiendo a soporte@blink.com.ve. Responderemos dentro de los plazos previstos por la ley de protección de datos aplicable en Venezuela.`},{h:`7. Cambios`,p:`Esta política puede actualizarse. Publicaremos la versión vigente en esta misma página y, ante cambios sustanciales, avisaremos al correo registrado de la cuenta.`}]},Qe={terminos:{title:`Términos y Condiciones de Uso`,subtitle:`Blink · Última actualización: Octubre de 2026`,intro:Xe.intro,blocks:Xe.blocks},privacidad:{title:`Política de Privacidad`,subtitle:`Blink · Última actualización: Octubre de 2026`,intro:Ze.intro,blocks:Ze.blocks}};function $e({kind:e}){let t=Qe[e];return(0,Y.jsxs)(`div`,{className:`ld-legal`,children:[(0,Y.jsxs)(`header`,{className:`ld-legal__bar`,children:[(0,Y.jsxs)(i,{to:`/`,className:`ld-logo`,"aria-label":`BLINK POS, inicio`,children:[(0,Y.jsx)(`span`,{className:`ld-logo__blink`,children:`BLINK`}),(0,Y.jsx)(`span`,{className:`ld-logo__pos`,children:`POS`})]}),(0,Y.jsxs)(`div`,{className:`ld-legal__actions`,children:[(0,Y.jsx)(i,{className:`ld-btn--glass`,to:`/`,children:`Volver al inicio`}),(0,Y.jsx)(i,{className:`ld-btn ld-btn--primary`,to:`/app/registro`,children:`Crear mi comercio`})]})]}),(0,Y.jsxs)(`main`,{className:`ld-legal__main`,children:[(0,Y.jsx)(`h1`,{children:t.title}),(0,Y.jsx)(`p`,{className:`ld-legal__sub`,children:t.subtitle}),(0,Y.jsx)(`p`,{className:`ld-legal__intro`,children:t.intro}),t.blocks.map(e=>`items`in e?(0,Y.jsxs)(`section`,{children:[(0,Y.jsx)(`h2`,{children:e.h}),e.items.map(e=>(0,Y.jsxs)(`div`,{className:`ld-legal__item`,children:[(0,Y.jsx)(`h3`,{children:e.h}),(0,Y.jsx)(`p`,{children:e.p})]},e.h))]},e.h):(0,Y.jsxs)(`section`,{children:[(0,Y.jsx)(`h2`,{children:e.h}),(0,Y.jsx)(`p`,{children:e.p})]},e.h)),(0,Y.jsxs)(`p`,{className:`ld-legal__foot`,children:[`¿Dudas?`,` `,(0,Y.jsx)(`a`,{href:`mailto:soporte@blink.com.ve`,children:`soporte@blink.com.ve`})]})]}),(0,Y.jsxs)(`footer`,{className:`ld-legal__foot-bar`,children:[(0,Y.jsx)(`p`,{children:`© 2026 Blink POS`}),(0,Y.jsxs)(`nav`,{"aria-label":`Enlaces legales`,children:[(0,Y.jsx)(i,{to:`/app/terminos`,children:`Términos de servicio`}),(0,Y.jsx)(i,{to:`/app/privacidad`,children:`Política de privacidad`}),(0,Y.jsx)(`a`,{href:`mailto:soporte@blink.com.ve`,children:`Soporte técnico`})]})]})]})}m(He);var et=(0,J.lazy)(()=>p(()=>import(`./General-BXWM6d4c.js`).then(e=>({default:e.General})),__vite__mapDeps([0,1,2,3,4,5,6,7]))),tt=(0,J.lazy)(()=>p(()=>import(`./Vender-B9wopSF5.js`).then(e=>({default:e.Vender})),__vite__mapDeps([8,1,2,3,4,5,6,7,9]))),nt=(0,J.lazy)(()=>p(()=>import(`./Historial-DTqQx1sw.js`).then(e=>({default:e.Historial})),__vite__mapDeps([10,1,2,3,4,5,6,7,11,9]))),rt=(0,J.lazy)(()=>p(()=>import(`./Catalogo-DhKdjMBi.js`).then(e=>({default:e.Catalogo})),__vite__mapDeps([12,1,2,3,4,5,6,7,11]))),it=(0,J.lazy)(()=>p(()=>import(`./Inventario-BZagrSWf.js`).then(e=>({default:e.Inventario})),__vite__mapDeps([13,1,2,3,4,5,6,7,11]))),at=(0,J.lazy)(()=>p(()=>import(`./Contactos-L_NtQRoa.js`).then(e=>({default:e.Contactos})),__vite__mapDeps([14,1,2,3,4,5,6,7]))),ot=(0,J.lazy)(()=>p(()=>import(`./Finanzas-Ci19NPER.js`).then(e=>({default:e.Finanzas})),__vite__mapDeps([15,1,2,3,4,5,6,7]))),st=(0,J.lazy)(()=>p(()=>import(`./Informes-wWn3EZ2Y.js`).then(e=>({default:e.Informes})),__vite__mapDeps([16,1,2,3,4,5,6,7,17]))),ct=(0,J.lazy)(()=>p(()=>import(`./Ajustes-1NAkTlQg.js`).then(e=>({default:e.Ajustes})),__vite__mapDeps([18,1,2,3,4,5,6,7,17])));function Q(){return(0,Y.jsx)(`div`,{className:`page-loader`,children:`Cargando…`})}function $({children:e}){let t=x(),n=v(),r=b(),i=O().state.onboarding.completed;return r?(0,Y.jsx)(Q,{}):!t||!n?(0,Y.jsx)(u,{to:`/app/entrar`,replace:!0}):i?(0,Y.jsx)(Ve,{children:(0,Y.jsx)(J.Suspense,{fallback:(0,Y.jsx)(Q,{}),children:e})}):(0,Y.jsx)(u,{to:`/app/onboarding`,replace:!0})}function lt({children:e}){let t=x(),n=v();return b()?(0,Y.jsx)(Q,{}):t&&n?(0,Y.jsx)(u,{to:`/app/inicio`,replace:!0}):(0,Y.jsx)(Y.Fragment,{children:e})}function ut({children:e}){let t=x(),n=v(),r=b(),i=O().state.onboarding.completed;return r?(0,Y.jsx)(Q,{}):!t||!n?(0,Y.jsx)(u,{to:`/app/entrar`,replace:!0}):i?(0,Y.jsx)(u,{to:`/app/inicio`,replace:!0}):(0,Y.jsx)(Y.Fragment,{children:e})}function dt(){return(0,Y.jsxs)(s,{children:[(0,Y.jsx)(l,{path:`terminos`,element:(0,Y.jsx)($e,{kind:`terminos`})}),(0,Y.jsx)(l,{path:`privacidad`,element:(0,Y.jsx)($e,{kind:`privacidad`})}),(0,Y.jsx)(l,{path:`entrar`,element:(0,Y.jsx)(lt,{children:(0,Y.jsx)(Ue,{})})}),(0,Y.jsx)(l,{path:`registro`,element:(0,Y.jsx)(lt,{children:(0,Y.jsx)(We,{})})}),(0,Y.jsx)(l,{path:`recuperar`,element:(0,Y.jsx)(Ge,{})}),(0,Y.jsx)(l,{path:`onboarding`,element:(0,Y.jsx)(ut,{children:(0,Y.jsx)(Ye,{})})}),(0,Y.jsx)(l,{path:`inicio`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(et,{})})}),(0,Y.jsx)(l,{path:`general`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(et,{})})}),(0,Y.jsx)(l,{path:`ventas`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(tt,{})})}),(0,Y.jsx)(l,{path:`ventas/historial`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(nt,{})})}),(0,Y.jsx)(l,{path:`catalogo`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(rt,{})})}),(0,Y.jsx)(l,{path:`inventario`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(it,{})})}),(0,Y.jsx)(l,{path:`contactos`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(at,{})})}),(0,Y.jsx)(l,{path:`finanzas`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(ot,{})})}),(0,Y.jsx)(l,{path:`informes`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(st,{})})}),(0,Y.jsx)(l,{path:`ajustes`,element:(0,Y.jsx)($,{children:(0,Y.jsx)(ct,{})})}),(0,Y.jsx)(l,{path:`*`,element:(0,Y.jsx)(u,{to:`/app/inicio`,replace:!0})})]})}function ft(){let{esOscuro:e}=h();return(0,Y.jsx)(w,{children:(0,Y.jsx)(r,{theme:`ios`,dark:e,iosHoverHighlight:!0,children:(0,Y.jsx)(T,{children:(0,Y.jsx)(dt,{})})})})}export{ft as AppInterna,X as i,Ne as n,ke as r,Pe as t};