/* Credit to http://phpjs.org/ */

/* 
   These library methods are used because the original Taxee is written in PHP
   and my lack of familiary with many of the built-in PHP methods.
*/

function str_replace(search, replace, subject, count) {
    //  discuss at: http://phpjs.org/functions/str_replace/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Gabriel Paderni
    // improved by: Philip Peterson
    // improved by: Simon Willison (http://simonwillison.net)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Onno Marsman
    // improved by: Brett Zamir (http://brett-zamir.me)
    //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // bugfixed by: Anton Ongson
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Oleg Eremeev
    //    input by: Onno Marsman
    //    input by: Brett Zamir (http://brett-zamir.me)
    //    input by: Oleg Eremeev
    //        note: The count parameter must be passed as a string in order
    //        note: to find a global variable in which the result will be given
    //   example 1: str_replace(' ', '.', 'Kevin van Zonneveld');
    //   returns 1: 'Kevin.van.Zonneveld'
    //   example 2: str_replace(['{name}', 'l'], ['hello', 'm'], '{name}, lars');
    //   returns 2: 'hemmo, mars'
    // bugfixed by: Glen Arason (http://CanadianDomainRegistry.ca)
    //   example 3: str_replace(Array('S','F'),'x','ASDFASDF');
    //   returns 3: 'AxDxAxDx'
    // bugfixed by: Glen Arason (http://CanadianDomainRegistry.ca) Corrected count
    //   example 4: str_replace(['A','D'], ['x','y'] , 'ASDFASDF' , 'cnt');
    //   returns 4: 'xSyFxSyF' // cnt = 0 (incorrect before fix)
    //   returns 4: 'xSyFxSyF' // cnt = 4 (correct after fix)

    var i = 0,
        j = 0,
        temp = '',
        repl = '',
        sl = 0,
        fl = 0,
        f = [].concat(search),
        r = [].concat(replace),
        s = subject,
        ra = Object.prototype.toString.call(r) === '[object Array]',
        sa = Object.prototype.toString.call(s) === '[object Array]';
    s = [].concat(s);

    if(typeof(search) === 'object' && typeof(replace) === 'string' ) {
        temp = replace;
        replace = new Array();
        for (i=0; i < search.length; i+=1) {
            replace[i] = temp;
        }
        temp = '';
        r = [].concat(replace);
        ra = Object.prototype.toString.call(r) === '[object Array]';
    }

    if (count) {
        this.window[count] = 0;
    }

    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue;
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + '';
            repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
            s[i] = (temp)
                .split(f[j])
                .join(repl);
            if (count) {
                this.window[count] += ((temp.split(f[j])).length - 1);
            }
        }
    }
    return sa ? s : s[0];
}


function array_search(needle, haystack, argStrict) {
    //  discuss at: http://phpjs.org/functions/array_search/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //    input by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //  depends on: array
    //        test: skip
    //   example 1: array_search('zonneveld', {firstname: 'kevin', middle: 'van', surname: 'zonneveld'});
    //   returns 1: 'surname'
    //   example 2: ini_set('phpjs.return_phpjs_arrays', 'on');
    //   example 2: var ordered_arr = array({3:'value'}, {2:'value'}, {'a':'value'}, {'b':'value'});
    //   example 2: var key = array_search(/val/g, ordered_arr); // or var key = ordered_arr.search(/val/g);
    //   returns 2: '3'

    var strict = !! argStrict,
        key = '';

    if (haystack && typeof haystack === 'object' && haystack.change_key_case) {
        // Duck-type check for our own array()-created PHPJS_Array
        return haystack.search(needle, argStrict);
    }
    if (typeof needle === 'object' && needle.exec) {
        // Duck-type for RegExp
        if (!strict) {
            // Let's consider case sensitive searches as strict
            var flags = 'i' + (needle.global ? 'g' : '') +
                (needle.multiline ? 'm' : '') +
                    // sticky is FF only
                (needle.sticky ? 'y' : '');
            needle = new RegExp(needle.source, flags);
        }
        for (key in haystack) {
            if(haystack.hasOwnProperty(key)){
                if (needle.test(haystack[key])) {
                    return key;
                }
            }
        }
        return false;
    }

    for (key in haystack) {
        if(haystack.hasOwnProperty(key)){
            if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
                return key;
            }
        }
    }

    return false;
}


