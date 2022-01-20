var Prebid;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/prebid-sso/cookies.ts":
/*!***********************************!*\
  !*** ./src/prebid-sso/cookies.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromCookieValues = exports.removeCookie = exports.setCookie = exports.getPrebidDataCacheExpiration = exports.UNKNOWN_TO_OPERATOR = exports.Cookies = void 0;
var Cookies;
(function (Cookies) {
    Cookies["ID"] = "PrebidId";
    Cookies["PREFS"] = "PrebidPrefs";
    Cookies["TEST_3PC"] = "Prebid-test_3pc";
})(Cookies = exports.Cookies || (exports.Cookies = {}));
exports.UNKNOWN_TO_OPERATOR = 'UNKNOWN_TO_OPERATOR';
// 1st party cookie expiration: 10 min
const getPrebidDataCacheExpiration = (date = new Date()) => {
    const expirationDate = new Date(date);
    expirationDate.setTime(expirationDate.getTime() + 1000 * 60 * 10);
    return expirationDate;
};
exports.getPrebidDataCacheExpiration = getPrebidDataCacheExpiration;
const setCookie = (res, cookieName, cookieValue, expirationDate, optionsOverride = {}) => {
    const options = Object.assign({ expires: expirationDate, sameSite: 'none', secure: true, encode: v => v }, optionsOverride);
    return res.cookie(cookieName, cookieValue, options);
};
exports.setCookie = setCookie;
const removeCookie = (req, res, cookieName, optionsOverride = {}) => {
    return (0, exports.setCookie)(res, cookieName, null, new Date(0), optionsOverride);
};
exports.removeCookie = removeCookie;
/**
 * @param idCookie
 * @param prefsCookie
 */
const fromCookieValues = (idCookie, prefsCookie) => {
    return {
        identifiers: (idCookie === exports.UNKNOWN_TO_OPERATOR || idCookie === undefined) ? [] : [JSON.parse(idCookie)],
        preferences: (prefsCookie === exports.UNKNOWN_TO_OPERATOR || prefsCookie === undefined) ? undefined : JSON.parse(prefsCookie)
    };
};
exports.fromCookieValues = fromCookieValues;


/***/ }),

/***/ "./src/prebid-sso/operator-client/js/prebid-sso-lib.ts":
/*!*************************************************************!*\
  !*** ./src/prebid-sso/operator-client/js/prebid-sso-lib.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.signPreferences = exports.writeIdAndPref = exports.getIdAndPreferences = void 0;
const operator_common_1 = __webpack_require__(/*! ../../operator-common */ "./src/prebid-sso/operator-common.ts");
const ua_parser_js_1 = __importDefault(__webpack_require__(/*! ua-parser-js */ "./node_modules/ua-parser-js/src/ua-parser.js"));
const cookies_1 = __webpack_require__(/*! ../../cookies */ "./src/prebid-sso/cookies.ts");
const logger = console;
const redirect = (url) => {
    document.location = url;
};
// Remove any "prebid data" param from the query string
// From https://stackoverflow.com/questions/1634748/how-can-i-delete-a-query-string-parameter-in-javascript/25214672#25214672
// TODO should be able to use a more standard way, but URL class is immutable :-(
const removeUrlParameter = (url, parameter) => {
    const urlParts = url.split('?');
    if (urlParts.length >= 2) {
        // Get first part, and remove from array
        const urlBase = urlParts.shift();
        // Join it back up
        const queryString = urlParts.join('?');
        const prefix = encodeURIComponent(parameter) + '=';
        const parts = queryString.split(/[&;]/g);
        // Reverse iteration as may be destructive
        for (let i = parts.length; i-- > 0;) {
            // Idiom for string.startsWith
            if (parts[i].lastIndexOf(prefix, 0) !== -1) {
                parts.splice(i, 1);
            }
        }
        url = urlBase + (parts.length > 0 ? ('?' + parts.join('&')) : '');
    }
    return url;
};
const getCookieValue = (name) => {
    var _a;
    return (((_a = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')) === null || _a === void 0 ? void 0 : _a.pop()) || '');
};
const setCookie = (name, value, expiration) => {
    document.cookie = `${name}=${value};expires=${expiration.toUTCString()}`;
};
// Update the URL shown in the address bar, without Prebid SSO data
const cleanUpUrL = () => history.pushState(null, "", removeUrlParameter(location.href, operator_common_1.uriParams.data));
const getProxyUrl = (proxyBase) => (endpoint) => {
    return `${proxyBase}/prebid${endpoint}`;
};
const redirectToProxyRead = (proxyBase) => () => {
    const redirectUrl = new URL(getProxyUrl(proxyBase)(operator_common_1.redirectEndpoints.read));
    redirectUrl.searchParams.set(operator_common_1.uriParams.returnUrl, location.href);
    redirect(redirectUrl.toString());
};
const saveCookieValueOrUnknown = (cookieName, cookieValue) => {
    logger.info(`Operator returned value for ${cookieName}: ${cookieValue !== undefined ? 'YES' : 'NO'}`);
    const valueToStore = cookieValue ? JSON.stringify(cookieValue) : cookies_1.UNKNOWN_TO_OPERATOR;
    logger.info(`Save ${cookieName} value: ${valueToStore}`);
    setCookie(cookieName, valueToStore, (0, cookies_1.getPrebidDataCacheExpiration)());
    return valueToStore;
};
const removeCookie = (cookieName) => {
    setCookie(cookieName, null, new Date(0));
};
let thirdPartyCookiesSupported = undefined;
const processGetIdAndPreferences = (proxyBase) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const getUrl = getProxyUrl(proxyBase);
    const redirectToRead = redirectToProxyRead(proxyBase);
    // 1. Any Prebid 1st party cookie?
    const id = getCookieValue(cookies_1.Cookies.ID);
    const rawPreferences = getCookieValue(cookies_1.Cookies.PREFS);
    if (id && rawPreferences) {
        logger.info('Cookie found: YES');
        cleanUpUrL();
        return (0, cookies_1.fromCookieValues)(id, rawPreferences);
    }
    logger.info('Cookie found: NO');
    const urlParams = new URLSearchParams(window.location.search);
    const uriData = urlParams.get(operator_common_1.uriParams.data);
    cleanUpUrL();
    // 2. Redirected from operator?
    if (uriData) {
        logger.info('Redirected from operator: YES');
        // Consider that if we have been redirected, it means 3PC are not supported
        thirdPartyCookiesSupported = false;
        // Verify message
        const response = yield fetch(getUrl(operator_common_1.signAndVerifyEndpoints.verifyRead), {
            method: 'POST',
            body: uriData,
            credentials: 'include'
        });
        const verificationResult = yield response.json();
        if (!verificationResult) {
            throw 'Verification failed';
        }
        const operatorData = JSON.parse(uriData !== null && uriData !== void 0 ? uriData : '{}');
        // 3. Received data?
        const returnedId = (_a = operatorData.body.identifiers) === null || _a === void 0 ? void 0 : _a[0];
        const hasPersistedId = (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted) === undefined || (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted);
        saveCookieValueOrUnknown(cookies_1.Cookies.ID, hasPersistedId ? returnedId : undefined);
        saveCookieValueOrUnknown(cookies_1.Cookies.PREFS, operatorData.body.preferences);
        return operatorData.body;
    }
    logger.info('Redirected from operator: NO');
    // 4. Browser known to support 3PC?
    const userAgent = new ua_parser_js_1.default(navigator.userAgent);
    if ((0, operator_common_1.isBrowserKnownToSupport3PC)(userAgent.getBrowser())) {
        logger.info('Browser known to support 3PC: YES');
        logger.info('Attempt to read from JSON');
        const response = yield fetch(getUrl(operator_common_1.jsonEndpoints.read), { credentials: 'include' });
        const operatorData = yield response.json();
        const returnedId = (_b = operatorData.body.identifiers) === null || _b === void 0 ? void 0 : _b[0];
        const hasPersistedId = (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted) === undefined || (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted);
        // 3. Received data?
        if (hasPersistedId) {
            logger.info('Operator returned id & prefs: YES');
            // If we got data, it means 3PC are supported
            thirdPartyCookiesSupported = true;
            // /!\ Note: we don't need to verify the message here as it is a REST call
            saveCookieValueOrUnknown(cookies_1.Cookies.ID, hasPersistedId ? returnedId : undefined);
            saveCookieValueOrUnknown(cookies_1.Cookies.PREFS, operatorData.body.preferences);
            return operatorData.body;
        }
        else {
            logger.info('Operator returned id & prefs: NO');
            logger.info('Verify 3PC on operator');
            // Note: need to include credentials to make sure cookies are sent
            const response = yield fetch(getUrl(operator_common_1.jsonEndpoints.verify3PC), { credentials: 'include' });
            const testOk = yield response.json();
            // 4. 3d party cookie ok?
            if (testOk) {
                logger.info('3PC verification OK: YES');
                thirdPartyCookiesSupported = true;
                logger.info('Save "unknown"');
                setCookie(cookies_1.Cookies.ID, cookies_1.UNKNOWN_TO_OPERATOR, (0, cookies_1.getPrebidDataCacheExpiration)());
                setCookie(cookies_1.Cookies.PREFS, cookies_1.UNKNOWN_TO_OPERATOR, (0, cookies_1.getPrebidDataCacheExpiration)());
                return { identifiers: [returnedId] };
            }
            else {
                logger.info('3PC verification OK: NO');
                thirdPartyCookiesSupported = false;
                logger.info('Fallback to JS redirect');
                return redirectToRead();
            }
        }
    }
    else {
        logger.info('Browser known to support 3PC: NO');
        thirdPartyCookiesSupported = false;
        logger.info('JS redirect');
        return redirectToRead();
    }
});
const processWriteIdAndPref = (proxyBase, unsignedRequest) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const getUrl = getProxyUrl(proxyBase);
    // First clean up local cookies
    removeCookie(cookies_1.Cookies.ID);
    removeCookie(cookies_1.Cookies.PREFS);
    // FIXME this boolean will be up to date only if a read occurred just before. If not, would need to explicitly test
    if (thirdPartyCookiesSupported) {
        // 1) sign the request
        const signedResponse = yield fetch(getUrl(operator_common_1.signAndVerifyEndpoints.signWrite), {
            method: 'POST',
            body: JSON.stringify(unsignedRequest),
            credentials: 'include'
        });
        const signedData = yield signedResponse.json();
        // 2) send
        const response = yield fetch(getUrl(operator_common_1.jsonEndpoints.write), {
            method: 'POST',
            body: JSON.stringify(signedData),
            credentials: 'include'
        });
        const operatorData = yield response.json();
        const returnedId = (_c = operatorData.body.identifiers) === null || _c === void 0 ? void 0 : _c[0];
        const hasPersistedId = (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted) === undefined || (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted);
        saveCookieValueOrUnknown(cookies_1.Cookies.ID, hasPersistedId ? returnedId : undefined);
        saveCookieValueOrUnknown(cookies_1.Cookies.PREFS, operatorData.body.preferences);
        return operatorData.body;
    }
    else {
        // Redirect. Signing of the request will happen on the backend proxy
        const redirectUrl = new URL(getUrl(operator_common_1.redirectEndpoints.write));
        redirectUrl.searchParams.set(operator_common_1.uriParams.returnUrl, location.href);
        redirectUrl.searchParams.set(operator_common_1.uriParams.data, JSON.stringify(unsignedRequest));
        return redirect(redirectUrl.toString());
    }
});
/**
 * @param proxyBase ex: http://myproxy.com
 */
const getIdAndPreferences = (proxyBase) => __awaiter(void 0, void 0, void 0, function* () {
    const idAndPreferences = yield processGetIdAndPreferences(proxyBase);
    logger.info('Finished', idAndPreferences);
    return idAndPreferences;
});
exports.getIdAndPreferences = getIdAndPreferences;
const writeIdAndPref = (proxyBase, input) => __awaiter(void 0, void 0, void 0, function* () {
    const idAndPreferences = yield processWriteIdAndPref(proxyBase, input);
    logger.info('Finished', idAndPreferences);
    return idAndPreferences;
});
exports.writeIdAndPref = writeIdAndPref;
const signPreferences = (proxyBase, input) => __awaiter(void 0, void 0, void 0, function* () {
    const getUrl = getProxyUrl(proxyBase);
    const signedResponse = yield fetch(getUrl(operator_common_1.signAndVerifyEndpoints.signPrefs), {
        method: 'POST',
        body: JSON.stringify(input),
        credentials: 'include'
    });
    return yield signedResponse.json();
});
exports.signPreferences = signPreferences;


/***/ }),

/***/ "./src/prebid-sso/operator-common.ts":
/*!*******************************************!*\
  !*** ./src/prebid-sso/operator-common.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMandatoryQueryStringParam = exports.getReturnUrl = exports.isBrowserKnownToSupport3PC = exports.metaRedirect = exports.httpRedirect = exports.uriParams = exports.jsonEndpoints = exports.redirectEndpoints = exports.signAndVerifyEndpoints = void 0;
exports.signAndVerifyEndpoints = {
    verifyRead: '/verify/read',
    signWrite: '/sign/write',
    signPrefs: '/sign/prefs',
};
exports.redirectEndpoints = {
    read: '/redirect/read',
    write: "/redirect/write"
};
exports.jsonEndpoints = {
    read: '/json/read',
    verify3PC: '/json/verify3pc',
    write: "/json/write",
};
exports.uriParams = {
    data: 'prebid',
    returnUrl: 'url',
    signature: 'signature',
    receiver: 'receiver',
    sender: 'sender',
    timestamp: 'timestamp',
    body: 'body'
};
const httpRedirect = (res, redirectUrl, httpCode = 303) => {
    res.redirect(httpCode, redirectUrl);
};
exports.httpRedirect = httpRedirect;
const metaRedirect = (res, redirectUrl, view) => {
    res.render(view, {
        metaRedirect: redirectUrl
    });
};
exports.metaRedirect = metaRedirect;
// FIXME Should be more elaborate. For the moment just consider Safari doesn't support 3PC
const isBrowserKnownToSupport3PC = (browser) => {
    return !browser.name.includes('Safari');
};
exports.isBrowserKnownToSupport3PC = isBrowserKnownToSupport3PC;
const getReturnUrl = (req, res) => {
    const redirectStr = (0, exports.getMandatoryQueryStringParam)(req, res, exports.uriParams.returnUrl);
    return redirectStr ? new URL(redirectStr) : undefined;
};
exports.getReturnUrl = getReturnUrl;
const getMandatoryQueryStringParam = (req, res, paramName) => {
    const stringValue = req.query[paramName];
    if (stringValue === undefined) {
        res.sendStatus(400);
        return undefined;
    }
    return stringValue;
};
exports.getMandatoryQueryStringParam = getMandatoryQueryStringParam;


/***/ }),

/***/ "./node_modules/ua-parser-js/src/ua-parser.js":
/*!****************************************************!*\
  !*** ./node_modules/ua-parser-js/src/ua-parser.js ***!
  \****************************************************/
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/////////////////////////////////////////////////////////////////////////////////
/* UAParser.js v1.0.2
   Copyright © 2012-2021 Faisal Salman <f@faisalman.com>
   MIT License *//*
   Detect Browser, Engine, OS, CPU, and Device type/model from User-Agent data.
   Supports browser & node.js environment. 
   Demo   : https://faisalman.github.io/ua-parser-js
   Source : https://github.com/faisalman/ua-parser-js */
