var CMP;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/demo/cmp/js/cmp.ts":
/*!********************************!*\
  !*** ./src/demo/cmp/js/cmp.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.cmpCheck = void 0;
/**
 * TODO For the moment, issues to properly import prebid lib in Typescript and at the same time have a small webpack compilation
 * TODO To have a small generated CMP.js file, do the following:
 * - comment this import
 * - add // @ts-ignore before each Prebid.xxxx call
 */
const Prebid = __importStar(__webpack_require__(/*! ../../../prebid-sso/operator-client/js/prebid-sso-lib */ "./src/prebid-sso/operator-client/js/prebid-sso-lib.ts"));
// TODO should protocol be a parameter?
const proxyBase = 'https://cmp.com';
const cmpCheck = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const prebidData = yield Prebid.getIdAndPreferences(proxyBase);
    if (prebidData === undefined) {
        // Will trigger a redirect
        return;
    }
    const returnedId = (_a = prebidData.identifiers) === null || _a === void 0 ? void 0 : _a[0];
    const hasPersistedId = (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted) === undefined || (returnedId === null || returnedId === void 0 ? void 0 : returnedId.persisted);
    if (!hasPersistedId || prebidData.preferences === undefined) {
        const optIn = confirm(`Hi, here's the CMP!
        
Please confirm if you want to opt-in, otherwise click cancel`);
        // 1. sign preferences
        const signedPreferences = yield Prebid.signPreferences(proxyBase, { identifier: returnedId, optIn });
        // 2. write
        yield Prebid.writeIdAndPref(proxyBase, {
            identifiers: prebidData.identifiers,
            preferences: signedPreferences
        });
    }
});
exports.cmpCheck = cmpCheck;