function in_array(needle, haystack, argStrict) {
    //  discuss at: http://phpjs.org/functions/in_array/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: vlado houba
    // improved by: Jonas Sciangula Street (Joni2Back)
    //    input by: Billy
    // bugfixed by: Brett Zamir (http://brett-zamir.me)
    //   example 1: in_array('van', ['Kevin', 'van', 'Zonneveld']);
    //   returns 1: true
    //   example 2: in_array('vlado', {0: 'Kevin', vlado: 'van', 1: 'Zonneveld'});
    //   returns 2: false
    //   example 3: in_array(1, ['1', '2', '3']);
    //   example 3: in_array(1, ['1', '2', '3'], false);
    //   returns 3: true
    //   returns 3: true
    //   example 4: in_array(1, ['1', '2', '3'], true);
    //   returns 4: false

    var key = '',
        strict = !! argStrict;

    //we prevent the double check (strict && arr[key] === ndl) || (!strict && arr[key] == ndl)
    //in just one for, in order to improve the performance
    //deciding wich type of comparation will do before walk array
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }

    return false;
}

function count(mixed_var, mode) {
    //  discuss at: http://phpjs.org/functions/count/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //    input by: Waldo Malqui Silva (http://waldo.malqui.info)
    //    input by: merabi
    // bugfixed by: Soren Hansen
    // bugfixed by: Olivier Louvignes (http://mg-crea.com/)
    // improved by: Brett Zamir (http://brett-zamir.me)
    //   example 1: count([[0,0],[0,-4]], 'COUNT_RECURSIVE');
    //   returns 1: 6
    //   example 2: count({'one' : [1,2,3,4,5]}, 'COUNT_RECURSIVE');
    //   returns 2: 6

    var key, cnt = 0;

    if (mixed_var === null || typeof mixed_var === 'undefined') {
        return 0;
    } else if (mixed_var.constructor !== Array && mixed_var.constructor !== Object) {
        return 1;
    }

    if (mode === 'COUNT_RECURSIVE') {
        mode = 1;
    }
    if (mode != 1) {
        mode = 0;
    }

    for (key in mixed_var) {
        if (mixed_var.hasOwnProperty(key)) {
            cnt++;
            if (mode == 1 && mixed_var[key] && (mixed_var[key].constructor === Array || mixed_var[key].constructor ===
                Object)) {
                cnt += this.count(mixed_var[key], 1);
            }
        }
    }

    return cnt;
}

function sizeof(mixed_var, mode) {
// discuss at: http://phpjs.org/functions/sizeof/
// original by: Philip Peterson
// depends on: count
// example 1: sizeof([[0,0],[0,-4]], 'COUNT_RECURSIVE');
// returns 1: 6
// example 2: sizeof({'one' : [1,2,3,4,5]}, 'COUNT_RECURSIVE');
// returns 2: 6
    return this.count(mixed_var, mode);
}

