import http from 'k6/http';
import { check, fail } from 'k6';
//Cookies
export function logCookie(cookie) {
    // For full list of attributes see: https://k6.io/docs/using-k6/cookies#properties-of-a-response-cookie-object
    console.log(
        `\t${cookie.name}: ${cookie.value}\n\tdomain: ${cookie.domain}\n\tpath: ${cookie.path}\n\texpires: ${cookie.expires}\n\thttpOnly: ${cookie.http_only}`
    );
}

/*function extractCookiesFromResponse(response){
    let cookies = [];
    for (const name in response.cookies) {
        if (response.cookies.hasOwnProperty(name) !== undefined) {
            let definition = response.cookies[name][0];
            let cookie = {
                name:definition.name,
                value:definition.value,
                options: {
                    domain: definition.domain,
                    path: definition.path,
                    expires: definition.expires,
                    secure: definition.secure
                }
            };
            cookies.push(cookie);
        }
    }
    return cookies;
}*/

export function logCookiesFromResponse(response) {
    //Cookies seen by K6
    console.log(`>>>Cookies for ${response.url}`);
    for (const name in response.cookies) {
        if (response.cookies.hasOwnProperty(name) !== undefined) {
            logCookie(response.cookies[name][0]);
        }
    }
    console.log(`<<<Cookies for ${response.url}`);
}

export function extractCookiesFromHeaders(response){
    let cookies = [];
    let headers = new Map(Object.entries(response.headers));        
    headers.forEach((v,k) => {
        if(k === "Set-Cookie"){
            let cookie = parseSetCookie(v);            
            cookies.push(cookie);
        }
    });
    return cookies;
}

export function logCookiesFromHeaders(response) {
    //Cookies from headers
    console.log(`>>>SetCookies for ${response.url}`);
    let headers = new Map(Object.entries(response.headers));        
    headers.forEach((v,k) => {
        if(k === "Set-Cookie"){
            console.log(`\t${v}`);
        }
    });
    console.log(`<<<SetCookies for ${response.url}`)
}

export function logCookies(response) {
    logCookiesFromResponse(response);
    logCookiesFromHeaders(response);
}

export function parseSetCookie(definition){
    let cookie = {
        name:undefined, 
        value:undefined, 
        decodedName: undefined,
        decodedValue:undefined,
        options: {
            domain: undefined,
            path: undefined,
            expires: undefined,
            secure: undefined,
        }
    };
    definition
        .split(';')
        .map(v => v.split('='))
        .reduce((acc, v) => {
            let rawKey = v[0].trim();
            let rawValue = v[1]?v[1].trim():"";
            let key = decodeURIComponent(rawKey);
            let value = decodeURIComponent(rawValue);
            if (! acc.name){
                acc.name = rawKey;
                acc.value = rawValue;
                acc.decodedName = key;
                acc.decodedValue = value;
            }
            else {
                switch(key){
                    case "Domain":
                        acc.options.domain = value;
                        break;
                    case "Path":
                        acc.options.path =  value;
                        break;
                    case "Expires":
                        acc.options.expires = value;
                        break;
                    case "Secure":
                        acc.options.secure = false;
                        break;
                    case "SameSite":
                        //Not mapped in K6
                        break;
                }
            }
            return acc;
        }, cookie);
    return cookie;
}

export function processCookies(response, context){
    //Extract cookies from response and save then in a map
    let cookies = extractCookiesFromHeaders(response);
    cookies.forEach(cookie => {
        context[cookie.name] = encodeURIComponent(cookie.value);
    });
}

//Navigation
export function call(url, params){
    //Get target url
    let target = http.get(url, params);
    check(target, {'success': (r) => r.status === 200});
    //Call target url
    let targetUrl = (target? target.body: undefined);
    if(!targetUrl){
        fail(`Invalid target url returned by ${url}`);
        return;
    }

    let response = http.get(targetUrl, params);
    check(response, {'success': (r) => r.status === 200});
    if(response.status === 400)
        console.log(targetUrl);
    return response;
}

export function simpleGet(url){
    let response = http.get(url);
    check(response, {'success': (r) => r.status === 200});
    console.log(response);
    return response;
}
export function simplePost(url, params, data){
    params.headers['Content-Type']='text/plain;charset=UTF-8';
    let encodedData = JSON.stringify(data);
    let result = http.post(url, encodedData, params);
    if(result.status !== 200){
        console.error(result);        
    }
    check(result, {'success': (r) => r.status === 200});
    return result;
}

export function redirectPost(url, params, data){
    params.headers['Content-Type']='text/plain;charset=UTF-8';
    let encodedData = JSON.stringify(data);
    //Get target url
    let target = http.post(url, encodedData, params);
    if(target.status !== 200){
        console.error(target.body);        
    }
    check(target, {'success': (r) => r.status === 200});
    //Call target url
    let response = http.post(target.body, encodedData, params);    
    if(response.status !== 200){
        console.error("Failed", response.status, target.body, response.body);
    }
    check(response, {'success': (r) => r.status === 200});
    return response;
}