/***/ }),

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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/demo/cmp/js/cmp.ts");
/******/ 	CMP = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDeEIsTUFBTTtBQUNOO0FBQ0EsWUFBWSxVQUFjLGtCQUFrQix3QkFBVTtBQUN0RCxZQUFZLG1DQUFPO0FBQ25CO0FBQ0EsYUFBYTtBQUFBLGtHQUFDO0FBQ2QsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQzs7Ozs7OztVQ3oyQkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7Ozs7O1VFQUE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9DTVAvLi9zcmMvZGVtby9jbXAvanMvY21wLnRzIiwid2VicGFjazovL0NNUC8uL3NyYy9wcmViaWQtc3NvL2Nvb2tpZXMudHMiLCJ3ZWJwYWNrOi8vQ01QLy4vc3JjL3ByZWJpZC1zc28vb3BlcmF0b3ItY2xpZW50L2pzL3ByZWJpZC1zc28tbGliLnRzIiwid2VicGFjazovL0NNUC8uL3NyYy9wcmViaWQtc3NvL29wZXJhdG9yLWNvbW1vbi50cyIsIndlYnBhY2s6Ly9DTVAvLi9ub2RlX21vZHVsZXMvdWEtcGFyc2VyLWpzL3NyYy91YS1wYXJzZXIuanMiLCJ3ZWJwYWNrOi8vQ01QL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0NNUC93ZWJwYWNrL3J1bnRpbWUvYW1kIG9wdGlvbnMiLCJ3ZWJwYWNrOi8vQ01QL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vQ01QL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9DTVAvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVE9ETyBGb3IgdGhlIG1vbWVudCwgaXNzdWVzIHRvIHByb3Blcmx5IGltcG9ydCBwcmViaWQgbGliIGluIFR5cGVzY3JpcHQgYW5kIGF0IHRoZSBzYW1lIHRpbWUgaGF2ZSBhIHNtYWxsIHdlYnBhY2sgY29tcGlsYXRpb25cbiAqIFRPRE8gVG8gaGF2ZSBhIHNtYWxsIGdlbmVyYXRlZCBDTVAuanMgZmlsZSwgZG8gdGhlIGZvbGxvd2luZzpcbiAqIC0gY29tbWVudCB0aGlzIGltcG9ydFxuICogLSBhZGQgLy8gQHRzLWlnbm9yZSBiZWZvcmUgZWFjaCBQcmViaWQueHh4eCBjYWxsXG4gKi9cbmltcG9ydCAqIGFzIFByZWJpZCBmcm9tIFwiLi4vLi4vLi4vcHJlYmlkLXNzby9vcGVyYXRvci1jbGllbnQvanMvcHJlYmlkLXNzby1saWJcIjtcbmltcG9ydCB7c2lnblByZWZlcmVuY2VzfSBmcm9tIFwiLi4vLi4vLi4vcHJlYmlkLXNzby9vcGVyYXRvci1jbGllbnQvanMvcHJlYmlkLXNzby1saWJcIjtcblxuLy8gVE9ETyBzaG91bGQgcHJvdG9jb2wgYmUgYSBwYXJhbWV0ZXI/XG5jb25zdCBwcm94eUJhc2UgPSAnaHR0cHM6Ly9jbXAuY29tJztcblxuZXhwb3J0IGNvbnN0IGNtcENoZWNrID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHByZWJpZERhdGEgPSBhd2FpdCBQcmViaWQuZ2V0SWRBbmRQcmVmZXJlbmNlcyhwcm94eUJhc2UpO1xuXG4gICAgaWYgKHByZWJpZERhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBXaWxsIHRyaWdnZXIgYSByZWRpcmVjdFxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IHJldHVybmVkSWQgPSBwcmViaWREYXRhLmlkZW50aWZpZXJzPy5bMF1cbiAgICBjb25zdCBoYXNQZXJzaXN0ZWRJZCA9IHJldHVybmVkSWQ/LnBlcnNpc3RlZCA9PT0gdW5kZWZpbmVkIHx8IHJldHVybmVkSWQ/LnBlcnNpc3RlZFxuXG4gICAgaWYgKCFoYXNQZXJzaXN0ZWRJZCB8fCBwcmViaWREYXRhLnByZWZlcmVuY2VzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3Qgb3B0SW4gPSBjb25maXJtKGBIaSwgaGVyZSdzIHRoZSBDTVAhXG4gICAgICAgIFxuUGxlYXNlIGNvbmZpcm0gaWYgeW91IHdhbnQgdG8gb3B0LWluLCBvdGhlcndpc2UgY2xpY2sgY2FuY2VsYClcblxuICAgICAgICAvLyAxLiBzaWduIHByZWZlcmVuY2VzXG4gICAgICAgIGNvbnN0IHNpZ25lZFByZWZlcmVuY2VzID0gYXdhaXQgUHJlYmlkLnNpZ25QcmVmZXJlbmNlcyhwcm94eUJhc2UsIHtpZGVudGlmaWVyOiByZXR1cm5lZElkLCBvcHRJbn0pXG5cbiAgICAgICAgLy8gMi4gd3JpdGVcbiAgICAgICAgYXdhaXQgUHJlYmlkLndyaXRlSWRBbmRQcmVmKHByb3h5QmFzZSwge1xuICAgICAgICAgICAgaWRlbnRpZmllcnM6IHByZWJpZERhdGEuaWRlbnRpZmllcnMsXG4gICAgICAgICAgICBwcmVmZXJlbmNlczogc2lnbmVkUHJlZmVyZW5jZXNcbiAgICAgICAgfSlcbiAgICB9XG5cbn1cbiIsImltcG9ydCB7UmVxdWVzdCwgUmVzcG9uc2V9IGZyb20gXCJleHByZXNzXCI7XG5pbXBvcnQge0Nvb2tpZU9wdGlvbnN9IGZyb20gXCJleHByZXNzLXNlcnZlLXN0YXRpYy1jb3JlXCI7XG5pbXBvcnQge0lkLCBJZEFuZE9wdGlvbmFsUHJlZnMsIFByZWZlcmVuY2VzfSBmcm9tIFwiLi9tb2RlbC9nZW5lcmF0ZWQtbW9kZWxcIjtcblxuZXhwb3J0IGVudW0gQ29va2llcyB7XG4gICAgSUQgPSBcIlByZWJpZElkXCIsXG4gICAgUFJFRlMgPSAnUHJlYmlkUHJlZnMnLFxuICAgIFRFU1RfM1BDID0gJ1ByZWJpZC10ZXN0XzNwYydcbn1cblxuZXhwb3J0IGNvbnN0IFVOS05PV05fVE9fT1BFUkFUT1IgPSAnVU5LTk9XTl9UT19PUEVSQVRPUidcblxuLy8gMXN0IHBhcnR5IGNvb2tpZSBleHBpcmF0aW9uOiAxMCBtaW5cbmV4cG9ydCBjb25zdCBnZXRQcmViaWREYXRhQ2FjaGVFeHBpcmF0aW9uID0gKGRhdGU6IERhdGUgPSBuZXcgRGF0ZSgpKSA9PiB7XG4gICAgY29uc3QgZXhwaXJhdGlvbkRhdGUgPSBuZXcgRGF0ZShkYXRlKTtcbiAgICBleHBpcmF0aW9uRGF0ZS5zZXRUaW1lKGV4cGlyYXRpb25EYXRlLmdldFRpbWUoKSArIDEwMDAgKiA2MCAqIDEwKVxuICAgIHJldHVybiBleHBpcmF0aW9uRGF0ZTtcbn1cblxuZXhwb3J0IGNvbnN0IHNldENvb2tpZSA9IChyZXM6IFJlc3BvbnNlLCBjb29raWVOYW1lOiBzdHJpbmcsIGNvb2tpZVZhbHVlOiBhbnksIGV4cGlyYXRpb25EYXRlOiBEYXRlLCBvcHRpb25zT3ZlcnJpZGU6IENvb2tpZU9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IENvb2tpZU9wdGlvbnMgPSB7XG4gICAgICAgIGV4cGlyZXM6IGV4cGlyYXRpb25EYXRlLFxuICAgICAgICBzYW1lU2l0ZTogJ25vbmUnLFxuICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgIGVuY29kZTogdiA9PiB2LCAvLyB0byBhdm9pZCB0aGUgc3RyaW5nIHRvIGJlIGVuY29kZWQgQHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy82MzIwNTU5OS9wcmV2ZW50LXVybC1lbmNvZGUtaW4tcmVzcG9uc2Utc2V0LWNvb2tpZS1ub2RlanNcbiAgICAgICAgLi4ub3B0aW9uc092ZXJyaWRlXG4gICAgfTtcbiAgICByZXR1cm4gcmVzLmNvb2tpZShjb29raWVOYW1lLCBjb29raWVWYWx1ZSwgb3B0aW9ucyk7XG59XG5cbmV4cG9ydCBjb25zdCByZW1vdmVDb29raWUgPSAocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlLCBjb29raWVOYW1lOiBzdHJpbmcsIG9wdGlvbnNPdmVycmlkZTogQ29va2llT3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgcmV0dXJuIHNldENvb2tpZShyZXMsIGNvb2tpZU5hbWUsIG51bGwsIG5ldyBEYXRlKDApLCBvcHRpb25zT3ZlcnJpZGUpXG59XG5cbi8qKlxuICogQHBhcmFtIGlkQ29va2llXG4gKiBAcGFyYW0gcHJlZnNDb29raWVcbiAqL1xuZXhwb3J0IGNvbnN0IGZyb21Db29raWVWYWx1ZXMgPSAoaWRDb29raWU6IHN0cmluZywgcHJlZnNDb29raWU6IHN0cmluZyk6IElkQW5kT3B0aW9uYWxQcmVmcyA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWRlbnRpZmllcnM6IChpZENvb2tpZSA9PT0gVU5LTk9XTl9UT19PUEVSQVRPUiB8fCBpZENvb2tpZSA9PT0gdW5kZWZpbmVkKSA/IFtdIDogW0pTT04ucGFyc2UoaWRDb29raWUpIGFzIElkXSxcbiAgICAgICAgcHJlZmVyZW5jZXM6IChwcmVmc0Nvb2tpZSA9PT0gVU5LTk9XTl9UT19PUEVSQVRPUiB8fCBwcmVmc0Nvb2tpZSA9PT0gdW5kZWZpbmVkKSA/IHVuZGVmaW5lZCA6IEpTT04ucGFyc2UocHJlZnNDb29raWUpIGFzIFByZWZlcmVuY2VzXG4gICAgfVxufVxuIiwiaW1wb3J0IHtcbiAgICBpc0Jyb3dzZXJLbm93blRvU3VwcG9ydDNQQyxcbiAgICBqc29uRW5kcG9pbnRzLFxuICAgIHJlZGlyZWN0RW5kcG9pbnRzLFxuICAgIHNpZ25BbmRWZXJpZnlFbmRwb2ludHMsXG4gICAgdXJpUGFyYW1zXG59IGZyb20gXCIuLi8uLi9vcGVyYXRvci1jb21tb25cIjtcbmltcG9ydCBVQVBhcnNlciBmcm9tIFwidWEtcGFyc2VyLWpzXCI7XG5pbXBvcnQge1xuICAgIEdldElkUHJlZnNSZXNwb25zZSxcbiAgICBJZEFuZE9wdGlvbmFsUHJlZnMsXG4gICAgSWRBbmRQcmVmcyxcbiAgICBQb3N0SWRQcmVmc1JlcXVlc3QsXG4gICAgUHJlZmVyZW5jZXNcbn0gZnJvbSBcIi4uLy4uL21vZGVsL2dlbmVyYXRlZC1tb2RlbFwiO1xuaW1wb3J0IHtDb29raWVzLCBmcm9tQ29va2llVmFsdWVzLCBnZXRQcmViaWREYXRhQ2FjaGVFeHBpcmF0aW9uLCBVTktOT1dOX1RPX09QRVJBVE9SfSBmcm9tIFwiLi4vLi4vY29va2llc1wiO1xuaW1wb3J0IHtOZXdQcmVmc30gZnJvbSBcIi4uLy4uL21vZGVsL21vZGVsXCI7XG5cbmNvbnN0IGxvZ2dlciA9IGNvbnNvbGU7XG5cbmNvbnN0IHJlZGlyZWN0ID0gKHVybDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgZG9jdW1lbnQubG9jYXRpb24gPSB1cmw7XG59XG5cbi8vIFJlbW92ZSBhbnkgXCJwcmViaWQgZGF0YVwiIHBhcmFtIGZyb20gdGhlIHF1ZXJ5IHN0cmluZ1xuLy8gRnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjM0NzQ4L2hvdy1jYW4taS1kZWxldGUtYS1xdWVyeS1zdHJpbmctcGFyYW1ldGVyLWluLWphdmFzY3JpcHQvMjUyMTQ2NzIjMjUyMTQ2NzJcbi8vIFRPRE8gc2hvdWxkIGJlIGFibGUgdG8gdXNlIGEgbW9yZSBzdGFuZGFyZCB3YXksIGJ1dCBVUkwgY2xhc3MgaXMgaW1tdXRhYmxlIDotKFxuY29uc3QgcmVtb3ZlVXJsUGFyYW1ldGVyID0gKHVybDogc3RyaW5nLCBwYXJhbWV0ZXI6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHVybFBhcnRzID0gdXJsLnNwbGl0KCc/Jyk7XG5cbiAgICBpZiAodXJsUGFydHMubGVuZ3RoID49IDIpIHtcbiAgICAgICAgLy8gR2V0IGZpcnN0IHBhcnQsIGFuZCByZW1vdmUgZnJvbSBhcnJheVxuICAgICAgICBjb25zdCB1cmxCYXNlID0gdXJsUGFydHMuc2hpZnQoKTtcblxuICAgICAgICAvLyBKb2luIGl0IGJhY2sgdXBcbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSB1cmxQYXJ0cy5qb2luKCc/Jyk7XG5cbiAgICAgICAgY29uc3QgcHJlZml4ID0gZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtZXRlcikgKyAnPSc7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gcXVlcnlTdHJpbmcuc3BsaXQoL1smO10vZyk7XG5cbiAgICAgICAgLy8gUmV2ZXJzZSBpdGVyYXRpb24gYXMgbWF5IGJlIGRlc3RydWN0aXZlXG4gICAgICAgIGZvciAobGV0IGkgPSBwYXJ0cy5sZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICAgICAgICAvLyBJZGlvbSBmb3Igc3RyaW5nLnN0YXJ0c1dpdGhcbiAgICAgICAgICAgIGlmIChwYXJ0c1tpXS5sYXN0SW5kZXhPZihwcmVmaXgsIDApICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHVybCA9IHVybEJhc2UgKyAocGFydHMubGVuZ3RoID4gMCA/ICgnPycgKyBwYXJ0cy5qb2luKCcmJykpIDogJycpO1xuICAgIH1cblxuICAgIHJldHVybiB1cmw7XG59O1xuXG5jb25zdCBnZXRDb29raWVWYWx1ZSA9IChuYW1lOiBzdHJpbmcpOiBzdHJpbmcgPT4gKFxuICAgIGRvY3VtZW50LmNvb2tpZS5tYXRjaCgnKF58OylcXFxccyonICsgbmFtZSArICdcXFxccyo9XFxcXHMqKFteO10rKScpPy5wb3AoKSB8fCAnJ1xuKVxuXG5jb25zdCBzZXRDb29raWUgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBleHBpcmF0aW9uOiBEYXRlKSA9PiB7XG4gICAgZG9jdW1lbnQuY29va2llID0gYCR7bmFtZX09JHt2YWx1ZX07ZXhwaXJlcz0ke2V4cGlyYXRpb24udG9VVENTdHJpbmcoKX1gXG59XG5cbi8vIFVwZGF0ZSB0aGUgVVJMIHNob3duIGluIHRoZSBhZGRyZXNzIGJhciwgd2l0aG91dCBQcmViaWQgU1NPIGRhdGFcbmNvbnN0IGNsZWFuVXBVckwgPSAoKSA9PiBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBcIlwiLCByZW1vdmVVcmxQYXJhbWV0ZXIobG9jYXRpb24uaHJlZiwgdXJpUGFyYW1zLmRhdGEpKTtcblxuY29uc3QgZ2V0UHJveHlVcmwgPSAocHJveHlCYXNlOiBzdHJpbmcpID0+IChlbmRwb2ludDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICByZXR1cm4gYCR7cHJveHlCYXNlfS9wcmViaWQke2VuZHBvaW50fWBcbn1cblxuY29uc3QgcmVkaXJlY3RUb1Byb3h5UmVhZCA9IChwcm94eUJhc2U6IHN0cmluZykgPT4gKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gbmV3IFVSTChnZXRQcm94eVVybChwcm94eUJhc2UpKHJlZGlyZWN0RW5kcG9pbnRzLnJlYWQpKVxuICAgIHJlZGlyZWN0VXJsLnNlYXJjaFBhcmFtcy5zZXQodXJpUGFyYW1zLnJldHVyblVybCwgbG9jYXRpb24uaHJlZilcbiAgICByZWRpcmVjdChyZWRpcmVjdFVybC50b1N0cmluZygpKTtcbn1cblxuY29uc3Qgc2F2ZUNvb2tpZVZhbHVlT3JVbmtub3duID0gPFQ+KGNvb2tpZU5hbWU6IHN0cmluZywgY29va2llVmFsdWU6IFQgfCB1bmRlZmluZWQpIDogc3RyaW5nID0+IHtcbiAgICBsb2dnZXIuaW5mbyhgT3BlcmF0b3IgcmV0dXJuZWQgdmFsdWUgZm9yICR7Y29va2llTmFtZX06ICR7Y29va2llVmFsdWUgIT09IHVuZGVmaW5lZCA/ICdZRVMnIDogJ05PJ31gKVxuXG4gICAgY29uc3QgdmFsdWVUb1N0b3JlID0gY29va2llVmFsdWUgPyBKU09OLnN0cmluZ2lmeShjb29raWVWYWx1ZSkgOiBVTktOT1dOX1RPX09QRVJBVE9SXG5cbiAgICBsb2dnZXIuaW5mbyhgU2F2ZSAke2Nvb2tpZU5hbWV9IHZhbHVlOiAke3ZhbHVlVG9TdG9yZX1gKVxuXG4gICAgc2V0Q29va2llKGNvb2tpZU5hbWUsIHZhbHVlVG9TdG9yZSwgZ2V0UHJlYmlkRGF0YUNhY2hlRXhwaXJhdGlvbigpKVxuXG4gICAgcmV0dXJuIHZhbHVlVG9TdG9yZTtcbn1cblxuY29uc3QgcmVtb3ZlQ29va2llID0gKGNvb2tpZU5hbWU6IHN0cmluZykgPT4ge1xuICAgIHNldENvb2tpZShjb29raWVOYW1lLCBudWxsLCBuZXcgRGF0ZSgwKSlcbn1cblxubGV0IHRoaXJkUGFydHlDb29raWVzU3VwcG9ydGVkOiBib29sZWFuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuXG5jb25zdCBwcm9jZXNzR2V0SWRBbmRQcmVmZXJlbmNlcyA9IGFzeW5jIChwcm94eUJhc2U6IHN0cmluZyk6IFByb21pc2U8SWRBbmRPcHRpb25hbFByZWZzIHwgdW5kZWZpbmVkPiA9PiB7XG5cbiAgICBjb25zdCBnZXRVcmwgPSBnZXRQcm94eVVybChwcm94eUJhc2UpXG4gICAgY29uc3QgcmVkaXJlY3RUb1JlYWQgPSByZWRpcmVjdFRvUHJveHlSZWFkKHByb3h5QmFzZSlcblxuICAgIC8vIDEuIEFueSBQcmViaWQgMXN0IHBhcnR5IGNvb2tpZT9cbiAgICBjb25zdCBpZCA9IGdldENvb2tpZVZhbHVlKENvb2tpZXMuSUQpXG4gICAgY29uc3QgcmF3UHJlZmVyZW5jZXMgPSBnZXRDb29raWVWYWx1ZShDb29raWVzLlBSRUZTKVxuXG4gICAgaWYgKGlkICYmIHJhd1ByZWZlcmVuY2VzKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDb29raWUgZm91bmQ6IFlFUycpXG4gICAgICAgIGNsZWFuVXBVckwoKTtcblxuICAgICAgICByZXR1cm4gZnJvbUNvb2tpZVZhbHVlcyhpZCwgcmF3UHJlZmVyZW5jZXMpXG4gICAgfVxuXG4gICAgbG9nZ2VyLmluZm8oJ0Nvb2tpZSBmb3VuZDogTk8nKVxuXG4gICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICBjb25zdCB1cmlEYXRhID0gdXJsUGFyYW1zLmdldCh1cmlQYXJhbXMuZGF0YSk7XG5cbiAgICBjbGVhblVwVXJMKCk7XG5cbiAgICAvLyAyLiBSZWRpcmVjdGVkIGZyb20gb3BlcmF0b3I/XG4gICAgaWYgKHVyaURhdGEpIHtcbiAgICAgICAgbG9nZ2VyLmluZm8oJ1JlZGlyZWN0ZWQgZnJvbSBvcGVyYXRvcjogWUVTJylcblxuICAgICAgICAvLyBDb25zaWRlciB0aGF0IGlmIHdlIGhhdmUgYmVlbiByZWRpcmVjdGVkLCBpdCBtZWFucyAzUEMgYXJlIG5vdCBzdXBwb3J0ZWRcbiAgICAgICAgdGhpcmRQYXJ0eUNvb2tpZXNTdXBwb3J0ZWQgPSBmYWxzZTtcblxuICAgICAgICAvLyBWZXJpZnkgbWVzc2FnZVxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGdldFVybChzaWduQW5kVmVyaWZ5RW5kcG9pbnRzLnZlcmlmeVJlYWQpLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IHVyaURhdGEsXG4gICAgICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IHZlcmlmaWNhdGlvblJlc3VsdCA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKSBhcyBHZXRJZFByZWZzUmVzcG9uc2VcblxuICAgICAgICBpZiAoIXZlcmlmaWNhdGlvblJlc3VsdCkge1xuICAgICAgICAgICAgdGhyb3cgJ1ZlcmlmaWNhdGlvbiBmYWlsZWQnXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcGVyYXRvckRhdGEgPSBKU09OLnBhcnNlKHVyaURhdGEgPz8gJ3t9JykgYXMgR2V0SWRQcmVmc1Jlc3BvbnNlXG5cbiAgICAgICAgLy8gMy4gUmVjZWl2ZWQgZGF0YT9cbiAgICAgICAgY29uc3QgcmV0dXJuZWRJZCA9IG9wZXJhdG9yRGF0YS5ib2R5LmlkZW50aWZpZXJzPy5bMF1cbiAgICAgICAgY29uc3QgaGFzUGVyc2lzdGVkSWQgPSByZXR1cm5lZElkPy5wZXJzaXN0ZWQgPT09IHVuZGVmaW5lZCB8fCByZXR1cm5lZElkPy5wZXJzaXN0ZWRcbiAgICAgICAgc2F2ZUNvb2tpZVZhbHVlT3JVbmtub3duKENvb2tpZXMuSUQsIGhhc1BlcnNpc3RlZElkID8gcmV0dXJuZWRJZCA6IHVuZGVmaW5lZClcbiAgICAgICAgc2F2ZUNvb2tpZVZhbHVlT3JVbmtub3duKENvb2tpZXMuUFJFRlMsIG9wZXJhdG9yRGF0YS5ib2R5LnByZWZlcmVuY2VzKVxuXG4gICAgICAgIHJldHVybiBvcGVyYXRvckRhdGEuYm9keVxuICAgIH1cblxuICAgIGxvZ2dlci5pbmZvKCdSZWRpcmVjdGVkIGZyb20gb3BlcmF0b3I6IE5PJylcblxuICAgIC8vIDQuIEJyb3dzZXIga25vd24gdG8gc3VwcG9ydCAzUEM/XG4gICAgY29uc3QgdXNlckFnZW50ID0gbmV3IFVBUGFyc2VyKG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gICAgaWYgKGlzQnJvd3Nlcktub3duVG9TdXBwb3J0M1BDKHVzZXJBZ2VudC5nZXRCcm93c2VyKCkpKSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdCcm93c2VyIGtub3duIHRvIHN1cHBvcnQgM1BDOiBZRVMnKVxuXG4gICAgICAgIGxvZ2dlci5pbmZvKCdBdHRlbXB0IHRvIHJlYWQgZnJvbSBKU09OJylcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChnZXRVcmwoanNvbkVuZHBvaW50cy5yZWFkKSwge2NyZWRlbnRpYWxzOiAnaW5jbHVkZSd9KVxuICAgICAgICBjb25zdCBvcGVyYXRvckRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkgYXMgR2V0SWRQcmVmc1Jlc3BvbnNlXG4gICAgICAgIFxuICAgICAgICBjb25zdCByZXR1cm5lZElkID0gb3BlcmF0b3JEYXRhLmJvZHkuaWRlbnRpZmllcnM/LlswXVxuICAgICAgICBjb25zdCBoYXNQZXJzaXN0ZWRJZCA9IHJldHVybmVkSWQ/LnBlcnNpc3RlZCA9PT0gdW5kZWZpbmVkIHx8IHJldHVybmVkSWQ/LnBlcnNpc3RlZFxuXG4gICAgICAgIC8vIDMuIFJlY2VpdmVkIGRhdGE/XG4gICAgICAgIGlmIChoYXNQZXJzaXN0ZWRJZCkge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ09wZXJhdG9yIHJldHVybmVkIGlkICYgcHJlZnM6IFlFUycpXG5cbiAgICAgICAgICAgIC8vIElmIHdlIGdvdCBkYXRhLCBpdCBtZWFucyAzUEMgYXJlIHN1cHBvcnRlZFxuICAgICAgICAgICAgdGhpcmRQYXJ0eUNvb2tpZXNTdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyAvIVxcIE5vdGU6IHdlIGRvbid0IG5lZWQgdG8gdmVyaWZ5IHRoZSBtZXNzYWdlIGhlcmUgYXMgaXQgaXMgYSBSRVNUIGNhbGxcblxuICAgICAgICAgICAgc2F2ZUNvb2tpZVZhbHVlT3JVbmtub3duKENvb2tpZXMuSUQsIGhhc1BlcnNpc3RlZElkID8gcmV0dXJuZWRJZCA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHNhdmVDb29raWVWYWx1ZU9yVW5rbm93bihDb29raWVzLlBSRUZTLCBvcGVyYXRvckRhdGEuYm9keS5wcmVmZXJlbmNlcylcblxuICAgICAgICAgICAgcmV0dXJuIG9wZXJhdG9yRGF0YS5ib2R5XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnT3BlcmF0b3IgcmV0dXJuZWQgaWQgJiBwcmVmczogTk8nKVxuXG4gICAgICAgICAgICBsb2dnZXIuaW5mbygnVmVyaWZ5IDNQQyBvbiBvcGVyYXRvcicpXG4gICAgICAgICAgICAvLyBOb3RlOiBuZWVkIHRvIGluY2x1ZGUgY3JlZGVudGlhbHMgdG8gbWFrZSBzdXJlIGNvb2tpZXMgYXJlIHNlbnRcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZ2V0VXJsKGpzb25FbmRwb2ludHMudmVyaWZ5M1BDKSwge2NyZWRlbnRpYWxzOiAnaW5jbHVkZSd9KVxuICAgICAgICAgICAgY29uc3QgdGVzdE9rID0gYXdhaXQgcmVzcG9uc2UuanNvbigpXG5cbiAgICAgICAgICAgIC8vIDQuIDNkIHBhcnR5IGNvb2tpZSBvaz9cbiAgICAgICAgICAgIGlmICh0ZXN0T2spIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuaW5mbygnM1BDIHZlcmlmaWNhdGlvbiBPSzogWUVTJylcblxuICAgICAgICAgICAgICAgIHRoaXJkUGFydHlDb29raWVzU3VwcG9ydGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCdTYXZlIFwidW5rbm93blwiJylcbiAgICAgICAgICAgICAgICBzZXRDb29raWUoQ29va2llcy5JRCwgVU5LTk9XTl9UT19PUEVSQVRPUiwgZ2V0UHJlYmlkRGF0YUNhY2hlRXhwaXJhdGlvbigpKVxuICAgICAgICAgICAgICAgIHNldENvb2tpZShDb29raWVzLlBSRUZTLCBVTktOT1dOX1RPX09QRVJBVE9SLCBnZXRQcmViaWREYXRhQ2FjaGVFeHBpcmF0aW9uKCkpXG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge2lkZW50aWZpZXJzOiBbcmV0dXJuZWRJZF19XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKCczUEMgdmVyaWZpY2F0aW9uIE9LOiBOTycpXG5cbiAgICAgICAgICAgICAgICB0aGlyZFBhcnR5Q29va2llc1N1cHBvcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oJ0ZhbGxiYWNrIHRvIEpTIHJlZGlyZWN0JylcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVkaXJlY3RUb1JlYWQoKSBhcyB1bmRlZmluZWRcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIuaW5mbygnQnJvd3NlciBrbm93biB0byBzdXBwb3J0IDNQQzogTk8nKVxuXG4gICAgICAgIHRoaXJkUGFydHlDb29raWVzU3VwcG9ydGVkID0gZmFsc2U7XG5cbiAgICAgICAgbG9nZ2VyLmluZm8oJ0pTIHJlZGlyZWN0JylcbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0VG9SZWFkKCkgYXMgdW5kZWZpbmVkXG4gICAgfVxufTtcblxuY29uc3QgcHJvY2Vzc1dyaXRlSWRBbmRQcmVmID0gYXN5bmMgKHByb3h5QmFzZTogc3RyaW5nLCB1bnNpZ25lZFJlcXVlc3Q6IElkQW5kUHJlZnMpOiBQcm9taXNlPElkQW5kT3B0aW9uYWxQcmVmcyB8IHVuZGVmaW5lZD4gPT4ge1xuICAgIGNvbnN0IGdldFVybCA9IGdldFByb3h5VXJsKHByb3h5QmFzZSlcblxuICAgIC8vIEZpcnN0IGNsZWFuIHVwIGxvY2FsIGNvb2tpZXNcbiAgICByZW1vdmVDb29raWUoQ29va2llcy5JRClcbiAgICByZW1vdmVDb29raWUoQ29va2llcy5QUkVGUylcblxuICAgIC8vIEZJWE1FIHRoaXMgYm9vbGVhbiB3aWxsIGJlIHVwIHRvIGRhdGUgb25seSBpZiBhIHJlYWQgb2NjdXJyZWQganVzdCBiZWZvcmUuIElmIG5vdCwgd291bGQgbmVlZCB0byBleHBsaWNpdGx5IHRlc3RcbiAgICBpZiAodGhpcmRQYXJ0eUNvb2tpZXNTdXBwb3J0ZWQpIHtcbiAgICAgICAgLy8gMSkgc2lnbiB0aGUgcmVxdWVzdFxuICAgICAgICBjb25zdCBzaWduZWRSZXNwb25zZSA9IGF3YWl0IGZldGNoKGdldFVybChzaWduQW5kVmVyaWZ5RW5kcG9pbnRzLnNpZ25Xcml0ZSksIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkodW5zaWduZWRSZXF1ZXN0KSxcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZSdcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3Qgc2lnbmVkRGF0YSA9IGF3YWl0IHNpZ25lZFJlc3BvbnNlLmpzb24oKSBhcyBQb3N0SWRQcmVmc1JlcXVlc3RcblxuICAgICAgICAvLyAyKSBzZW5kXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZ2V0VXJsKGpzb25FbmRwb2ludHMud3JpdGUpLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHNpZ25lZERhdGEpLFxuICAgICAgICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJ1xuICAgICAgICB9KVxuICAgICAgICBjb25zdCBvcGVyYXRvckRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkgYXMgR2V0SWRQcmVmc1Jlc3BvbnNlXG5cbiAgICAgICAgY29uc3QgcmV0dXJuZWRJZCA9IG9wZXJhdG9yRGF0YS5ib2R5LmlkZW50aWZpZXJzPy5bMF1cbiAgICAgICAgY29uc3QgaGFzUGVyc2lzdGVkSWQgPSByZXR1cm5lZElkPy5wZXJzaXN0ZWQgPT09IHVuZGVmaW5lZCB8fCByZXR1cm5lZElkPy5wZXJzaXN0ZWRcblxuICAgICAgICBzYXZlQ29va2llVmFsdWVPclVua25vd24oQ29va2llcy5JRCwgaGFzUGVyc2lzdGVkSWQgPyByZXR1cm5lZElkIDogdW5kZWZpbmVkKTtcbiAgICAgICAgc2F2ZUNvb2tpZVZhbHVlT3JVbmtub3duKENvb2tpZXMuUFJFRlMsIG9wZXJhdG9yRGF0YS5ib2R5LnByZWZlcmVuY2VzKTtcblxuICAgICAgICByZXR1cm4gb3BlcmF0b3JEYXRhLmJvZHlcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJlZGlyZWN0LiBTaWduaW5nIG9mIHRoZSByZXF1ZXN0IHdpbGwgaGFwcGVuIG9uIHRoZSBiYWNrZW5kIHByb3h5XG4gICAgICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gbmV3IFVSTChnZXRVcmwocmVkaXJlY3RFbmRwb2ludHMud3JpdGUpKVxuICAgICAgICByZWRpcmVjdFVybC5zZWFyY2hQYXJhbXMuc2V0KHVyaVBhcmFtcy5yZXR1cm5VcmwsIGxvY2F0aW9uLmhyZWYpXG4gICAgICAgIHJlZGlyZWN0VXJsLnNlYXJjaFBhcmFtcy5zZXQodXJpUGFyYW1zLmRhdGEsIEpTT04uc3RyaW5naWZ5KHVuc2lnbmVkUmVxdWVzdCkpXG5cbiAgICAgICAgcmV0dXJuIHJlZGlyZWN0KHJlZGlyZWN0VXJsLnRvU3RyaW5nKCkpIGFzIHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHByb3h5QmFzZSBleDogaHR0cDovL215cHJveHkuY29tXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRJZEFuZFByZWZlcmVuY2VzID0gYXN5bmMgKHByb3h5QmFzZTogc3RyaW5nKTogUHJvbWlzZTxJZEFuZE9wdGlvbmFsUHJlZnMgfCB1bmRlZmluZWQ+ID0+IHtcbiAgICBjb25zdCBpZEFuZFByZWZlcmVuY2VzID0gYXdhaXQgcHJvY2Vzc0dldElkQW5kUHJlZmVyZW5jZXMocHJveHlCYXNlKTtcblxuICAgIGxvZ2dlci5pbmZvKCdGaW5pc2hlZCcsIGlkQW5kUHJlZmVyZW5jZXMpXG5cbiAgICByZXR1cm4gaWRBbmRQcmVmZXJlbmNlcztcbn1cblxuZXhwb3J0IGNvbnN0IHdyaXRlSWRBbmRQcmVmID0gYXN5bmMgKHByb3h5QmFzZTogc3RyaW5nLCBpbnB1dDogSWRBbmRQcmVmcyk6IFByb21pc2U8SWRBbmRPcHRpb25hbFByZWZzIHwgdW5kZWZpbmVkPiA9PiB7XG4gICAgY29uc3QgaWRBbmRQcmVmZXJlbmNlcyA9IGF3YWl0IHByb2Nlc3NXcml0ZUlkQW5kUHJlZihwcm94eUJhc2UsIGlucHV0KTtcblxuICAgIGxvZ2dlci5pbmZvKCdGaW5pc2hlZCcsIGlkQW5kUHJlZmVyZW5jZXMpXG5cbiAgICByZXR1cm4gaWRBbmRQcmVmZXJlbmNlcztcbn1cblxuZXhwb3J0IGNvbnN0IHNpZ25QcmVmZXJlbmNlcyA9IGFzeW5jIChwcm94eUJhc2U6IHN0cmluZywgaW5wdXQ6IE5ld1ByZWZzKTogUHJvbWlzZTxQcmVmZXJlbmNlcz4gPT4ge1xuICAgIGNvbnN0IGdldFVybCA9IGdldFByb3h5VXJsKHByb3h5QmFzZSlcblxuICAgIGNvbnN0IHNpZ25lZFJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZ2V0VXJsKHNpZ25BbmRWZXJpZnlFbmRwb2ludHMuc2lnblByZWZzKSwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoaW5wdXQpLFxuICAgICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnXG4gICAgfSlcbiAgICByZXR1cm4gYXdhaXQgc2lnbmVkUmVzcG9uc2UuanNvbigpIGFzIFByZWZlcmVuY2VzXG59XG4iLCIvLyBUaGUgZW5kcG9pbnRzIGV4cG9zZWQgYnkgdGhlIG9wZXJhdG9yIEFQSVxuaW1wb3J0IHtSZXF1ZXN0LCBSZXNwb25zZX0gZnJvbSBcImV4cHJlc3NcIjtcbmltcG9ydCB7SUJyb3dzZXJ9IGZyb20gXCJ1YS1wYXJzZXItanNcIjtcblxuZXhwb3J0IGNvbnN0IHNpZ25BbmRWZXJpZnlFbmRwb2ludHMgPSB7XG4gICAgdmVyaWZ5UmVhZDogJy92ZXJpZnkvcmVhZCcsXG4gICAgc2lnbldyaXRlOiAnL3NpZ24vd3JpdGUnLFxuICAgIHNpZ25QcmVmczogJy9zaWduL3ByZWZzJyxcbn1cblxuZXhwb3J0IGNvbnN0IHJlZGlyZWN0RW5kcG9pbnRzID0ge1xuICAgIHJlYWQ6ICcvcmVkaXJlY3QvcmVhZCcsXG4gICAgd3JpdGU6IFwiL3JlZGlyZWN0L3dyaXRlXCJcbn1cblxuZXhwb3J0IGNvbnN0IGpzb25FbmRwb2ludHMgPSB7XG4gICAgcmVhZDogJy9qc29uL3JlYWQnLFxuICAgIHZlcmlmeTNQQzogJy9qc29uL3ZlcmlmeTNwYycsXG4gICAgd3JpdGU6IFwiL2pzb24vd3JpdGVcIixcbn1cblxuZXhwb3J0IGNvbnN0IHVyaVBhcmFtcyA9IHtcbiAgICBkYXRhOiAncHJlYmlkJywgLy8gRklYTUUgc2hvdWxkIGRlcHJlY2F0ZVxuICAgIHJldHVyblVybDogJ3VybCcsXG4gICAgc2lnbmF0dXJlOiAnc2lnbmF0dXJlJyxcbiAgICByZWNlaXZlcjogJ3JlY2VpdmVyJyxcbiAgICBzZW5kZXI6ICdzZW5kZXInLFxuICAgIHRpbWVzdGFtcDogJ3RpbWVzdGFtcCcsXG4gICAgYm9keTogJ2JvZHknXG59XG5cbmV4cG9ydCBjb25zdCBodHRwUmVkaXJlY3QgPSAocmVzOiBSZXNwb25zZSwgcmVkaXJlY3RVcmw6IHN0cmluZywgaHR0cENvZGUgPSAzMDMpID0+IHtcbiAgICByZXMucmVkaXJlY3QoaHR0cENvZGUsIHJlZGlyZWN0VXJsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBtZXRhUmVkaXJlY3QgPSAocmVzOiBSZXNwb25zZSwgcmVkaXJlY3RVcmw6IHN0cmluZywgdmlldzogc3RyaW5nKSA9PiB7XG4gICAgcmVzLnJlbmRlcih2aWV3LCB7XG4gICAgICAgIG1ldGFSZWRpcmVjdDogcmVkaXJlY3RVcmxcbiAgICB9KVxufTtcblxuLy8gRklYTUUgU2hvdWxkIGJlIG1vcmUgZWxhYm9yYXRlLiBGb3IgdGhlIG1vbWVudCBqdXN0IGNvbnNpZGVyIFNhZmFyaSBkb2Vzbid0IHN1cHBvcnQgM1BDXG5leHBvcnQgY29uc3QgaXNCcm93c2VyS25vd25Ub1N1cHBvcnQzUEMgPSAoYnJvd3NlcjogSUJyb3dzZXIpID0+IHtcbiAgICByZXR1cm4gIWJyb3dzZXIubmFtZS5pbmNsdWRlcygnU2FmYXJpJylcbn1cblxuZXhwb3J0IGNvbnN0IGdldFJldHVyblVybCA9IChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBVUkwgPT4ge1xuICAgIGNvbnN0IHJlZGlyZWN0U3RyID0gZ2V0TWFuZGF0b3J5UXVlcnlTdHJpbmdQYXJhbShyZXEsIHJlcywgdXJpUGFyYW1zLnJldHVyblVybClcbiAgICByZXR1cm4gcmVkaXJlY3RTdHIgPyBuZXcgVVJMKHJlZGlyZWN0U3RyKSA6IHVuZGVmaW5lZFxufVxuXG5leHBvcnQgY29uc3QgZ2V0TWFuZGF0b3J5UXVlcnlTdHJpbmdQYXJhbSA9IChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UsIHBhcmFtTmFtZTogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBzdHJpbmdWYWx1ZSA9IHJlcS5xdWVyeVtwYXJhbU5hbWVdIGFzIHN0cmluZztcbiAgICBpZiAoc3RyaW5nVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXMuc2VuZFN0YXR1cyg0MDApXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBzdHJpbmdWYWx1ZVxufVxuXG4iLCIvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8qIFVBUGFyc2VyLmpzIHYxLjAuMlxuICAgQ29weXJpZ2h0IMKpIDIwMTItMjAyMSBGYWlzYWwgU2FsbWFuIDxmQGZhaXNhbG1hbi5jb20+XG4gICBNSVQgTGljZW5zZSAqLy8qXG4gICBEZXRlY3QgQnJvd3NlciwgRW5naW5lLCBPUywgQ1BVLCBhbmQgRGV2aWNlIHR5cGUvbW9kZWwgZnJvbSBVc2VyLUFnZW50IGRhdGEuXG4gICBTdXBwb3J0cyBicm93c2VyICYgbm9kZS5qcyBlbnZpcm9ubWVudC4gXG4gICBEZW1vICAgOiBodHRwczovL2ZhaXNhbG1hbi5naXRodWIuaW8vdWEtcGFyc2VyLWpzXG4gICBTb3VyY2UgOiBodHRwczovL2dpdGh1Yi5jb20vZmFpc2FsbWFuL3VhLXBhcnNlci1qcyAqL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbihmdW5jdGlvbiAod2luZG93LCB1bmRlZmluZWQpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ29uc3RhbnRzXG4gICAgLy8vLy8vLy8vLy8vL1xuXG5cbiAgICB2YXIgTElCVkVSU0lPTiAgPSAnMS4wLjInLFxuICAgICAgICBFTVBUWSAgICAgICA9ICcnLFxuICAgICAgICBVTktOT1dOICAgICA9ICc/JyxcbiAgICAgICAgRlVOQ19UWVBFICAgPSAnZnVuY3Rpb24nLFxuICAgICAgICBVTkRFRl9UWVBFICA9ICd1bmRlZmluZWQnLFxuICAgICAgICBPQkpfVFlQRSAgICA9ICdvYmplY3QnLFxuICAgICAgICBTVFJfVFlQRSAgICA9ICdzdHJpbmcnLFxuICAgICAgICBNQUpPUiAgICAgICA9ICdtYWpvcicsXG4gICAgICAgIE1PREVMICAgICAgID0gJ21vZGVsJyxcbiAgICAgICAgTkFNRSAgICAgICAgPSAnbmFtZScsXG4gICAgICAgIFRZUEUgICAgICAgID0gJ3R5cGUnLFxuICAgICAgICBWRU5ET1IgICAgICA9ICd2ZW5kb3InLFxuICAgICAgICBWRVJTSU9OICAgICA9ICd2ZXJzaW9uJyxcbiAgICAgICAgQVJDSElURUNUVVJFPSAnYXJjaGl0ZWN0dXJlJyxcbiAgICAgICAgQ09OU09MRSAgICAgPSAnY29uc29sZScsXG4gICAgICAgIE1PQklMRSAgICAgID0gJ21vYmlsZScsXG4gICAgICAgIFRBQkxFVCAgICAgID0gJ3RhYmxldCcsXG4gICAgICAgIFNNQVJUVFYgICAgID0gJ3NtYXJ0dHYnLFxuICAgICAgICBXRUFSQUJMRSAgICA9ICd3ZWFyYWJsZScsXG4gICAgICAgIEVNQkVEREVEICAgID0gJ2VtYmVkZGVkJyxcbiAgICAgICAgVUFfTUFYX0xFTkdUSCA9IDI1NTtcblxuICAgIHZhciBBTUFaT04gID0gJ0FtYXpvbicsXG4gICAgICAgIEFQUExFICAgPSAnQXBwbGUnLFxuICAgICAgICBBU1VTICAgID0gJ0FTVVMnLFxuICAgICAgICBCTEFDS0JFUlJZID0gJ0JsYWNrQmVycnknLFxuICAgICAgICBCUk9XU0VSID0gJ0Jyb3dzZXInLFxuICAgICAgICBDSFJPTUUgID0gJ0Nocm9tZScsXG4gICAgICAgIEVER0UgICAgPSAnRWRnZScsXG4gICAgICAgIEZJUkVGT1ggPSAnRmlyZWZveCcsXG4gICAgICAgIEdPT0dMRSAgPSAnR29vZ2xlJyxcbiAgICAgICAgSFVBV0VJICA9ICdIdWF3ZWknLFxuICAgICAgICBMRyAgICAgID0gJ0xHJyxcbiAgICAgICAgTUlDUk9TT0ZUID0gJ01pY3Jvc29mdCcsXG4gICAgICAgIE1PVE9ST0xBICA9ICdNb3Rvcm9sYScsXG4gICAgICAgIE9QRVJBICAgPSAnT3BlcmEnLFxuICAgICAgICBTQU1TVU5HID0gJ1NhbXN1bmcnLFxuICAgICAgICBTT05ZICAgID0gJ1NvbnknLFxuICAgICAgICBYSUFPTUkgID0gJ1hpYW9taScsXG4gICAgICAgIFpFQlJBICAgPSAnWmVicmEnLFxuICAgICAgICBGQUNFQk9PSyAgID0gJ0ZhY2Vib29rJztcblxuICAgIC8vLy8vLy8vLy8vXG4gICAgLy8gSGVscGVyXG4gICAgLy8vLy8vLy8vL1xuXG4gICAgdmFyIGV4dGVuZCA9IGZ1bmN0aW9uIChyZWdleGVzLCBleHRlbnNpb25zKSB7XG4gICAgICAgICAgICB2YXIgbWVyZ2VkUmVnZXhlcyA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiByZWdleGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnNbaV0gJiYgZXh0ZW5zaW9uc1tpXS5sZW5ndGggJSAyID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lcmdlZFJlZ2V4ZXNbaV0gPSBleHRlbnNpb25zW2ldLmNvbmNhdChyZWdleGVzW2ldKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXJnZWRSZWdleGVzW2ldID0gcmVnZXhlc1tpXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkUmVnZXhlcztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyaXplID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICAgICAgdmFyIGVudW1zID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8YXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZW51bXNbYXJyW2ldLnRvVXBwZXJDYXNlKCldID0gYXJyW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVudW1zO1xuICAgICAgICB9LFxuICAgICAgICBoYXMgPSBmdW5jdGlvbiAoc3RyMSwgc3RyMikge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBzdHIxID09PSBTVFJfVFlQRSA/IGxvd2VyaXplKHN0cjIpLmluZGV4T2YobG93ZXJpemUoc3RyMSkpICE9PSAtMSA6IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBsb3dlcml6ZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWFqb3JpemUgPSBmdW5jdGlvbiAodmVyc2lvbikge1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZih2ZXJzaW9uKSA9PT0gU1RSX1RZUEUgPyB2ZXJzaW9uLnJlcGxhY2UoL1teXFxkXFwuXS9nLCBFTVBUWSkuc3BsaXQoJy4nKVswXSA6IHVuZGVmaW5lZDtcbiAgICAgICAgfSxcbiAgICAgICAgdHJpbSA9IGZ1bmN0aW9uIChzdHIsIGxlbikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZihzdHIpID09PSBTVFJfVFlQRSkge1xuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKC9eXFxzXFxzKi8sIEVNUFRZKS5yZXBsYWNlKC9cXHNcXHMqJC8sIEVNUFRZKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mKGxlbikgPT09IFVOREVGX1RZUEUgPyBzdHIgOiBzdHIuc3Vic3RyaW5nKDAsIFVBX01BWF9MRU5HVEgpO1xuICAgICAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBNYXAgaGVscGVyXG4gICAgLy8vLy8vLy8vLy8vLy9cblxuICAgIHZhciByZ3hNYXBwZXIgPSBmdW5jdGlvbiAodWEsIGFycmF5cykge1xuXG4gICAgICAgICAgICB2YXIgaSA9IDAsIGosIGssIHAsIHEsIG1hdGNoZXMsIG1hdGNoO1xuXG4gICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggYWxsIHJlZ2V4ZXMgbWFwc1xuICAgICAgICAgICAgd2hpbGUgKGkgPCBhcnJheXMubGVuZ3RoICYmICFtYXRjaGVzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVnZXggPSBhcnJheXNbaV0sICAgICAgIC8vIGV2ZW4gc2VxdWVuY2UgKDAsMiw0LC4uKVxuICAgICAgICAgICAgICAgICAgICBwcm9wcyA9IGFycmF5c1tpICsgMV07ICAgLy8gb2RkIHNlcXVlbmNlICgxLDMsNSwuLilcbiAgICAgICAgICAgICAgICBqID0gayA9IDA7XG5cbiAgICAgICAgICAgICAgICAvLyB0cnkgbWF0Y2hpbmcgdWFzdHJpbmcgd2l0aCByZWdleGVzXG4gICAgICAgICAgICAgICAgd2hpbGUgKGogPCByZWdleC5sZW5ndGggJiYgIW1hdGNoZXMpIHtcblxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzID0gcmVnZXhbaisrXS5leGVjKHVhKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoISFtYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHAgPSAwOyBwIDwgcHJvcHMubGVuZ3RoOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IG1hdGNoZXNbKytrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBxID0gcHJvcHNbcF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgaWYgZ2l2ZW4gcHJvcGVydHkgaXMgYWN0dWFsbHkgYXJyYXlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHEgPT09IE9CSl9UWVBFICYmIHEubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocS5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcVsxXSA9PSBGVU5DX1RZUEUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhc3NpZ24gbW9kaWZpZWQgbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3FbMF1dID0gcVsxXS5jYWxsKHRoaXMsIG1hdGNoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXNzaWduIGdpdmVuIHZhbHVlLCBpZ25vcmUgcmVnZXggbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3FbMF1dID0gcVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChxLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgd2hldGhlciBmdW5jdGlvbiBvciByZWdleFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBxWzFdID09PSBGVU5DX1RZUEUgJiYgIShxWzFdLmV4ZWMgJiYgcVsxXS50ZXN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhbGwgZnVuY3Rpb24gKHVzdWFsbHkgc3RyaW5nIG1hcHBlcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3FbMF1dID0gbWF0Y2ggPyBxWzFdLmNhbGwodGhpcywgbWF0Y2gsIHFbMl0pIDogdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzYW5pdGl6ZSBtYXRjaCB1c2luZyBnaXZlbiByZWdleFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcVswXV0gPSBtYXRjaCA/IG1hdGNoLnJlcGxhY2UocVsxXSwgcVsyXSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocS5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3FbMF1dID0gbWF0Y2ggPyBxWzNdLmNhbGwodGhpcywgbWF0Y2gucmVwbGFjZShxWzFdLCBxWzJdKSkgOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3FdID0gbWF0Y2ggPyBtYXRjaCA6IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN0ck1hcHBlciA9IGZ1bmN0aW9uIChzdHIsIG1hcCkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIG1hcCkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGN1cnJlbnQgdmFsdWUgaXMgYXJyYXlcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1hcFtpXSA9PT0gT0JKX1RZUEUgJiYgbWFwW2ldLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtYXBbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXMobWFwW2ldW2pdLCBzdHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChpID09PSBVTktOT1dOKSA/IHVuZGVmaW5lZCA6IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGhhcyhtYXBbaV0sIHN0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChpID09PSBVTktOT1dOKSA/IHVuZGVmaW5lZCA6IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9O1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gU3RyaW5nIG1hcFxuICAgIC8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBTYWZhcmkgPCAzLjBcbiAgICB2YXIgb2xkU2FmYXJpTWFwID0ge1xuICAgICAgICAgICAgJzEuMCcgICA6ICcvOCcsXG4gICAgICAgICAgICAnMS4yJyAgIDogJy8xJyxcbiAgICAgICAgICAgICcxLjMnICAgOiAnLzMnLFxuICAgICAgICAgICAgJzIuMCcgICA6ICcvNDEyJyxcbiAgICAgICAgICAgICcyLjAuMicgOiAnLzQxNicsXG4gICAgICAgICAgICAnMi4wLjMnIDogJy80MTcnLFxuICAgICAgICAgICAgJzIuMC40JyA6ICcvNDE5JyxcbiAgICAgICAgICAgICc/JyAgICAgOiAnLydcbiAgICAgICAgfSxcbiAgICAgICAgd2luZG93c1ZlcnNpb25NYXAgPSB7XG4gICAgICAgICAgICAnTUUnICAgICAgICA6ICc0LjkwJyxcbiAgICAgICAgICAgICdOVCAzLjExJyAgIDogJ05UMy41MScsXG4gICAgICAgICAgICAnTlQgNC4wJyAgICA6ICdOVDQuMCcsXG4gICAgICAgICAgICAnMjAwMCcgICAgICA6ICdOVCA1LjAnLFxuICAgICAgICAgICAgJ1hQJyAgICAgICAgOiBbJ05UIDUuMScsICdOVCA1LjInXSxcbiAgICAgICAgICAgICdWaXN0YScgICAgIDogJ05UIDYuMCcsXG4gICAgICAgICAgICAnNycgICAgICAgICA6ICdOVCA2LjEnLFxuICAgICAgICAgICAgJzgnICAgICAgICAgOiAnTlQgNi4yJyxcbiAgICAgICAgICAgICc4LjEnICAgICAgIDogJ05UIDYuMycsXG4gICAgICAgICAgICAnMTAnICAgICAgICA6IFsnTlQgNi40JywgJ05UIDEwLjAnXSxcbiAgICAgICAgICAgICdSVCcgICAgICAgIDogJ0FSTSdcbiAgICB9O1xuXG4gICAgLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBSZWdleCBtYXBcbiAgICAvLy8vLy8vLy8vLy8vXG5cbiAgICB2YXIgcmVnZXhlcyA9IHtcblxuICAgICAgICBicm93c2VyIDogW1tcblxuICAgICAgICAgICAgL1xcYig/OmNybW98Y3Jpb3MpXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIGZvciBBbmRyb2lkL2lPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnQ2hyb21lJ11dLCBbXG4gICAgICAgICAgICAvZWRnKD86ZXxpb3N8YSk/XFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBFZGdlXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdFZGdlJ11dLCBbXG5cbiAgICAgICAgICAgIC8vIFByZXN0byBiYXNlZFxuICAgICAgICAgICAgLyhvcGVyYSBtaW5pKVxcLyhbLVxcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBNaW5pXG4gICAgICAgICAgICAvKG9wZXJhIFttb2JpbGV0YWJdezMsNn0pXFxiLit2ZXJzaW9uXFwvKFstXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAvLyBPcGVyYSBNb2JpL1RhYmxldFxuICAgICAgICAgICAgLyhvcGVyYSkoPzouK3ZlcnNpb25cXC98W1xcLyBdKykoW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmFcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL29waW9zW1xcLyBdKyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBtaW5pIG9uIGlwaG9uZSA+PSA4LjBcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgT1BFUkErJyBNaW5pJ11dLCBbXG4gICAgICAgICAgICAvXFxib3ByXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPcGVyYSBXZWJraXRcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgT1BFUkFdXSwgW1xuXG4gICAgICAgICAgICAvLyBNaXhlZFxuICAgICAgICAgICAgLyhraW5kbGUpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLaW5kbGVcbiAgICAgICAgICAgIC8obHVuYXNjYXBlfG1heHRob258bmV0ZnJvbnR8amFzbWluZXxibGF6ZXIpW1xcLyBdPyhbXFx3XFwuXSopL2ksICAgICAgLy8gTHVuYXNjYXBlL01heHRob24vTmV0ZnJvbnQvSmFzbWluZS9CbGF6ZXJcbiAgICAgICAgICAgIC8vIFRyaWRlbnQgYmFzZWRcbiAgICAgICAgICAgIC8oYXZhbnQgfGllbW9iaWxlfHNsaW0pKD86YnJvd3Nlcik/W1xcLyBdPyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgLy8gQXZhbnQvSUVNb2JpbGUvU2xpbUJyb3dzZXJcbiAgICAgICAgICAgIC8oYmE/aWR1YnJvd3NlcilbXFwvIF0/KFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmFpZHUgQnJvd3NlclxuICAgICAgICAgICAgLyg/Om1zfFxcKCkoaWUpIChbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbnRlcm5ldCBFeHBsb3JlclxuXG4gICAgICAgICAgICAvLyBXZWJraXQvS0hUTUwgYmFzZWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZsb2NrL1JvY2tNZWx0L01pZG9yaS9FcGlwaGFueS9TaWxrL1NreWZpcmUvQm9sdC9Jcm9uL0lyaWRpdW0vUGhhbnRvbUpTL0Jvd3Nlci9RdXBaaWxsYS9GYWxrb25cbiAgICAgICAgICAgIC8oZmxvY2t8cm9ja21lbHR8bWlkb3JpfGVwaXBoYW55fHNpbGt8c2t5ZmlyZXxvdmlicm93c2VyfGJvbHR8aXJvbnx2aXZhbGRpfGlyaWRpdW18cGhhbnRvbWpzfGJvd3NlcnxxdWFya3xxdXB6aWxsYXxmYWxrb258cmVrb25xfHB1ZmZpbnxicmF2ZXx3aGFsZXxxcWJyb3dzZXJsaXRlfHFxKVxcLyhbLVxcd1xcLl0rKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWtvbnEvUHVmZmluL0JyYXZlL1doYWxlL1FRQnJvd3NlckxpdGUvUVEsIGFrYSBTaG91UVxuICAgICAgICAgICAgLyh3ZWlibylfXyhbXFxkXFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlaWJvXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8oPzpcXGJ1Yz8gP2Jyb3dzZXJ8KD86anVjLispdWN3ZWIpW1xcLyBdPyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgIC8vIFVDQnJvd3NlclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnVUMnK0JST1dTRVJdXSwgW1xuICAgICAgICAgICAgL1xcYnFiY29yZVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2VDaGF0IERlc2t0b3AgZm9yIFdpbmRvd3MgQnVpbHQtaW4gQnJvd3NlclxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnV2VDaGF0KFdpbikgRGVza3RvcCddXSwgW1xuICAgICAgICAgICAgL21pY3JvbWVzc2VuZ2VyXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZUNoYXRcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1dlQ2hhdCddXSwgW1xuICAgICAgICAgICAgL2tvbnF1ZXJvclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLb25xdWVyb3JcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0tvbnF1ZXJvciddXSwgW1xuICAgICAgICAgICAgL3RyaWRlbnQuK3J2WzogXShbXFx3XFwuXXsxLDl9KVxcYi4rbGlrZSBnZWNrby9pICAgICAgICAgICAgICAgICAgICAgICAvLyBJRTExXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdJRSddXSwgW1xuICAgICAgICAgICAgL3lhYnJvd3NlclxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBZYW5kZXhcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ1lhbmRleCddXSwgW1xuICAgICAgICAgICAgLyhhdmFzdHxhdmcpXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBdmFzdC9BVkcgU2VjdXJlIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgLyguKykvLCAnJDEgU2VjdXJlICcrQlJPV1NFUl0sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvXFxiZm9jdXNcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IEZvY3VzXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIEZJUkVGT1grJyBGb2N1cyddXSwgW1xuICAgICAgICAgICAgL1xcYm9wdFxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgVG91Y2hcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgT1BFUkErJyBUb3VjaCddXSwgW1xuICAgICAgICAgICAgL2NvY19jb2NcXHcrXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29jIENvYyBCcm93c2VyXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdDb2MgQ29jJ11dLCBbXG4gICAgICAgICAgICAvZG9sZmluXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERvbHBoaW5cbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0RvbHBoaW4nXV0sIFtcbiAgICAgICAgICAgIC9jb2FzdFxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3BlcmEgQ29hc3RcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgT1BFUkErJyBDb2FzdCddXSwgW1xuICAgICAgICAgICAgL21pdWlicm93c2VyXFwvKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNSVVJIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ01JVUkgJytCUk9XU0VSXV0sIFtcbiAgICAgICAgICAgIC9meGlvc1xcLyhbLVxcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveCBmb3IgaU9TXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIEZJUkVGT1hdXSwgW1xuICAgICAgICAgICAgL1xcYnFpaHV8KHFpP2hvP28/fDM2MClicm93c2VyL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMzYwXG4gICAgICAgICAgICBdLCBbW05BTUUsICczNjAgJytCUk9XU0VSXV0sIFtcbiAgICAgICAgICAgIC8ob2N1bHVzfHNhbXN1bmd8c2FpbGZpc2gpYnJvd3NlclxcLyhbXFx3XFwuXSspL2lcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgLyguKykvLCAnJDEgJytCUk9XU0VSXSwgVkVSU0lPTl0sIFsgICAgICAgICAgICAgICAgICAgICAgLy8gT2N1bHVzL1NhbXN1bmcvU2FpbGZpc2ggQnJvd3NlclxuICAgICAgICAgICAgLyhjb21vZG9fZHJhZ29uKVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21vZG8gRHJhZ29uXG4gICAgICAgICAgICBdLCBbW05BTUUsIC9fL2csICcgJ10sIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKGVsZWN0cm9uKVxcLyhbXFx3XFwuXSspIHNhZmFyaS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVsZWN0cm9uLWJhc2VkIEFwcFxuICAgICAgICAgICAgLyh0ZXNsYSkoPzogcXRjYXJicm93c2VyfFxcLygyMFxcZFxcZFxcLlstXFx3XFwuXSspKS9pLCAgICAgICAgICAgICAgICAgICAvLyBUZXNsYVxuICAgICAgICAgICAgL20/KHFxYnJvd3NlcnxiYWlkdWJveGFwcHwyMzQ1RXhwbG9yZXIpW1xcLyBdPyhbXFx3XFwuXSspL2kgICAgICAgICAgICAvLyBRUUJyb3dzZXIvQmFpZHUgQXBwLzIzNDUgQnJvd3NlclxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvKG1ldGFzcilbXFwvIF0/KFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNvdUdvdUJyb3dzZXJcbiAgICAgICAgICAgIC8obGJicm93c2VyKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGllQmFvIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtOQU1FXSwgW1xuXG4gICAgICAgICAgICAvLyBXZWJWaWV3XG4gICAgICAgICAgICAvKCg/OmZiYW5cXC9mYmlvc3xmYl9pYWJcXC9mYjRhKSg/IS4rZmJhdil8O2ZiYXZcXC8oW1xcd1xcLl0rKTspL2kgICAgICAgLy8gRmFjZWJvb2sgQXBwIGZvciBpT1MgJiBBbmRyb2lkXG4gICAgICAgICAgICBdLCBbW05BTUUsIEZBQ0VCT09LXSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC9zYWZhcmkgKGxpbmUpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGluZSBBcHAgZm9yIGlPU1xuICAgICAgICAgICAgL1xcYihsaW5lKVxcLyhbXFx3XFwuXSspXFwvaWFiL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbmUgQXBwIGZvciBBbmRyb2lkXG4gICAgICAgICAgICAvKGNocm9taXVtfGluc3RhZ3JhbSlbXFwvIF0oWy1cXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9taXVtL0luc3RhZ3JhbVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG4gICAgICAgICAgICAvXFxiZ3NhXFwvKFtcXHdcXC5dKykgLipzYWZhcmlcXC8vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIFNlYXJjaCBBcHBsaWFuY2Ugb24gaU9TXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdHU0EnXV0sIFtcblxuICAgICAgICAgICAgL2hlYWRsZXNzY2hyb21lKD86XFwvKFtcXHdcXC5dKyl8ICkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWUgSGVhZGxlc3NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgQ0hST01FKycgSGVhZGxlc3MnXV0sIFtcblxuICAgICAgICAgICAgLyB3dlxcKS4rKGNocm9tZSlcXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21lIFdlYlZpZXdcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgQ0hST01FKycgV2ViVmlldyddLCBWRVJTSU9OXSwgW1xuXG4gICAgICAgICAgICAvZHJvaWQuKyB2ZXJzaW9uXFwvKFtcXHdcXC5dKylcXGIuKyg/Om1vYmlsZSBzYWZhcml8c2FmYXJpKS9pICAgICAgICAgICAvLyBBbmRyb2lkIEJyb3dzZXJcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ0FuZHJvaWQgJytCUk9XU0VSXV0sIFtcblxuICAgICAgICAgICAgLyhjaHJvbWV8b21uaXdlYnxhcm9yYXxbdGl6ZW5va2FdezV9ID9icm93c2VyKVxcL3Y/KFtcXHdcXC5dKykvaSAgICAgICAvLyBDaHJvbWUvT21uaVdlYi9Bcm9yYS9UaXplbi9Ob2tpYVxuICAgICAgICAgICAgXSwgW05BTUUsIFZFUlNJT05dLCBbXG5cbiAgICAgICAgICAgIC92ZXJzaW9uXFwvKFtcXHdcXC5dKykgLiptb2JpbGVcXC9cXHcrIChzYWZhcmkpL2kgICAgICAgICAgICAgICAgICAgICAgICAvLyBNb2JpbGUgU2FmYXJpXG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsICdNb2JpbGUgU2FmYXJpJ11dLCBbXG4gICAgICAgICAgICAvdmVyc2lvblxcLyhbXFx3XFwuXSspIC4qKG1vYmlsZSA/c2FmYXJpfHNhZmFyaSkvaSAgICAgICAgICAgICAgICAgICAgIC8vIFNhZmFyaSAmIFNhZmFyaSBNb2JpbGVcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBOQU1FXSwgW1xuICAgICAgICAgICAgL3dlYmtpdC4rPyhtb2JpbGUgP3NhZmFyaXxzYWZhcmkpKFxcL1tcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAvLyBTYWZhcmkgPCAzLjBcbiAgICAgICAgICAgIF0sIFtOQU1FLCBbVkVSU0lPTiwgc3RyTWFwcGVyLCBvbGRTYWZhcmlNYXBdXSwgW1xuXG4gICAgICAgICAgICAvKHdlYmtpdHxraHRtbClcXC8oW1xcd1xcLl0rKS9pXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgLy8gR2Vja28gYmFzZWRcbiAgICAgICAgICAgIC8obmF2aWdhdG9yfG5ldHNjYXBlXFxkPylcXC8oWy1cXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5ldHNjYXBlXG4gICAgICAgICAgICBdLCBbW05BTUUsICdOZXRzY2FwZSddLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL21vYmlsZSB2cjsgcnY6KFtcXHdcXC5dKylcXCkuK2ZpcmVmb3gvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IFJlYWxpdHlcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgRklSRUZPWCsnIFJlYWxpdHknXV0sIFtcbiAgICAgICAgICAgIC9la2lvaGYuKyhmbG93KVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvd1xuICAgICAgICAgICAgLyhzd2lmdGZveCkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTd2lmdGZveFxuICAgICAgICAgICAgLyhpY2VkcmFnb258aWNld2Vhc2VsfGNhbWlub3xjaGltZXJhfGZlbm5lY3xtYWVtbyBicm93c2VyfG1pbmltb3xjb25rZXJvcnxrbGFyKVtcXC8gXT8oW1xcd1xcLlxcK10rKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJY2VEcmFnb24vSWNld2Vhc2VsL0NhbWluby9DaGltZXJhL0Zlbm5lYy9NYWVtby9NaW5pbW8vQ29ua2Vyb3IvS2xhclxuICAgICAgICAgICAgLyhzZWFtb25rZXl8ay1tZWxlb258aWNlY2F0fGljZWFwZXxmaXJlYmlyZHxwaG9lbml4fHBhbGVtb29ufGJhc2lsaXNrfHdhdGVyZm94KVxcLyhbLVxcd1xcLl0rKSQvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZWZveC9TZWFNb25rZXkvSy1NZWxlb24vSWNlQ2F0L0ljZUFwZS9GaXJlYmlyZC9QaG9lbml4XG4gICAgICAgICAgICAvKGZpcmVmb3gpXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE90aGVyIEZpcmVmb3gtYmFzZWRcbiAgICAgICAgICAgIC8obW96aWxsYSlcXC8oW1xcd1xcLl0rKSAuK3J2XFw6LitnZWNrb1xcL1xcZCsvaSwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW96aWxsYVxuXG4gICAgICAgICAgICAvLyBPdGhlclxuICAgICAgICAgICAgLyhwb2xhcmlzfGx5bnh8ZGlsbG98aWNhYnxkb3Jpc3xhbWF5YXx3M218bmV0c3VyZnxzbGVpcG5pcnxvYmlnb3xtb3NhaWN8KD86Z298aWNlfHVwKVtcXC4gXT9icm93c2VyKVstXFwvIF0/dj8oW1xcd1xcLl0rKS9pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQb2xhcmlzL0x5bngvRGlsbG8vaUNhYi9Eb3Jpcy9BbWF5YS93M20vTmV0U3VyZi9TbGVpcG5pci9PYmlnby9Nb3NhaWMvR28vSUNFL1VQLkJyb3dzZXJcbiAgICAgICAgICAgIC8obGlua3MpIFxcKChbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGlua3NcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXVxuICAgICAgICBdLFxuXG4gICAgICAgIGNwdSA6IFtbXG5cbiAgICAgICAgICAgIC8oPzooYW1kfHgoPzooPzo4Nnw2NClbLV9dKT98d293fHdpbik2NClbO1xcKV0vaSAgICAgICAgICAgICAgICAgICAgIC8vIEFNRDY0ICh4NjQpXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgJ2FtZDY0J11dLCBbXG5cbiAgICAgICAgICAgIC8oaWEzMig/PTspKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSUEzMiAocXVpY2t0aW1lKVxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsIGxvd2VyaXplXV0sIFtcblxuICAgICAgICAgICAgLygoPzppWzM0Nl18eCk4NilbO1xcKV0vaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSUEzMiAoeDg2KVxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdpYTMyJ11dLCBbXG5cbiAgICAgICAgICAgIC9cXGIoYWFyY2g2NHxhcm0odj84ZT9sP3xfPzY0KSlcXGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFSTTY0XG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgJ2FybTY0J11dLCBbXG5cbiAgICAgICAgICAgIC9cXGIoYXJtKD86dls2N10pP2h0P24/W2ZsXXA/KVxcYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBUk1IRlxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhcm1oZiddXSwgW1xuXG4gICAgICAgICAgICAvLyBQb2NrZXRQQyBtaXN0YWtlbmx5IGlkZW50aWZpZWQgYXMgUG93ZXJQQ1xuICAgICAgICAgICAgL3dpbmRvd3MgKGNlfG1vYmlsZSk7IHBwYzsvaVxuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsICdhcm0nXV0sIFtcblxuICAgICAgICAgICAgLygoPzpwcGN8cG93ZXJwYykoPzo2NCk/KSg/OiBtYWN8O3xcXCkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUG93ZXJQQ1xuICAgICAgICAgICAgXSwgW1tBUkNISVRFQ1RVUkUsIC9vd2VyLywgRU1QVFksIGxvd2VyaXplXV0sIFtcblxuICAgICAgICAgICAgLyhzdW40XFx3KVs7XFwpXS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNQQVJDXG4gICAgICAgICAgICBdLCBbW0FSQ0hJVEVDVFVSRSwgJ3NwYXJjJ11dLCBbXG5cbiAgICAgICAgICAgIC8oKD86YXZyMzJ8aWE2NCg/PTspKXw2OGsoPz1cXCkpfFxcYmFybSg/PXYoPzpbMS03XXxbNS03XTEpbD98O3xlYWJpKXwoPz1hdG1lbCApYXZyfCg/OmlyaXh8bWlwc3xzcGFyYykoPzo2NCk/XFxifHBhLXJpc2MpL2lcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSUE2NCwgNjhLLCBBUk0vNjQsIEFWUi8zMiwgSVJJWC82NCwgTUlQUy82NCwgU1BBUkMvNjQsIFBBLVJJU0NcbiAgICAgICAgICAgIF0sIFtbQVJDSElURUNUVVJFLCBsb3dlcml6ZV1dXG4gICAgICAgIF0sXG5cbiAgICAgICAgZGV2aWNlIDogW1tcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIE1PQklMRVMgJiBUQUJMRVRTXG4gICAgICAgICAgICAvLyBPcmRlcmVkIGJ5IHBvcHVsYXJpdHlcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgLy8gU2Ftc3VuZ1xuICAgICAgICAgICAgL1xcYihzY2gtaVs4OV0wXFxkfHNody1tMzgwc3xzbS1bcHRdXFx3ezIsNH18Z3QtW3BuXVxcZHsyLDR9fHNnaC10OFs1Nl05fG5leHVzIDEwKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFNBTVNVTkddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoKD86c1tjZ3BdaHxndHxzbSktXFx3K3xnYWxheHkgbmV4dXMpL2ksXG4gICAgICAgICAgICAvc2Ftc3VuZ1stIF0oWy1cXHddKykvaSxcbiAgICAgICAgICAgIC9zZWMtKHNnaFxcdyspL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgU0FNU1VOR10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBBcHBsZVxuICAgICAgICAgICAgL1xcKChpcCg/OmhvbmV8b2QpW1xcdyBdKik7L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlQb2QvaVBob25lXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFQUExFXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFwoKGlwYWQpO1stXFx3XFwpLDsgXSthcHBsZS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlQYWRcbiAgICAgICAgICAgIC9hcHBsZWNvcmVtZWRpYVxcL1tcXHdcXC5dKyBcXCgoaXBhZCkvaSxcbiAgICAgICAgICAgIC9cXGIoaXBhZClcXGRcXGQ/LFxcZFxcZD9bO1xcXV0uK2lvcy9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEFQUExFXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIEh1YXdlaVxuICAgICAgICAgICAgL1xcYigoPzphZ1tyc11bMjNdP3xiYWgyP3xzaHQ/fGJ0diktYT9bbHddXFxkezJ9KVxcYig/IS4rZFxcL3MpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgSFVBV0VJXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKD86aHVhd2VpfGhvbm9yKShbLVxcdyBdKylbO1xcKV0vaSxcbiAgICAgICAgICAgIC9cXGIobmV4dXMgNnB8XFx3ezIsNH0tW2F0dV0/W2xuXVswMTI1OXhdWzAxMjM1OV1bYW5dPylcXGIoPyEuK2RcXC9zKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEhVQVdFSV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBYaWFvbWlcbiAgICAgICAgICAgIC9cXGIocG9jb1tcXHcgXSspKD86IGJ1aXxcXCkpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWGlhb21pIFBPQ09cbiAgICAgICAgICAgIC9cXGI7IChcXHcrKSBidWlsZFxcL2htXFwxL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFhpYW9taSBIb25nbWkgJ251bWVyaWMnIG1vZGVsc1xuICAgICAgICAgICAgL1xcYihobVstXyBdP25vdGU/W18gXT8oPzpcXGRcXHcpPykgYnVpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBYaWFvbWkgSG9uZ21pXG4gICAgICAgICAgICAvXFxiKHJlZG1pW1xcLV8gXT8oPzpub3RlfGspP1tcXHdfIF0rKSg/OiBidWl8XFwpKS9pLCAgICAgICAgICAgICAgICAgICAvLyBYaWFvbWkgUmVkbWlcbiAgICAgICAgICAgIC9cXGIobWlbLV8gXT8oPzphXFxkfG9uZXxvbmVbXyBdcGx1c3xub3RlIGx0ZXxtYXgpP1tfIF0/KD86XFxkP1xcdz8pW18gXT8oPzpwbHVzfHNlfGxpdGUpPykoPzogYnVpfFxcKSkvaSAvLyBYaWFvbWkgTWlcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsIC9fL2csICcgJ10sIFtWRU5ET1IsIFhJQU9NSV0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihtaVstXyBdPyg/OnBhZCkoPzpbXFx3XyBdKykpKD86IGJ1aXxcXCkpL2kgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaSBQYWQgdGFibGV0c1xuICAgICAgICAgICAgXSxbW01PREVMLCAvXy9nLCAnICddLCBbVkVORE9SLCBYSUFPTUldLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLy8gT1BQT1xuICAgICAgICAgICAgLzsgKFxcdyspIGJ1aS4rIG9wcG8vaSxcbiAgICAgICAgICAgIC9cXGIoY3BoWzEyXVxcZHszfXxwKD86YWZ8Y1thbF18ZFxcd3xlW2FyXSlbbXRdXFxkMHx4OTAwN3xhMTAxb3ApXFxiL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ09QUE8nXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIFZpdm9cbiAgICAgICAgICAgIC92aXZvIChcXHcrKSg/OiBidWl8XFwpKS9pLFxuICAgICAgICAgICAgL1xcYih2WzEyXVxcZHszfVxcdz9bYXRdKSg/OiBidWl8OykvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnVml2byddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gUmVhbG1lXG4gICAgICAgICAgICAvXFxiKHJteFsxMl1cXGR7M30pKD86IGJ1aXw7fFxcKSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnUmVhbG1lJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBNb3Rvcm9sYVxuICAgICAgICAgICAgL1xcYihtaWxlc3RvbmV8ZHJvaWQoPzpbMi00eF18ICg/OmJpb25pY3x4Mnxwcm98cmF6cikpPzo/KCA0Zyk/KVxcYltcXHcgXStidWlsZFxcLy9pLFxuICAgICAgICAgICAgL1xcYm1vdCg/Om9yb2xhKT9bLSBdKFxcdyopL2ksXG4gICAgICAgICAgICAvKCg/Om1vdG9bXFx3XFwoXFwpIF0rfHh0XFxkezMsNH18bmV4dXMgNikoPz0gYnVpfFxcKSkpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgTU9UT1JPTEFdLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGIobXo2MFxcZHx4b29tWzIgXXswLDJ9KSBidWlsZFxcLy9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIE1PVE9ST0xBXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIExHXG4gICAgICAgICAgICAvKCg/PWxnKT9bdmxda1xcLT9cXGR7M30pIGJ1aXwgM1xcLlstXFx3OyBdezEwfWxnPy0oWzA2Y3Y5XXszLDR9KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIExHXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKGxtKD86LT9mMTAwW252XT98LVtcXHdcXC5dKykoPz0gYnVpfFxcKSl8bmV4dXMgWzQ1XSkvaSxcbiAgICAgICAgICAgIC9cXGJsZ1stZTtcXC8gXSsoKD8hYnJvd3NlcnxuZXRjYXN0fGFuZHJvaWQgdHYpXFx3KykvaSxcbiAgICAgICAgICAgIC9cXGJsZy0/KFtcXGRcXHddKykgYnVpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgTEddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gTGVub3ZvXG4gICAgICAgICAgICAvKGlkZWF0YWJbLVxcdyBdKykvaSxcbiAgICAgICAgICAgIC9sZW5vdm8gPyhzWzU2XTAwMFstXFx3XSt8dGFiKD86W1xcdyBdKyl8eXRbLVxcZFxcd117Nn18dGJbLVxcZFxcd117Nn0pL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0xlbm92byddLCBbVFlQRSwgVEFCTEVUXV0sIFtcblxuICAgICAgICAgICAgLy8gTm9raWFcbiAgICAgICAgICAgIC8oPzptYWVtb3xub2tpYSkuKihuOTAwfGx1bWlhIFxcZCspL2ksXG4gICAgICAgICAgICAvbm9raWFbLV8gXT8oWy1cXHdcXC5dKikvaVxuICAgICAgICAgICAgXSwgW1tNT0RFTCwgL18vZywgJyAnXSwgW1ZFTkRPUiwgJ05va2lhJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBHb29nbGVcbiAgICAgICAgICAgIC8ocGl4ZWwgYylcXGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBQaXhlbCBDXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEdPT0dMRV0sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLis7IChwaXhlbFtcXGRheGwgXXswLDZ9KSg/OiBidWl8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBQaXhlbFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBHT09HTEVdLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gU29ueVxuICAgICAgICAgICAgL2Ryb2lkLisgKFtjLWddXFxkezR9fHNvWy1nbF1cXHcrfHhxLWFcXHdbNC03XVsxMl0pKD89IGJ1aXxcXCkuK2Nocm9tZVxcLyg/IVsxLTZdezAsMX1cXGRcXC4pKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFNPTlldLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9zb255IHRhYmxldCBbcHNdL2ksXG4gICAgICAgICAgICAvXFxiKD86c29ueSk/c2dwXFx3Kyg/OiBidWl8XFwpKS9pXG4gICAgICAgICAgICBdLCBbW01PREVMLCAnWHBlcmlhIFRhYmxldCddLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIE9uZVBsdXNcbiAgICAgICAgICAgIC8gKGtiMjAwNXxpbjIwWzEyXTV8YmUyMFsxMl1bNTldKVxcYi9pLFxuICAgICAgICAgICAgLyg/Om9uZSk/KD86cGx1cyk/IChhXFxkMFxcZFxcZCkoPzogYnxcXCkpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ09uZVBsdXMnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIEFtYXpvblxuICAgICAgICAgICAgLyhhbGV4YSl3ZWJtL2ksXG4gICAgICAgICAgICAvKGtmW2Etel17Mn13aSkoIGJ1aXxcXCkpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLaW5kbGUgRmlyZSB3aXRob3V0IFNpbGtcbiAgICAgICAgICAgIC8oa2ZbYS16XSspKCBidWl8XFwpKS4rc2lsa1xcLy9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBLaW5kbGUgRmlyZSBIRFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBTUFaT05dLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oKD86c2R8a2YpWzAzNDloaWpvcnN0dXddKykoIGJ1aXxcXCkpLitzaWxrXFwvL2kgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlIFBob25lXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvKC4rKS9nLCAnRmlyZSBQaG9uZSAkMSddLCBbVkVORE9SLCBBTUFaT05dLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gQmxhY2tCZXJyeVxuICAgICAgICAgICAgLyhwbGF5Ym9vayk7Wy1cXHdcXCksOyBdKyhyaW0pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJsYWNrQmVycnkgUGxheUJvb2tcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgVkVORE9SLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoKD86YmJbYS1mXXxzdFtodl0pMTAwLVxcZCkvaSxcbiAgICAgICAgICAgIC9cXChiYjEwOyAoXFx3KykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja0JlcnJ5IDEwXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIEJMQUNLQkVSUlldLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gQXN1c1xuICAgICAgICAgICAgLyg/OlxcYnxhc3VzXykodHJhbnNmb1twcmltZSBdezQsMTB9IFxcdyt8ZWVlcGN8c2xpZGVyIFxcdyt8bmV4dXMgN3xwYWRmb25lfHAwMFtjal0pL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQVNVU10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyAoeltiZXNdNlswMjddWzAxMl1ba21dW2xzXXx6ZW5mb25lIFxcZFxcdz8pXFxiL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgQVNVU10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBIVENcbiAgICAgICAgICAgIC8obmV4dXMgOSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFRDIE5leHVzIDlcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0hUQyddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC8oaHRjKVstO18gXXsxLDJ9KFtcXHcgXSsoPz1cXCl8IGJ1aSl8XFx3KykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSFRDXG5cbiAgICAgICAgICAgIC8vIFpURVxuICAgICAgICAgICAgLyh6dGUpWy0gXShbXFx3IF0rPykoPzogYnVpfFxcL3xcXCkpL2ksXG4gICAgICAgICAgICAvKGFsY2F0ZWx8Z2Vla3NwaG9uZXxuZXhpYW58cGFuYXNvbmljfHNvbnkpWy1fIF0/KFstXFx3XSopL2kgICAgICAgICAvLyBBbGNhdGVsL0dlZWtzUGhvbmUvTmV4aWFuL1BhbmFzb25pYy9Tb255XG4gICAgICAgICAgICBdLCBbVkVORE9SLCBbTU9ERUwsIC9fL2csICcgJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuXG4gICAgICAgICAgICAvLyBBY2VyXG4gICAgICAgICAgICAvZHJvaWQuKzsgKFthYl1bMS03XS0/WzAxNzhhXVxcZFxcZD8pL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0FjZXInXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8vIE1laXp1XG4gICAgICAgICAgICAvZHJvaWQuKzsgKG1bMS01XSBub3RlKSBidWkvaSxcbiAgICAgICAgICAgIC9cXGJtei0oWy1cXHddezIsfSkvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTWVpenUnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vIFNoYXJwXG4gICAgICAgICAgICAvXFxiKHNoLT9bYWx0dnpdP1xcZFxcZFthLWVrbV0/KS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdTaGFycCddLCBbVFlQRSwgTU9CSUxFXV0sIFtcblxuICAgICAgICAgICAgLy8gTUlYRURcbiAgICAgICAgICAgIC8oYmxhY2tiZXJyeXxiZW5xfHBhbG0oPz1cXC0pfHNvbnllcmljc3NvbnxhY2VyfGFzdXN8ZGVsbHxtZWl6dXxtb3Rvcm9sYXxwb2x5dHJvbilbLV8gXT8oWy1cXHddKikvaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tCZXJyeS9CZW5RL1BhbG0vU29ueS1Fcmljc3Nvbi9BY2VyL0FzdXMvRGVsbC9NZWl6dS9Nb3Rvcm9sYS9Qb2x5dHJvblxuICAgICAgICAgICAgLyhocCkgKFtcXHcgXStcXHcpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhQIGlQQVFcbiAgICAgICAgICAgIC8oYXN1cyktPyhcXHcrKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFzdXNcbiAgICAgICAgICAgIC8obWljcm9zb2Z0KTsgKGx1bWlhW1xcdyBdKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBMdW1pYVxuICAgICAgICAgICAgLyhsZW5vdm8pWy1fIF0/KFstXFx3XSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGVub3ZvXG4gICAgICAgICAgICAvKGpvbGxhKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEpvbGxhXG4gICAgICAgICAgICAvKG9wcG8pID8oW1xcdyBdKykgYnVpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPUFBPXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8oYXJjaG9zKSAoZ2FtZXBhZDI/KS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQXJjaG9zXG4gICAgICAgICAgICAvKGhwKS4rKHRvdWNocGFkKD8hLit0YWJsZXQpfHRhYmxldCkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhQIFRvdWNoUGFkXG4gICAgICAgICAgICAvKGtpbmRsZSlcXC8oW1xcd1xcLl0rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEtpbmRsZVxuICAgICAgICAgICAgLyhub29rKVtcXHcgXStidWlsZFxcLyhcXHcrKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb29rXG4gICAgICAgICAgICAvKGRlbGwpIChzdHJlYVtrcHJcXGQgXSpbXFxka29dKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVsbCBTdHJlYWtcbiAgICAgICAgICAgIC8obGVbLSBdK3BhbilbLSBdKyhcXHd7MSw5fSkgYnVpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExlIFBhbiBUYWJsZXRzXG4gICAgICAgICAgICAvKHRyaW5pdHkpWy0gXSoodFxcZHszfSkgYnVpL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcmluaXR5IFRhYmxldHNcbiAgICAgICAgICAgIC8oZ2lnYXNldClbLSBdKyhxXFx3ezEsOX0pIGJ1aS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdpZ2FzZXQgVGFibGV0c1xuICAgICAgICAgICAgLyh2b2RhZm9uZSkgKFtcXHcgXSspKD86XFwpfCBidWkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFZvZGFmb25lXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIFRBQkxFVF1dLCBbXG5cbiAgICAgICAgICAgIC8oc3VyZmFjZSBkdW8pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3VyZmFjZSBEdW9cbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgTUlDUk9TT0ZUXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvZHJvaWQgW1xcZFxcLl0rOyAoZnBcXGR1PykoPzogYnxcXCkpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWlycGhvbmVcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0ZhaXJwaG9uZSddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC8odTMwNGFhKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQVQmVFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnQVQmVCddLCBbVFlQRSwgTU9CSUxFXV0sIFtcbiAgICAgICAgICAgIC9cXGJzaWUtKFxcdyopL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaWVtZW5zXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdTaWVtZW5zJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihyY3RcXHcrKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJDQSBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdSQ0EnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKHZlbnVlW1xcZCBdezIsN30pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRGVsbCBWZW51ZSBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdEZWxsJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYihxKD86bXZ8dGEpXFx3KykgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFZlcml6b24gVGFibGV0XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdWZXJpem9uJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYig/OmJhcm5lc1smIF0rbm9ibGUgfGJuW3J0XSkoW1xcd1xcKyBdKikgYi9pICAgICAgICAgICAgICAgICAgICAgICAvLyBCYXJuZXMgJiBOb2JsZSBUYWJsZXRcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0Jhcm5lcyAmIE5vYmxlJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYih0bVxcZHszfVxcdyspIGIvaVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnTnVWaXNpb24nXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKGs4OCkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBaVEUgSyBTZXJpZXMgVGFibGV0XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdaVEUnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKG54XFxkezN9aikgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWlRFIE51YmlhXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdaVEUnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKGdlblxcZHszfSkgYi4rNDloL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3dpc3MgR0VOIE1vYmlsZVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU3dpc3MnXSwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKHp1clxcZHszfSkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3dpc3MgWlVSIFRhYmxldFxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnU3dpc3MnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvXFxiKCh6ZWtpKT90Yi4qXFxiKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gWmVraSBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdaZWtpJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYihbeXJdXFxkezJ9KSBiL2ksXG4gICAgICAgICAgICAvXFxiKGRyYWdvblstIF0rdG91Y2ggfGR0KShcXHd7NX0pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRHJhZ29uIFRvdWNoIFRhYmxldFxuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdEcmFnb24gVG91Y2gnXSwgTU9ERUwsIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYihucy0/XFx3ezAsOX0pIGIvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluc2lnbmlhIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ0luc2lnbmlhJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYigobnhhfG5leHQpLT9cXHd7MCw5fSkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5leHRCb29rIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ05leHRCb29rJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgL1xcYih4dHJlbWVcXF8pPyh2KDFbMDQ1XXwyWzAxNV18WzM0NjldMHw3WzA1XSkpIGIvaSAgICAgICAgICAgICAgICAgIC8vIFZvaWNlIFh0cmVtZSBQaG9uZXNcbiAgICAgICAgICAgIF0sIFtbVkVORE9SLCAnVm9pY2UnXSwgTU9ERUwsIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYihsdnRlbFxcLSk/KHYxWzEyXSkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEx2VGVsIFBob25lc1xuICAgICAgICAgICAgXSwgW1tWRU5ET1IsICdMdlRlbCddLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvXFxiKHBoLTEpIC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFc3NlbnRpYWwgUEgtMVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnRXNzZW50aWFsJ10sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL1xcYih2KDEwMG1kfDcwMG5hfDcwMTF8OTE3ZykuKlxcYikgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVudml6ZW4gVGFibGV0c1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnRW52aXplbiddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIodHJpb1stXFx3XFwuIF0rKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFjaFNwZWVkIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ01hY2hTcGVlZCddLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGJ0dV8oMTQ5MSkgYi9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJvdG9yIFRhYmxldHNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1JvdG9yJ10sIFtUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhzaGllbGRbXFx3IF0rKSBiL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTnZpZGlhIFNoaWVsZCBUYWJsZXRzXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdOdmlkaWEnXSwgW1RZUEUsIFRBQkxFVF1dLCBbXG4gICAgICAgICAgICAvKHNwcmludCkgKFxcdyspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTcHJpbnQgUGhvbmVzXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvKGtpblxcLltvbmV0d117M30pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaWNyb3NvZnQgS2luXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvXFwuL2csICcgJ10sIFtWRU5ET1IsIE1JQ1JPU09GVF0sIFtUWVBFLCBNT0JJTEVdXSwgW1xuICAgICAgICAgICAgL2Ryb2lkLis7IChjYzY2NjY/fGV0NVsxNl18bWNbMjM5XVsyM114P3x2YzhbMDNdeD8pXFwpL2kgICAgICAgICAgICAgLy8gWmVicmFcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgWkVCUkFdLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAoZWMzMHxwczIwfHRjWzItOF1cXGRba3hdKVxcKS9pXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIFpFQlJBXSwgW1RZUEUsIE1PQklMRV1dLCBbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIENPTlNPTEVTXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC8ob3V5YSkvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT3V5YVxuICAgICAgICAgICAgLyhuaW50ZW5kbykgKFt3aWRzM3V0Y2hdKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOaW50ZW5kb1xuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBDT05TT0xFXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAoc2hpZWxkKSBidWkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTnZpZGlhXG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsICdOdmlkaWEnXSwgW1RZUEUsIENPTlNPTEVdXSwgW1xuICAgICAgICAgICAgLyhwbGF5c3RhdGlvbiBbMzQ1cG9ydGFibGV2aV0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQbGF5c3RhdGlvblxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBTT05ZXSwgW1RZUEUsIENPTlNPTEVdXSwgW1xuICAgICAgICAgICAgL1xcYih4Ym94KD86IG9uZSk/KD8hOyB4Ym94KSlbXFwpOyBdL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1pY3Jvc29mdCBYYm94XG4gICAgICAgICAgICBdLCBbTU9ERUwsIFtWRU5ET1IsIE1JQ1JPU09GVF0sIFtUWVBFLCBDT05TT0xFXV0sIFtcblxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgICAgLy8gU01BUlRUVlNcbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgICAgICAgICAgL3NtYXJ0LXR2Lisoc2Ftc3VuZykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTYW1zdW5nXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvaGJidHYuK21hcGxlOyhcXGQrKS9pXG4gICAgICAgICAgICBdLCBbW01PREVMLCAvXi8sICdTbWFydFRWJ10sIFtWRU5ET1IsIFNBTVNVTkddLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvKG51eDsgbmV0Y2FzdC4rc21hcnR0dnxsZyAobmV0Y2FzdFxcLnR2LTIwMVxcZHxhbmRyb2lkIHR2KSkvaSAgICAgICAgLy8gTEcgU21hcnRUVlxuICAgICAgICAgICAgXSwgW1tWRU5ET1IsIExHXSwgW1RZUEUsIFNNQVJUVFZdXSwgW1xuICAgICAgICAgICAgLyhhcHBsZSkgP3R2L2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBcHBsZSBUVlxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgW01PREVMLCBBUFBMRSsnIFRWJ10sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC9jcmtleS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR29vZ2xlIENocm9tZWNhc3RcbiAgICAgICAgICAgIF0sIFtbTU9ERUwsIENIUk9NRSsnY2FzdCddLCBbVkVORE9SLCBHT09HTEVdLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuK2FmdChcXHcpKCBidWl8XFwpKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyZSBUVlxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCBBTUFaT05dLCBbVFlQRSwgU01BUlRUVl1dLCBbXG4gICAgICAgICAgICAvXFwoZHR2W1xcKTtdLisoYXF1b3MpL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2hhcnBcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgJ1NoYXJwJ10sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC9cXGIocm9rdSlbXFxkeF0qW1xcKVxcL10oKD86ZHZwLSk/W1xcZFxcLl0qKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUm9rdVxuICAgICAgICAgICAgL2hiYnR2XFwvXFxkK1xcLlxcZCtcXC5cXGQrICtcXChbXFx3IF0qOyAqKFxcd1teO10qKTsoW147XSopL2kgICAgICAgICAgICAgICAvLyBIYmJUViBkZXZpY2VzXG4gICAgICAgICAgICBdLCBbW1ZFTkRPUiwgdHJpbV0sIFtNT0RFTCwgdHJpbV0sIFtUWVBFLCBTTUFSVFRWXV0sIFtcbiAgICAgICAgICAgIC9cXGIoYW5kcm9pZCB0dnxzbWFydFstIF0/dHZ8b3BlcmEgdHZ8dHY7IHJ2OilcXGIvaSAgICAgICAgICAgICAgICAgICAvLyBTbWFydFRWIGZyb20gVW5pZGVudGlmaWVkIFZlbmRvcnNcbiAgICAgICAgICAgIF0sIFtbVFlQRSwgU01BUlRUVl1dLCBbXG5cbiAgICAgICAgICAgIC8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAgICAgICAgIC8vIFdFQVJBQkxFU1xuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvKChwZWJibGUpKWFwcC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFBlYmJsZVxuICAgICAgICAgICAgXSwgW1ZFTkRPUiwgTU9ERUwsIFtUWVBFLCBXRUFSQUJMRV1dLCBbXG4gICAgICAgICAgICAvZHJvaWQuKzsgKGdsYXNzKSBcXGQvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHb29nbGUgR2xhc3NcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgR09PR0xFXSwgW1RZUEUsIFdFQVJBQkxFXV0sIFtcbiAgICAgICAgICAgIC9kcm9pZC4rOyAod3Q2Mz8wezIsM30pXFwpL2lcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgWkVCUkFdLCBbVFlQRSwgV0VBUkFCTEVdXSwgW1xuICAgICAgICAgICAgLyhxdWVzdCggMik/KS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBPY3VsdXMgUXVlc3RcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1ZFTkRPUiwgRkFDRUJPT0tdLCBbVFlQRSwgV0VBUkFCTEVdXSwgW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgICAgICAgICAvLyBFTUJFRERFRFxuICAgICAgICAgICAgLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgICAgICAgICAvKHRlc2xhKSg/OiBxdGNhcmJyb3dzZXJ8XFwvWy1cXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRlc2xhXG4gICAgICAgICAgICBdLCBbVkVORE9SLCBbVFlQRSwgRU1CRURERURdXSwgW1xuXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgICAgICAgICAgLy8gTUlYRUQgKEdFTkVSSUMpXG4gICAgICAgICAgICAvLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgICAgIC9kcm9pZCAuKz87IChbXjtdKz8pKD86IGJ1aXxcXCkgYXBwbGV3KS4rPyBtb2JpbGUgc2FmYXJpL2kgICAgICAgICAgIC8vIEFuZHJvaWQgUGhvbmVzIGZyb20gVW5pZGVudGlmaWVkIFZlbmRvcnNcbiAgICAgICAgICAgIF0sIFtNT0RFTCwgW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvZHJvaWQgLis/OyAoW147XSs/KSg/OiBidWl8XFwpIGFwcGxldykuKz8oPyEgbW9iaWxlKSBzYWZhcmkvaSAgICAgICAvLyBBbmRyb2lkIFRhYmxldHMgZnJvbSBVbmlkZW50aWZpZWQgVmVuZG9yc1xuICAgICAgICAgICAgXSwgW01PREVMLCBbVFlQRSwgVEFCTEVUXV0sIFtcbiAgICAgICAgICAgIC9cXGIoKHRhYmxldHx0YWIpWztcXC9dfGZvY3VzXFwvXFxkKD8hLittb2JpbGUpKS9pICAgICAgICAgICAgICAgICAgICAgIC8vIFVuaWRlbnRpZmlhYmxlIFRhYmxldFxuICAgICAgICAgICAgXSwgW1tUWVBFLCBUQUJMRVRdXSwgW1xuICAgICAgICAgICAgLyhwaG9uZXxtb2JpbGUoPzpbO1xcL118IHNhZmFyaSl8cGRhKD89Lit3aW5kb3dzIGNlKSkvaSAgICAgICAgICAgICAgLy8gVW5pZGVudGlmaWFibGUgTW9iaWxlXG4gICAgICAgICAgICBdLCBbW1RZUEUsIE1PQklMRV1dLCBbXG4gICAgICAgICAgICAvKGFuZHJvaWRbLVxcd1xcLiBdezAsOX0pOy4rYnVpbC9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2VuZXJpYyBBbmRyb2lkIERldmljZVxuICAgICAgICAgICAgXSwgW01PREVMLCBbVkVORE9SLCAnR2VuZXJpYyddXVxuICAgICAgICBdLFxuXG4gICAgICAgIGVuZ2luZSA6IFtbXG5cbiAgICAgICAgICAgIC93aW5kb3dzLisgZWRnZVxcLyhbXFx3XFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFZGdlSFRNTFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBFREdFKydIVE1MJ11dLCBbXG5cbiAgICAgICAgICAgIC93ZWJraXRcXC81MzdcXC4zNi4rY2hyb21lXFwvKD8hMjcpKFtcXHdcXC5dKykvaSAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGlua1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnQmxpbmsnXV0sIFtcblxuICAgICAgICAgICAgLyhwcmVzdG8pXFwvKFtcXHdcXC5dKykvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBQcmVzdG9cbiAgICAgICAgICAgIC8od2Via2l0fHRyaWRlbnR8bmV0ZnJvbnR8bmV0c3VyZnxhbWF5YXxseW54fHczbXxnb2FubmEpXFwvKFtcXHdcXC5dKykvaSwgLy8gV2ViS2l0L1RyaWRlbnQvTmV0RnJvbnQvTmV0U3VyZi9BbWF5YS9MeW54L3czbS9Hb2FubmFcbiAgICAgICAgICAgIC9la2lvaChmbG93KVxcLyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmxvd1xuICAgICAgICAgICAgLyhraHRtbHx0YXNtYW58bGlua3MpW1xcLyBdXFwoPyhbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gS0hUTUwvVGFzbWFuL0xpbmtzXG4gICAgICAgICAgICAvKGljYWIpW1xcLyBdKFsyM11cXC5bXFxkXFwuXSspL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpQ2FiXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcblxuICAgICAgICAgICAgL3J2XFw6KFtcXHdcXC5dezEsOX0pXFxiLisoZ2Vja28pL2kgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2Vja29cbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBOQU1FXVxuICAgICAgICBdLFxuXG4gICAgICAgIG9zIDogW1tcblxuICAgICAgICAgICAgLy8gV2luZG93c1xuICAgICAgICAgICAgL21pY3Jvc29mdCAod2luZG93cykgKHZpc3RhfHhwKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaW5kb3dzIChpVHVuZXMpXG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8od2luZG93cykgbnQgNlxcLjI7IChhcm0pL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdpbmRvd3MgUlRcbiAgICAgICAgICAgIC8od2luZG93cyAoPzpwaG9uZSg/OiBvcyk/fG1vYmlsZSkpW1xcLyBdPyhbXFxkXFwuXFx3IF0qKS9pLCAgICAgICAgICAgIC8vIFdpbmRvd3MgUGhvbmVcbiAgICAgICAgICAgIC8od2luZG93cylbXFwvIF0/KFtudGNlXFxkXFwuIF0rXFx3KSg/IS4reGJveCkvaVxuICAgICAgICAgICAgXSwgW05BTUUsIFtWRVJTSU9OLCBzdHJNYXBwZXIsIHdpbmRvd3NWZXJzaW9uTWFwXV0sIFtcbiAgICAgICAgICAgIC8od2luKD89M3w5fG4pfHdpbiA5eCApKFtudFxcZFxcLl0rKS9pXG4gICAgICAgICAgICBdLCBbW05BTUUsICdXaW5kb3dzJ10sIFtWRVJTSU9OLCBzdHJNYXBwZXIsIHdpbmRvd3NWZXJzaW9uTWFwXV0sIFtcblxuICAgICAgICAgICAgLy8gaU9TL21hY09TXG4gICAgICAgICAgICAvaXBbaG9uZWFkXXsyLDR9XFxiKD86LipvcyAoW1xcd10rKSBsaWtlIG1hY3w7IG9wZXJhKS9pLCAgICAgICAgICAgICAgLy8gaU9TXG4gICAgICAgICAgICAvY2ZuZXR3b3JrXFwvLitkYXJ3aW4vaVxuICAgICAgICAgICAgXSwgW1tWRVJTSU9OLCAvXy9nLCAnLiddLCBbTkFNRSwgJ2lPUyddXSwgW1xuICAgICAgICAgICAgLyhtYWMgb3MgeCkgPyhbXFx3XFwuIF0qKS9pLFxuICAgICAgICAgICAgLyhtYWNpbnRvc2h8bWFjX3Bvd2VycGNcXGIpKD8hLitoYWlrdSkvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWFjIE9TXG4gICAgICAgICAgICBdLCBbW05BTUUsICdNYWMgT1MnXSwgW1ZFUlNJT04sIC9fL2csICcuJ11dLCBbXG5cbiAgICAgICAgICAgIC8vIE1vYmlsZSBPU2VzXG4gICAgICAgICAgICAvZHJvaWQgKFtcXHdcXC5dKylcXGIuKyhhbmRyb2lkWy0gXXg4NikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFuZHJvaWQteDg2XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgTkFNRV0sIFsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFuZHJvaWQvV2ViT1MvUU5YL0JhZGEvUklNL01hZW1vL01lZUdvL1NhaWxmaXNoIE9TXG4gICAgICAgICAgICAvKGFuZHJvaWR8d2Vib3N8cW54fGJhZGF8cmltIHRhYmxldCBvc3xtYWVtb3xtZWVnb3xzYWlsZmlzaClbLVxcLyBdPyhbXFx3XFwuXSopL2ksXG4gICAgICAgICAgICAvKGJsYWNrYmVycnkpXFx3KlxcLyhbXFx3XFwuXSopL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCbGFja2JlcnJ5XG4gICAgICAgICAgICAvKHRpemVufGthaW9zKVtcXC8gXShbXFx3XFwuXSspL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRpemVuL0thaU9TXG4gICAgICAgICAgICAvXFwoKHNlcmllczQwKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZXJpZXMgNDBcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgL1xcKGJiKDEwKTsvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQmxhY2tCZXJyeSAxMFxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBCTEFDS0JFUlJZXV0sIFtcbiAgICAgICAgICAgIC8oPzpzeW1iaWFuID9vc3xzeW1ib3N8czYwKD89Oyl8c2VyaWVzNjApWy1cXC8gXT8oW1xcd1xcLl0qKS9pICAgICAgICAgLy8gU3ltYmlhblxuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCAnU3ltYmlhbiddXSwgW1xuICAgICAgICAgICAgL21vemlsbGFcXC9bXFxkXFwuXSsgXFwoKD86bW9iaWxlfHRhYmxldHx0dnxtb2JpbGU7IFtcXHcgXSspOyBydjouKyBnZWNrb1xcLyhbXFx3XFwuXSspL2kgLy8gRmlyZWZveCBPU1xuICAgICAgICAgICAgXSwgW1ZFUlNJT04sIFtOQU1FLCBGSVJFRk9YKycgT1MnXV0sIFtcbiAgICAgICAgICAgIC93ZWIwczsuK3J0KHR2KS9pLFxuICAgICAgICAgICAgL1xcYig/OmhwKT93b3MoPzpicm93c2VyKT9cXC8oW1xcd1xcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2ViT1NcbiAgICAgICAgICAgIF0sIFtWRVJTSU9OLCBbTkFNRSwgJ3dlYk9TJ11dLCBbXG5cbiAgICAgICAgICAgIC8vIEdvb2dsZSBDaHJvbWVjYXN0XG4gICAgICAgICAgICAvY3JrZXlcXC8oW1xcZFxcLl0rKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdvb2dsZSBDaHJvbWVjYXN0XG4gICAgICAgICAgICBdLCBbVkVSU0lPTiwgW05BTUUsIENIUk9NRSsnY2FzdCddXSwgW1xuICAgICAgICAgICAgLyhjcm9zKSBbXFx3XSsgKFtcXHdcXC5dK1xcdykvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ2hyb21pdW0gT1NcbiAgICAgICAgICAgIF0sIFtbTkFNRSwgJ0Nocm9taXVtIE9TJ10sIFZFUlNJT05dLFtcblxuICAgICAgICAgICAgLy8gQ29uc29sZVxuICAgICAgICAgICAgLyhuaW50ZW5kb3xwbGF5c3RhdGlvbikgKFt3aWRzMzQ1cG9ydGFibGV2dWNoXSspL2ksICAgICAgICAgICAgICAgICAvLyBOaW50ZW5kby9QbGF5c3RhdGlvblxuICAgICAgICAgICAgLyh4Ym94KTsgK3hib3ggKFteXFwpO10rKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWljcm9zb2Z0IFhib3ggKDM2MCwgT25lLCBYLCBTLCBTZXJpZXMgWCwgU2VyaWVzIFMpXG5cbiAgICAgICAgICAgIC8vIE90aGVyXG4gICAgICAgICAgICAvXFxiKGpvbGl8cGFsbSlcXGIgPyg/Om9zKT9cXC8/KFtcXHdcXC5dKikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSm9saS9QYWxtXG4gICAgICAgICAgICAvKG1pbnQpW1xcL1xcKFxcKSBdPyhcXHcqKS9pLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNaW50XG4gICAgICAgICAgICAvKG1hZ2VpYXx2ZWN0b3JsaW51eClbOyBdL2ksICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hZ2VpYS9WZWN0b3JMaW51eFxuICAgICAgICAgICAgLyhba3hsbl0/dWJ1bnR1fGRlYmlhbnxzdXNlfG9wZW5zdXNlfGdlbnRvb3xhcmNoKD89IGxpbnV4KXxzbGFja3dhcmV8ZmVkb3JhfG1hbmRyaXZhfGNlbnRvc3xwY2xpbnV4b3N8cmVkID9oYXR8emVud2Fsa3xsaW5wdXN8cmFzcGJpYW58cGxhbiA5fG1pbml4fHJpc2Mgb3N8Y29udGlraXxkZWVwaW58bWFuamFyb3xlbGVtZW50YXJ5IG9zfHNhYmF5b258bGluc3BpcmUpKD86IGdudVxcL2xpbnV4KT8oPzogZW50ZXJwcmlzZSk/KD86Wy0gXWxpbnV4KT8oPzotZ251KT9bLVxcLyBdPyg/IWNocm9tfHBhY2thZ2UpKFstXFx3XFwuXSopL2ksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVidW50dS9EZWJpYW4vU1VTRS9HZW50b28vQXJjaC9TbGFja3dhcmUvRmVkb3JhL01hbmRyaXZhL0NlbnRPUy9QQ0xpbnV4T1MvUmVkSGF0L1plbndhbGsvTGlucHVzL1Jhc3BiaWFuL1BsYW45L01pbml4L1JJU0NPUy9Db250aWtpL0RlZXBpbi9NYW5qYXJvL2VsZW1lbnRhcnkvU2FiYXlvbi9MaW5zcGlyZVxuICAgICAgICAgICAgLyhodXJkfGxpbnV4KSA/KFtcXHdcXC5dKikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEh1cmQvTGludXhcbiAgICAgICAgICAgIC8oZ251KSA/KFtcXHdcXC5dKikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHTlVcbiAgICAgICAgICAgIC9cXGIoWy1mcmVudG9wY2doc117MCw1fWJzZHxkcmFnb25mbHkpW1xcLyBdPyg/IWFtZHxbaXgzNDZdezEsMn04NikoW1xcd1xcLl0qKS9pLCAvLyBGcmVlQlNEL05ldEJTRC9PcGVuQlNEL1BDLUJTRC9HaG9zdEJTRC9EcmFnb25GbHlcbiAgICAgICAgICAgIC8oaGFpa3UpIChcXHcrKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhhaWt1XG4gICAgICAgICAgICBdLCBbTkFNRSwgVkVSU0lPTl0sIFtcbiAgICAgICAgICAgIC8oc3Vub3MpID8oW1xcd1xcLlxcZF0qKS9pICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU29sYXJpc1xuICAgICAgICAgICAgXSwgW1tOQU1FLCAnU29sYXJpcyddLCBWRVJTSU9OXSwgW1xuICAgICAgICAgICAgLygoPzpvcGVuKT9zb2xhcmlzKVstXFwvIF0/KFtcXHdcXC5dKikvaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTb2xhcmlzXG4gICAgICAgICAgICAvKGFpeCkgKChcXGQpKD89XFwufFxcKXwgKVtcXHdcXC5dKSovaSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQUlYXG4gICAgICAgICAgICAvXFxiKGJlb3N8b3NcXC8yfGFtaWdhb3N8bW9ycGhvc3xvcGVudm1zfGZ1Y2hzaWF8aHAtdXgpL2ksICAgICAgICAgICAgLy8gQmVPUy9PUzIvQW1pZ2FPUy9Nb3JwaE9TL09wZW5WTVMvRnVjaHNpYS9IUC1VWFxuICAgICAgICAgICAgLyh1bml4KSA/KFtcXHdcXC5dKikvaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVOSVhcbiAgICAgICAgICAgIF0sIFtOQU1FLCBWRVJTSU9OXVxuICAgICAgICBdXG4gICAgfTtcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ29uc3RydWN0b3JcbiAgICAvLy8vLy8vLy8vLy8vLy8vXG5cbiAgICB2YXIgVUFQYXJzZXIgPSBmdW5jdGlvbiAodWEsIGV4dGVuc2lvbnMpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHVhID09PSBPQkpfVFlQRSkge1xuICAgICAgICAgICAgZXh0ZW5zaW9ucyA9IHVhO1xuICAgICAgICAgICAgdWEgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVUFQYXJzZXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFVBUGFyc2VyKHVhLCBleHRlbnNpb25zKS5nZXRSZXN1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBfdWEgPSB1YSB8fCAoKHR5cGVvZiB3aW5kb3cgIT09IFVOREVGX1RZUEUgJiYgd2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkgPyB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCA6IEVNUFRZKTtcbiAgICAgICAgdmFyIF9yZ3htYXAgPSBleHRlbnNpb25zID8gZXh0ZW5kKHJlZ2V4ZXMsIGV4dGVuc2lvbnMpIDogcmVnZXhlcztcblxuICAgICAgICB0aGlzLmdldEJyb3dzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2Jyb3dzZXIgPSB7fTtcbiAgICAgICAgICAgIF9icm93c2VyW05BTUVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgX2Jyb3dzZXJbVkVSU0lPTl0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZ3hNYXBwZXIuY2FsbChfYnJvd3NlciwgX3VhLCBfcmd4bWFwLmJyb3dzZXIpO1xuICAgICAgICAgICAgX2Jyb3dzZXIubWFqb3IgPSBtYWpvcml6ZShfYnJvd3Nlci52ZXJzaW9uKTtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3NlcjtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRDUFUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2NwdSA9IHt9O1xuICAgICAgICAgICAgX2NwdVtBUkNISVRFQ1RVUkVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmd4TWFwcGVyLmNhbGwoX2NwdSwgX3VhLCBfcmd4bWFwLmNwdSk7XG4gICAgICAgICAgICByZXR1cm4gX2NwdTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXREZXZpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2RldmljZSA9IHt9O1xuICAgICAgICAgICAgX2RldmljZVtWRU5ET1JdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgX2RldmljZVtNT0RFTF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBfZGV2aWNlW1RZUEVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmd4TWFwcGVyLmNhbGwoX2RldmljZSwgX3VhLCBfcmd4bWFwLmRldmljZSk7XG4gICAgICAgICAgICByZXR1cm4gX2RldmljZTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRFbmdpbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2VuZ2luZSA9IHt9O1xuICAgICAgICAgICAgX2VuZ2luZVtOQU1FXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIF9lbmdpbmVbVkVSU0lPTl0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICByZ3hNYXBwZXIuY2FsbChfZW5naW5lLCBfdWEsIF9yZ3htYXAuZW5naW5lKTtcbiAgICAgICAgICAgIHJldHVybiBfZW5naW5lO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldE9TID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIF9vcyA9IHt9O1xuICAgICAgICAgICAgX29zW05BTUVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgX29zW1ZFUlNJT05dID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgcmd4TWFwcGVyLmNhbGwoX29zLCBfdWEsIF9yZ3htYXAub3MpO1xuICAgICAgICAgICAgcmV0dXJuIF9vcztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5nZXRSZXN1bHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVhICAgICAgOiB0aGlzLmdldFVBKCksXG4gICAgICAgICAgICAgICAgYnJvd3NlciA6IHRoaXMuZ2V0QnJvd3NlcigpLFxuICAgICAgICAgICAgICAgIGVuZ2luZSAgOiB0aGlzLmdldEVuZ2luZSgpLFxuICAgICAgICAgICAgICAgIG9zICAgICAgOiB0aGlzLmdldE9TKCksXG4gICAgICAgICAgICAgICAgZGV2aWNlICA6IHRoaXMuZ2V0RGV2aWNlKCksXG4gICAgICAgICAgICAgICAgY3B1ICAgICA6IHRoaXMuZ2V0Q1BVKClcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0VUEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3VhO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldFVBID0gZnVuY3Rpb24gKHVhKSB7XG4gICAgICAgICAgICBfdWEgPSAodHlwZW9mIHVhID09PSBTVFJfVFlQRSAmJiB1YS5sZW5ndGggPiBVQV9NQVhfTEVOR1RIKSA/IHRyaW0odWEsIFVBX01BWF9MRU5HVEgpIDogdWE7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZXRVQShfdWEpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgVUFQYXJzZXIuVkVSU0lPTiA9IExJQlZFUlNJT047XG4gICAgVUFQYXJzZXIuQlJPV1NFUiA9ICBlbnVtZXJpemUoW05BTUUsIFZFUlNJT04sIE1BSk9SXSk7XG4gICAgVUFQYXJzZXIuQ1BVID0gZW51bWVyaXplKFtBUkNISVRFQ1RVUkVdKTtcbiAgICBVQVBhcnNlci5ERVZJQ0UgPSBlbnVtZXJpemUoW01PREVMLCBWRU5ET1IsIFRZUEUsIENPTlNPTEUsIE1PQklMRSwgU01BUlRUViwgVEFCTEVULCBXRUFSQUJMRSwgRU1CRURERURdKTtcbiAgICBVQVBhcnNlci5FTkdJTkUgPSBVQVBhcnNlci5PUyA9IGVudW1lcml6ZShbTkFNRSwgVkVSU0lPTl0pO1xuXG4gICAgLy8vLy8vLy8vLy9cbiAgICAvLyBFeHBvcnRcbiAgICAvLy8vLy8vLy8vXG5cbiAgICAvLyBjaGVjayBqcyBlbnZpcm9ubWVudFxuICAgIGlmICh0eXBlb2YoZXhwb3J0cykgIT09IFVOREVGX1RZUEUpIHtcbiAgICAgICAgLy8gbm9kZWpzIGVudlxuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gVU5ERUZfVFlQRSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gVUFQYXJzZXI7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0cy5VQVBhcnNlciA9IFVBUGFyc2VyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJlcXVpcmVqcyBlbnYgKG9wdGlvbmFsKVxuICAgICAgICBpZiAodHlwZW9mKGRlZmluZSkgPT09IEZVTkNfVFlQRSAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBVQVBhcnNlcjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFVOREVGX1RZUEUpIHtcbiAgICAgICAgICAgIC8vIGJyb3dzZXIgZW52XG4gICAgICAgICAgICB3aW5kb3cuVUFQYXJzZXIgPSBVQVBhcnNlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGpRdWVyeS9aZXB0byBzcGVjaWZpYyAob3B0aW9uYWwpXG4gICAgLy8gTm90ZTpcbiAgICAvLyAgIEluIEFNRCBlbnYgdGhlIGdsb2JhbCBzY29wZSBzaG91bGQgYmUga2VwdCBjbGVhbiwgYnV0IGpRdWVyeSBpcyBhbiBleGNlcHRpb24uXG4gICAgLy8gICBqUXVlcnkgYWx3YXlzIGV4cG9ydHMgdG8gZ2xvYmFsIHNjb3BlLCB1bmxlc3MgalF1ZXJ5Lm5vQ29uZmxpY3QodHJ1ZSkgaXMgdXNlZCxcbiAgICAvLyAgIGFuZCB3ZSBzaG91bGQgY2F0Y2ggdGhhdC5cbiAgICB2YXIgJCA9IHR5cGVvZiB3aW5kb3cgIT09IFVOREVGX1RZUEUgJiYgKHdpbmRvdy5qUXVlcnkgfHwgd2luZG93LlplcHRvKTtcbiAgICBpZiAoJCAmJiAhJC51YSkge1xuICAgICAgICB2YXIgcGFyc2VyID0gbmV3IFVBUGFyc2VyKCk7XG4gICAgICAgICQudWEgPSBwYXJzZXIuZ2V0UmVzdWx0KCk7XG4gICAgICAgICQudWEuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlci5nZXRVQSgpO1xuICAgICAgICB9O1xuICAgICAgICAkLnVhLnNldCA9IGZ1bmN0aW9uICh1YSkge1xuICAgICAgICAgICAgcGFyc2VyLnNldFVBKHVhKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBwYXJzZXIuZ2V0UmVzdWx0KCk7XG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICQudWFbcHJvcF0gPSByZXN1bHRbcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG59KSh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyA/IHdpbmRvdyA6IHRoaXMpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIl9fd2VicGFja19yZXF1aXJlX18uYW1kTyA9IHt9OyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2RlbW8vY21wL2pzL2NtcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==