function number_format(number, decimals, dec_point, thousands_sep) {
    //  discuss at: http://phpjs.org/functions/number_format/
    // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: davook
    // improved by: Brett Zamir (http://brett-zamir.me)
    // improved by: Brett Zamir (http://brett-zamir.me)
    // improved by: Theriault
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // bugfixed by: Michael White (http://getsprink.com)
    // bugfixed by: Benjamin Lupton
    // bugfixed by: Allan Jensen (http://www.winternet.no)
    // bugfixed by: Howard Yeend
    // bugfixed by: Diogo Resende
    // bugfixed by: Rival
    // bugfixed by: Brett Zamir (http://brett-zamir.me)
    //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    //  revised by: Luke Smith (http://lucassmith.name)
    //    input by: Kheang Hok Chin (http://www.distantia.ca/)
    //    input by: Jay Klehr
    //    input by: Amir Habibi (http://www.residence-mixte.com/)
    //    input by: Amirouche
    //   example 1: number_format(1234.56);
    //   returns 1: '1,235'
    //   example 2: number_format(1234.56, 2, ',', ' ');
    //   returns 2: '1 234,56'
    //   example 3: number_format(1234.5678, 2, '.', '');
    //   returns 3: '1234.57'
    //   example 4: number_format(67, 2, ',', '.');
    //   returns 4: '67,00'
    //   example 5: number_format(1000);
    //   returns 5: '1,000'
    //   example 6: number_format(67.311, 2);
    //   returns 6: '67.31'
    //   example 7: number_format(1000.55, 1);
    //   returns 7: '1,000.6'
    //   example 8: number_format(67000, 5, ',', '.');
    //   returns 8: '67.000,00000'
    //   example 9: number_format(0.9, 0);
    //   returns 9: '1'
    //  example 10: number_format('1.20', 2);
    //  returns 10: '1.20'
    //  example 11: number_format('1.20', 4);
    //  returns 11: '1.2000'
    //  example 12: number_format('1.2000', 3);
    //  returns 12: '1.200'
    //  example 13: number_format('1 000,50', 2, '.', ' ');
    //  returns 13: '100 050.00'
    //  example 14: number_format(1e-8, 8, '.', '');
    //  returns 14: '0.00000001'

    number = (number + '')
        .replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + (Math.round(n * k) / k)
                    .toFixed(prec);
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
        .split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '')
            .length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1)
            .join('0');
    }
    return s.join(dec);
}

function round(value, precision, mode) {
    //  discuss at: http://phpjs.org/functions/round/
    // original by: Philip Peterson
    //  revised by: Onno Marsman
    //  revised by: T.Wild
    //  revised by: Rafal Kukawski (http://blog.kukawski.pl/)
    //    input by: Greenseed
    //    input by: meo
    //    input by: William
    //    input by: Josep Sanz (http://www.ws3.es/)
    // bugfixed by: Brett Zamir (http://brett-zamir.me)
    //        note: Great work. Ideas for improvement:
    //        note: - code more compliant with developer guidelines
    //        note: - for implementing PHP constant arguments look at
    //        note: the pathinfo() function, it offers the greatest
    //        note: flexibility & compatibility possible
    //   example 1: round(1241757, -3);
    //   returns 1: 1242000
    //   example 2: round(3.6);
    //   returns 2: 4
    //   example 3: round(2.835, 2);
    //   returns 3: 2.84
    //   example 4: round(1.1749999999999, 2);
    //   returns 4: 1.17
    //   example 5: round(58551.799999999996, 2);
    //   returns 5: 58551.8

    var m, f, isHalf, sgn; // helper variables
    // making sure precision is integer
    precision |= 0;
    m = Math.pow(10, precision);
    value *= m;
    // sign of the number
    sgn = (value > 0) | -(value < 0);
    isHalf = value % 1 === 0.5 * sgn;
    f = Math.floor(value);

    if (isHalf) {
        switch (mode) {
            case 'PHP_ROUND_HALF_DOWN':
                // rounds .5 toward zero
                value = f + (sgn < 0);
                break;
            case 'PHP_ROUND_HALF_EVEN':
                // rouds .5 towards the next even integer
                value = f + (f % 2 * sgn);
                break;
            case 'PHP_ROUND_HALF_ODD':
                // rounds .5 towards the next odd integer
                value = f + !(f % 2);
                break;
            default:
                // rounds .5 away from zero
                value = f + (sgn > 0);
        }
    }

    return (isHalf ? value : Math.round(value)) / m;
}

