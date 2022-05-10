function Switch(aFunc, bFunc){
    let counter = 0;
    const aFunction = aFunc || throwException("IllegalArgument", "function1 is not defined");
    const bFunction = bFunc || throwException("IllegalArgument", "function2 is not defined");

    if(!isFunction(aFunction)){
        throwException("IllegalArgument", "function1 is not a function");
    }

    if(!isFunction(bFunction)){
        throwException("IllegalArgument", "function2 is not a function");
    }

    this.apply = function(){
        if(counter % 2 == 0){
            aFunction();
        }else{
            bFunction();
        }

        counter++;
    }
}

function arraysEqual(arr1, arr2){
    if(arr1.length != arr2.length){
        return false;
    }

    for(let i = 0; i < arr1.length; i++){
        if(arr1[i] != arr2[i]){
            return false;
        }
    }

    return true;
}

function copyArray(arr){
    const result = [];

    for(let i = 0; i < arr.length; i++){
        result.push(arr[i]);
    }

    return result;
}

function formatDate(epoch){
    const date = new Date(0);
        date.setUTCSeconds(epoch);
    return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.toLocaleTimeString(getLocale());
}

function hasValue(obj){
    return obj != undefined && obj != null;
}

function throwException(name, message){
    name = name == undefined ? "" : name;
    message = message == undefined ? "" : message;
    throw {name: name, message: message};
}

function getLocale(){
    return getCookie(COOKIE_LOCALE) || getBrowserLanguage();
}

function getBrowserLanguage(){
    return navigator.language.toLowerCase().split("-")[0];
}

function isEmailValid(email){
    let result;
    if(email == null || email == undefined){
        result = false;
    }

    if(email.length < 6){
        return false;
    }

    return email.match("^\\s*[\\w\\-\\+_]+(\\.[\\w\\-\\+_]+)*\\@[\\w\\-\\+_]+\\.[\\w\\-\\+_]+(\\.[\\w\\-\\+_]+)*\\s*$");
}

function getActualTimeStamp(){
    return Math.floor(new Date().getTime() / 1000);
}

function switchTab(clazz, id, duration){
    $("." + clazz).hide(duration);
    $("#" + id).show(duration);
}

function setIntervalImmediate(callBack, interval){
    callBack();
    return setInterval(callBack, interval);
}

function setCookie(key, value, expirationDays) {
    let cookieString = key + "=" + value;
    if(hasValue(expirationDays)){
        const date = new Date();
        date.setTime(+ date + (expirationDays * 86400000))
        cookieString += ";expires=" + date.toGMTString();
    }
    cookieString += "; path=/";

    window.document.cookie = cookieString;
};

function getCookie(key){
    const cookies = document.cookie.split('; ');
    for(let cIndex in cookies){
        const cookie = cookies[cIndex].split("=");
        if(cookie[0] == key){
            return cookie[1];
        }
    }
    return null;
}

function createSvgElement(type){
    return document.createElementNS("http://www.w3.org/2000/svg", type);
}

function generateRandomId() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function selectElementText(el, win) {
     win = win || window;
     const doc = win.document;
     if (win.getSelection && doc.createRange) {
         const sel = win.getSelection();
         const range = doc.createRange();
         range.selectNodeContents(el);
         sel.removeAllRanges();
         sel.addRange(range);
     } else if (doc.body.createTextRange) {
         const range = doc.body.createTextRange();
         range.moveToElementText(el);
         range.select();
     }
 }

function clearSelection() {
    document.execCommand('selectAll', false, null);
}

function isTextSelected(){
    const selection = window.getSelection();
    return selection.toString().length > 0;
}

function getValidationTimeout(){
    const presetTimeout = getCookie("validation-timeout");
    return presetTimeout == null ? 1000 : Number(presetTimeout);
}

function getQueryParam(paramName){
    return new URLSearchParams(window.location.search).get(paramName);
}

function search(arr, predicate){
    for(let i = 0; i < arr.length; i++){
        if(predicate(arr[i])){
            return i;
        }
    }

    return null;
}

function bulkReplaceAll(text, replacements){
    let result = text;

    for(let key in replacements){
        while(result.indexOf(key) > -1){
            result = result.replace(key, replacements[key]);
        }
    }
    return result
}

function isBlank(str) {
    return "&nbsp;" == str || (!str || /^\s*$/.test(str));
}

function mapToString(map){
    return new MapStream(map)
        .toListStream((key, value)=>{return key + "=" + value})
        .join(", ");
}

window.Base64 = {
    _keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},
    decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},
    _utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},
    _utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}
}

function isFunction(functionToCheck) {
    if(!hasValue){
        return false;
    }
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}