/////////////////////////////////////////////////////////////////////////////////

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '1.0.2',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        STR_TYPE    = 'string',
        MAJOR       = 'major',
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded',
        UA_MAX_LENGTH = 255;

    var AMAZON  = 'Amazon',
        APPLE   = 'Apple',
        ASUS    = 'ASUS',
        BLACKBERRY = 'BlackBerry',
        BROWSER = 'Browser',
        CHROME  = 'Chrome',
        EDGE    = 'Edge',
        FIREFOX = 'Firefox',
        GOOGLE  = 'Google',
        HUAWEI  = 'Huawei',
        LG      = 'LG',
        MICROSOFT = 'Microsoft',
        MOTOROLA  = 'Motorola',
        OPERA   = 'Opera',
        SAMSUNG = 'Samsung',
        SONY    = 'Sony',
        XIAOMI  = 'Xiaomi',
        ZEBRA   = 'Zebra',
        FACEBOOK   = 'Facebook';

    ///////////
    // Helper
    //////////

    var extend = function (regexes, extensions) {
            var mergedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    mergedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    mergedRegexes[i] = regexes[i];
                }
            }
            return mergedRegexes;
        },
        enumerize = function (arr) {
            var enums = {};
            for (var i=0; i<arr.length; i++) {
                enums[arr[i].toUpperCase()] = arr[i];
            }
            return enums;
        },
        has = function (str1, str2) {
            return typeof str1 === STR_TYPE ? lowerize(str2).indexOf(lowerize(str1)) !== -1 : false;
        },
        lowerize = function (str) {
            return str.toLowerCase();
        },
        majorize = function (version) {
            return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g, EMPTY).split('.')[0] : undefined;
        },
        trim = function (str, len) {
            if (typeof(str) === STR_TYPE) {
                str = str.replace(/^\s\s*/, EMPTY).replace(/\s\s*$/, EMPTY);
                return typeof(len) === UNDEF_TYPE ? str : str.substring(0, UA_MAX_LENGTH);
            }
    };

    ///////////////
    // Map helper
    //////////////

    var rgxMapper = function (ua, arrays) {

            var i = 0, j, k, p, q, matches, match;

            // loop through all regexes maps
            while (i < arrays.length && !matches) {

                var regex = arrays[i],       // even sequence (0,2,4,..)
                    props = arrays[i + 1];   // odd sequence (1,3,5,..)
                j = k = 0;

                // try matching uastring with regexes
                while (j < regex.length && !matches) {

                    matches = regex[j++].exec(ua);

                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length === 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        this[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        this[q[0]] = q[1];
                                    }
                                } else if (q.length === 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        this[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length === 4) {
                                        this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                this[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
        },

        strMapper = function (str, map) {

            for (var i in map) {
                // check if current value is array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
    };

    ///////////////
    // String map
    //////////////

    // Safari < 3.0
    var oldSafariMap = {
            '1.0'   : '/8',
            '1.2'   : '/1',
            '1.3'   : '/3',
            '2.0'   : '/412',
            '2.0.2' : '/416',
            '2.0.3' : '/417',
            '2.0.4' : '/419',
            '?'     : '/'
        },
        windowsVersionMap = {
            'ME'        : '4.90',
            'NT 3.11'   : 'NT3.51',
            'NT 4.0'    : 'NT4.0',
            '2000'      : 'NT 5.0',
            'XP'        : ['NT 5.1', 'NT 5.2'],
            'Vista'     : 'NT 6.0',
            '7'         : 'NT 6.1',
            '8'         : 'NT 6.2',
            '8.1'       : 'NT 6.3',
            '10'        : ['NT 6.4', 'NT 10.0'],
            'RT'        : 'ARM'
    };

    //////////////
    // Regex map
    /////////////

    var regexes = {

        browser : [[

            /\b(?:crmo|crios)\/([\w\.]+)/i                                      // Chrome for Android/iOS
            ], [VERSION, [NAME, 'Chrome']], [
            /edg(?:e|ios|a)?\/([\w\.]+)/i                                       // Microsoft Edge
            ], [VERSION, [NAME, 'Edge']], [

            // Presto based
            /(opera mini)\/([-\w\.]+)/i,                                        // Opera Mini
            /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,                 // Opera Mobi/Tablet
            /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i                           // Opera
            ], [NAME, VERSION], [
            /opios[\/ ]+([\w\.]+)/i                                             // Opera mini on iphone >= 8.0
            ], [VERSION, [NAME, OPERA+' Mini']], [
            /\bopr\/([\w\.]+)/i                                                 // Opera Webkit
            ], [VERSION, [NAME, OPERA]], [

            // Mixed
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,      // Lunascape/Maxthon/Netfront/Jasmine/Blazer
            // Trident based
            /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,               // Avant/IEMobile/SlimBrowser
            /(ba?idubrowser)[\/ ]?([\w\.]+)/i,                                  // Baidu Browser
            /(?:ms|\()(ie) ([\w\.]+)/i,                                         // Internet Explorer

            // Webkit/KHTML based                                               // Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
            /(flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale|qqbrowserlite|qq)\/([-\w\.]+)/i,
                                                                                // Rekonq/Puffin/Brave/Whale/QQBrowserLite/QQ, aka ShouQ
            /(weibo)__([\d\.]+)/i                                               // Weibo
            ], [NAME, VERSION], [
            /(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i                 // UCBrowser
            ], [VERSION, [NAME, 'UC'+BROWSER]], [
            /\bqbcore\/([\w\.]+)/i                                              // WeChat Desktop for Windows Built-in Browser
            ], [VERSION, [NAME, 'WeChat(Win) Desktop']], [
            /micromessenger\/([\w\.]+)/i                                        // WeChat
            ], [VERSION, [NAME, 'WeChat']], [
            /konqueror\/([\w\.]+)/i                                             // Konqueror
            ], [VERSION, [NAME, 'Konqueror']], [
            /trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i                       // IE11
            ], [VERSION, [NAME, 'IE']], [
            /yabrowser\/([\w\.]+)/i                                             // Yandex
            ], [VERSION, [NAME, 'Yandex']], [
            /(avast|avg)\/([\w\.]+)/i                                           // Avast/AVG Secure Browser
            ], [[NAME, /(.+)/, '$1 Secure '+BROWSER], VERSION], [
            /\bfocus\/([\w\.]+)/i                                               // Firefox Focus
            ], [VERSION, [NAME, FIREFOX+' Focus']], [
            /\bopt\/([\w\.]+)/i                                                 // Opera Touch
            ], [VERSION, [NAME, OPERA+' Touch']], [
            /coc_coc\w+\/([\w\.]+)/i                                            // Coc Coc Browser
            ], [VERSION, [NAME, 'Coc Coc']], [
            /dolfin\/([\w\.]+)/i                                                // Dolphin
            ], [VERSION, [NAME, 'Dolphin']], [
            /coast\/([\w\.]+)/i                                                 // Opera Coast
            ], [VERSION, [NAME, OPERA+' Coast']], [
            /miuibrowser\/([\w\.]+)/i                                           // MIUI Browser
            ], [VERSION, [NAME, 'MIUI '+BROWSER]], [
            /fxios\/([-\w\.]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, FIREFOX]], [
            /\bqihu|(qi?ho?o?|360)browser/i                                     // 360
            ], [[NAME, '360 '+BROWSER]], [
            /(oculus|samsung|sailfish)browser\/([\w\.]+)/i
            ], [[NAME, /(.+)/, '$1 '+BROWSER], VERSION], [                      // Oculus/Samsung/Sailfish Browser
            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], [
            /(electron)\/([\w\.]+) safari/i,                                    // Electron-based App
            /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,                   // Tesla
            /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i            // QQBrowser/Baidu App/2345 Browser
            ], [NAME, VERSION], [
            /(metasr)[\/ ]?([\w\.]+)/i,                                         // SouGouBrowser
            /(lbbrowser)/i                                                      // LieBao Browser
            ], [NAME], [

            // WebView
            /((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i       // Facebook App for iOS & Android
            ], [[NAME, FACEBOOK], VERSION], [
            /safari (line)\/([\w\.]+)/i,                                        // Line App for iOS
            /\b(line)\/([\w\.]+)\/iab/i,                                        // Line App for Android
            /(chromium|instagram)[\/ ]([-\w\.]+)/i                              // Chromium/Instagram
            ], [NAME, VERSION], [
            /\bgsa\/([\w\.]+) .*safari\//i                                      // Google Search Appliance on iOS
            ], [VERSION, [NAME, 'GSA']], [

            /headlesschrome(?:\/([\w\.]+)| )/i                                  // Chrome Headless
            ], [VERSION, [NAME, CHROME+' Headless']], [

            / wv\).+(chrome)\/([\w\.]+)/i                                       // Chrome WebView
            ], [[NAME, CHROME+' WebView'], VERSION], [

            /droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i           // Android Browser
            ], [VERSION, [NAME, 'Android '+BROWSER]], [

            /(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i       // Chrome/OmniWeb/Arora/Tizen/Nokia
            ], [NAME, VERSION], [

            /version\/([\w\.]+) .*mobile\/\w+ (safari)/i                        // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [
            /version\/([\w\.]+) .*(mobile ?safari|safari)/i                     // Safari & Safari Mobile
            ], [VERSION, NAME], [
            /webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i                      // Safari < 3.0
            ], [NAME, [VERSION, strMapper, oldSafariMap]], [

            /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

            // Gecko based
            /(navigator|netscape\d?)\/([-\w\.]+)/i                              // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
            /mobile vr; rv:([\w\.]+)\).+firefox/i                               // Firefox Reality
            ], [VERSION, [NAME, FIREFOX+' Reality']], [
            /ekiohf.+(flow)\/([\w\.]+)/i,                                       // Flow
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror/Klar
            /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(firefox)\/([\w\.]+)/i,                                            // Other Firefox-based
            /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,                         // Mozilla

            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir/Obigo/Mosaic/Go/ICE/UP.Browser
            /(links) \(([\w\.]+)/i                                              // Links
            ], [NAME, VERSION]
        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i                     // AMD64 (x64)
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i                                                      // IA32 (quicktime)
            ], [[ARCHITECTURE, lowerize]], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32 (x86)
            ], [[ARCHITECTURE, 'ia32']], [

            /\b(aarch64|arm(v?8e?l?|_?64))\b/i                                 // ARM64
            ], [[ARCHITECTURE, 'arm64']], [

            /\b(arm(?:v[67])?ht?n?[fl]p?)\b/i                                   // ARMHF
            ], [[ARCHITECTURE, 'armhf']], [

            // PocketPC mistakenly identified as PowerPC
            /windows (ce|mobile); ppc;/i
            ], [[ARCHITECTURE, 'arm']], [

            /((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i                            // PowerPC
            ], [[ARCHITECTURE, /ower/, EMPTY, lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, lowerize]]
        ],

        device : [[

            //////////////////////////
            // MOBILES & TABLETS
            // Ordered by popularity
            /////////////////////////

            // Samsung
            /\b(sch-i[89]0\d|shw-m380s|sm-[pt]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, TABLET]], [
            /\b((?:s[cgp]h|gt|sm)-\w+|galaxy nexus)/i,
            /samsung[- ]([-\w]+)/i,
            /sec-(sgh\w+)/i
            ], [MODEL, [VENDOR, SAMSUNG], [TYPE, MOBILE]], [

            // Apple
            /\((ip(?:hone|od)[\w ]*);/i                                         // iPod/iPhone
            ], [MODEL, [VENDOR, APPLE], [TYPE, MOBILE]], [
            /\((ipad);[-\w\),; ]+apple/i,                                       // iPad
            /applecoremedia\/[\w\.]+ \((ipad)/i,
            /\b(ipad)\d\d?,\d\d?[;\]].+ios/i
            ], [MODEL, [VENDOR, APPLE], [TYPE, TABLET]], [

            // Huawei
            /\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, TABLET]], [
            /(?:huawei|honor)([-\w ]+)[;\)]/i,
            /\b(nexus 6p|\w{2,4}-[atu]?[ln][01259x][012359][an]?)\b(?!.+d\/s)/i
            ], [MODEL, [VENDOR, HUAWEI], [TYPE, MOBILE]], [

            // Xiaomi
            /\b(poco[\w ]+)(?: bui|\))/i,                                       // Xiaomi POCO
            /\b; (\w+) build\/hm\1/i,                                           // Xiaomi Hongmi 'numeric' models
            /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,                             // Xiaomi Hongmi
            /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,                   // Xiaomi Redmi
            /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i // Xiaomi Mi
            ], [[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, MOBILE]], [
            /\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i                        // Mi Pad tablets
            ],[[MODEL, /_/g, ' '], [VENDOR, XIAOMI], [TYPE, TABLET]], [

            // OPPO
            /; (\w+) bui.+ oppo/i,
            /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i
            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [

            // Vivo
            /vivo (\w+)(?: bui|\))/i,
            /\b(v[12]\d{3}\w?[at])(?: bui|;)/i
            ], [MODEL, [VENDOR, 'Vivo'], [TYPE, MOBILE]], [

            // Realme
            /\b(rmx[12]\d{3})(?: bui|;|\))/i
            ], [MODEL, [VENDOR, 'Realme'], [TYPE, MOBILE]], [

            // Motorola
            /\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
            /\bmot(?:orola)?[- ](\w*)/i,
            /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, MOBILE]], [
            /\b(mz60\d|xoom[2 ]{0,2}) build\//i
            ], [MODEL, [VENDOR, MOTOROLA], [TYPE, TABLET]], [

            // LG
            /((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i
            ], [MODEL, [VENDOR, LG], [TYPE, TABLET]], [
            /(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
            /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
            /\blg-?([\d\w]+) bui/i
            ], [MODEL, [VENDOR, LG], [TYPE, MOBILE]], [

            // Lenovo
            /(ideatab[-\w ]+)/i,
            /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i
            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

            // Nokia
            /(?:maemo|nokia).*(n900|lumia \d+)/i,
            /nokia[-_ ]?([-\w\.]*)/i
            ], [[MODEL, /_/g, ' '], [VENDOR, 'Nokia'], [TYPE, MOBILE]], [

            // Google
            /(pixel c)\b/i                                                      // Google Pixel C
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, TABLET]], [
            /droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i                         // Google Pixel
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, MOBILE]], [

            // Sony
            /droid.+ ([c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i
            ], [MODEL, [VENDOR, SONY], [TYPE, MOBILE]], [
            /sony tablet [ps]/i,
            /\b(?:sony)?sgp\w+(?: bui|\))/i
            ], [[MODEL, 'Xperia Tablet'], [VENDOR, SONY], [TYPE, TABLET]], [

            // OnePlus
            / (kb2005|in20[12]5|be20[12][59])\b/i,
            /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i
            ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

            // Amazon
            /(alexa)webm/i,
            /(kf[a-z]{2}wi)( bui|\))/i,                                         // Kindle Fire without Silk
            /(kf[a-z]+)( bui|\)).+silk\//i                                      // Kindle Fire HD
            ], [MODEL, [VENDOR, AMAZON], [TYPE, TABLET]], [
            /((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i                     // Fire Phone
            ], [[MODEL, /(.+)/g, 'Fire Phone $1'], [VENDOR, AMAZON], [TYPE, MOBILE]], [

            // BlackBerry
            /(playbook);[-\w\),; ]+(rim)/i                                      // BlackBerry PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [
            /\b((?:bb[a-f]|st[hv])100-\d)/i,
            /\(bb10; (\w+)/i                                                    // BlackBerry 10
            ], [MODEL, [VENDOR, BLACKBERRY], [TYPE, MOBILE]], [

            // Asus
            /(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, TABLET]], [
            / (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i
            ], [MODEL, [VENDOR, ASUS], [TYPE, MOBILE]], [

            // HTC
            /(nexus 9)/i                                                        // HTC Nexus 9
            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [
            /(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,                         // HTC

            // ZTE
            /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
            /(alcatel|geeksphone|nexian|panasonic|sony)[-_ ]?([-\w]*)/i         // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            // Acer
            /droid.+; ([ab][1-7]-?[0178a]\d\d?)/i
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            // Meizu
            /droid.+; (m[1-5] note) bui/i,
            /\bmz-([-\w]{2,})/i
            ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [

            // Sharp
            /\b(sh-?[altvz]?\d\d[a-ekm]?)/i
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, MOBILE]], [

            // MIXED
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i,
                                                                                // BlackBerry/BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
            /(hp) ([\w ]+\w)/i,                                                 // HP iPAQ
            /(asus)-?(\w+)/i,                                                   // Asus
            /(microsoft); (lumia[\w ]+)/i,                                      // Microsoft Lumia
            /(lenovo)[-_ ]?([-\w]+)/i,                                          // Lenovo
            /(jolla)/i,                                                         // Jolla
            /(oppo) ?([\w ]+) bui/i                                             // OPPO
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /(archos) (gamepad2?)/i,                                            // Archos
            /(hp).+(touchpad(?!.+tablet)|tablet)/i,                             // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(nook)[\w ]+build\/(\w+)/i,                                        // Nook
            /(dell) (strea[kpr\d ]*[\dko])/i,                                   // Dell Streak
            /(le[- ]+pan)[- ]+(\w{1,9}) bui/i,                                  // Le Pan Tablets
            /(trinity)[- ]*(t\d{3}) bui/i,                                      // Trinity Tablets
            /(gigaset)[- ]+(q\w{1,9}) bui/i,                                    // Gigaset Tablets
            /(vodafone) ([\w ]+)(?:\)| bui)/i                                   // Vodafone
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(surface duo)/i                                                    // Surface Duo
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, TABLET]], [
            /droid [\d\.]+; (fp\du?)(?: b|\))/i                                 // Fairphone
            ], [MODEL, [VENDOR, 'Fairphone'], [TYPE, MOBILE]], [
            /(u304aa)/i                                                         // AT&T
            ], [MODEL, [VENDOR, 'AT&T'], [TYPE, MOBILE]], [
            /\bsie-(\w*)/i                                                      // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [
            /\b(rct\w+) b/i                                                     // RCA Tablets
            ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [
            /\b(venue[\d ]{2,7}) b/i                                            // Dell Venue Tablets
            ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [
            /\b(q(?:mv|ta)\w+) b/i                                              // Verizon Tablet
            ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [
            /\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i                       // Barnes & Noble Tablet
            ], [MODEL, [VENDOR, 'Barnes & Noble'], [TYPE, TABLET]], [
            /\b(tm\d{3}\w+) b/i
            ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [
            /\b(k88) b/i                                                        // ZTE K Series Tablet
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [
            /\b(nx\d{3}j) b/i                                                   // ZTE Nubia
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [
            /\b(gen\d{3}) b.+49h/i                                              // Swiss GEN Mobile
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [
            /\b(zur\d{3}) b/i                                                   // Swiss ZUR Tablet
            ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [
            /\b((zeki)?tb.*\b) b/i                                              // Zeki Tablets
            ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [
            /\b([yr]\d{2}) b/i,
            /\b(dragon[- ]+touch |dt)(\w{5}) b/i                                // Dragon Touch Tablet
            ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [
            /\b(ns-?\w{0,9}) b/i                                                // Insignia Tablets
            ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [
            /\b((nxa|next)-?\w{0,9}) b/i                                        // NextBook Tablets
            ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [
            /\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i                  // Voice Xtreme Phones
            ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [
            /\b(lvtel\-)?(v1[12]) b/i                                           // LvTel Phones
            ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [
            /\b(ph-1) /i                                                        // Essential PH-1
            ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [
            /\b(v(100md|700na|7011|917g).*\b) b/i                               // Envizen Tablets
            ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [
            /\b(trio[-\w\. ]+) b/i                                              // MachSpeed Tablets
            ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [
            /\btu_(1491) b/i                                                    // Rotor Tablets
            ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [
            /(shield[\w ]+) b/i                                                 // Nvidia Shield Tablets
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, TABLET]], [
            /(sprint) (\w+)/i                                                   // Sprint Phones
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, MICROSOFT], [TYPE, MOBILE]], [
            /droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i             // Zebra
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, TABLET]], [
            /droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, MOBILE]], [

            ///////////////////
            // CONSOLES
            ///////////////////

            /(ouya)/i,                                                          // Ouya
            /(nintendo) ([wids3utch]+)/i                                        // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [
            /droid.+; (shield) bui/i                                            // Nvidia
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [
            /(playstation [345portablevi]+)/i                                   // Playstation
            ], [MODEL, [VENDOR, SONY], [TYPE, CONSOLE]], [
            /\b(xbox(?: one)?(?!; xbox))[\); ]/i                                // Microsoft Xbox
            ], [MODEL, [VENDOR, MICROSOFT], [TYPE, CONSOLE]], [

            ///////////////////
            // SMARTTVS
            ///////////////////

            /smart-tv.+(samsung)/i                                              // Samsung
            ], [VENDOR, [TYPE, SMARTTV]], [
            /hbbtv.+maple;(\d+)/i
            ], [[MODEL, /^/, 'SmartTV'], [VENDOR, SAMSUNG], [TYPE, SMARTTV]], [
            /(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i        // LG SmartTV
            ], [[VENDOR, LG], [TYPE, SMARTTV]], [
            /(apple) ?tv/i                                                      // Apple TV
            ], [VENDOR, [MODEL, APPLE+' TV'], [TYPE, SMARTTV]], [
            /crkey/i                                                            // Google Chromecast
            ], [[MODEL, CHROME+'cast'], [VENDOR, GOOGLE], [TYPE, SMARTTV]], [
            /droid.+aft(\w)( bui|\))/i                                          // Fire TV
            ], [MODEL, [VENDOR, AMAZON], [TYPE, SMARTTV]], [
            /\(dtv[\);].+(aquos)/i                                              // Sharp
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [
            /\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,                          // Roku
            /hbbtv\/\d+\.\d+\.\d+ +\([\w ]*; *(\w[^;]*);([^;]*)/i               // HbbTV devices
            ], [[VENDOR, trim], [MODEL, trim], [TYPE, SMARTTV]], [
            /\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i                   // SmartTV from Unidentified Vendors
            ], [[TYPE, SMARTTV]], [

            ///////////////////
            // WEARABLES
            ///////////////////

            /((pebble))app/i                                                    // Pebble
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [
            /droid.+; (glass) \d/i                                              // Google Glass
            ], [MODEL, [VENDOR, GOOGLE], [TYPE, WEARABLE]], [
            /droid.+; (wt63?0{2,3})\)/i
            ], [MODEL, [VENDOR, ZEBRA], [TYPE, WEARABLE]], [
            /(quest( 2)?)/i                                                     // Oculus Quest
            ], [MODEL, [VENDOR, FACEBOOK], [TYPE, WEARABLE]], [

            ///////////////////
            // EMBEDDED
            ///////////////////

            /(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i                              // Tesla
            ], [VENDOR, [TYPE, EMBEDDED]], [

            ////////////////////
            // MIXED (GENERIC)
            ///////////////////

            /droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i           // Android Phones from Unidentified Vendors
            ], [MODEL, [TYPE, MOBILE]], [
            /droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i       // Android Tablets from Unidentified Vendors
            ], [MODEL, [TYPE, TABLET]], [
            /\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i                      // Unidentifiable Tablet
            ], [[TYPE, TABLET]], [
            /(phone|mobile(?:[;\/]| safari)|pda(?=.+windows ce))/i              // Unidentifiable Mobile
            ], [[TYPE, MOBILE]], [
            /(android[-\w\. ]{0,9});.+buil/i                                    // Generic Android Device
            ], [MODEL, [VENDOR, 'Generic']]
        ],

        engine : [[

            /windows.+ edge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, EDGE+'HTML']], [

            /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
            ], [VERSION, [NAME, 'Blink']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
            /ekioh(flow)\/([\w\.]+)/i,                                          // Flow
            /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,                           // KHTML/Tasman/Links
            /(icab)[\/ ]([23]\.[\d\.]+)/i                                       // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]{1,9})\b.+(gecko)/i                                     // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows
            /microsoft (windows) (vista|xp)/i                                   // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows) nt 6\.2; (arm)/i,                                        // Windows RT
            /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,            // Windows Phone
            /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i
            ], [NAME, [VERSION, strMapper, windowsVersionMap]], [
            /(win(?=3|9|n)|win 9x )([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, strMapper, windowsVersionMap]], [

            // iOS/macOS
            /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,              // iOS
            /cfnetwork\/.+darwin/i
            ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [
            /(mac os x) ?([\w\. ]*)/i,
            /(macintosh|mac_powerpc\b)(?!.+haiku)/i                             // Mac OS
            ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

            // Mobile OSes
            /droid ([\w\.]+)\b.+(android[- ]x86)/i                              // Android-x86
            ], [VERSION, NAME], [                                               // Android/WebOS/QNX/Bada/RIM/Maemo/MeeGo/Sailfish OS
            /(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
            /(blackberry)\w*\/([\w\.]*)/i,                                      // Blackberry
            /(tizen|kaios)[\/ ]([\w\.]+)/i,                                     // Tizen/KaiOS
            /\((series40);/i                                                    // Series 40
            ], [NAME, VERSION], [
            /\(bb(10);/i                                                        // BlackBerry 10
            ], [VERSION, [NAME, BLACKBERRY]], [
            /(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i         // Symbian
            ], [VERSION, [NAME, 'Symbian']], [
            /mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i // Firefox OS
            ], [VERSION, [NAME, FIREFOX+' OS']], [
            /web0s;.+rt(tv)/i,
            /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i                              // WebOS
            ], [VERSION, [NAME, 'webOS']], [

            // Google Chromecast
            /crkey\/([\d\.]+)/i                                                 // Google Chromecast
            ], [VERSION, [NAME, CHROME+'cast']], [
            /(cros) [\w]+ ([\w\.]+\w)/i                                         // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Console
            /(nintendo|playstation) ([wids345portablevuch]+)/i,                 // Nintendo/Playstation
            /(xbox); +xbox ([^\);]+)/i,                                         // Microsoft Xbox (360, One, X, S, Series X, Series S)

            // Other
            /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,                            // Joli/Palm
            /(mint)[\/\(\) ]?(\w*)/i,                                           // Mint
            /(mageia|vectorlinux)[; ]/i,                                        // Mageia/VectorLinux
            /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
                                                                                // Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware/Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus/Raspbian/Plan9/Minix/RISCOS/Contiki/Deepin/Manjaro/elementary/Sabayon/Linspire
            /(hurd|linux) ?([\w\.]*)/i,                                         // Hurd/Linux
            /(gnu) ?([\w\.]*)/i,                                                // GNU
            /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, // FreeBSD/NetBSD/OpenBSD/PC-BSD/GhostBSD/DragonFly
            /(haiku) (\w+)/i                                                    // Haiku
            ], [NAME, VERSION], [
            /(sunos) ?([\w\.\d]*)/i                                             // Solaris
            ], [[NAME, 'Solaris'], VERSION], [
            /((?:open)?solaris)[-\/ ]?([\w\.]*)/i,                              // Solaris
            /(aix) ((\d)(?=\.|\)| )[\w\.])*/i,                                  // AIX
            /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux)/i,            // BeOS/OS2/AmigaOS/MorphOS/OpenVMS/Fuchsia/HP-UX
            /(unix) ?([\w\.]*)/i                                                // UNIX
            ], [NAME, VERSION]
        ]
    };

    /////////////////
    // Constructor
    ////////////////

    var UAParser = function (ua, extensions) {

        if (typeof ua === OBJ_TYPE) {
            extensions = ua;
            ua = undefined;
        }

        if (!(this instanceof UAParser)) {
            return new UAParser(ua, extensions).getResult();
        }

        var _ua = ua || ((typeof window !== UNDEF_TYPE && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
        var _rgxmap = extensions ? extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            var _browser = {};
            _browser[NAME] = undefined;
            _browser[VERSION] = undefined;
            rgxMapper.call(_browser, _ua, _rgxmap.browser);
            _browser.major = majorize(_browser.version);
            return _browser;
        };
        this.getCPU = function () {
            var _cpu = {};
            _cpu[ARCHITECTURE] = undefined;
            rgxMapper.call(_cpu, _ua, _rgxmap.cpu);
            return _cpu;
        };
        this.getDevice = function () {
            var _device = {};
            _device[VENDOR] = undefined;
            _device[MODEL] = undefined;
            _device[TYPE] = undefined;
            rgxMapper.call(_device, _ua, _rgxmap.device);
            return _device;
        };
        this.getEngine = function () {
            var _engine = {};
            _engine[NAME] = undefined;
            _engine[VERSION] = undefined;
            rgxMapper.call(_engine, _ua, _rgxmap.engine);
            return _engine;
        };
        this.getOS = function () {
            var _os = {};
            _os[NAME] = undefined;
            _os[VERSION] = undefined;
            rgxMapper.call(_os, _ua, _rgxmap.os);
            return _os;
        };
        this.getResult = function () {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return _ua;
        };
        this.setUA = function (ua) {
            _ua = (typeof ua === STR_TYPE && ua.length > UA_MAX_LENGTH) ? trim(ua, UA_MAX_LENGTH) : ua;
            return this;
        };
        this.setUA(_ua);
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER =  enumerize([NAME, VERSION, MAJOR]);
    UAParser.CPU = enumerize([ARCHITECTURE]);
    UAParser.DEVICE = enumerize([MODEL, VENDOR, TYPE, CONSOLE, MOBILE, SMARTTV, TABLET, WEARABLE, EMBEDDED]);
    UAParser.ENGINE = UAParser.OS = enumerize([NAME, VERSION]);

    ///////////
    // Export
    //////////

    // check js environment
    if (typeof(exports) !== UNDEF_TYPE) {
        // nodejs env
        if ("object" !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if ("function" === FUNC_TYPE && __webpack_require__.amdO) {
            !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
                return UAParser;
            }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else if (typeof window !== UNDEF_TYPE) {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = typeof window !== UNDEF_TYPE && (window.jQuery || window.Zepto);
    if ($ && !$.ua) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function () {
            return parser.getUA();
        };
        $.ua.set = function (ua) {
            parser.setUA(ua);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : this);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/amd options */
/******/ 	(() => {
/******/ 		__webpack_require__.amdO = {};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/prebid-sso/operator-client/js/prebid-sso-lib.ts");
/******/ 	Prebid = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBYTtBQUN6QjtBQUNBO0FBQ0EsUUFBUSxnQkFBZ0I7QUFDeEIsTUFBTTtBQUNOO0FBQ0EsWUFBWSxVQUFjLGtCQUFrQix3QkFBVTtBQUN0RCxZQUFZLG1DQUFPO0FBQ25CO0FBQ0EsYUFBYTtBQUFBLGtHQUFDO0FBQ2QsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQzs7Ozs7OztVQ3oyQkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7Ozs7O1VFQUE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9QcmViaWQvLi9zcmMvcHJlYmlkLXNzby9jb29raWVzLnRzIiwid2VicGFjazovL1ByZWJpZC8uL3NyYy9wcmViaWQtc3NvL29wZXJhdG9yLWNsaWVudC9qcy9wcmViaWQtc3NvLWxpYi50cyIsIndlYnBhY2s6Ly9QcmViaWQvLi9zcmMvcHJlYmlkLXNzby9vcGVyYXRvci1jb21tb24udHMiLCJ3ZWJwYWNrOi8vUHJlYmlkLy4vbm9kZV9tb2R1bGVzL3VhLXBhcnNlci1qcy9zcmMvdWEtcGFyc2VyLmpzIiwid2VicGFjazovL1ByZWJpZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9QcmViaWQvd2VicGFjay9ydW50aW1lL2FtZCBvcHRpb25zIiwid2VicGFjazovL1ByZWJpZC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL1ByZWJpZC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vUHJlYmlkL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1JlcXVlc3QsIFJlc3BvbnNlfSBmcm9tIFwiZXhwcmVzc1wiO1xuaW1wb3J0IHtDb29raWVPcHRpb25zfSBmcm9tIFwiZXhwcmVzcy1zZXJ2ZS1zdGF0aWMtY29yZVwiO1xuaW1wb3J0IHtJZCwgSWRBbmRPcHRpb25hbFByZWZzLCBQcmVmZXJlbmNlc30gZnJvbSBcIi4vbW9kZWwvZ2VuZXJhdGVkLW1vZGVsXCI7XG5cbmV4cG9ydCBlbnVtIENvb2tpZXMge1xuICAgIElEID0gXCJQcmViaWRJZFwiLFxuICAgIFBSRUZTID0gJ1ByZWJpZFByZWZzJyxcbiAgICBURVNUXzNQQyA9ICdQcmViaWQtdGVzdF8zcGMnXG59XG5cbmV4cG9ydCBjb25zdCBVTktOT1dOX1RPX09QRVJBVE9SID0gJ1VOS05PV05fVE9fT1BFUkFUT1InXG5cbi8vIDFzdCBwYXJ0eSBjb29raWUgZXhwaXJhdGlvbjogMTAgbWluXG5leHBvcnQgY29uc3QgZ2V0UHJlYmlkRGF0YUNhY2hlRXhwaXJhdGlvbiA9IChkYXRlOiBEYXRlID0gbmV3IERhdGUoKSkgPT4ge1xuICAgIGNvbnN0IGV4cGlyYXRpb25EYXRlID0gbmV3IERhdGUoZGF0ZSk7XG4gICAgZXhwaXJhdGlvbkRhdGUuc2V0VGltZShleHBpcmF0aW9uRGF0ZS5nZXRUaW1lKCkgKyAxMDAwICogNjAgKiAxMClcbiAgICByZXR1cm4gZXhwaXJhdGlvbkRhdGU7XG59XG5cbmV4cG9ydCBjb25zdCBzZXRDb29raWUgPSAocmVzOiBSZXNwb25zZSwgY29va2llTmFtZTogc3RyaW5nLCBjb29raWVWYWx1ZTogYW55LCBleHBpcmF0aW9uRGF0ZTogRGF0ZSwgb3B0aW9uc092ZXJyaWRlOiBDb29raWVPcHRpb25zID0ge30pID0+IHtcbiAgICBjb25zdCBvcHRpb25zOiBDb29raWVPcHRpb25zID0ge1xuICAgICAgICBleHBpcmVzOiBleHBpcmF0aW9uRGF0ZSxcbiAgICAgICAgc2FtZVNpdGU6ICdub25lJyxcbiAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICBlbmNvZGU6IHYgPT4gdiwgLy8gdG8gYXZvaWQgdGhlIHN0cmluZyB0byBiZSBlbmNvZGVkIEBzZWUgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjMyMDU1OTkvcHJldmVudC11cmwtZW5jb2RlLWluLXJlc3BvbnNlLXNldC1jb29raWUtbm9kZWpzXG4gICAgICAgIC4uLm9wdGlvbnNPdmVycmlkZVxuICAgIH07XG4gICAgcmV0dXJuIHJlcy5jb29raWUoY29va2llTmFtZSwgY29va2llVmFsdWUsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgY29uc3QgcmVtb3ZlQ29va2llID0gKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgY29va2llTmFtZTogc3RyaW5nLCBvcHRpb25zT3ZlcnJpZGU6IENvb2tpZU9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIHJldHVybiBzZXRDb29raWUocmVzLCBjb29raWVOYW1lLCBudWxsLCBuZXcgRGF0ZSgwKSwgb3B0aW9uc092ZXJyaWRlKVxufVxuXG4vKipcbiAqIEBwYXJhbSBpZENvb2tpZVxuICogQHBhcmFtIHByZWZzQ29va2llXG4gKi9cbmV4cG9ydCBjb25zdCBmcm9tQ29va2llVmFsdWVzID0gKGlkQ29va2llOiBzdHJpbmcsIHByZWZzQ29va2llOiBzdHJpbmcpOiBJZEFuZE9wdGlvbmFsUHJlZnMgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkZW50aWZpZXJzOiAoaWRDb29raWUgPT09IFVOS05PV05fVE9fT1BFUkFUT1IgfHwgaWRDb29raWUgPT09IHVuZGVmaW5lZCkgPyBbXSA6IFtKU09OLnBhcnNlKGlkQ29va2llKSBhcyBJZF0sXG4gICAgICAgIHByZWZlcmVuY2VzOiAocHJlZnNDb29raWUgPT09IFVOS05PV05fVE9fT1BFUkFUT1IgfHwgcHJlZnNDb29raWUgPT09IHVuZGVmaW5lZCkgPyB1bmRlZmluZWQgOiBKU09OLnBhcnNlKHByZWZzQ29va2llKSBhcyBQcmVmZXJlbmNlc1xuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgaXNCcm93c2VyS25vd25Ub1N1cHBvcnQzUEMsXG4gICAganNvbkVuZHBvaW50cyxcbiAgICByZWRpcmVjdEVuZHBvaW50cyxcbiAgICBzaWduQW5kVmVyaWZ5RW5kcG9pbnRzLFxuICAgIHVyaVBhcmFtc1xufSBmcm9tIFwiLi4vLi4vb3BlcmF0b3ItY29tbW9uXCI7XG5pbXBvcnQgVUFQYXJzZXIgZnJvbSBcInVhLXBhcnNlci1qc1wiO1xuaW1wb3J0IHtcbiAgICBHZXRJZFByZWZzUmVzcG9uc2UsXG4gICAgSWRBbmRPcHRpb25hbFByZWZzLFxuICAgIElkQW5kUHJlZnMsXG4gICAgUG9zdElkUHJlZnNSZXF1ZXN0LFxuICAgIFByZWZlcmVuY2VzXG59IGZyb20gXCIuLi8uLi9tb2RlbC9nZW5lcmF0ZWQtbW9kZWxcIjtcbmltcG9ydCB7Q29va2llcywgZnJvbUNvb2tpZVZhbHVlcywgZ2V0UHJlYmlkRGF0YUNhY2hlRXhwaXJhdGlvbiwgVU5LTk9XTl9UT19PUEVSQVRPUn0gZnJvbSBcIi4uLy4uL2Nvb2tpZXNcIjtcbmltcG9ydCB7TmV3UHJlZnN9IGZyb20gXCIuLi8uLi9tb2RlbC9tb2RlbFwiO1xuXG5jb25zdCBsb2dnZXIgPSBjb25zb2xlO1xuXG5jb25zdCByZWRpcmVjdCA9ICh1cmw6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGRvY3VtZW50LmxvY2F0aW9uID0gdXJsO1xufVxuXG4vLyBSZW1vdmUgYW55IFwicHJlYmlkIGRhdGFcIiBwYXJhbSBmcm9tIHRoZSBxdWVyeSBzdHJpbmdcbi8vIEZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTYzNDc0OC9ob3ctY2FuLWktZGVsZXRlLWEtcXVlcnktc3RyaW5nLXBhcmFtZXRlci1pbi1qYXZhc2NyaXB0LzI1MjE0NjcyIzI1MjE0NjcyXG4vLyBUT0RPIHNob3VsZCBiZSBhYmxlIHRvIHVzZSBhIG1vcmUgc3RhbmRhcmQgd2F5LCBidXQgVVJMIGNsYXNzIGlzIGltbXV0YWJsZSA6LShcbmNvbnN0IHJlbW92ZVVybFBhcmFtZXRlciA9ICh1cmw6IHN0cmluZywgcGFyYW1ldGVyOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB1cmxQYXJ0cyA9IHVybC5zcGxpdCgnPycpO1xuXG4gICAgaWYgKHVybFBhcnRzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIC8vIEdldCBmaXJzdCBwYXJ0LCBhbmQgcmVtb3ZlIGZyb20gYXJyYXlcbiAgICAgICAgY29uc3QgdXJsQmFzZSA9IHVybFBhcnRzLnNoaWZ0KCk7XG5cbiAgICAgICAgLy8gSm9pbiBpdCBiYWNrIHVwXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gdXJsUGFydHMuam9pbignPycpO1xuXG4gICAgICAgIGNvbnN0IHByZWZpeCA9IGVuY29kZVVSSUNvbXBvbmVudChwYXJhbWV0ZXIpICsgJz0nO1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHF1ZXJ5U3RyaW5nLnNwbGl0KC9bJjtdL2cpO1xuXG4gICAgICAgIC8vIFJldmVyc2UgaXRlcmF0aW9uIGFzIG1heSBiZSBkZXN0cnVjdGl2ZVxuICAgICAgICBmb3IgKGxldCBpID0gcGFydHMubGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgICAgICAgLy8gSWRpb20gZm9yIHN0cmluZy5zdGFydHNXaXRoXG4gICAgICAgICAgICBpZiAocGFydHNbaV0ubGFzdEluZGV4T2YocHJlZml4LCAwKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB1cmwgPSB1cmxCYXNlICsgKHBhcnRzLmxlbmd0aCA+IDAgPyAoJz8nICsgcGFydHMuam9pbignJicpKSA6ICcnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdXJsO1xufTtcblxuY29uc3QgZ2V0Q29va2llVmFsdWUgPSAobmFtZTogc3RyaW5nKTogc3RyaW5nID0+IChcbiAgICBkb2N1bWVudC5jb29raWUubWF0Y2goJyhefDspXFxcXHMqJyArIG5hbWUgKyAnXFxcXHMqPVxcXFxzKihbXjtdKyknKT8ucG9wKCkgfHwgJydcbilcblxuY29uc3Qgc2V0Q29va2llID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgZXhwaXJhdGlvbjogRGF0ZSkgPT4ge1xuICAgIGRvY3VtZW50LmNvb2tpZSA9IGAke25hbWV9PSR7dmFsdWV9O2V4cGlyZXM9JHtleHBpcmF0aW9uLnRvVVRDU3RyaW5nKCl9YFxufVxuXG4vLyBVcGRhdGUgdGhlIFVSTCBzaG93biBpbiB0aGUgYWRkcmVzcyBiYXIsIHdpdGhvdXQgUHJlYmlkIFNTTyBkYXRhXG5jb25zdCBjbGVhblVwVXJMID0gKCkgPT4gaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgXCJcIiwgcmVtb3ZlVXJsUGFyYW1ldGVyKGxvY2F0aW9uLmhyZWYsIHVyaVBhcmFtcy5kYXRhKSk7XG5cbmNvbnN0IGdldFByb3h5VXJsID0gKHByb3h5QmFzZTogc3RyaW5nKSA9PiAoZW5kcG9pbnQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgcmV0dXJuIGAke3Byb3h5QmFzZX0vcHJlYmlkJHtlbmRwb2ludH1gXG59XG5cbmNvbnN0IHJlZGlyZWN0VG9Qcm94eVJlYWQgPSAocHJveHlCYXNlOiBzdHJpbmcpID0+ICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCByZWRpcmVjdFVybCA9IG5ldyBVUkwoZ2V0UHJveHlVcmwocHJveHlCYXNlKShyZWRpcmVjdEVuZHBvaW50cy5yZWFkKSlcbiAgICByZWRpcmVjdFVybC5zZWFyY2hQYXJhbXMuc2V0KHVyaVBhcmFtcy5yZXR1cm5VcmwsIGxvY2F0aW9uLmhyZWYpXG4gICAgcmVkaXJlY3QocmVkaXJlY3RVcmwudG9TdHJpbmcoKSk7XG59XG5cbmNvbnN0IHNhdmVDb29raWVWYWx1ZU9yVW5rbm93biA9IDxUPihjb29raWVOYW1lOiBzdHJpbmcsIGNvb2tpZVZhbHVlOiBUIHwgdW5kZWZpbmVkKSA6IHN0cmluZyA9PiB7XG4gICAgbG9nZ2VyLmluZm8oYE9wZXJhdG9yIHJldHVybmVkIHZhbHVlIGZvciAke2Nvb2tpZU5hbWV9OiAke2Nvb2tpZVZhbHVlICE9PSB1bmRlZmluZWQgPyAnWUVTJyA6ICdOTyd9YClcblxuICAgIGNvbnN0IHZhbHVlVG9TdG9yZSA9IGNvb2tpZVZhbHVlID8gSlNPTi5zdHJpbmdpZnkoY29va2llVmFsdWUpIDogVU5LTk9XTl9UT19PUEVSQVRPUlxuXG4gICAgbG9nZ2VyLmluZm8oYFNhdmUgJHtjb29raWVOYW1lfSB2YWx1ZTogJHt2YWx1ZVRvU3RvcmV9YClcblxuICAgIHNldENvb2tpZShjb29raWVOYW1lLCB2YWx1ZVRvU3RvcmUsIGdldFByZWJpZERhdGFDYWNoZUV4cGlyYXRpb24oKSlcblxuICAgIHJldHVybiB2YWx1ZVRvU3RvcmU7XG59XG5cbmNvbnN0IHJlbW92ZUNvb2tpZSA9IChjb29raWVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICBzZXRDb29raWUoY29va2llTmFtZSwgbnVsbCwgbmV3IERhdGUoMCkpXG59XG5cbmxldCB0aGlyZFBhcnR5Q29va2llc1N1cHBvcnRlZDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcblxuY29uc3QgcHJvY2Vzc0dldElkQW5kUHJlZmVyZW5jZXMgPSBhc3luYyAocHJveHlCYXNlOiBzdHJpbmcpOiBQcm9taXNlPElkQW5kT3B0aW9uYWxQcmVmcyB8IHVuZGVmaW5lZD4gPT4ge1xuXG4gICAgY29uc3QgZ2V0VXJsID0gZ2V0UHJveHlVcmwocHJveHlCYXNlKVxuICAgIGNvbnN0IHJlZGlyZWN0VG9SZWFkID0gcmVkaXJlY3RUb1Byb3h5UmVhZChwcm94eUJhc2UpXG5cbiAgICAvLyAxLiBBbnkgUHJlYmlkIDFzdCBwYXJ0eSBjb29raWU/XG4gICAgY29uc3QgaWQgPSBnZXRDb29raWVWYWx1ZShDb29raWVzLklEKVxuICAgIGNvbnN0IHJhd1ByZWZlcmVuY2VzID0gZ2V0Q29va2llVmFsdWUoQ29va2llcy5QUkVGUylcblxuICAgIGlmIChpZCAmJiByYXdQcmVmZXJlbmNlcykge1xuICAgICAgICBsb2dnZXIuaW5mbygnQ29va2llIGZvdW5kOiBZRVMnKVxuICAgICAgICBjbGVhblVwVXJMKCk7XG5cbiAgICAgICAgcmV0dXJuIGZyb21Db29raWVWYWx1ZXMoaWQsIHJhd1ByZWZlcmVuY2VzKVxuICAgIH1cblxuICAgIGxvZ2dlci5pbmZvKCdDb29raWUgZm91bmQ6IE5PJylcblxuICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gICAgY29uc3QgdXJpRGF0YSA9IHVybFBhcmFtcy5nZXQodXJpUGFyYW1zLmRhdGEpO1xuXG4gICAgY2xlYW5VcFVyTCgpO1xuXG4gICAgLy8gMi4gUmVkaXJlY3RlZCBmcm9tIG9wZXJhdG9yP1xuICAgIGlmICh1cmlEYXRhKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdSZWRpcmVjdGVkIGZyb20gb3BlcmF0b3I6IFlFUycpXG5cbiAgICAgICAgLy8gQ29uc2lkZXIgdGhhdCBpZiB3ZSBoYXZlIGJlZW4gcmVkaXJlY3RlZCwgaXQgbWVhbnMgM1BDIGFyZSBub3Qgc3VwcG9ydGVkXG4gICAgICAgIHRoaXJkUGFydHlDb29raWVzU3VwcG9ydGVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gVmVyaWZ5IG1lc3NhZ2VcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChnZXRVcmwoc2lnbkFuZFZlcmlmeUVuZHBvaW50cy52ZXJpZnlSZWFkKSwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiB1cmlEYXRhLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJ1xuICAgICAgICB9KVxuICAgICAgICBjb25zdCB2ZXJpZmljYXRpb25SZXN1bHQgPSBhd2FpdCByZXNwb25zZS5qc29uKCkgYXMgR2V0SWRQcmVmc1Jlc3BvbnNlXG5cbiAgICAgICAgaWYgKCF2ZXJpZmljYXRpb25SZXN1bHQpIHtcbiAgICAgICAgICAgIHRocm93ICdWZXJpZmljYXRpb24gZmFpbGVkJ1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3BlcmF0b3JEYXRhID0gSlNPTi5wYXJzZSh1cmlEYXRhID8/ICd7fScpIGFzIEdldElkUHJlZnNSZXNwb25zZVxuXG4gICAgICAgIC8vIDMuIFJlY2VpdmVkIGRhdGE/XG4gICAgICAgIGNvbnN0IHJldHVybmVkSWQgPSBvcGVyYXRvckRhdGEuYm9keS5pZGVudGlmaWVycz8uWzBdXG4gICAgICAgIGNvbnN0IGhhc1BlcnNpc3RlZElkID0gcmV0dXJuZWRJZD8ucGVyc2lzdGVkID09PSB1bmRlZmluZWQgfHwgcmV0dXJuZWRJZD8ucGVyc2lzdGVkXG4gICAgICAgIHNhdmVDb29raWVWYWx1ZU9yVW5rbm93bihDb29raWVzLklELCBoYXNQZXJzaXN0ZWRJZCA/IHJldHVybmVkSWQgOiB1bmRlZmluZWQpXG4gICAgICAgIHNhdmVDb29raWVWYWx1ZU9yVW5rbm93bihDb29raWVzLlBSRUZTLCBvcGVyYXRvckRhdGEuYm9keS5wcmVmZXJlbmNlcylcblxuICAgICAgICByZXR1cm4gb3BlcmF0b3JEYXRhLmJvZHlcbiAgICB9XG5cbiAgICBsb2dnZXIuaW5mbygnUmVkaXJlY3RlZCBmcm9tIG9wZXJhdG9yOiBOTycpXG5cbiAgICAvLyA0LiBCcm93c2VyIGtub3duIHRvIHN1cHBvcnQgM1BDP1xuICAgIGNvbnN0IHVzZXJBZ2VudCA9IG5ldyBVQVBhcnNlcihuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuICAgIGlmIChpc0Jyb3dzZXJLbm93blRvU3VwcG9ydDNQQyh1c2VyQWdlbnQuZ2V0QnJvd3NlcigpKSkge1xuICAgICAgICBsb2dnZXIuaW5mbygnQnJvd3NlciBrbm93biB0byBzdXBwb3J0IDNQQzogWUVTJylcblxuICAgICAgICBsb2dnZXIuaW5mbygnQXR0ZW1wdCB0byByZWFkIGZyb20gSlNPTicpXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZ2V0VXJsKGpzb25FbmRwb2ludHMucmVhZCksIHtjcmVkZW50aWFsczogJ2luY2x1ZGUnfSlcbiAgICAgICAgY29uc3Qgb3BlcmF0b3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpIGFzIEdldElkUHJlZnNSZXNwb25zZVxuICAgICAgICBcbiAgICAgICAgY29uc3QgcmV0dXJuZWRJZCA9IG9wZXJhdG9yRGF0YS5ib2R5LmlkZW50aWZpZXJzPy5bMF1cbiAgICAgICAgY29uc3QgaGFzUGVyc2lzdGVkSWQgPSByZXR1cm5lZElkPy5wZXJzaXN0ZWQgPT09IHVuZGVmaW5lZCB8fCByZXR1cm5lZElkPy5wZXJzaXN0ZWRcblxuICAgICAgICAvLyAzLiBSZWNlaXZlZCBkYXRhP1xuICAgICAgICBpZiAoaGFzUGVyc2lzdGVkSWQpIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdPcGVyYXRvciByZXR1cm5lZCBpZCAmIHByZWZzOiBZRVMnKVxuXG4gICAgICAgICAgICAvLyBJZiB3ZSBnb3QgZGF0YSwgaXQgbWVhbnMgM1BDIGFyZSBzdXBwb3J0ZWRcbiAgICAgICAgICAgIHRoaXJkUGFydHlDb29raWVzU3VwcG9ydGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gLyFcXCBOb3RlOiB3ZSBkb24ndCBuZWVkIHRvIHZlcmlmeSB0aGUgbWVzc2FnZSBoZXJlIGFzIGl0IGlzIGEgUkVTVCBjYWxsXG5cbiAgICAgICAgICAgIHNhdmVDb29raWVWYWx1ZU9yVW5rbm93bihDb29raWVzLklELCBoYXNQZXJzaXN0ZWRJZCA/IHJldHVybmVkSWQgOiB1bmRlZmluZWQpXG4gICAgICAgICAgICBzYXZlQ29va2llVmFsdWVPclVua25vd24oQ29va2llcy5QUkVGUywgb3BlcmF0b3JEYXRhLmJvZHkucHJlZmVyZW5jZXMpXG5cbiAgICAgICAgICAgIHJldHVybiBvcGVyYXRvckRhdGEuYm9keVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ09wZXJhdG9yIHJldHVybmVkIGlkICYgcHJlZnM6IE5PJylcblxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ1ZlcmlmeSAzUEMgb24gb3BlcmF0b3InKVxuICAgICAgICAgICAgLy8gTm90ZTogbmVlZCB0byBpbmNsdWRlIGNyZWRlbnRpYWxzIHRvIG1ha2Ugc3VyZSBjb29raWVzIGFyZSBzZW50XG4gICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGdldFVybChqc29uRW5kcG9pbnRzLnZlcmlmeTNQQyksIHtjcmVkZW50aWFsczogJ2luY2x1ZGUnfSlcbiAgICAgICAgICAgIGNvbnN0IHRlc3RPayA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuXG4gICAgICAgICAgICAvLyA0LiAzZCBwYXJ0eSBjb29raWUgb2s/XG4gICAgICAgICAgICBpZiAodGVzdE9rKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJzNQQyB2ZXJpZmljYXRpb24gT0s6IFlFUycpXG5cbiAgICAgICAgICAgICAgICB0aGlyZFBhcnR5Q29va2llc1N1cHBvcnRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnU2F2ZSBcInVua25vd25cIicpXG4gICAgICAgICAgICAgICAgc2V0Q29va2llKENvb2tpZXMuSUQsIFVOS05PV05fVE9fT1BFUkFUT1IsIGdldFByZWJpZERhdGFDYWNoZUV4cGlyYXRpb24oKSlcbiAgICAgICAgICAgICAgICBzZXRDb29raWUoQ29va2llcy5QUkVGUywgVU5LTk9XTl9UT19PUEVSQVRPUiwgZ2V0UHJlYmlkRGF0YUNhY2hlRXhwaXJhdGlvbigpKVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtpZGVudGlmaWVyczogW3JldHVybmVkSWRdfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnM1BDIHZlcmlmaWNhdGlvbiBPSzogTk8nKVxuXG4gICAgICAgICAgICAgICAgdGhpcmRQYXJ0eUNvb2tpZXNTdXBwb3J0ZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdGYWxsYmFjayB0byBKUyByZWRpcmVjdCcpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZGlyZWN0VG9SZWFkKCkgYXMgdW5kZWZpbmVkXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ0Jyb3dzZXIga25vd24gdG8gc3VwcG9ydCAzUEM6IE5PJylcblxuICAgICAgICB0aGlyZFBhcnR5Q29va2llc1N1cHBvcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGxvZ2dlci5pbmZvKCdKUyByZWRpcmVjdCcpXG4gICAgICAgIHJldHVybiByZWRpcmVjdFRvUmVhZCgpIGFzIHVuZGVmaW5lZFxuICAgIH1cbn07XG5cbmNvbnN0IHByb2Nlc3NXcml0ZUlkQW5kUHJlZiA9IGFzeW5jIChwcm94eUJhc2U6IHN0cmluZywgdW5zaWduZWRSZXF1ZXN0OiBJZEFuZFByZWZzKTogUHJvbWlzZTxJZEFuZE9wdGlvbmFsUHJlZnMgfCB1bmRlZmluZWQ+ID0+IHtcbiAgICBjb25zdCBnZXRVcmwgPSBnZXRQcm94eVVybChwcm94eUJhc2UpXG5cbiAgICAvLyBGaXJzdCBjbGVhbiB1cCBsb2NhbCBjb29raWVzXG4gICAgcmVtb3ZlQ29va2llKENvb2tpZXMuSUQpXG4gICAgcmVtb3ZlQ29va2llKENvb2tpZXMuUFJFRlMpXG5cbiAgICAvLyBGSVhNRSB0aGlzIGJvb2xlYW4gd2lsbCBiZSB1cCB0byBkYXRlIG9ubHkgaWYgYSByZWFkIG9jY3VycmVkIGp1c3QgYmVmb3JlLiBJZiBub3QsIHdvdWxkIG5lZWQgdG8gZXhwbGljaXRseSB0ZXN0XG4gICAgaWYgKHRoaXJkUGFydHlDb29raWVzU3VwcG9ydGVkKSB7XG4gICAgICAgIC8vIDEpIHNpZ24gdGhlIHJlcXVlc3RcbiAgICAgICAgY29uc3Qgc2lnbmVkUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChnZXRVcmwoc2lnbkFuZFZlcmlmeUVuZHBvaW50cy5zaWduV3JpdGUpLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHVuc2lnbmVkUmVxdWVzdCksXG4gICAgICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHNpZ25lZERhdGEgPSBhd2FpdCBzaWduZWRSZXNwb25zZS5qc29uKCkgYXMgUG9zdElkUHJlZnNSZXF1ZXN0XG5cbiAgICAgICAgLy8gMikgc2VuZFxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGdldFVybChqc29uRW5kcG9pbnRzLndyaXRlKSwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShzaWduZWREYXRhKSxcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZSdcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3Qgb3BlcmF0b3JEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpIGFzIEdldElkUHJlZnNSZXNwb25zZVxuXG4gICAgICAgIGNvbnN0IHJldHVybmVkSWQgPSBvcGVyYXRvckRhdGEuYm9keS5pZGVudGlmaWVycz8uWzBdXG4gICAgICAgIGNvbnN0IGhhc1BlcnNpc3RlZElkID0gcmV0dXJuZWRJZD8ucGVyc2lzdGVkID09PSB1bmRlZmluZWQgfHwgcmV0dXJuZWRJZD8ucGVyc2lzdGVkXG5cbiAgICAgICAgc2F2ZUNvb2tpZVZhbHVlT3JVbmtub3duKENvb2tpZXMuSUQsIGhhc1BlcnNpc3RlZElkID8gcmV0dXJuZWRJZCA6IHVuZGVmaW5lZCk7XG4gICAgICAgIHNhdmVDb29raWVWYWx1ZU9yVW5rbm93bihDb29raWVzLlBSRUZTLCBvcGVyYXRvckRhdGEuYm9keS5wcmVmZXJlbmNlcyk7XG5cbiAgICAgICAgcmV0dXJuIG9wZXJhdG9yRGF0YS5ib2R5XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZWRpcmVjdC4gU2lnbmluZyBvZiB0aGUgcmVxdWVzdCB3aWxsIGhhcHBlbiBvbiB0aGUgYmFja2VuZCBwcm94eVxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IG5ldyBVUkwoZ2V0VXJsKHJlZGlyZWN0RW5kcG9pbnRzLndyaXRlKSlcbiAgICAgICAgcmVkaXJlY3RVcmwuc2VhcmNoUGFyYW1zLnNldCh1cmlQYXJhbXMucmV0dXJuVXJsLCBsb2NhdGlvbi5ocmVmKVxuICAgICAgICByZWRpcmVjdFVybC5zZWFyY2hQYXJhbXMuc2V0KHVyaVBhcmFtcy5kYXRhLCBKU09OLnN0cmluZ2lmeSh1bnNpZ25lZFJlcXVlc3QpKVxuXG4gICAgICAgIHJldHVybiByZWRpcmVjdChyZWRpcmVjdFVybC50b1N0cmluZygpKSBhcyB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSBwcm94eUJhc2UgZXg6IGh0dHA6Ly9teXByb3h5LmNvbVxuICovXG5leHBvcnQgY29uc3QgZ2V0SWRBbmRQcmVmZXJlbmNlcyA9IGFzeW5jIChwcm94eUJhc2U6IHN0cmluZyk6IFByb21pc2U8SWRBbmRPcHRpb25hbFByZWZzIHwgdW5kZWZpbmVkPiA9PiB7XG4gICAgY29uc3QgaWRBbmRQcmVmZXJlbmNlcyA9IGF3YWl0IHByb2Nlc3NHZXRJZEFuZFByZWZlcmVuY2VzKHByb3h5QmFzZSk7XG5cbiAgICBsb2dnZXIuaW5mbygnRmluaXNoZWQnLCBpZEFuZFByZWZlcmVuY2VzKVxuXG4gICAgcmV0dXJuIGlkQW5kUHJlZmVyZW5jZXM7XG59XG5cbmV4cG9ydCBjb25zdCB3cml0ZUlkQW5kUHJlZiA9IGFzeW5jIChwcm94eUJhc2U6IHN0cmluZywgaW5wdXQ6IElkQW5kUHJlZnMpOiBQcm9taXNlPElkQW5kT3B0aW9uYWxQcmVmcyB8IHVuZGVmaW5lZD4gPT4ge1xuICAgIGNvbnN0IGlkQW5kUHJlZmVyZW5jZXMgPSBhd2FpdCBwcm9jZXNzV3JpdGVJZEFuZFByZWYocHJveHlCYXNlLCBpbnB1dCk7XG5cbiAgICBsb2dnZXIuaW5mbygnRmluaXNoZWQnLCBpZEFuZFByZWZlcmVuY2VzKVxuXG4gICAgcmV0dXJuIGlkQW5kUHJlZmVyZW5jZXM7XG59XG5cbmV4cG9ydCBjb25zdCBzaWduUHJlZmVyZW5jZXMgPSBhc3luYyAocHJveHlCYXNlOiBzdHJpbmcsIGlucHV0OiBOZXdQcmVmcyk6IFByb21pc2U8UHJlZmVyZW5jZXM+ID0+IHtcbiAgICBjb25zdCBnZXRVcmwgPSBnZXRQcm94eVVybChwcm94eUJhc2UpXG5cbiAgICBjb25zdCBzaWduZWRSZXNwb25zZSA9IGF3YWl0IGZldGNoKGdldFVybChzaWduQW5kVmVyaWZ5RW5kcG9pbnRzLnNpZ25QcmVmcyksIHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGlucHV0KSxcbiAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJ1xuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IHNpZ25lZFJlc3BvbnNlLmpzb24oKSBhcyBQcmVmZXJlbmNlc1xufVxuIiwiLy8gVGhlIGVuZHBvaW50cyBleHBvc2VkIGJ5IHRoZSBvcGVyYXRvciBBUElcbmltcG9ydCB7UmVxdWVzdCwgUmVzcG9uc2V9IGZyb20gXCJleHByZXNzXCI7XG5pbXBvcnQge0lCcm93c2VyfSBmcm9tIFwidWEtcGFyc2VyLWpzXCI7XG5cbmV4cG9ydCBjb25zdCBzaWduQW5kVmVyaWZ5RW5kcG9pbnRzID0ge1xuICAgIHZlcmlmeVJlYWQ6ICcvdmVyaWZ5L3JlYWQnLFxuICAgIHNpZ25Xcml0ZTogJy9zaWduL3dyaXRlJyxcbiAgICBzaWduUHJlZnM6ICcvc2lnbi9wcmVmcycsXG59XG5cbmV4cG9ydCBjb25zdCByZWRpcmVjdEVuZHBvaW50cyA9IHtcbiAgICByZWFkOiAnL3JlZGlyZWN0L3JlYWQnLFxuICAgIHdyaXRlOiBcIi9yZWRpcmVjdC93cml0ZVwiXG59XG5cbmV4cG9ydCBjb25zdCBqc29uRW5kcG9pbnRzID0ge1xuICAgIHJlYWQ6ICcvanNvbi9yZWFkJyxcbiAgICB2ZXJpZnkzUEM6ICcvanNvbi92ZXJpZnkzcGMnLFxuICAgIHdyaXRlOiBcIi9qc29uL3dyaXRlXCIsXG59XG5cbmV4cG9ydCBjb25zdCB1cmlQYXJhbXMgPSB7XG4gICAgZGF0YTogJ3ByZWJpZCcsIC8vIEZJWE1FIHNob3VsZCBkZXByZWNhdGVcbiAgICByZXR1cm5Vcmw6ICd1cmwnLFxuICAgIHNpZ25hdHVyZTogJ3NpZ25hdHVyZScsXG4gICAgcmVjZWl2ZXI6ICdyZWNlaXZlcicsXG4gICAgc2VuZGVyOiAnc2VuZGVyJyxcbiAgICB0aW1lc3RhbXA6ICd0aW1lc3RhbXAnLFxuICAgIGJvZHk6ICdib2R5J1xufVxuXG5leHBvcnQgY29uc3QgaHR0cFJlZGlyZWN0ID0gKHJlczogUmVzcG9uc2UsIHJlZGlyZWN0VXJsOiBzdHJpbmcsIGh0dHBDb2RlID0gMzAzKSA9PiB7XG4gICAgcmVzLnJlZGlyZWN0KGh0dHBDb2RlLCByZWRpcmVjdFVybCk7XG59O1xuXG5leHBvcnQgY29uc3QgbWV0YVJlZGlyZWN0ID0gKHJlczogUmVzcG9uc2UsIHJlZGlyZWN0VXJsOiBzdHJpbmcsIHZpZXc6IHN0cmluZykgPT4ge1xuICAgIHJlcy5yZW5kZXIodmlldywge1xuICAgICAgICBtZXRhUmVkaXJlY3Q6IHJlZGlyZWN0VXJsXG4gICAgfSlcbn07XG5cbi8vIEZJWE1FIFNob3VsZCBiZSBtb3JlIGVsYWJvcmF0ZS4gRm9yIHRoZSBtb21lbnQganVzdCBjb25zaWRlciBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IDNQQ1xuZXhwb3J0IGNvbnN0IGlzQnJvd3Nlcktub3duVG9TdXBwb3J0M1BDID0gKGJyb3dzZXI6IElCcm93c2VyKSA9PiB7XG4gICAgcmV0dXJuICFicm93c2VyLm5hbWUuaW5jbHVkZXMoJ1NhZmFyaScpXG59XG5cbmV4cG9ydCBjb25zdCBnZXRSZXR1cm5VcmwgPSAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKTogVVJMID0+IHtcbiAgICBjb25zdCByZWRpcmVjdFN0ciA9IGdldE1hbmRhdG9yeVF1ZXJ5U3RyaW5nUGFyYW0ocmVxLCByZXMsIHVyaVBhcmFtcy5yZXR1cm5VcmwpXG4gICAgcmV0dXJuIHJlZGlyZWN0U3RyID8gbmV3IFVSTChyZWRpcmVjdFN0cikgOiB1bmRlZmluZWRcbn1cblxuZXhwb3J0IGNvbnN0IGdldE1hbmRhdG9yeVF1ZXJ5U3RyaW5nUGFyYW0gPSAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBwYXJhbU5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgY29uc3Qgc3RyaW5nVmFsdWUgPSByZXEucXVlcnlbcGFyYW1OYW1lXSBhcyBzdHJpbmc7XG4gICAgaWYgKHN0cmluZ1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmVzLnNlbmRTdGF0dXMoNDAwKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5nVmFsdWVcbn1cblxuIiwiLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vKiBVQVBhcnNlci5qcyB2MS4wLjJcbiAgIENvcHlyaWdodCDCqSAyMDEyLTIwMjEgRmFpc2FsIFNhbG1hbiA8ZkBmYWlzYWxtYW4uY29tPlxuICAgTUlUIExpY2Vuc2UgKi8vKlxuICAgRGV0ZWN0IEJyb3dzZXIsIEVuZ2luZSwgT1MsIENQVSwgYW5kIERldmljZSB0eXBlL21vZGVsIGZyb20gVXNlci1BZ2VudCBkYXRhLlxuICAgU3VwcG9ydHMgYnJvd3NlciAmIG5vZGUuanMgZW52aXJvbm1lbnQuIFxuICAgRGVtbyAgIDogaHR0cHM6Ly9mYWlzYWxtYW4uZ2l0aHViLmlvL3VhLXBhcnNlci1qc1xuICAgU291cmNlIDogaHR0cHM6Ly9naXRodWIuY29tL2ZhaXNhbG1hbi91YS1wYXJzZXItanMgKi9cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4oZnVuY3Rpb24gKHdpbmRvdywgdW5kZWZpbmVkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbnN0YW50c1xuICAgIC8vLy8vLy8vLy8vLy9cblxuXG4gICAgdmFyIExJQlZFUlNJT04gID0gJzEuMC4yJyxcbiAgICAgICAgRU1QVFkgICAgICAgPSAnJyxcbiAgICAgICAgVU5LTk9XTiAgICAgPSAnPycsXG4gICAgICAgIEZVTkNfVFlQRSAgID0gJ2Z1bmN0aW9uJyxcbiAgICAgICAgVU5ERUZfVFlQRSAgPSAndW5kZWZpbmVkJyxcbiAgICAgICAgT0JKX1RZUEUgICAgPSAnb2JqZWN0JyxcbiAgICAgICAgU1RSX1RZUEUgICAgPSAnc3RyaW5nJyxcbiAgICAgICAgTUFKT1IgICAgICAgPSAnbWFqb3InLFxuICAgICAgICBNT0RFTCAgICAgICA9ICdtb2RlbCcsXG4gICAgICAgIE5BTUUgICAgICAgID0gJ25hbWUnLFxuICAgICAgICBUWVBFICAgICAgICA9ICd0eXBlJyxcbiAgICAgICAgVkVORE9SICAgICAgPSAndmVuZG9yJyxcbiAgICAgICAgVkVSU0lPTiAgICAgPSAndmVyc2lvbicsXG4gICAgICAgIEFSQ0hJVEVDVFVSRT0gJ2FyY2hpdGVjdHVyZScsXG4gICAgICAgIENPTlNPTEUgICAgID0gJ2NvbnNvbGUnLFxuICAgICAgICBNT0JJTEUgICAgICA9ICdtb2JpbGUnLFxuICAgICAgICBUQUJMRVQgICAgICA9ICd0YWJsZXQnLFxuICAgICAgICBTTUFSVFRWICAgICA9ICdzbWFydHR2JyxcbiAgICAgICAgV0VBUkFCTEUgICAgPSAnd2VhcmFibGUnLFxuICAgICAgICBFTUJFRERFRCAgICA9ICdlbWJlZGRlZCcsXG4gICAgICAgIFVBX01BWF9MRU5HVEggPSAyNTU7XG5cbiAgICB2YXIgQU1BWk9OICA9ICdBbWF6b24nLFxuICAgICAgICBBUFBMRSAgID0gJ0FwcGxlJyxcbiAgICAgICAgQVNVUyAgICA9ICdBU1VTJyxcbiAgICAgICAgQkxBQ0tCRVJSWSA9ICdCbGFja0JlcnJ5JyxcbiAgICAgICAgQlJPV1NFUiA9ICdCcm93c2VyJyxcbiAgICAgICAgQ0hST01FICA9ICdDaHJvbWUnLFxuICAgICAgICBFREdFICAgID0gJ0VkZ2UnLFxuICAgICAgICBGSVJFRk9YID0gJ0ZpcmVmb3gnLFxuICAgICAgICBHT09HTEUgID0gJ0dvb2dsZScsXG4gICAgICAgIEhVQVdFSSAgPSAnSHVhd2VpJyxcbiAgICAgICAgTEcgICAgICA9ICdMRycsXG4gICAgICAgIE1JQ1JPU09GVCA9ICdNaWNyb3NvZnQnLFxuICAgICAgICBNT1RPUk9MQSAgPSAnTW90b3JvbGEnLFxuICAgICAgICBPUEVSQSAgID0gJ09wZXJhJyxcbiAgICAgICAgU0FNU1VORyA9ICdTYW1zdW5nJyxcbiAgICAgICAgU09OWSAgICA9ICdTb255JyxcbiAgICAgICAgWElBT01JICA9ICdYaWFvbWknLFxuICAgICAgICBaRUJSQSAgID0gJ1plYnJhJyxcbiAgICAgICAgRkFDRUJPT0sgICA9ICdGYWNlYm9vayc7XG5cbiAgICAvLy8vLy8vLy8vL1xuICAgIC8vIEhlbHBlclxuICAgIC8vLy8vLy8vLy9cblxuICAgIHZhciBleHRlbmQgPSBmdW5jdGlvbiAocmVnZXhlcywgZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgdmFyIG1lcmdlZFJlZ2V4ZXMgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gcmVnZXhlcykge1xuICAgICAgICAgICAgICAgIGlmIChleHRlbnNpb25zW2ldICYmIGV4dGVuc2lvbnNbaV0ubGVuZ3RoICUgMiA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRSZWdleGVzW2ldID0gZXh0ZW5zaW9uc1tpXS5jb25jYXQocmVnZXhlc1tpXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUmVnZXhlc1tpXSA9IHJlZ2V4ZXNbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZFJlZ2V4ZXM7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcml6ZSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgICAgIHZhciBlbnVtcyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGVudW1zW2FycltpXS50b1VwcGVyQ2FzZSgpXSA9IGFycltpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbnVtcztcbiAgICAgICAgfSxcbiAgICAgICAgaGFzID0gZnVuY3Rpb24gKHN0cjEsIHN0cjIpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygc3RyMSA9PT0gU1RSX1RZUEUgPyBsb3dlcml6ZShzdHIyKS5pbmRleE9mKGxvd2VyaXplKHN0cjEpKSAhPT0gLTEgOiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgbG93ZXJpemUgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIG1ham9yaXplID0gZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YodmVyc2lvbikgPT09IFNUUl9UWVBFID8gdmVyc2lvbi5yZXBsYWNlKC9bXlxcZFxcLl0vZywgRU1QVFkpLnNwbGl0KCcuJylbMF0gOiB1bmRlZmluZWQ7XG4gICAgICAgIH0sXG4gICAgICAgIHRyaW0gPSBmdW5jdGlvbiAoc3RyLCBsZW4pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Yoc3RyKSA9PT0gU1RSX1RZUEUpIHtcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXlxcc1xccyovLCBFTVBUWSkucmVwbGFjZSgvXFxzXFxzKiQvLCBFTVBUWSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZihsZW4pID09PSBVTkRFRl9UWVBFID8gc3RyIDogc3RyLnN1YnN0cmluZygwLCBVQV9NQVhfTEVOR1RIKTtcbiAgICAgICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gTWFwIGhlbHBlclxuICAgIC8vLy8vLy8vLy8vLy8vXG5cbiAgICB2YXIgcmd4TWFwcGVyID0gZnVuY3Rpb24gKHVhLCBhcnJheXMpIHtcblxuICAgICAgICAgICAgdmFyIGkgPSAwLCBqLCBrLCBwLCBxLCBtYXRjaGVzLCBtYXRjaDtcblxuICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGFsbCByZWdleGVzIG1hcHNcbiAgICAgICAgICAgIHdoaWxlIChpIDwgYXJyYXlzLmxlbmd0aCAmJiAhbWF0Y2hlcykge1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlZ2V4ID0gYXJyYXlzW2ldLCAgICAgICAvLyBldmVuIHNlcXVlbmNlICgwLDIsNCwuLilcbiAgICAgICAgICAgICAgICAgICAgcHJvcHMgPSBhcnJheXNbaSArIDFdOyAgIC8vIG9kZCBzZXF1ZW5jZSAoMSwzLDUsLi4pXG4gICAgICAgICAgICAgICAgaiA9IGsgPSAwO1xuXG4gICAgICAgICAgICAgICAgLy8gdHJ5IG1hdGNoaW5nIHVhc3RyaW5nIHdpdGggcmVnZXhlc1xuICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgcmVnZXgubGVuZ3RoICYmICFtYXRjaGVzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcyA9IHJlZ2V4W2orK10uZXhlYyh1YSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhbWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChwID0gMDsgcCA8IHByb3BzLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSBtYXRjaGVzWysra107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcSA9IHByb3BzW3BdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGdpdmVuIHByb3BlcnR5IGlzIGFjdHVhbGx5IGFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBxID09PSBPQkpfVFlQRSAmJiBxLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHEubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHFbMV0gPT0gRlVOQ19UWVBFKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIG1vZGlmaWVkIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IHFbMV0uY2FsbCh0aGlzLCBtYXRjaCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBnaXZlbiB2YWx1ZSwgaWdub3JlIHJlZ2V4IG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IHFbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocS5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHdoZXRoZXIgZnVuY3Rpb24gb3IgcmVnZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcVsxXSA9PT0gRlVOQ19UWVBFICYmICEocVsxXS5leGVjICYmIHFbMV0udGVzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYWxsIGZ1bmN0aW9uICh1c3VhbGx5IHN0cmluZyBtYXBwZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IG1hdGNoID8gcVsxXS5jYWxsKHRoaXMsIG1hdGNoLCBxWzJdKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FuaXRpemUgbWF0Y2ggdXNpbmcgZ2l2ZW4gcmVnZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3FbMF1dID0gbWF0Y2ggPyBtYXRjaC5yZXBsYWNlKHFbMV0sIHFbMl0pIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHEubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txWzBdXSA9IG1hdGNoID8gcVszXS5jYWxsKHRoaXMsIG1hdGNoLnJlcGxhY2UocVsxXSwgcVsyXSkpIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1txXSA9IG1hdGNoID8gbWF0Y2ggOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdHJNYXBwZXIgPSBmdW5jdGlvbiAoc3RyLCBtYXApIHtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBtYXApIHtcbiAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBjdXJyZW50IHZhbHVlIGlzIGFycmF5XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXBbaV0gPT09IE9CSl9UWVBFICYmIG1hcFtpXS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbWFwW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzKG1hcFtpXVtqXSwgc3RyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoaSA9PT0gVU5LTk9XTikgPyB1bmRlZmluZWQgOiBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXMobWFwW2ldLCBzdHIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoaSA9PT0gVU5LTk9XTikgPyB1bmRlZmluZWQgOiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgfTtcblxuICAgIC8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIFN0cmluZyBtYXBcbiAgICAvLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gU2FmYXJpIDwgMy4wXG4gICAgdmFyIG9sZFNhZmFyaU1hcCA9IHtcbiAgICAgICAgICAgICcxLjAnICAgOiAnLzgnLFxuICAgICAgICAgICAgJzEuMicgICA6ICcvMScsXG4gICAgICAgICAgICAnMS4zJyAgIDogJy8zJyxcbiAgICAgICAgICAgICcyLjAnICAgOiAnLzQxMicsXG4gICAgICAgICAgICAnMi4wLjInIDogJy80MTYnLFxuICAgICAgICAgICAgJzIuMC4zJyA6ICcvNDE3JyxcbiAgICAgICAgICAgICcyLjAuNCcgOiAnLzQxOScsXG4gICAgICAgICAgICAnPycgICAgIDogJy8nXG4gICAgICAgIH0sXG4gICAgICAgIHdpbmRvd3NWZXJzaW9uTWFwID0ge1xuICAgICAgICAgICAgJ01FJyAgICAgICAgOiAnNC45MCcsXG4gICAgICAgICAgICAnTlQgMy4xMScgICA6ICdOVDMuNTEnLFxuICAgICAgICAgICAgJ05UIDQuMCcgICAgOiAnTlQ0LjAnLFxuICAgICAgICAgICAgJzIwMDAnICAgICAgOiAnTlQgNS4wJyxcbiAgICAgICAgICAgICdYUCcgICAgICAgIDogWydOVCA1LjEnLCAnTlQgNS4yJ10sXG4gICAgICAgICAgICAnVmlzdGEnICAgICA6ICdOVCA2LjAnLFxuICAgICAgICAgICAgJzcnICAgICAgICAgOiAnTlQgNi4xJyxcbiAgICAgICAgICAgICc4JyAgICAgICAgIDogJ05UIDYuMicsXG4gICAgICAgICAgICAnOC4xJyAgICAgICA6ICdOVCA2LjMnLFxuICAgICAgICAgICAgJzEwJyAgICAgICAgOiBbJ05UIDYuNCcsICdOVCAxMC4wJ10sXG4gICAgICAgICAgICAnUlQnICAgICAgICA6ICdBUk0nXG4gICAgfTtcblxuICAgIC8vLy8vLy8vLy8vLy8vXG4gICAgLy8gUmVnZXggbWFwXG4gICAgLy8vLy8vLy8vLy8vL1xuXG4gICAgdmFyIHJlZ2V4ZXMgPSB7XG5cbiAgICAgICAgYnJvd3NlciA6IFtbXG5cbiAgICAgICAgICAgIC9cXGIoPzpjcm1vfGNyaW9zKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSBmb3IgQW5kcm9pZC9pT1NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0Nocm9tZSddXSwgW1xuICAgICAgICAgICAgL2VkZyg/OmV8aW9zfGEpP1xcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgRWRnZVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnRWRnZSddXSwgW1xuXG4gICAgICAgICAgICAvLyBQcmVzdG8gYmFzZWRcbiAgICAgICAgICAgIC8ob3BlcmEgbWluaSlcXC8oWy1cXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgTWluaVxuICAgICAgICAgICAgLyhvcGVyYSBbbW9iaWxldGFiXXszLDZ9KVxcYi4rdmVyc2lvblxcLyhbLVxcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgLy8gT3BlcmEgTW9iaS9UYWJsZXRcbiAgICAgICAgICAgIC8ob3BlcmEpKD86Lit2ZXJzaW9uXFwvfFtcXC8gXSspKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9vcGlvc1tcXC8gXSsoW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgbWluaSBvbiBpcGhvbmUgPj0gOC4wXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBKycgTWluaSddXSwgW1xuICAgICAgICAgICAgL1xcYm9wclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgV2Via2l0XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBXV0sIFtcblxuICAgICAgICAgICAgLy8gTWl4ZWRcbiAgICAgICAgICAgIC8oa2luZGxlKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlXG4gICAgICAgICAgICAvKGx1bmFzY2FwZXxtYXh0aG9ufG5ldGZyb250fGphc21pbmV8YmxhemVyKVtcXC8gXT8oW1xcd1xcLl0qKS9pLCAgICAgIC8vIEx1bmFzY2FwZS9NYXh0aG9uL05ldGZyb250L0phc21pbmUvQmxhemVyXG4gICAgICAgICAgICAvLyBUcmlkZW50IGJhc2VkXG4gICAgICAgICAgICAvKGF2YW50IHxpZW1vYmlsZXxzbGltKSg/OmJyb3dzZXIpP1tcXC8gXT8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgIC8vIEF2YW50L0lFTW9iaWxlL1NsaW1Ccm93c2VyXG4gICAgICAgICAgICAvKGJhP2lkdWJyb3dzZXIpW1xcLyBdPyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJhaWR1IEJyb3dzZXJcbiAgICAgICAgICAgIC8oPzptc3xcXCgpKGllKSAoW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW50ZXJuZXQgRXhwbG9yZXJcblxuICAgICAgICAgICAgLy8gV2Via2l0L0tIVE1MIGJhc2VkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGbG9jay9Sb2NrTWVsdC9NaWRvcmkvRXBpcGhhbnkvU2lsay9Ta3lmaXJlL0JvbHQvSXJvbi9JcmlkaXVtL1BoYW50b21KUy9Cb3dzZXIvUXVwWmlsbGEvRmFsa29uXG4gICAgICAgICAgICAvKGZsb2NrfHJvY2ttZWx0fG1pZG9yaXxlcGlwaGFueXxzaWxrfHNreWZpcmV8b3ZpYnJvd3Nlcnxib2x0fGlyb258dml2YWxkaXxpcmlkaXVtfHBoYW50b21qc3xib3dzZXJ8cXVhcmt8cXVwemlsbGF8ZmFsa29ufHJla29ucXxwdWZmaW58YnJhdmV8d2hhbGV8cXFicm93c2VybGl0ZXxxcSlcXC8oWy1cXHdcXC5dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVrb25xL1B1ZmZpbi9CcmF2ZS9XaGFsZS9RUUJyb3dzZXJMaXRlL1FRLCBha2EgU2hvdVFcbiAgICAgICAgICAgIC8od2VpYm8pX18oW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZWlib1xuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKD86XFxidWM/ID9icm93c2VyfCg/Omp1Yy4rKXVjd2ViKVtcXC8gXT8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAvLyBVQ0Jyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1VDJytCUk9XU0VSXV0sIFtcbiAgICAgICAgICAgIC9cXGJxYmNvcmVcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlQ2hhdCBEZXNrdG9wIGZvciBXaW5kb3dzIEJ1aWx0LWluIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1dlQ2hhdChXaW4pIERlc2t0b3AnXV0sIFtcbiAgICAgICAgICAgIC9taWNyb21lc3NlbmdlclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2VDaGF0XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdXZUNoYXQnXV0sIFtcbiAgICAgICAgICAgIC9rb25xdWVyb3JcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS29ucXVlcm9yXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdLb25xdWVyb3InXV0sIFtcbiAgICAgICAgICAgIC90cmlkZW50Litydls6IF0oW1xcd1xcLl17MSw5fSlcXGIuK2xpa2UgZ2Vja28vaSAgICAgICAgICAgICAgICAgICAgICAgLy8gSUUxMVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnSUUnXV0sIFtcbiAgICAgICAgICAgIC95YWJyb3dzZXJcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWWFuZGV4XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdZYW5kZXgnXV0sIFtcbiAgICAgICAgICAgIC8oYXZhc3R8YXZnKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXZhc3QvQVZHIFNlY3VyZSBCcm93c2VyXG4gICAgICAgICAgICBdLCBbW05BTUUsIC8oLispLywgJyQxIFNlY3VyZSAnK0JST1dTRVJdLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL1xcYmZvY3VzXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBGb2N1c1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBGSVJFRk9YKycgRm9jdXMnXV0sIFtcbiAgICAgICAgICAgIC9cXGJvcHRcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIFRvdWNoXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBKycgVG91Y2gnXV0sIFtcbiAgICAgICAgICAgIC9jb2NfY29jXFx3K1xcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENvYyBDb2MgQnJvd3NlclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnQ29jIENvYyddXSwgW1xuICAgICAgICAgICAgL2RvbGZpblxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBEb2xwaGluXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdEb2xwaGluJ11dLCBbXG4gICAgICAgICAgICAvY29hc3RcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wZXJhIENvYXN0XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIE9QRVJBKycgQ29hc3QnXV0sIFtcbiAgICAgICAgICAgIC9taXVpYnJvd3NlclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTUlVSSBCcm93c2VyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdNSVVJICcrQlJPV1NFUl1dLCBbXG4gICAgICAgICAgICAvZnhpb3NcXC8oWy1cXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3ggZm9yIGlPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBGSVJFRk9YXV0sIFtcbiAgICAgICAgICAgIC9cXGJxaWh1fChxaT9obz9vP3wzNjApYnJvd3Nlci9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDM2MFxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnMzYwICcrQlJPV1NFUl1dLCBbXG4gICAgICAgICAgICAvKG9jdWx1c3xzYW1zdW5nfHNhaWxmaXNoKWJyb3dzZXJcXC8oW1xcd1xcLl0rKS9pXG4gICAgICAgICAgICBdLCBbW05BTUUsIC8oLispLywgJyQxICcrQlJPV1NFUl0sIFZFUlNJT05dLCBbICAgICAgICAgICAgICAgICAgICAgIC8vIE9jdWx1cy9TYW1zdW5nL1NhaWxmaXNoIEJyb3dzZXJcbiAgICAgICAgICAgIC8oY29tb2RvX2RyYWdvbilcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tb2RvIERyYWdvblxuICAgICAgICAgICAgXSwgW1tOQU1FLCAvXy9nLCAnICddLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyhlbGVjdHJvbilcXC8oW1xcd1xcLl0rKSBzYWZhcmkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbGVjdHJvbi1iYXNlZCBBcHBcbiAgICAgICAgICAgIC8odGVzbGEpKD86IHF0Y2FyYnJvd3NlcnxcXC8oMjBcXGRcXGRcXC5bLVxcd1xcLl0rKSkvaSwgICAgICAgICAgICAgICAgICAgLy8gVGVzbGFcbiAgICAgICAgICAgIC9tPyhxcWJyb3dzZXJ8YmFpZHVib3hhcHB8MjM0NUV4cGxvcmVyKVtcXC8gXT8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgLy8gUVFCcm93c2VyL0JhaWR1IEFwcC8yMzQ1IEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLyhtZXRhc3IpW1xcLyBdPyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb3VHb3VCcm93c2VyXG4gICAgICAgICAgICAvKGxiYnJvd3NlcikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpZUJhbyBCcm93c2VyXG4gICAgICAgICAgICBdLCBbTkFNRV0sIFtcblxuICAgICAgICAgICAgLy8gV2ViVmlld1xuICAgICAgICAgICAgLygoPzpmYmFuXFwvZmJpb3N8ZmJfaWFiXFwvZmI0YSkoPyEuK2ZiYXYpfDtmYmF2XFwvKFtcXHdcXC5dKyk7KS9pICAgICAgIC8vIEZhY2Vib29rIEFwcCBmb3IgaU9TICYgQW5kcm9pZFxuICAgICAgICAgICAgXSwgW1tOQU1FLCBGQUNFQk9PS10sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvc2FmYXJpIChsaW5lKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmUgQXBwIGZvciBpT1NcbiAgICAgICAgICAgIC9cXGIobGluZSlcXC8oW1xcd1xcLl0rKVxcL2lhYi9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW5lIEFwcCBmb3IgQW5kcm9pZFxuICAgICAgICAgICAgLyhjaHJvbWl1bXxpbnN0YWdyYW0pW1xcLyBdKFstXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWl1bS9JbnN0YWdyYW1cbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL1xcYmdzYVxcLyhbXFx3XFwuXSspIC4qc2FmYXJpXFwvL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBTZWFyY2ggQXBwbGlhbmNlIG9uIGlPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnR1NBJ11dLCBbXG5cbiAgICAgICAgICAgIC9oZWFkbGVzc2Nocm9tZSg/OlxcLyhbXFx3XFwuXSspfCApL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIEhlYWRsZXNzXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIENIUk9NRSsnIEhlYWRsZXNzJ11dLCBbXG5cbiAgICAgICAgICAgIC8gd3ZcXCkuKyhjaHJvbWUpXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZSBXZWJWaWV3XG4gICAgICAgICAgICBdLCBbW05BTUUsIENIUk9NRSsnIFdlYlZpZXcnXSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgL2Ryb2lkLisgdmVyc2lvblxcLyhbXFx3XFwuXSspXFxiLisoPzptb2JpbGUgc2FmYXJpfHNhZmFyaSkvaSAgICAgICAgICAgLy8gQW5kcm9pZCBCcm93c2VyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdBbmRyb2lkICcrQlJPV1NFUl1dLCBbXG5cbiAgICAgICAgICAgIC8oY2hyb21lfG9tbml3ZWJ8YXJvcmF8W3RpemVub2thXXs1fSA/YnJvd3NlcilcXC92PyhbXFx3XFwuXSspL2kgICAgICAgLy8gQ2hyb21lL09tbmlXZWIvQXJvcmEvVGl6ZW4vTm9raWFcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvdmVyc2lvblxcLyhbXFx3XFwuXSspIC4qbW9iaWxlXFwvXFx3KyAoc2FmYXJpKS9pICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW9iaWxlIFNhZmFyaVxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnTW9iaWxlIFNhZmFyaSddXSwgW1xuICAgICAgICAgICAgL3ZlcnNpb25cXC8oW1xcd1xcLl0rKSAuKihtb2JpbGUgP3NhZmFyaXxzYWZhcmkpL2kgICAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgJiBTYWZhcmkgTW9iaWxlXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgTkFNRV0sIFtcbiAgICAgICAgICAgIC93ZWJraXQuKz8obW9iaWxlID9zYWZhcml8c2FmYXJpKShcXC9bXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgLy8gU2FmYXJpIDwgMy4wXG4gICAgICAgICAgICBdLCBbTkFNRSwgW1ZFUlNJT04sIHN0ck1hcHBlciwgb2xkU2FmYXJpTWFwXV0sIFtcblxuICAgICAgICAgICAgLyh3ZWJraXR8a2h0bWwpXFwvKFtcXHdcXC5dKykvaVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC8vIEdlY2tvIGJhc2VkXG4gICAgICAgICAgICAvKG5hdmlnYXRvcnxuZXRzY2FwZVxcZD8pXFwvKFstXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXRzY2FwZVxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnTmV0c2NhcGUnXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9tb2JpbGUgdnI7IHJ2OihbXFx3XFwuXSspXFwpLitmaXJlZm94L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBSZWFsaXR5XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIEZJUkVGT1grJyBSZWFsaXR5J11dLCBbXG4gICAgICAgICAgICAvZWtpb2hmLisoZmxvdylcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb3dcbiAgICAgICAgICAgIC8oc3dpZnRmb3gpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3dpZnRmb3hcbiAgICAgICAgICAgIC8oaWNlZHJhZ29ufGljZXdlYXNlbHxjYW1pbm98Y2hpbWVyYXxmZW5uZWN8bWFlbW8gYnJvd3NlcnxtaW5pbW98Y29ua2Vyb3J8a2xhcilbXFwvIF0/KFtcXHdcXC5cXCtdKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWNlRHJhZ29uL0ljZXdlYXNlbC9DYW1pbm8vQ2hpbWVyYS9GZW5uZWMvTWFlbW8vTWluaW1vL0Nvbmtlcm9yL0tsYXJcbiAgICAgICAgICAgIC8oc2VhbW9ua2V5fGstbWVsZW9ufGljZWNhdHxpY2VhcGV8ZmlyZWJpcmR8cGhvZW5peHxwYWxlbW9vbnxiYXNpbGlza3x3YXRlcmZveClcXC8oWy1cXHdcXC5dKykkL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVmb3gvU2VhTW9ua2V5L0stTWVsZW9uL0ljZUNhdC9JY2VBcGUvRmlyZWJpcmQvUGhvZW5peFxuICAgICAgICAgICAgLyhmaXJlZm94KVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPdGhlciBGaXJlZm94LWJhc2VkXG4gICAgICAgICAgICAvKG1vemlsbGEpXFwvKFtcXHdcXC5dKykgLitydlxcOi4rZ2Vja29cXC9cXGQrL2ksICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1vemlsbGFcblxuICAgICAgICAgICAgLy8gT3RoZXJcbiAgICAgICAgICAgIC8ocG9sYXJpc3xseW54fGRpbGxvfGljYWJ8ZG9yaXN8YW1heWF8dzNtfG5ldHN1cmZ8c2xlaXBuaXJ8b2JpZ298bW9zYWljfCg/OmdvfGljZXx1cClbXFwuIF0/YnJvd3NlcilbLVxcLyBdP3Y/KFtcXHdcXC5dKykvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUG9sYXJpcy9MeW54L0RpbGxvL2lDYWIvRG9yaXMvQW1heWEvdzNtL05ldFN1cmYvU2xlaXBuaXIvT2JpZ28vTW9zYWljL0dvL0lDRS9VUC5Ccm93c2VyXG4gICAgICAgICAgICAvKGxpbmtzKSBcXCgoW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmtzXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl1cbiAgICAgICAgXSxcblxuICAgICAgICBjcHUgOiBbW1xuXG4gICAgICAgICAgICAvKD86KGFtZHx4KD86KD86ODZ8NjQpWy1fXSk/fHdvd3x3aW4pNjQpWztcXCldL2kgICAgICAgICAgICAgICAgICAgICAvLyBBTUQ2NCAoeDY0KVxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhbWQ2NCddXSwgW1xuXG4gICAgICAgICAgICAvKGlhMzIoPz07KSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBMzIgKHF1aWNrdGltZSlcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCBsb3dlcml6ZV1dLCBbXG5cbiAgICAgICAgICAgIC8oKD86aVszNDZdfHgpODYpWztcXCldL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBMzIgKHg4NilcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnaWEzMiddXSwgW1xuXG4gICAgICAgICAgICAvXFxiKGFhcmNoNjR8YXJtKHY/OGU/bD98Xz82NCkpXFxiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBUk02NFxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhcm02NCddXSwgW1xuXG4gICAgICAgICAgICAvXFxiKGFybSg/OnZbNjddKT9odD9uP1tmbF1wPylcXGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQVJNSEZcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYXJtaGYnXV0sIFtcblxuICAgICAgICAgICAgLy8gUG9ja2V0UEMgbWlzdGFrZW5seSBpZGVudGlmaWVkIGFzIFBvd2VyUENcbiAgICAgICAgICAgIC93aW5kb3dzIChjZXxtb2JpbGUpOyBwcGM7L2lcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAnYXJtJ11dLCBbXG5cbiAgICAgICAgICAgIC8oKD86cHBjfHBvd2VycGMpKD86NjQpPykoPzogbWFjfDt8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBvd2VyUENcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCAvb3dlci8sIEVNUFRZLCBsb3dlcml6ZV1dLCBbXG5cbiAgICAgICAgICAgIC8oc3VuNFxcdylbO1xcKV0vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTUEFSQ1xuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdzcGFyYyddXSwgW1xuXG4gICAgICAgICAgICAvKCg/OmF2cjMyfGlhNjQoPz07KSl8NjhrKD89XFwpKXxcXGJhcm0oPz12KD86WzEtN118WzUtN10xKWw/fDt8ZWFiaSl8KD89YXRtZWwgKWF2cnwoPzppcml4fG1pcHN8c3BhcmMpKD86NjQpP1xcYnxwYS1yaXNjKS9pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElBNjQsIDY4SywgQVJNLzY0LCBBVlIvMzIsIElSSVgvNjQsIE1JUFMvNjQsIFNQQVJDLzY0LCBQQS1SSVNDXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgbG93ZXJpemVdXVxuICAgICAgICBdLFxuXG4gICAgICAgIGRldmljZSA6IFtbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBNT0JJTEVTICYgVEFCTEVUU1xuICAgICAgICAgICAgLy8gT3JkZXJlZCBieSBwb3B1bGFyaXR5XG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC8vIFNhbXN1bmdcbiAgICAgICAgICAgIC9cXGIoc2NoLWlbODldMFxcZHxzaHctbTM4MHN8c20tW3B0XVxcd3syLDR9fGd0LVtwbl1cXGR7Miw0fXxzZ2gtdDhbNTZdOXxuZXh1cyAxMCkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBTQU1TVU5HXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKCg/OnNbY2dwXWh8Z3R8c20pLVxcdyt8Z2FsYXh5IG5leHVzKS9pLFxuICAgICAgICAgICAgL3NhbXN1bmdbLSBdKFstXFx3XSspL2ksXG4gICAgICAgICAgICAvc2VjLShzZ2hcXHcrKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFNBTVNVTkddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gQXBwbGVcbiAgICAgICAgICAgIC9cXCgoaXAoPzpob25lfG9kKVtcXHcgXSopOy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUG9kL2lQaG9uZVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBUFBMRV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcKChpcGFkKTtbLVxcd1xcKSw7IF0rYXBwbGUvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpUGFkXG4gICAgICAgICAgICAvYXBwbGVjb3JlbWVkaWFcXC9bXFx3XFwuXSsgXFwoKGlwYWQpL2ksXG4gICAgICAgICAgICAvXFxiKGlwYWQpXFxkXFxkPyxcXGRcXGQ/WztcXF1dLitpb3MvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBUFBMRV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBIdWF3ZWlcbiAgICAgICAgICAgIC9cXGIoKD86YWdbcnNdWzIzXT98YmFoMj98c2h0P3xidHYpLWE/W2x3XVxcZHsyfSlcXGIoPyEuK2RcXC9zKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEhVQVdFSV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyg/Omh1YXdlaXxob25vcikoWy1cXHcgXSspWztcXCldL2ksXG4gICAgICAgICAgICAvXFxiKG5leHVzIDZwfFxcd3syLDR9LVthdHVdP1tsbl1bMDEyNTl4XVswMTIzNTldW2FuXT8pXFxiKD8hLitkXFwvcykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBIVUFXRUldLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gWGlhb21pXG4gICAgICAgICAgICAvXFxiKHBvY29bXFx3IF0rKSg/OiBidWl8XFwpKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFhpYW9taSBQT0NPXG4gICAgICAgICAgICAvXFxiOyAoXFx3KykgYnVpbGRcXC9obVxcMS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBYaWFvbWkgSG9uZ21pICdudW1lcmljJyBtb2RlbHNcbiAgICAgICAgICAgIC9cXGIoaG1bLV8gXT9ub3RlP1tfIF0/KD86XFxkXFx3KT8pIGJ1aS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWGlhb21pIEhvbmdtaVxuICAgICAgICAgICAgL1xcYihyZWRtaVtcXC1fIF0/KD86bm90ZXxrKT9bXFx3XyBdKykoPzogYnVpfFxcKSkvaSwgICAgICAgICAgICAgICAgICAgLy8gWGlhb21pIFJlZG1pXG4gICAgICAgICAgICAvXFxiKG1pWy1fIF0/KD86YVxcZHxvbmV8b25lW18gXXBsdXN8bm90ZSBsdGV8bWF4KT9bXyBdPyg/OlxcZD9cXHc/KVtfIF0/KD86cGx1c3xzZXxsaXRlKT8pKD86IGJ1aXxcXCkpL2kgLy8gWGlhb21pIE1pXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvXy9nLCAnICddLCBbVkVORE9SLCBYSUFPTUldLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIobWlbLV8gXT8oPzpwYWQpKD86W1xcd18gXSspKSg/OiBidWl8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWkgUGFkIHRhYmxldHNcbiAgICAgICAgICAgIF0sW1tNT0RFTCwgL18vZywgJyAnXSwgW1ZFTkRPUiwgWElBT01JXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIE9QUE9cbiAgICAgICAgICAgIC87IChcXHcrKSBidWkuKyBvcHBvL2ksXG4gICAgICAgICAgICAvXFxiKGNwaFsxMl1cXGR7M318cCg/OmFmfGNbYWxdfGRcXHd8ZVthcl0pW210XVxcZDB8eDkwMDd8YTEwMW9wKVxcYi9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdPUFBPJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBWaXZvXG4gICAgICAgICAgICAvdml2byAoXFx3KykoPzogYnVpfFxcKSkvaSxcbiAgICAgICAgICAgIC9cXGIodlsxMl1cXGR7M31cXHc/W2F0XSkoPzogYnVpfDspL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1Zpdm8nXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIFJlYWxtZVxuICAgICAgICAgICAgL1xcYihybXhbMTJdXFxkezN9KSg/OiBidWl8O3xcXCkpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1JlYWxtZSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gTW90b3JvbGFcbiAgICAgICAgICAgIC9cXGIobWlsZXN0b25lfGRyb2lkKD86WzItNHhdfCAoPzpiaW9uaWN8eDJ8cHJvfHJhenIpKT86PyggNGcpPylcXGJbXFx3IF0rYnVpbGRcXC8vaSxcbiAgICAgICAgICAgIC9cXGJtb3QoPzpvcm9sYSk/Wy0gXShcXHcqKS9pLFxuICAgICAgICAgICAgLygoPzptb3RvW1xcd1xcKFxcKSBdK3x4dFxcZHszLDR9fG5leHVzIDYpKD89IGJ1aXxcXCkpKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIE1PVE9ST0xBXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKG16NjBcXGR8eG9vbVsyIF17MCwyfSkgYnVpbGRcXC8vaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBNT1RPUk9MQV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBMR1xuICAgICAgICAgICAgLygoPz1sZyk/W3ZsXWtcXC0/XFxkezN9KSBidWl8IDNcXC5bLVxcdzsgXXsxMH1sZz8tKFswNmN2OV17Myw0fSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBMR10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhsbSg/Oi0/ZjEwMFtudl0/fC1bXFx3XFwuXSspKD89IGJ1aXxcXCkpfG5leHVzIFs0NV0pL2ksXG4gICAgICAgICAgICAvXFxibGdbLWU7XFwvIF0rKCg/IWJyb3dzZXJ8bmV0Y2FzdHxhbmRyb2lkIHR2KVxcdyspL2ksXG4gICAgICAgICAgICAvXFxibGctPyhbXFxkXFx3XSspIGJ1aS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIExHXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIExlbm92b1xuICAgICAgICAgICAgLyhpZGVhdGFiWy1cXHcgXSspL2ksXG4gICAgICAgICAgICAvbGVub3ZvID8oc1s1Nl0wMDBbLVxcd10rfHRhYig/OltcXHcgXSspfHl0Wy1cXGRcXHddezZ9fHRiWy1cXGRcXHddezZ9KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdMZW5vdm8nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIE5va2lhXG4gICAgICAgICAgICAvKD86bWFlbW98bm9raWEpLioobjkwMHxsdW1pYSBcXGQrKS9pLFxuICAgICAgICAgICAgL25va2lhWy1fIF0/KFstXFx3XFwuXSopL2lcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsIC9fL2csICcgJ10sIFtWRU5ET1IsICdOb2tpYSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gR29vZ2xlXG4gICAgICAgICAgICAvKHBpeGVsIGMpXFxiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgUGl4ZWwgQ1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBHT09HTEVdLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAocGl4ZWxbXFxkYXhsIF17MCw2fSkoPzogYnVpfFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgUGl4ZWxcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIFNvbnlcbiAgICAgICAgICAgIC9kcm9pZC4rIChbYy1nXVxcZHs0fXxzb1stZ2xdXFx3K3x4cS1hXFx3WzQtN11bMTJdKSg/PSBidWl8XFwpLitjaHJvbWVcXC8oPyFbMS02XXswLDF9XFxkXFwuKSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvc29ueSB0YWJsZXQgW3BzXS9pLFxuICAgICAgICAgICAgL1xcYig/OnNvbnkpP3NncFxcdysoPzogYnVpfFxcKSkvaVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgJ1hwZXJpYSBUYWJsZXQnXSwgW1ZFTkRPUiwgU09OWV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBPbmVQbHVzXG4gICAgICAgICAgICAvIChrYjIwMDV8aW4yMFsxMl01fGJlMjBbMTJdWzU5XSlcXGIvaSxcbiAgICAgICAgICAgIC8oPzpvbmUpPyg/OnBsdXMpPyAoYVxcZDBcXGRcXGQpKD86IGJ8XFwpKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdPbmVQbHVzJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBBbWF6b25cbiAgICAgICAgICAgIC8oYWxleGEpd2VibS9pLFxuICAgICAgICAgICAgLyhrZlthLXpdezJ9d2kpKCBidWl8XFwpKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlIEZpcmUgd2l0aG91dCBTaWxrXG4gICAgICAgICAgICAvKGtmW2Etel0rKSggYnVpfFxcKSkuK3NpbGtcXC8vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS2luZGxlIEZpcmUgSERcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKCg/OnNkfGtmKVswMzQ5aGlqb3JzdHV3XSspKCBidWl8XFwpKS4rc2lsa1xcLy9pICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZSBQaG9uZVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgLyguKykvZywgJ0ZpcmUgUGhvbmUgJDEnXSwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEJsYWNrQmVycnlcbiAgICAgICAgICAgIC8ocGxheWJvb2spO1stXFx3XFwpLDsgXSsocmltKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5IFBsYXlCb29rXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFZFTkRPUiwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKCg/OmJiW2EtZl18c3RbaHZdKTEwMC1cXGQpL2ksXG4gICAgICAgICAgICAvXFwoYmIxMDsgKFxcdyspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tCZXJyeSAxMFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBCTEFDS0JFUlJZXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEFzdXNcbiAgICAgICAgICAgIC8oPzpcXGJ8YXN1c18pKHRyYW5zZm9bcHJpbWUgXXs0LDEwfSBcXHcrfGVlZXBjfHNsaWRlciBcXHcrfG5leHVzIDd8cGFkZm9uZXxwMDBbY2pdKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFTVVNdLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8gKHpbYmVzXTZbMDI3XVswMTJdW2ttXVtsc118emVuZm9uZSBcXGRcXHc/KVxcYi9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFTVVNdLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gSFRDXG4gICAgICAgICAgICAvKG5leHVzIDkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhUQyBOZXh1cyA5XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdIVEMnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKGh0YylbLTtfIF17MSwyfShbXFx3IF0rKD89XFwpfCBidWkpfFxcdyspL2ksICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhUQ1xuXG4gICAgICAgICAgICAvLyBaVEVcbiAgICAgICAgICAgIC8oenRlKVstIF0oW1xcdyBdKz8pKD86IGJ1aXxcXC98XFwpKS9pLFxuICAgICAgICAgICAgLyhhbGNhdGVsfGdlZWtzcGhvbmV8bmV4aWFufHBhbmFzb25pY3xzb255KVstXyBdPyhbLVxcd10qKS9pICAgICAgICAgLy8gQWxjYXRlbC9HZWVrc1Bob25lL05leGlhbi9QYW5hc29uaWMvU29ueVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgW01PREVMLCAvXy9nLCAnICddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gQWNlclxuICAgICAgICAgICAgL2Ryb2lkLis7IChbYWJdWzEtN10tP1swMTc4YV1cXGRcXGQ/KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdBY2VyJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvLyBNZWl6dVxuICAgICAgICAgICAgL2Ryb2lkLis7IChtWzEtNV0gbm90ZSkgYnVpL2ksXG4gICAgICAgICAgICAvXFxibXotKFstXFx3XXsyLH0pL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ01laXp1J10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBTaGFycFxuICAgICAgICAgICAgL1xcYihzaC0/W2FsdHZ6XT9cXGRcXGRbYS1la21dPykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU2hhcnAnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIE1JWEVEXG4gICAgICAgICAgICAvKGJsYWNrYmVycnl8YmVucXxwYWxtKD89XFwtKXxzb255ZXJpY3Nzb258YWNlcnxhc3VzfGRlbGx8bWVpenV8bW90b3JvbGF8cG9seXRyb24pWy1fIF0/KFstXFx3XSopL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnkvQmVuUS9QYWxtL1NvbnktRXJpY3Nzb24vQWNlci9Bc3VzL0RlbGwvTWVpenUvTW90b3JvbGEvUG9seXRyb25cbiAgICAgICAgICAgIC8oaHApIChbXFx3IF0rXFx3KS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIUCBpUEFRXG4gICAgICAgICAgICAvKGFzdXMpLT8oXFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBc3VzXG4gICAgICAgICAgICAvKG1pY3Jvc29mdCk7IChsdW1pYVtcXHcgXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgTHVtaWFcbiAgICAgICAgICAgIC8obGVub3ZvKVstXyBdPyhbLVxcd10rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExlbm92b1xuICAgICAgICAgICAgLyhqb2xsYSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBKb2xsYVxuICAgICAgICAgICAgLyhvcHBvKSA/KFtcXHcgXSspIGJ1aS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT1BQT1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvKGFyY2hvcykgKGdhbWVwYWQyPykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFyY2hvc1xuICAgICAgICAgICAgLyhocCkuKyh0b3VjaHBhZCg/IS4rdGFibGV0KXx0YWJsZXQpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIUCBUb3VjaFBhZFxuICAgICAgICAgICAgLyhraW5kbGUpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLaW5kbGVcbiAgICAgICAgICAgIC8obm9vaylbXFx3IF0rYnVpbGRcXC8oXFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm9va1xuICAgICAgICAgICAgLyhkZWxsKSAoc3RyZWFba3ByXFxkIF0qW1xcZGtvXSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERlbGwgU3RyZWFrXG4gICAgICAgICAgICAvKGxlWy0gXStwYW4pWy0gXSsoXFx3ezEsOX0pIGJ1aS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMZSBQYW4gVGFibGV0c1xuICAgICAgICAgICAgLyh0cmluaXR5KVstIF0qKHRcXGR7M30pIGJ1aS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJpbml0eSBUYWJsZXRzXG4gICAgICAgICAgICAvKGdpZ2FzZXQpWy0gXSsocVxcd3sxLDl9KSBidWkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHaWdhc2V0IFRhYmxldHNcbiAgICAgICAgICAgIC8odm9kYWZvbmUpIChbXFx3IF0rKSg/OlxcKXwgYnVpKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWb2RhZm9uZVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuXG4gICAgICAgICAgICAvKHN1cmZhY2UgZHVvKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1cmZhY2UgRHVvXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIE1JQ1JPU09GVF0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkIFtcXGRcXC5dKzsgKGZwXFxkdT8pKD86IGJ8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFpcnBob25lXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdGYWlycGhvbmUnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvKHUzMDRhYSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFUJlRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0FUJlQnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxic2llLShcXHcqKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2llbWVuc1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU2llbWVucyddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIocmN0XFx3KykgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSQ0EgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnUkNBJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYih2ZW51ZVtcXGQgXXsyLDd9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERlbGwgVmVudWUgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnRGVsbCddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIocSg/Om12fHRhKVxcdyspIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBWZXJpem9uIFRhYmxldFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnVmVyaXpvbiddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoPzpiYXJuZXNbJiBdK25vYmxlIHxibltydF0pKFtcXHdcXCsgXSopIGIvaSAgICAgICAgICAgICAgICAgICAgICAgLy8gQmFybmVzICYgTm9ibGUgVGFibGV0XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdCYXJuZXMgJiBOb2JsZSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIodG1cXGR7M31cXHcrKSBiL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ051VmlzaW9uJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYihrODgpIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWlRFIEsgU2VyaWVzIFRhYmxldFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnWlRFJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYihueFxcZHszfWopIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFpURSBOdWJpYVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnWlRFJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihnZW5cXGR7M30pIGIuKzQ5aC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aXNzIEdFTiBNb2JpbGVcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1N3aXNzJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYih6dXJcXGR7M30pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN3aXNzIFpVUiBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1N3aXNzJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYigoemVraSk/dGIuKlxcYikgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFpla2kgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnWmVraSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoW3lyXVxcZHsyfSkgYi9pLFxuICAgICAgICAgICAgL1xcYihkcmFnb25bLSBdK3RvdWNoIHxkdCkoXFx3ezV9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERyYWdvbiBUb3VjaCBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnRHJhZ29uIFRvdWNoJ10sIE1PREVMLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIobnMtP1xcd3swLDl9KSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnNpZ25pYSBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdJbnNpZ25pYSddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoKG54YXxuZXh0KS0/XFx3ezAsOX0pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOZXh0Qm9vayBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdOZXh0Qm9vayddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoeHRyZW1lXFxfKT8odigxWzA0NV18MlswMTVdfFszNDY5XTB8N1swNV0pKSBiL2kgICAgICAgICAgICAgICAgICAvLyBWb2ljZSBYdHJlbWUgUGhvbmVzXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgJ1ZvaWNlJ10sIE1PREVMLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIobHZ0ZWxcXC0pPyh2MVsxMl0pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMdlRlbCBQaG9uZXNcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnTHZUZWwnXSwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihwaC0xKSAvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXNzZW50aWFsIFBILTFcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0Vzc2VudGlhbCddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIodigxMDBtZHw3MDBuYXw3MDExfDkxN2cpLipcXGIpIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFbnZpemVuIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0Vudml6ZW4nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKHRyaW9bLVxcd1xcLiBdKykgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hY2hTcGVlZCBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdNYWNoU3BlZWQnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxidHVfKDE0OTEpIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSb3RvciBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdSb3RvciddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oc2hpZWxkW1xcdyBdKykgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE52aWRpYSBTaGllbGQgVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTnZpZGlhJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhzcHJpbnQpIChcXHcrKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3ByaW50IFBob25lc1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhraW5cXC5bb25ldHddezN9KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IEtpblxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL1xcLi9nLCAnICddLCBbVkVORE9SLCBNSUNST1NPRlRdLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAoY2M2NjY2P3xldDVbMTZdfG1jWzIzOV1bMjNdeD98dmM4WzAzXXg/KVxcKS9pICAgICAgICAgICAgIC8vIFplYnJhXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFpFQlJBXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKGVjMzB8cHMyMHx0Y1syLThdXFxkW2t4XSlcXCkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBaRUJSQV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBDT05TT0xFU1xuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvKG91eWEpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE91eWFcbiAgICAgICAgICAgIC8obmludGVuZG8pIChbd2lkczN1dGNoXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmludGVuZG9cbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgQ09OU09MRV1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKHNoaWVsZCkgYnVpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE52aWRpYVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTnZpZGlhJ10sIFtUWVBFLCBDT05TT0xFXV0sIFtcbiAgICAgICAgICAgIC8ocGxheXN0YXRpb24gWzM0NXBvcnRhYmxldmldKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUGxheXN0YXRpb25cbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgU09OWV0sIFtUWVBFLCBDT05TT0xFXV0sIFtcbiAgICAgICAgICAgIC9cXGIoeGJveCg/OiBvbmUpPyg/ITsgeGJveCkpW1xcKTsgXS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgWGJveFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBNSUNST1NPRlRdLCBbVFlQRSwgQ09OU09MRV1dLCBbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIFNNQVJUVFZTXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC9zbWFydC10di4rKHNhbXN1bmcpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2Ftc3VuZ1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL2hiYnR2LittYXBsZTsoXFxkKykvaVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL14vLCAnU21hcnRUViddLCBbVkVORE9SLCBTQU1TVU5HXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgLyhudXg7IG5ldGNhc3QuK3NtYXJ0dHZ8bGcgKG5ldGNhc3RcXC50di0yMDFcXGR8YW5kcm9pZCB0dikpL2kgICAgICAgIC8vIExHIFNtYXJ0VFZcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCBMR10sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC8oYXBwbGUpID90di9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXBwbGUgVFZcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIFtNT0RFTCwgQVBQTEUrJyBUViddLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvY3JrZXkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBDaHJvbWVjYXN0XG4gICAgICAgICAgICBdLCBbW01PREVMLCBDSFJPTUUrJ2Nhc3QnXSwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLithZnQoXFx3KSggYnVpfFxcKSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmUgVFZcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQU1BWk9OXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgL1xcKGR0dltcXCk7XS4rKGFxdW9zKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNoYXJwXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdTaGFycCddLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvXFxiKHJva3UpW1xcZHhdKltcXClcXC9dKCg/OmR2cC0pP1tcXGRcXC5dKikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJva3VcbiAgICAgICAgICAgIC9oYmJ0dlxcL1xcZCtcXC5cXGQrXFwuXFxkKyArXFwoW1xcdyBdKjsgKihcXHdbXjtdKik7KFteO10qKS9pICAgICAgICAgICAgICAgLy8gSGJiVFYgZGV2aWNlc1xuICAgICAgICAgICAgXSwgW1tWRU5ET1IsIHRyaW1dLCBbTU9ERUwsIHRyaW1dLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvXFxiKGFuZHJvaWQgdHZ8c21hcnRbLSBdP3R2fG9wZXJhIHR2fHR2OyBydjopXFxiL2kgICAgICAgICAgICAgICAgICAgLy8gU21hcnRUViBmcm9tIFVuaWRlbnRpZmllZCBWZW5kb3JzXG4gICAgICAgICAgICBdLCBbW1RZUEUsIFNNQVJUVFZdXSwgW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBXRUFSQUJMRVNcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgLygocGViYmxlKSlhcHAvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQZWJibGVcbiAgICAgICAgICAgIF0sIFtWRU5ET1IsIE1PREVMLCBbVFlQRSwgV0VBUkFCTEVdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLis7IChnbGFzcykgXFxkL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIEdsYXNzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEdPT0dMRV0sIFtUWVBFLCBXRUFSQUJMRV1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKHd0NjM/MHsyLDN9KVxcKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFpFQlJBXSwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcbiAgICAgICAgICAgIC8ocXVlc3QoIDIpPykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT2N1bHVzIFF1ZXN0XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEZBQ0VCT09LXSwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgICAgLy8gRU1CRURERURcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgLyh0ZXNsYSkoPzogcXRjYXJicm93c2VyfFxcL1stXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUZXNsYVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgW1RZUEUsIEVNQkVEREVEXV0sIFtcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIE1JWEVEIChHRU5FUklDKVxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvZHJvaWQgLis/OyAoW147XSs/KSg/OiBidWl8XFwpIGFwcGxldykuKz8gbW9iaWxlIHNhZmFyaS9pICAgICAgICAgICAvLyBBbmRyb2lkIFBob25lcyBmcm9tIFVuaWRlbnRpZmllZCBWZW5kb3JzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkIC4rPzsgKFteO10rPykoPzogYnVpfFxcKSBhcHBsZXcpLis/KD8hIG1vYmlsZSkgc2FmYXJpL2kgICAgICAgLy8gQW5kcm9pZCBUYWJsZXRzIGZyb20gVW5pZGVudGlmaWVkIFZlbmRvcnNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKCh0YWJsZXR8dGFiKVs7XFwvXXxmb2N1c1xcL1xcZCg/IS4rbW9iaWxlKSkvaSAgICAgICAgICAgICAgICAgICAgICAvLyBVbmlkZW50aWZpYWJsZSBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8ocGhvbmV8bW9iaWxlKD86WztcXC9dfCBzYWZhcmkpfHBkYSg/PS4rd2luZG93cyBjZSkpL2kgICAgICAgICAgICAgIC8vIFVuaWRlbnRpZmlhYmxlIE1vYmlsZVxuICAgICAgICAgICAgXSwgW1tUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgLyhhbmRyb2lkWy1cXHdcXC4gXXswLDl9KTsuK2J1aWwvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdlbmVyaWMgQW5kcm9pZCBEZXZpY2VcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0dlbmVyaWMnXV1cbiAgICAgICAgXSxcblxuICAgICAgICBlbmdpbmUgOiBbW1xuXG4gICAgICAgICAgICAvd2luZG93cy4rIGVkZ2VcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRWRnZUhUTUxcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgRURHRSsnSFRNTCddXSwgW1xuXG4gICAgICAgICAgICAvd2Via2l0XFwvNTM3XFwuMzYuK2Nocm9tZVxcLyg/ITI3KShbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxpbmtcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0JsaW5rJ11dLCBbXG5cbiAgICAgICAgICAgIC8ocHJlc3RvKVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJlc3RvXG4gICAgICAgICAgICAvKHdlYmtpdHx0cmlkZW50fG5ldGZyb250fG5ldHN1cmZ8YW1heWF8bHlueHx3M218Z29hbm5hKVxcLyhbXFx3XFwuXSspL2ksIC8vIFdlYktpdC9UcmlkZW50L05ldEZyb250L05ldFN1cmYvQW1heWEvTHlueC93M20vR29hbm5hXG4gICAgICAgICAgICAvZWtpb2goZmxvdylcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb3dcbiAgICAgICAgICAgIC8oa2h0bWx8dGFzbWFufGxpbmtzKVtcXC8gXVxcKD8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtIVE1ML1Rhc21hbi9MaW5rc1xuICAgICAgICAgICAgLyhpY2FiKVtcXC8gXShbMjNdXFwuW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaUNhYlxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC9ydlxcOihbXFx3XFwuXXsxLDl9KVxcYi4rKGdlY2tvKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdlY2tvXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgTkFNRV1cbiAgICAgICAgXSxcblxuICAgICAgICBvcyA6IFtbXG5cbiAgICAgICAgICAgIC8vIFdpbmRvd3NcbiAgICAgICAgICAgIC9taWNyb3NvZnQgKHdpbmRvd3MpICh2aXN0YXx4cCkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2luZG93cyAoaVR1bmVzKVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKHdpbmRvd3MpIG50IDZcXC4yOyAoYXJtKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5kb3dzIFJUXG4gICAgICAgICAgICAvKHdpbmRvd3MgKD86cGhvbmUoPzogb3MpP3xtb2JpbGUpKVtcXC8gXT8oW1xcZFxcLlxcdyBdKikvaSwgICAgICAgICAgICAvLyBXaW5kb3dzIFBob25lXG4gICAgICAgICAgICAvKHdpbmRvd3MpW1xcLyBdPyhbbnRjZVxcZFxcLiBdK1xcdykoPyEuK3hib3gpL2lcbiAgICAgICAgICAgIF0sIFtOQU1FLCBbVkVSU0lPTiwgc3RyTWFwcGVyLCB3aW5kb3dzVmVyc2lvbk1hcF1dLCBbXG4gICAgICAgICAgICAvKHdpbig/PTN8OXxuKXx3aW4gOXggKShbbnRcXGRcXC5dKykvaVxuICAgICAgICAgICAgXSwgW1tOQU1FLCAnV2luZG93cyddLCBbVkVSU0lPTiwgc3RyTWFwcGVyLCB3aW5kb3dzVmVyc2lvbk1hcF1dLCBbXG5cbiAgICAgICAgICAgIC8vIGlPUy9tYWNPU1xuICAgICAgICAgICAgL2lwW2hvbmVhZF17Miw0fVxcYig/Oi4qb3MgKFtcXHddKykgbGlrZSBtYWN8OyBvcGVyYSkvaSwgICAgICAgICAgICAgIC8vIGlPU1xuICAgICAgICAgICAgL2NmbmV0d29ya1xcLy4rZGFyd2luL2lcbiAgICAgICAgICAgIF0sIFtbVkVSU0lPTiwgL18vZywgJy4nXSwgW05BTUUsICdpT1MnXV0sIFtcbiAgICAgICAgICAgIC8obWFjIG9zIHgpID8oW1xcd1xcLiBdKikvaSxcbiAgICAgICAgICAgIC8obWFjaW50b3NofG1hY19wb3dlcnBjXFxiKSg/IS4raGFpa3UpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hYyBPU1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnTWFjIE9TJ10sIFtWRVJTSU9OLCAvXy9nLCAnLiddXSwgW1xuXG4gICAgICAgICAgICAvLyBNb2JpbGUgT1Nlc1xuICAgICAgICAgICAgL2Ryb2lkIChbXFx3XFwuXSspXFxiLisoYW5kcm9pZFstIF14ODYpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbmRyb2lkLXg4NlxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIE5BTUVdLCBbICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbmRyb2lkL1dlYk9TL1FOWC9CYWRhL1JJTS9NYWVtby9NZWVHby9TYWlsZmlzaCBPU1xuICAgICAgICAgICAgLyhhbmRyb2lkfHdlYm9zfHFueHxiYWRhfHJpbSB0YWJsZXQgb3N8bWFlbW98bWVlZ298c2FpbGZpc2gpWy1cXC8gXT8oW1xcd1xcLl0qKS9pLFxuICAgICAgICAgICAgLyhibGFja2JlcnJ5KVxcdypcXC8oW1xcd1xcLl0qKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tiZXJyeVxuICAgICAgICAgICAgLyh0aXplbnxrYWlvcylbXFwvIF0oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaXplbi9LYWlPU1xuICAgICAgICAgICAgL1xcKChzZXJpZXM0MCk7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VyaWVzIDQwXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9cXChiYigxMCk7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnkgMTBcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgQkxBQ0tCRVJSWV1dLCBbXG4gICAgICAgICAgICAvKD86c3ltYmlhbiA/b3N8c3ltYm9zfHM2MCg/PTspfHNlcmllczYwKVstXFwvIF0/KFtcXHdcXC5dKikvaSAgICAgICAgIC8vIFN5bWJpYW5cbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1N5bWJpYW4nXV0sIFtcbiAgICAgICAgICAgIC9tb3ppbGxhXFwvW1xcZFxcLl0rIFxcKCg/Om1vYmlsZXx0YWJsZXR8dHZ8bW9iaWxlOyBbXFx3IF0rKTsgcnY6LisgZ2Vja29cXC8oW1xcd1xcLl0rKS9pIC8vIEZpcmVmb3ggT1NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgRklSRUZPWCsnIE9TJ11dLCBbXG4gICAgICAgICAgICAvd2ViMHM7LitydCh0dikvaSxcbiAgICAgICAgICAgIC9cXGIoPzpocCk/d29zKD86YnJvd3Nlcik/XFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlYk9TXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICd3ZWJPUyddXSwgW1xuXG4gICAgICAgICAgICAvLyBHb29nbGUgQ2hyb21lY2FzdFxuICAgICAgICAgICAgL2Nya2V5XFwvKFtcXGRcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgQ2hyb21lY2FzdFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBDSFJPTUUrJ2Nhc3QnXV0sIFtcbiAgICAgICAgICAgIC8oY3JvcykgW1xcd10rIChbXFx3XFwuXStcXHcpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9taXVtIE9TXG4gICAgICAgICAgICBdLCBbW05BTUUsICdDaHJvbWl1bSBPUyddLCBWRVJTSU9OXSxbXG5cbiAgICAgICAgICAgIC8vIENvbnNvbGVcbiAgICAgICAgICAgIC8obmludGVuZG98cGxheXN0YXRpb24pIChbd2lkczM0NXBvcnRhYmxldnVjaF0rKS9pLCAgICAgICAgICAgICAgICAgLy8gTmludGVuZG8vUGxheXN0YXRpb25cbiAgICAgICAgICAgIC8oeGJveCk7ICt4Ym94IChbXlxcKTtdKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBYYm94ICgzNjAsIE9uZSwgWCwgUywgU2VyaWVzIFgsIFNlcmllcyBTKVxuXG4gICAgICAgICAgICAvLyBPdGhlclxuICAgICAgICAgICAgL1xcYihqb2xpfHBhbG0pXFxiID8oPzpvcyk/XFwvPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEpvbGkvUGFsbVxuICAgICAgICAgICAgLyhtaW50KVtcXC9cXChcXCkgXT8oXFx3KikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWludFxuICAgICAgICAgICAgLyhtYWdlaWF8dmVjdG9ybGludXgpWzsgXS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWdlaWEvVmVjdG9yTGludXhcbiAgICAgICAgICAgIC8oW2t4bG5dP3VidW50dXxkZWJpYW58c3VzZXxvcGVuc3VzZXxnZW50b298YXJjaCg/PSBsaW51eCl8c2xhY2t3YXJlfGZlZG9yYXxtYW5kcml2YXxjZW50b3N8cGNsaW51eG9zfHJlZCA/aGF0fHplbndhbGt8bGlucHVzfHJhc3BiaWFufHBsYW4gOXxtaW5peHxyaXNjIG9zfGNvbnRpa2l8ZGVlcGlufG1hbmphcm98ZWxlbWVudGFyeSBvc3xzYWJheW9ufGxpbnNwaXJlKSg/OiBnbnVcXC9saW51eCk/KD86IGVudGVycHJpc2UpPyg/OlstIF1saW51eCk/KD86LWdudSk/Wy1cXC8gXT8oPyFjaHJvbXxwYWNrYWdlKShbLVxcd1xcLl0qKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVYnVudHUvRGViaWFuL1NVU0UvR2VudG9vL0FyY2gvU2xhY2t3YXJlL0ZlZG9yYS9NYW5kcml2YS9DZW50T1MvUENMaW51eE9TL1JlZEhhdC9aZW53YWxrL0xpbnB1cy9SYXNwYmlhbi9QbGFuOS9NaW5peC9SSVNDT1MvQ29udGlraS9EZWVwaW4vTWFuamFyby9lbGVtZW50YXJ5L1NhYmF5b24vTGluc3BpcmVcbiAgICAgICAgICAgIC8oaHVyZHxsaW51eCkgPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIdXJkL0xpbnV4XG4gICAgICAgICAgICAvKGdudSkgPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR05VXG4gICAgICAgICAgICAvXFxiKFstZnJlbnRvcGNnaHNdezAsNX1ic2R8ZHJhZ29uZmx5KVtcXC8gXT8oPyFhbWR8W2l4MzQ2XXsxLDJ9ODYpKFtcXHdcXC5dKikvaSwgLy8gRnJlZUJTRC9OZXRCU0QvT3BlbkJTRC9QQy1CU0QvR2hvc3RCU0QvRHJhZ29uRmx5XG4gICAgICAgICAgICAvKGhhaWt1KSAoXFx3KykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBIYWlrdVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKHN1bm9zKSA/KFtcXHdcXC5cXGRdKikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvbGFyaXNcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ1NvbGFyaXMnXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8oKD86b3Blbik/c29sYXJpcylbLVxcLyBdPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29sYXJpc1xuICAgICAgICAgICAgLyhhaXgpICgoXFxkKSg/PVxcLnxcXCl8IClbXFx3XFwuXSkqL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFJWFxuICAgICAgICAgICAgL1xcYihiZW9zfG9zXFwvMnxhbWlnYW9zfG1vcnBob3N8b3BlbnZtc3xmdWNoc2lhfGhwLXV4KS9pLCAgICAgICAgICAgIC8vIEJlT1MvT1MyL0FtaWdhT1MvTW9ycGhPUy9PcGVuVk1TL0Z1Y2hzaWEvSFAtVVhcbiAgICAgICAgICAgIC8odW5peCkgPyhbXFx3XFwuXSopL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVTklYXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl1cbiAgICAgICAgXVxuICAgIH07XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENvbnN0cnVjdG9yXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgdmFyIFVBUGFyc2VyID0gZnVuY3Rpb24gKHVhLCBleHRlbnNpb25zKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiB1YSA9PT0gT0JKX1RZUEUpIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnMgPSB1YTtcbiAgICAgICAgICAgIHVhID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFVBUGFyc2VyKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBVQVBhcnNlcih1YSwgZXh0ZW5zaW9ucykuZ2V0UmVzdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgX3VhID0gdWEgfHwgKCh0eXBlb2Ygd2luZG93ICE9PSBVTkRFRl9UWVBFICYmIHdpbmRvdy5uYXZpZ2F0b3IgJiYgd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpID8gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgOiBFTVBUWSk7XG4gICAgICAgIHZhciBfcmd4bWFwID0gZXh0ZW5zaW9ucyA/IGV4dGVuZChyZWdleGVzLCBleHRlbnNpb25zKSA6IHJlZ2V4ZXM7XG5cbiAgICAgICAgdGhpcy5nZXRCcm93c2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9icm93c2VyID0ge307XG4gICAgICAgICAgICBfYnJvd3NlcltOQU1FXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9icm93c2VyW1ZFUlNJT05dID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmd4TWFwcGVyLmNhbGwoX2Jyb3dzZXIsIF91YSwgX3JneG1hcC5icm93c2VyKTtcbiAgICAgICAgICAgIF9icm93c2VyLm1ham9yID0gbWFqb3JpemUoX2Jyb3dzZXIudmVyc2lvbik7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXI7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0Q1BVID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9jcHUgPSB7fTtcbiAgICAgICAgICAgIF9jcHVbQVJDSElURUNUVVJFXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9jcHUsIF91YSwgX3JneG1hcC5jcHUpO1xuICAgICAgICAgICAgcmV0dXJuIF9jcHU7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0RGV2aWNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9kZXZpY2UgPSB7fTtcbiAgICAgICAgICAgIF9kZXZpY2VbVkVORE9SXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9kZXZpY2VbTU9ERUxdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgX2RldmljZVtUWVBFXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9kZXZpY2UsIF91YSwgX3JneG1hcC5kZXZpY2UpO1xuICAgICAgICAgICAgcmV0dXJuIF9kZXZpY2U7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0RW5naW5lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9lbmdpbmUgPSB7fTtcbiAgICAgICAgICAgIF9lbmdpbmVbTkFNRV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBfZW5naW5lW1ZFUlNJT05dID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmd4TWFwcGVyLmNhbGwoX2VuZ2luZSwgX3VhLCBfcmd4bWFwLmVuZ2luZSk7XG4gICAgICAgICAgICByZXR1cm4gX2VuZ2luZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRPUyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBfb3MgPSB7fTtcbiAgICAgICAgICAgIF9vc1tOQU1FXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9vc1tWRVJTSU9OXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHJneE1hcHBlci5jYWxsKF9vcywgX3VhLCBfcmd4bWFwLm9zKTtcbiAgICAgICAgICAgIHJldHVybiBfb3M7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0UmVzdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB1YSAgICAgIDogdGhpcy5nZXRVQSgpLFxuICAgICAgICAgICAgICAgIGJyb3dzZXIgOiB0aGlzLmdldEJyb3dzZXIoKSxcbiAgICAgICAgICAgICAgICBlbmdpbmUgIDogdGhpcy5nZXRFbmdpbmUoKSxcbiAgICAgICAgICAgICAgICBvcyAgICAgIDogdGhpcy5nZXRPUygpLFxuICAgICAgICAgICAgICAgIGRldmljZSAgOiB0aGlzLmdldERldmljZSgpLFxuICAgICAgICAgICAgICAgIGNwdSAgICAgOiB0aGlzLmdldENQVSgpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldFVBID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIF91YTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRVQSA9IGZ1bmN0aW9uICh1YSkge1xuICAgICAgICAgICAgX3VhID0gKHR5cGVvZiB1YSA9PT0gU1RSX1RZUEUgJiYgdWEubGVuZ3RoID4gVUFfTUFYX0xFTkdUSCkgPyB0cmltKHVhLCBVQV9NQVhfTEVOR1RIKSA6IHVhO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0VUEoX3VhKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIFVBUGFyc2VyLlZFUlNJT04gPSBMSUJWRVJTSU9OO1xuICAgIFVBUGFyc2VyLkJST1dTRVIgPSAgZW51bWVyaXplKFtOQU1FLCBWRVJTSU9OLCBNQUpPUl0pO1xuICAgIFVBUGFyc2VyLkNQVSA9IGVudW1lcml6ZShbQVJDSElURUNUVVJFXSk7XG4gICAgVUFQYXJzZXIuREVWSUNFID0gZW51bWVyaXplKFtNT0RFTCwgVkVORE9SLCBUWVBFLCBDT05TT0xFLCBNT0JJTEUsIFNNQVJUVFYsIFRBQkxFVCwgV0VBUkFCTEUsIEVNQkVEREVEXSk7XG4gICAgVUFQYXJzZXIuRU5HSU5FID0gVUFQYXJzZXIuT1MgPSBlbnVtZXJpemUoW05BTUUsIFZFUlNJT05dKTtcblxuICAgIC8vLy8vLy8vLy8vXG4gICAgLy8gRXhwb3J0XG4gICAgLy8vLy8vLy8vL1xuXG4gICAgLy8gY2hlY2sganMgZW52aXJvbm1lbnRcbiAgICBpZiAodHlwZW9mKGV4cG9ydHMpICE9PSBVTkRFRl9UWVBFKSB7XG4gICAgICAgIC8vIG5vZGVqcyBlbnZcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFVOREVGX1RZUEUgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFVBUGFyc2VyO1xuICAgICAgICB9XG4gICAgICAgIGV4cG9ydHMuVUFQYXJzZXIgPSBVQVBhcnNlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZXF1aXJlanMgZW52IChvcHRpb25hbClcbiAgICAgICAgaWYgKHR5cGVvZihkZWZpbmUpID09PSBGVU5DX1RZUEUgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVUFQYXJzZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSBVTkRFRl9UWVBFKSB7XG4gICAgICAgICAgICAvLyBicm93c2VyIGVudlxuICAgICAgICAgICAgd2luZG93LlVBUGFyc2VyID0gVUFQYXJzZXI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBqUXVlcnkvWmVwdG8gc3BlY2lmaWMgKG9wdGlvbmFsKVxuICAgIC8vIE5vdGU6XG4gICAgLy8gICBJbiBBTUQgZW52IHRoZSBnbG9iYWwgc2NvcGUgc2hvdWxkIGJlIGtlcHQgY2xlYW4sIGJ1dCBqUXVlcnkgaXMgYW4gZXhjZXB0aW9uLlxuICAgIC8vICAgalF1ZXJ5IGFsd2F5cyBleHBvcnRzIHRvIGdsb2JhbCBzY29wZSwgdW5sZXNzIGpRdWVyeS5ub0NvbmZsaWN0KHRydWUpIGlzIHVzZWQsXG4gICAgLy8gICBhbmQgd2Ugc2hvdWxkIGNhdGNoIHRoYXQuXG4gICAgdmFyICQgPSB0eXBlb2Ygd2luZG93ICE9PSBVTkRFRl9UWVBFICYmICh3aW5kb3cualF1ZXJ5IHx8IHdpbmRvdy5aZXB0byk7XG4gICAgaWYgKCQgJiYgISQudWEpIHtcbiAgICAgICAgdmFyIHBhcnNlciA9IG5ldyBVQVBhcnNlcigpO1xuICAgICAgICAkLnVhID0gcGFyc2VyLmdldFJlc3VsdCgpO1xuICAgICAgICAkLnVhLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZXIuZ2V0VUEoKTtcbiAgICAgICAgfTtcbiAgICAgICAgJC51YS5zZXQgPSBmdW5jdGlvbiAodWEpIHtcbiAgICAgICAgICAgIHBhcnNlci5zZXRVQSh1YSk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gcGFyc2VyLmdldFJlc3VsdCgpO1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAkLnVhW3Byb3BdID0gcmVzdWx0W3Byb3BdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxufSkodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgPyB3aW5kb3cgOiB0aGlzKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmFtZE8gPSB7fTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9wcmViaWQtc3NvL29wZXJhdG9yLWNsaWVudC9qcy9wcmViaWQtc3NvLWxpYi50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==