function file_get_contents(url, flags, context, offset, maxLen) {
    //  discuss at: http://phpjs.org/functions/file_get_contents/
    // original by: Legaev Andrey
    //    input by: Jani Hartikainen
    //    input by: Raphael (Ao) RUDLER
    // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // improved by: Brett Zamir (http://brett-zamir.me)
    // bugfixed by: Brett Zamir (http://brett-zamir.me)
    //        note: This function uses XmlHttpRequest and cannot retrieve resource from different domain without modifications.
    //        note: Synchronous by default (as in PHP) so may lock up browser. Can
    //        note: get async by setting a custom "phpjs.async" property to true and "notification" for an
    //        note: optional callback (both as context params, with responseText, and other JS-specific
    //        note: request properties available via 'this'). Note that file_get_contents() will not return the text
    //        note: in such a case (use this.responseText within the callback). Or, consider using
    //        note: jQuery's: $('#divId').load('http://url') instead.
    //        note: The context argument is only implemented for http, and only partially (see below for
    //        note: "Presently unimplemented HTTP context options"); also the arguments passed to
    //        note: notification are incomplete
    //        test: skip
    //   example 1: var buf file_get_contents('http://google.com');
    //   example 1: buf.indexOf('Google') !== -1
    //   returns 1: true

    var tmp, headers = [],
        newTmp = [],
        k = 0,
        i = 0,
        href = '',
        pathPos = -1,
        flagNames = 0,
        content = null,
        http_stream = false;
    var func = function (value) {
        return value.substring(1) !== '';
    };

    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT
    var ini = this.php_js.ini;
    context = context || this.php_js.default_streams_context || null;

    if (!flags) {
        flags = 0;
    }
    var OPTS = {
        FILE_USE_INCLUDE_PATH: 1,
        FILE_TEXT: 32,
        FILE_BINARY: 64
    };
    if (typeof flags === 'number') {
        // Allow for a single string or an array of string flags
        flagNames = flags;
    } else {
        flags = [].concat(flags);
        for (i = 0; i < flags.length; i++) {
            if (OPTS[flags[i]]) {
                flagNames = flagNames | OPTS[flags[i]];
            }
        }
    }

    if (flagNames & OPTS.FILE_BINARY && (flagNames & OPTS.FILE_TEXT)) {
        // These flags shouldn't be together
        throw 'You cannot pass both FILE_BINARY and FILE_TEXT to file_get_contents()';
    }

    if ((flagNames & OPTS.FILE_USE_INCLUDE_PATH) && ini.include_path && ini.include_path.local_value) {
        var slash = ini.include_path.local_value.indexOf('/') !== -1 ? '/' : '\\';
        url = ini.include_path.local_value + slash + url;
    } else if (!/^(https?|file):/.test(url)) {
        // Allow references within or below the same directory (should fix to allow other relative references or root reference; could make dependent on parse_url())
        href = this.window.location.href;
        pathPos = url.indexOf('/') === 0 ? href.indexOf('/', 8) - 1 : href.lastIndexOf('/');
        url = href.slice(0, pathPos + 1) + url;
    }

    var http_options;
    if (context) {
        http_options = context.stream_options && context.stream_options.http;
        http_stream = !!http_options;
    }

    if (!context || !context.stream_options || http_stream) {
        var req = this.window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
        if (!req) {
            throw new Error('XMLHttpRequest not supported');
        }

        var method = http_stream ? http_options.method : 'GET';
        var async = !! (context && context.stream_params && context.stream_params['phpjs.async']);

        if (ini['phpjs.ajaxBypassCache'] && ini['phpjs.ajaxBypassCache'].local_value) {
            url += (url.match(/\?/) == null ? '?' : '&') + (new Date())
                .getTime(); // Give optional means of forcing bypass of cache
        }

        req.open(method, url, async);
        if (async) {
            var notification = context.stream_params.notification;
            if (typeof notification === 'function') {
                // Fix: make work with req.addEventListener if available: https://developer.mozilla.org/En/Using_XMLHttpRequest
                if (0 && req.addEventListener) {
                    // Unimplemented so don't allow to get here
                    /*
                     req.addEventListener('progress', updateProgress, false);
                     req.addEventListener('load', transferComplete, false);
                     req.addEventListener('error', transferFailed, false);
                     req.addEventListener('abort', transferCanceled, false);
                     */
                } else {
                    req.onreadystatechange = function (aEvt) {
                        // aEvt has stopPropagation(), preventDefault(); see https://developer.mozilla.org/en/NsIDOMEvent
                        // Other XMLHttpRequest properties: multipart, responseXML, status, statusText, upload, withCredentials
                        /*
                         PHP Constants:
                         STREAM_NOTIFY_RESOLVE   1       A remote address required for this stream has been resolved, or the resolution failed. See severity  for an indication of which happened.
                         STREAM_NOTIFY_CONNECT   2     A connection with an external resource has been established.
                         STREAM_NOTIFY_AUTH_REQUIRED 3     Additional authorization is required to access the specified resource. Typical issued with severity level of STREAM_NOTIFY_SEVERITY_ERR.
                         STREAM_NOTIFY_MIME_TYPE_IS  4     The mime-type of resource has been identified, refer to message for a description of the discovered type.
                         STREAM_NOTIFY_FILE_SIZE_IS  5     The size of the resource has been discovered.
                         STREAM_NOTIFY_REDIRECTED    6     The external resource has redirected the stream to an alternate location. Refer to message .
                         STREAM_NOTIFY_PROGRESS  7     Indicates current progress of the stream transfer in bytes_transferred and possibly bytes_max as well.
                         STREAM_NOTIFY_COMPLETED 8     There is no more data available on the stream.
                         STREAM_NOTIFY_FAILURE   9     A generic error occurred on the stream, consult message and message_code for details.
                         STREAM_NOTIFY_AUTH_RESULT   10     Authorization has been completed (with or without success).

                         STREAM_NOTIFY_SEVERITY_INFO 0     Normal, non-error related, notification.
                         STREAM_NOTIFY_SEVERITY_WARN 1     Non critical error condition. Processing may continue.
                         STREAM_NOTIFY_SEVERITY_ERR  2     A critical error occurred. Processing cannot continue.
                         */
                        var objContext = {
                            responseText: req.responseText,
                            responseXML: req.responseXML,
                            status: req.status,
                            statusText: req.statusText,
                            readyState: req.readyState,
                            evt: aEvt
                        }; // properties are not available in PHP, but offered on notification via 'this' for convenience
                        // notification args: notification_code, severity, message, message_code, bytes_transferred, bytes_max (all int's except string 'message')
                        // Need to add message, etc.
                        var bytes_transferred;
                        switch (req.readyState) {
                            case 0:
                                //     UNINITIALIZED     open() has not been called yet.
                                notification.call(objContext, 0, 0, '', 0, 0, 0);
                                break;
                            case 1:
                                //     LOADING     send() has not been called yet.
                                notification.call(objContext, 0, 0, '', 0, 0, 0);
                                break;
                            case 2:
                                //     LOADED     send() has been called, and headers and status are available.
                                notification.call(objContext, 0, 0, '', 0, 0, 0);
                                break;
                            case 3:
                                //     INTERACTIVE     Downloading; responseText holds partial data.
                                // One character is two bytes
                                bytes_transferred = req.responseText.length * 2;
                                notification.call(objContext, 7, 0, '', 0, bytes_transferred, 0);
                                break;
                            case 4:
                                //     COMPLETED     The operation is complete.
                                if (req.status >= 200 && req.status < 400) {
                                    // One character is two bytes
                                    bytes_transferred = req.responseText.length * 2;
                                    notification.call(objContext, 8, 0, '', req.status, bytes_transferred, 0);
                                } else if (req.status === 403) {
                                    // Fix: These two are finished except for message
                                    notification.call(objContext, 10, 2, '', req.status, 0, 0);
                                } else {
                                    // Errors
                                    notification.call(objContext, 9, 2, '', req.status, 0, 0);
                                }
                                break;
                            default:
                                throw 'Unrecognized ready state for file_get_contents()';
                        }
                    };
                }
            }
        }

        if (http_stream) {
            var sendHeaders = (http_options.header && http_options.header.split(/\r?\n/)) || [];
            var userAgentSent = false;
            for (i = 0; i < sendHeaders.length; i++) {
                var sendHeader = sendHeaders[i];
                var breakPos = sendHeader.search(/:\s*/);
                var sendHeaderName = sendHeader.substring(0, breakPos);
                req.setRequestHeader(sendHeaderName, sendHeader.substring(breakPos + 1));
                if (sendHeaderName === 'User-Agent') {
                    userAgentSent = true;
                }
            }
            if (!userAgentSent) {
                var user_agent = http_options.user_agent || (ini.user_agent && ini.user_agent.local_value);
                if (user_agent) {
                    req.setRequestHeader('User-Agent', user_agent);
                }
            }
            content = http_options.content || null;
            /*
             // Presently unimplemented HTTP context options
             // When set to TRUE, the entire URI will be used when constructing the request. (i.e. GET http://www.example.com/path/to/file.html HTTP/1.0). While this is a non-standard request format, some proxy servers require it.
             var request_fulluri = http_options.request_fulluri || false;
             // The max number of redirects to follow. Value 1 or less means that no redirects are followed.
             var max_redirects = http_options.max_redirects || 20;
             // HTTP protocol version
             var protocol_version = http_options.protocol_version || 1.0;
             // Read timeout in seconds, specified by a float
             var timeout = http_options.timeout || (ini.default_socket_timeout && ini.default_socket_timeout.local_value);
             // Fetch the content even on failure status codes.
             var ignore_errors = http_options.ignore_errors || false;
             */
        }

        if (flagNames & OPTS.FILE_TEXT) {
            // Overrides how encoding is treated (regardless of what is returned from the server)
            var content_type = 'text/html';
            if (http_options && http_options['phpjs.override']) {
                // Fix: Could allow for non-HTTP as well
                // We use this, e.g., in gettext-related functions if character set
                content_type = http_options['phpjs.override'];
                //   overridden earlier by bind_textdomain_codeset()
            } else {
                var encoding = (ini['unicode.stream_encoding'] && ini['unicode.stream_encoding'].local_value) ||
                    'UTF-8';
                if (http_options && http_options.header && (/^content-type:/im)
                        .test(http_options.header)) {
                    // We'll assume a content-type expects its own specified encoding if present
                    // We let any header encoding stand
                    content_type = http_options.header.match(/^content-type:\s*(.*)$/im)[1];
                }
                if (!(/;\s*charset=/)
                        .test(content_type)) {
                    // If no encoding
                    content_type += '; charset=' + encoding;
                }
            }
            req.overrideMimeType(content_type);
        }
        // Default is FILE_BINARY, but for binary, we apparently deviate from PHP in requiring the flag, since many if not
        //     most people will also want a way to have it be auto-converted into native JavaScript text instead
        else if (flagNames & OPTS.FILE_BINARY) {
            // Trick at https://developer.mozilla.org/En/Using_XMLHttpRequest to get binary
            req.overrideMimeType('text/plain; charset=x-user-defined');
            // Getting an individual byte then requires:
            // throw away high-order byte (f7) where x is 0 to responseText.length-1 (see notes in our substr())
            // responseText.charCodeAt(x) & 0xFF;
        }

        try {
            if (http_options && http_options['phpjs.sendAsBinary']) {
                // For content sent in a POST or PUT request (use with file_put_contents()?)
                // In Firefox, only available FF3+
                req.sendAsBinary(content);
            } else {
                req.send(content);
            }
        } catch (e) {
            // catches exception reported in issue #66
            return false;
        }

        tmp = req.getAllResponseHeaders();
        if (tmp) {
            tmp = tmp.split('\n');
            for (k = 0; k < tmp.length; k++) {
                if (func(tmp[k])) {
                    newTmp.push(tmp[k]);
                }
            }
            tmp = newTmp;
            for (i = 0; i < tmp.length; i++) {
                headers[i] = tmp[i];
            }
            // see http://php.net/manual/en/reserved.variables.httpresponseheader.php
            this.$http_response_header = headers;
        }

        if (offset || maxLen) {
            if (maxLen) {
                return req.responseText.substr(offset || 0, maxLen);
            }
            return req.responseText.substr(offset);
        }
        return req.responseText;
    }
    return false;
}
