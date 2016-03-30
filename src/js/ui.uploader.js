
/**
 var uploader = new lupload.Uploader({
     trigger: ".upload",
     url: "index.php?route=tool/upload/image",
     filters: [{extensions: "png,jpg"}],
     multipart_params: {contentType: "text/html"}
 });

 uploader
     .on(lupload.EVENT_ERROR, function (uploader, msg) {
        console.log("ERROR", msg);
     })
     .on(lupload.EVENT_FILE_UPLOAD_COMPLETE, function (me, file, res) {
        console.log("complete", file, res)
     })
     .init();
 */
+(function (window, undefined) {
    var seed = 0;
    var i18n = {};
    var lupload = {
        //state
        STATE_STOPPED: 1,
        STATE_STARTED: 2,
        STATE_QUEUED: 1,
        STATE_UPLOADING: 2,
        STATE_FAILED: 4,
        STATE_DONE: 5,

        //error code
        ERROR_GENERIC: -100,
        ERROR_HTTP: -200,
        ERROR_IO: -300,
        ERROR_SECURITY: -400,
        ERROR_INIT: -500,
        ERROR_FILE_SIZE: -600,
        ERROR_FILE_EXTENSION: -601,
        ERROR_FILE_COUNT: -602,
        ERROR_IMAGE_FORMAT: -700,
        ERROR_IMAGE_MEMORY: -701,
        ERROR_IMAGE_DIMENSIONS: -702,

        //events
        EVENT_INIT: "init",
        EVENT_INIT_AFTER: "init-after",
        EVENT_FILES_ADD: "files-add",
        EVENT_FILES_REMOVE: "files-remove",
        EVENT_FILES_UPLOAD_COMPLETE: "files-upload-complete",
        EVENT_FILE_UPLOAD_BEFORE: "file-upload-before",
        EVENT_FILE_UPLOAD_START: "file-upload-start",
        EVENT_FILE_UPLOAD_PROGRESS: "file-upload-progress",
        EVENT_FILE_UPLOAD_COMPLETE: "file-upload-complete",
        EVENT_FILE_UPLOAD_CANCEL: "file-upload-cancel",
        EVENT_FILE_UPLOAD_CHUNK: "file-chunk-uploaded",
        EVENT_QUEUE_CHANGE: "queue-change",
        EVENT_START: "start",
        EVENT_STOP: "stop",
        EVENT_REFRESH: "refresh",
        EVENT_BROWSE_DISABLE: "browse-disable",
        EVENT_DISPOSE: "dispose",
        EVENT_ERROR: "error",

        runtimes: [],               //可用的运行时
        guidPrefix: "p",
        guid: function () {
            var s = (new Date).getTime().toString(32);
            for (var i = 0; 5 > i; i++) {
                s += Math.floor(65535 * Math.random()).toString(32)
            }
            return lupload.guidPrefix + s + (seed++).toString(32)
        },
        addRuntime: function (name, properties) {
            properties.name = name;
            lupload.runtimes[name] = properties;
            lupload.runtimes.push(properties);
            return properties
        },
        ua: (function () {
            var d, e, f, a = navigator, b = a.userAgent, c = a.vendor;
            d = /WebKit/.test(b);
            f = d && -1 !== c.indexOf("Apple");
            e = window.opera && window.opera.buildNumber;
            return {
                windows: -1 !== navigator.platform.indexOf("Win"),
                ie: !d && !e && /MSIE/gi.test(b) && /Explorer/gi.test(a.appName),
                webkit: d,
                gecko: !d && /Gecko/.test(b),
                safari: f,
                opera: !!e
            }
        })(),
        mimeTypes: (function (str) {
            var d = {},
                b = str.split(/,/),
                i, j, f;
            for (i = 0; i < b.length; i += 2) {
                f = b[i + 1].split(/ /);
                for (j = 0; j < f.length; j++) {
                    d[f[j]] = b[i];
                }
            }
            return d;
        })("application/msword,doc dot,application/pdf,pdf,application/pgp-signature,pgp,application/postscript,ps ai eps,application/rtf,rtf,application/vnd.ms-excel,xls xlb,application/vnd.ms-powerpoint,ppt pps pot,application/zip,zip,application/x-shockwave-flash,swf swfl,application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx,application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx,application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx,application/vnd.openxmlformats-officedocument.presentationml.template,potx,application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx,application/x-javascript,js,application/json,json,audio/mpeg,mpga mpega mp2 mp3,audio/x-wav,wav,audio/mp4,m4a,image/bmp,bmp,image/gif,gif,image/jpeg,jpeg jpg jpe,image/photoshop,psd,image/png,png,image/svg+xml,svg svgz,image/tiff,tiff tif,text/plain,asc txt text diff log,text/html,htm html xhtml,text/css,css,text/csv,csv,text/rtf,rtf,video/mpeg,mpeg mpg mpe,video/quicktime,qt mov,video/mp4,mp4,video/x-m4v,m4v,video/x-flv,flv,video/x-ms-wmv,wmv,video/avi,avi,video/webm,webm,video/vnd.rn-realvideo,rv,application/vnd.oasis.opendocument.formula-template,otf,application/octet-stream,exe"),
        buildUrl: function (url, params) {
            var qs = "";
            $.each(params, function (name, value) {
                qs += (qs ? "&" : "") + encodeURIComponent(name) + "=" + encodeURIComponent(value);
            });
            qs && (url += (url.indexOf("?") > 0 ? "&" : "?") + qs);
            return url;
        },
        addI18n: function (o) {
            return $.extend(i18n, o);
        },
        translate: function (code) {
            return i18n[code] || code;
        }
    };

    /**
     * @param {Object} options
     */
    var Uploader = function (options) {
        this._map = {};
        this.options = $.extend({
            trigger: null,
            dropElement: "",
            className: "",
            url: '/',               //文件上传URL
            file_data_name: "file", //文件参数名
            multipart_params: {},   //上传时额外post的参数信息
            headers: [],
            multi_selection: true,  //是否支持多文件选择
            multipart: true,
            filters: [],            //[{extensions: "png,jpg"}]
            unique_names: "",
            chunk_size: 0,
            max_file_size: 4000000, //最大文件大小
            max_file_count: 0,
            required_features: '',  //依赖功能，依赖多个功能时用英文逗号分隔
            runtimes: '',           //指定运行时，多个运行时用英文逗号分隔，如"html5,html4"
            init: false             //初始化回调 {false|Function|FunctionArray}
        }, options);

        this.progress = new QueueProgress();
        this.files = [];

        this.id = lupload.guid();
        this.state = lupload.STATE_STOPPED;
        this.runtime = "";
        this.features = {};
        this.timestamp = 0;
        this.disabled = false;
    };
    Uploader.prototype = {
        init: function () {
            var me = this,
                options = this.options;

            //文件已添加
            this.on(lupload.EVENT_FILES_ADD, function (me, files) {
                var filters = options.filters,
                    validFileCount = 0,
                    file, filterReg;

                if (filters && filters.length) {
                    filterReg = [];
                    $.each(filters, function (i, filter) {
                        $.each(filter.extensions.split(/,/), function (i, ext) {
                            filterReg.push(/^\s*\*\s*$/.test(ext) ? "\\.*" : "\\." + ext.replace(new RegExp("[" + "/^$.*+?|()[]{}\\".replace(/./g, "\\$&") + "]", "g"), "\\$&"));
                        });
                    });
                    filterReg = new RegExp(filterReg.join("|") + "$", "i");
                }
                for (var i = 0; i < files.length; i++) {
                    file = files[i];
                    file.loaded = 0;
                    file.percent = 0;
                    file.status = lupload.STATE_QUEUED;

                    if (!filterReg || filterReg.test(file.name)) {
                        if (file.size !== undefined && file.size > options.max_file_size) {
                            me.trigger(lupload.EVENT_ERROR, {
                                code: lupload.ERROR_FILE_SIZE,
                                message: lupload.translate("File size error."),
                                file: file
                            });
                        } else if (options.max_file_count && me.files.length >= options.max_file_count) {
                            me.trigger(lupload.EVENT_ERROR, {
                                code: lupload.ERROR_FILE_COUNT,
                                message: lupload.translate("File count error."),
                                file: file
                            });
                            break;
                        } else {
                            me.files.push(file);
                            validFileCount++;
                        }
                    } else {
                        me.trigger(lupload.EVENT_ERROR, {
                            code: lupload.ERROR_FILE_EXTENSION,
                            message: lupload.translate("File extension error."),
                            file: file
                        });
                    }
                }

                if (validFileCount) {
                    setTimeout(function () {
                        me.trigger(lupload.EVENT_QUEUE_CHANGE);
                        me.refresh();
                    }, 1);
                }
            });

            if (options.unique_names) {
                me.on(lupload.EVENT_FILE_UPLOAD_START, function (me, file) {
                    var reg = file.name.match(/\.([^.]+)$/), //后缀名
                        ext = "tmp";
                    reg && (ext = reg[1]);
                    file.target_name = file.id + "." + ext;
                });
            }

            me.on(lupload.EVENT_FILE_UPLOAD_PROGRESS, function (me, file) {
                file.percent = file.size > 0 ? Math.ceil(file.loaded / file.size * 100) : 100;
                me._updateProgress();
            });

            me.on(lupload.EVENT_QUEUE_CHANGE, function (me) {
                me._updateProgress();
                me.start();
            });

            me.on(lupload.EVENT_ERROR, function (me, error) {
                if (error.file) {
                    error.file.status = lupload.STATE_FAILED;
                    me._updateProgress();
                    if (me.state == lupload.STATE_STARTED) {
                        setTimeout(function () {
                            me._queueUpload.call(me);
                        }, 1);
                    }
                }
            });

            me.on(lupload.EVENT_FILE_UPLOAD_COMPLETE, function (me, file) {
                file.status = lupload.STATE_DONE;
                file.loaded = file.size;
                me.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, file);
                setTimeout(function () {
                    me._queueUpload();
                }, 1);
            });

            var runtimes = [],
                runtimeIndex = 0;
            if (options.runtimes) {
                var requiredRuntimes = options.runtimes.split(/\s?,\s?/);
                for (var i = 0, len = requiredRuntimes.length; i < len; i++) {
                    lupload.runtimes[requiredRuntimes[i]] && runtimes.push(lupload.runtimes[requiredRuntimes[i]]);
                }
            } else {
                runtimes = lupload.runtimes;
            }

            //设置可用的运行时
            function setRuntime() {
                var runtime = runtimes[runtimeIndex++],
                    features, requiredFeatures;

                if (runtime) {
                    features = runtime.getFeatures();
                    requiredFeatures = options.required_features;
                    if (requiredFeatures) {
                        requiredFeatures = requiredFeatures.split(",");
                        for (var i = 0, len = requiredFeatures.length; i < len; i++) {
                            if (!features[requiredFeatures[i]]) {
                                setRuntime();
                                return;
                            }
                        }
                    }
                    runtime.init(me, function (d) {
                        if (d && d.success) {
                            me.features = features;
                            me.runtime = runtime.name;
                            me.trigger(lupload.EVENT_INIT, {runtime: runtime.name});
                            me.trigger(lupload.EVENT_INIT_AFTER);
                            me.refresh();
                        } else {
                            setRuntime();
                        }
                    });
                } else {
                    //没有可用的运行时
                    me.trigger(lupload.EVENT_ERROR, {code: lupload.ERROR_INIT, message: lupload.translate("Init error.")});
                }
            }

            setRuntime();

            if (options.init) {
                typeof options.init == "function" ? options.init(me) : $.each(options.init, function (event, handler) {
                    me.on(event, handler);
                });
            }
        },
        /**
         * 触发事件
         * @param {String} event
         * @returns {boolean}
         */
        trigger: function (event) {
            var args = Array.prototype.slice.call(arguments, 0),
                msg;

            args[0] = this;
            var handlers, handler;
            if (handlers = this._map[event]) {
                var onceEvent = [],
                    i = 0,
                    len = handlers.length;
                for (; i < len; i++) {
                    handler = handlers[i];
                    msg = handler.func.apply(handler.scope, args);
                    handler.once && onceEvent.push(handler.func);
                }
                if (onceEvent.length) {
                    for (i = 0, len = onceEvent.length; i < len; i++) {
                        this.off(event, onceEvent[i]);
                    }
                }
            }
            return msg !== false;
        },

        /**
         * 绑定事件
         * @param {String} event
         * @param {Function} func
         * @param {Object} scope
         * @param {Boolean} once
         */
        on: function (event, func, scope, once) {
            if (typeof (func) !== "function") {
                return this;
            }
            var handlers;
            if (!(handlers = this._map[event])) {
                this._map[event] = handlers = [];
            }
            handlers.push({func: func, scope: scope || this, once: !!once});
            return this;
        },

        /**
         * 绑定事件，触发一次后解除绑定
         * @param {String} event
         * @param {Function} func
         * @param {Object} scope
         */
        once: function (event, func, scope) {
            if (typeof (func) !== "function") {
                return this;
            }
            return this.on(event, func, scope, true);
        },

        /**
         * 解除绑定
         * @param {String} event event name
         * @param {Function} func Subscriber to be remove. If not set, clear all in event
         */
        off: function (event, func) {
            var i = -1, handlers;
            //未传入事件名，则清空所有绑定的事件
            if (!event) {
                this._map = {};

            } else if (func) { //删除指定handler
                handlers = this._map[event];
                for (var j = 0, len = handlers.length; j < len; j++) {
                    if (handlers[j].func === func) {
                        i = j;
                    }
                }

                if (i >= 0) {
                    handlers.splice(i, 1);
                }

            } else { //删除指定事件的所有handler
                this._map[event] = [];
            }
            return this;
        },

        //按队列先后顺序上传图片
        _queueUpload: function () {
            var file, uploadedFileCount = 0;
            if (this.state == lupload.STATE_STARTED) {
                for (var i = 0, len = this.files.length; i < len; i++) {
                    if (file || this.files[i].status != lupload.STATE_QUEUED) {
                        uploadedFileCount++;
                    } else {
                        file = this.files[i];
                        file.status = lupload.STATE_UPLOADING;

                        if (this.trigger(lupload.EVENT_FILE_UPLOAD_BEFORE, file)) {
                            this.trigger(lupload.EVENT_FILE_UPLOAD_START, file);
                        }
                    }
                }

                if (uploadedFileCount == this.files.length) {
                    this.stop();
                    this.trigger(lupload.EVENT_FILES_UPLOAD_COMPLETE, this.files);
                }
            }
        },

        //更新进程统计
        _updateProgress: function () {
            var file;
            this.progress.reset();
            for (var i = 0, len = this.files.length; i < len; i++) {
                file = this.files[i];
                if (file.size !== undefined) {
                    this.progress.size += file.size;
                    this.progress.loaded += file.loaded;
                } else {
                    this.progress.size = undefined;
                }
                if (file.status == lupload.STATE_DONE) {
                    this.progress.uploaded++;
                } else if (file.status == lupload.STATE_FAILED) {
                    this.progress.failed++;
                } else {
                    this.progress.queued++;
                }
            }
            if (this.progress.size === undefined) {
                this.progress.percent = this.files.length > 0 ? Math.ceil(this.progress.uploaded / this.files.length * 100) : 0;
            } else {
                this.progress.bytesPerSec = Math.ceil(this.progress.loaded / ((+new Date - this.timestamp || 1) / 1e3));
                this.progress.percent = this.progress.size > 0 ? Math.ceil(this.progress.loaded / this.progress.size * 100) : 0;
            }
        },

        /**
         * 刷新UI
         */
        refresh: function () {
            this.trigger(lupload.EVENT_REFRESH);
        },

        /**
         * 开启上传
         */
        start: function () {
            if (this.files.length && this.state != lupload.STATE_STARTED) {
                this.state = lupload.STATE_STARTED;
                this.timestamp = +new Date;
                this.trigger(lupload.EVENT_START);
                this._queueUpload();
            }
        },

        /**
         * 关闭上传
         */
        stop: function () {
            if (this.state != lupload.STATE_STOPPED) {
                this.state = lupload.STATE_STOPPED;
                for (var i = this.files.length - 1; i >= 0; i--) {
                    if (this.files[i].status == lupload.STATE_UPLOADING) {
                        this.files[i].status = lupload.STATE_QUEUED;
                        this._updateProgress();
                    }
                }
                this.trigger(lupload.EVENT_FILE_UPLOAD_CANCEL);
                this.trigger(lupload.EVENT_STOP);
            }
        },
        disableBrowse: function () {
            this.disabled = arguments[0] !== undefined ? arguments[0] : true;
            this.trigger(lupload.EVENT_BROWSE_DISABLE, this.disabled);
        },

        /**
         * 获取文件
         * @param id {String} 文件id
         * @returns {File}
         */
        getFile: function (id) {
            var i = this.files.length - 1, file;
            while (file = this.files[i--]) {
                if (file.id === id) {
                    return file;
                }
            }
        },

        /**
         * 删除文件
         * @param id {String}
         */
        removeFile: function (id) {
            for (var i = this.files.length - 1; i >= 0; i--) {
                if (this.files[i].id === id) {
                    return this.splice(i, 1)[0];
                }
            }
        },

        /**
         * 删除指定位置的文件
         * @param index
         * @param len
         * @returns {Array.<T>}
         */
        splice: function (index, len) {
            var files = this.files.splice(index === undefined ? 0 : index, len === undefined ? this.files.length : len);
            this.trigger(lupload.EVENT_FILES_REMOVE, files);
            this.trigger(lupload.EVENT_QUEUE_CHANGE);
            return files;
        },
        dispose: function () {
            this.stop();
            this.trigger(lupload.EVENT_DISPOSE);
            this.off();
            this.supr();
        }
    };


    var File = function (id, name, size) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.loaded = 0;
        this.percent = 0;
        this.status = 0;
    };


    var Runtime = {
        getFeatures: function () {
        },
        init: function () {
        }
    };

    var QueueProgress = function(){
        var me = this;
        me.size = 0;
        me.loaded = 0;
        me.uploaded = 0;
        me.failed = 0;
        me.queued = 0;
        me.percent = 0;
        me.bytesPerSec = 0;
        me.reset = function () {
            me.size = me.loaded = me.uploaded = me.failed = me.queued = me.percent = me.bytesPerSec = 0;
        };
    };

    lupload.File = File;
    lupload.Uploader = Uploader;
    lupload.Runtime = Runtime;

    window.lupload = lupload;


})(window);

//HTML5 Runtime
+(function (window, document, lupload, d) {
    var f, fileCache = {};

    function readImage(file, callback) {
        var reader;

        if ("FileReader" in window) {
            reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                callback(reader.result);
            };
            return undefined;
        } else {
            return callback(file.getAsDataURL());
        }
    }

    function readBinary(file, callback) {
        var reader;
        if ("FileReader" in window) {
            reader = new FileReader();
            reader.readAsBinaryString(file);
            reader.onload = function () {
                callback(reader.result);
            };
            return undefined;
        } else {
            return callback(file.getAsBinary());
        }
    }

    function resizeImage(file, resize, mimeType, callback) {
        var canvas, context, img, scale, uploader = this;
        readImage(fileCache[file.id], function (dataUrl) {
            canvas = document.createElement("canvas");
            canvas.style.display = "none";
            document.body.appendChild(canvas);
            context = canvas.getContext("2d");
            img = new Image();
            img.onerror = img.onabort = function () {
                callback({success: !1});
            };
            img.onload = function () {
                var width, height, p, q;
                resize.width || (resize.width = img.width);
                resize.height || (resize.height = img.height);
                scale = Math.min(resize.width / img.width, resize.height / img.height);

                if (1 > scale || 1 === scale && "image/jpeg" === mimeType) {
                    width = Math.round(img.width * scale);
                    height = Math.round(img.height * scale);
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(img, 0, 0, width, height);
                    if ("image/jpeg" === mimeType) {
                        p = new l(atob(dataUrl.substring(dataUrl.indexOf("base64,") + 7)));
                        if (p.headers && p.headers.length) {
                            q = new m;
                            if (q.init(p.get("exif")[0])) {
                                q.setExif("PixelXDimension", width);
                                q.setExif("PixelYDimension", height);
                                p.set("exif", q.getBinary());
                                //uploader.hasEventListener("ExifData") && uploader.trigger("ExifData", file, q.EXIF());
                                //uploader.hasEventListener("GpsData") && uploader.trigger("GpsData", file, q.GPS());
                            }
                        }
                        if (resize.quality) {
                            try {
                                dataUrl = canvas.toDataURL(mimeType, resize.quality / 100);
                            } catch (r) {
                                dataUrl = canvas.toDataURL(mimeType);
                            }
                        }
                    } else {
                        dataUrl = canvas.toDataURL(mimeType);
                    }
                    dataUrl = dataUrl.substring(dataUrl.indexOf("base64,") + 7);
                    dataUrl = atob(dataUrl);
                    if (p && p.headers && p.headers.length) {
                        dataUrl = p.restore(dataUrl);
                        p.purge();
                    }
                    canvas.parentNode.removeChild(canvas);
                    callback({
                        success: true,
                        data: dataUrl
                    });
                } else {
                    callback({success: false});
                }
            };
            img.src = dataUrl;
        });
    }

    lupload.runtimes.Html5 = lupload.addRuntime("html5", {
        getFeatures: function () {
            var xhr,
                enableHTML5,
                enableProgress,
                enableSendBinary,
                enableImgResize,
                enableChunk;

            enableHTML5 = enableProgress = enableImgResize = enableChunk = false;

            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
                enableProgress = !!xhr.upload;
                enableHTML5 = !(!xhr.sendAsBinary && !xhr.upload);
            }
            if (enableHTML5) {
                enableSendBinary = !!(xhr.sendAsBinary || window.Uint8Array && window.ArrayBuffer);
                enableImgResize = !(!File || !File.prototype.getAsDataURL && !window.FileReader || !enableSendBinary);
                enableChunk = !(!File || !(File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice));
            }
            f = lupload.ua.safari && lupload.ua.windows;
            return {
                html5: enableHTML5,
                dragdrop: function () {
                    var elem = document.createElement("div");
                    return "draggable"in elem || "ondragstart"in elem && "ondrop"in elem;
                }(),
                jpgresize: enableImgResize,
                pngresize: enableImgResize,
                multipart: enableImgResize || !!window.FileReader || !!window.FormData,
                canSendBinary: enableSendBinary,
                cantSendBlobInFormData: !(!(lupload.ua.gecko && window.FormData && window.FileReader) || FileReader.prototype.readAsArrayBuffer),
                progress: enableProgress,
                chunks: enableChunk,
                multi_selection: !(lupload.ua.safari && lupload.ua.windows),
                triggerDialog: lupload.ua.gecko && window.FormData || lupload.ua.webkit
            };
        },
        init: function (uploader, callback) {
            var features, xhr;

            function eName(event) {
                return event + "." + uploader.id;
            }

            function l(fileList) {
                var oFile, id, files = [], exist = {};
                for (var i = 0, len = fileList.length; i < len; i++) {
                    oFile = fileList[i];
                    if (!exist[oFile.name]) {
                        exist[oFile.name] = true;
                        id = lupload.guid();
                        fileCache[id] = oFile;
                        files.push(new lupload.File(id, oFile.fileName || oFile.name, oFile.fileSize || oFile.size));
                    }
                }
                files.length && uploader.trigger(lupload.EVENT_FILES_ADD, files);
            }

            features = this.getFeatures();

            if (features.html5) {
                uploader.on(lupload.EVENT_INIT, function (uploader) {
                    var $component, $trigger, h, i, k, mimeType, $input,
                        accept = [],
                        options = uploader.options,
                        filters = uploader.options.filters,
                        $container = $(document.body);

                    $component = $('<div id="' + uploader.id + "_html5_container" + '" />');
                    if (options.className) {
                        $component.addClass(options.className);
                    }
                    $component.css({
                        position: "absolute",
                        background: "transparent",
                        overflow: "hidden",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0
                    });
                    $component.addClass("lupload html5");
                    if (options.container) {
                        $container = $(options.container);
                        if ("static" === $container.css("position")) {
                            $container.css("position", "relative");
                        }
                    }
                    $container.append($component);

                    a:for (h = 0; h < filters.length; h++) {
                        k = filters[h].extensions.split(/,/);
                        for (i = 0; i < k.length; i++) {
                            if ("*" === k[i]) {
                                accept = [];
                                break a;
                            }
                            mimeType = lupload.mimeTypes[k[i]];
                            mimeType && -1 === $.inArray(mimeType, accept) && accept.push(mimeType);
                        }
                    }

                    $input = $('<input id="' + uploader.id + '_html5"  style="font-size:999px" type="file" accept="' + accept.join(",") + '" ' + (uploader.options.multi_selection && uploader.features.multi_selection ? 'multiple="multiple"' : "") + " />")
                        .appendTo($component.scrollTop(100));
                    if (uploader.features.triggerDialog) {
                        $input.css({
                            position: "absolute",
                            left: 0,
                            width: "100%",
                            height: "100%"
                        });
                    } else {
                        $input.css("float", "right");
                    }
                    $input.on("change", function () {
                        l(this.files);
                        $(this).val("");
                    });
                    $trigger = $(options.trigger);
                    if ($trigger.size()) {
                        if (uploader.features.triggerDialog) {
                            $trigger.on(eName("click"), function (e) {
                                var $input = $("#" + uploader.id + "_html5");
                                if ($input.size() && !$input.is(":disabled")) {
                                    $input.trigger("click");
                                }
                                e.preventDefault();
                            });
                        }
                    }
                });

                uploader.on(lupload.EVENT_INIT_AFTER, function () {
                    var $dropArea = $(uploader.options.dropElement);
                    if ($dropArea.size()) {
                        if (f) {
                            $dropArea.on(eName("dragenter"), function () {
                                var $dropInput;
                                $dropInput = $("#" + uploader.id + "_drop");
                                if (!$dropInput.size()) {
                                    $dropInput = $('<input type="file" id="' + uploader.id + '_drop' + '" '+(uploader.options.multi_selection && uploader.features.multi_selection ? 'multiple="multiple"' : "")+' />');
                                    $dropInput.on(eName("change"), function () {
                                        l(this.files);
                                        $dropInput.off(eName("change"));
                                        $dropInput.remove();
                                    });
                                    $dropArea.append($dropInput);
                                }

                                if ("static" === $dropArea.css("position")) {
                                    $dropArea.css({position: "relative"});
                                }
                                $dropInput.css({
                                    position: "absolute",
                                    display: "block",
                                    top: 0,
                                    left: 0,
                                    width: ($dropArea[0].offsetWidth || $dropArea[0].clientWidth) + "px",
                                    height: ($dropArea[0].offsetHeight || $dropArea[0].clientHeight) + "px",
                                    opacity: 0
                                });
                            });
                            return;
                        }
                        $dropArea.on(eName("dragover"), function (e) {
                            e.preventDefault();
                        });
                        $dropArea.on(eName("drop"), function (e) {
                            var dataTransfer = e.originalEvent['dataTransfer'];
                            dataTransfer && dataTransfer.files && l(dataTransfer.files);
                            e.preventDefault();
                        });
                    }
                });

                uploader.on(lupload.EVENT_REFRESH, function (a) {
                });

                uploader.on(lupload.EVENT_BROWSE_DISABLE, function (uploader, disabled) {
                    var $input = $("#" + uploader.id + "_html5");
                    $input.size() && ($input.prop("disabled", disabled));
                });

                uploader.on(lupload.EVENT_FILE_UPLOAD_CANCEL, function () {
                    xhr && xhr.abort && xhr.abort();
                });

                uploader.on(lupload.EVENT_FILE_UPLOAD_START, function (uploader, file) {
                    var options = uploader.options;

                    function slice(a, b, c) {
                        var slice;
                        if (!File.prototype.slice) {
                            if ((slice = File.prototype.webkitSlice || File.prototype.mozSlice)) {
                                return slice.call(a, b, c);
                            } else {
                                return null;
                            }
                        }
                        try {
                            a.slice();
                            return a.slice(b, c);
                        } catch (e) {
                            return a.slice(b, c - b);
                        }
                    }

                    function n(e) {
                        var chunk = 0,
                            h = 0,
                            reader = "FileReader" in window ? new FileReader : null;

                        function l() {
                            var n, p, params, r, s, t,
                                url = uploader.options.url;

                            function send(e) {
                                var formData,
                                    f = 0,
                                    j = "----luploadboundary" + lupload.guid(),
                                    o = "--",
                                    v = "\r\n",
                                    w = "";

                                xhr = new XMLHttpRequest;
                                xhr.upload && (xhr.upload.onprogress = function (e) {
                                    file.loaded = Math.min(file.size, h + e.loaded - f);
                                    uploader.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, file);
                                });
                                xhr.onreadystatechange = function () {
                                    var status, result;
                                    if (4 == xhr.readyState && uploader.state !== lupload.STATE_STOPPED) {
                                        try {
                                            status = xhr.status
                                        } catch (e) {
                                            status = 0
                                        }
                                        if (status >= 400) {
                                            uploader.trigger(lupload.EVENT_ERROR, {
                                                code: lupload.ERROR_HTTP,
                                                message: lupload.translate("HTTP Error."),
                                                file: file,
                                                status: status
                                            });
                                        } else {
                                            if (p) {
                                                result = {
                                                    chunk: chunk,
                                                    chunks: p,
                                                    response: xhr.responseText,
                                                    status: status,
                                                    canceled: false
                                                };
                                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_CHUNK, file, result);
                                                h += s;
                                                if (result.canceled) {
                                                    file.status = lupload.STATE_FAILED;
                                                    return;
                                                }
                                                file.loaded = Math.min(file.size, (chunk + 1) * r)
                                            } else {
                                                file.loaded = file.size;
                                            }
                                            uploader.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, file);
                                            e = n = formData = w = null;
                                            if (!p || ++chunk >= p) {
                                                file.status = lupload.STATE_DONE;
                                                var res = xhr.responseText;
                                                try {
                                                    res = $.parseJSON(res);
                                                } catch (e) {
                                                }
                                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_COMPLETE, file, res)
                                            } else {
                                                l()
                                            }
                                        }
                                    }
                                };
                                if (uploader.options.multipart && features.multipart) {
                                    params.name = file.target_name || file.name;
                                    xhr.open("post", url, true);
                                    $.each(uploader.options.headers, function (a, b) {
                                        xhr.setRequestHeader(a, b)
                                    });
                                    if ("string" != typeof e && window.FormData) {
                                        formData = new FormData;
                                        $.each($.extend(params, uploader.options.multipart_params), function (name, value) {
                                            formData.append(name, value)
                                        });
                                        formData.append(uploader.options.file_data_name, e);
                                        xhr.send(formData);
                                        return
                                    }
                                    if ("string" == typeof e) {
                                        xhr.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + j);
                                        $.each($.extend(params, uploader.options.multipart_params), function (a, b) {
                                            w += o + j + v + 'Content-Disposition: form-data; name="' + a + '"' + v + v;
                                            w += unescape(encodeURIComponent(b)) + v
                                        });
                                        t = lupload.mimeTypes[file.name.replace(/^.+\.([^.]+)/, "$1").toLowerCase()] || "application/octet-stream";
                                        w += o + j + v + 'Content-Disposition: form-data; name="' + uploader.options.file_data_name + '"; filename="' + unescape(encodeURIComponent(file.name)) + '"' + v + "Content-Type: " + t + v + v + e + v + o + j + o + v;
                                        f = w.length - e.length;
                                        e = w;
                                        if (xhr['sendAsBinary']) {
                                            xhr['sendAsBinary'](e);
                                        } else if (features.canSendBinary) {
                                            for (var x = new Uint8Array(e.length), y = 0; y < e.length; y++) {
                                                x[y] = 255 & e.charCodeAt(y);
                                            }
                                            xhr.send(x.buffer)
                                        }
                                        return
                                    }
                                }
                                url = lupload.buildUrl(uploader.options.url, $.extend(params, uploader.options.multipart_params));
                                xhr.open("post", url, true);
                                xhr.setRequestHeader("Content-Type", "application/octet-stream");
                                $.each(uploader.options.headers, function (name, value) {
                                    xhr.setRequestHeader(name, value)
                                });
                                xhr.send(e)
                            }

                            if (file.status != lupload.STATE_DONE && file.status != lupload.STATE_FAILED && uploader.state != lupload.STATE_STOPPED) {
                                params = {name: file.target_name || file.name};
                                if (options.chunk_size && file.size > options.chunk_size && (features.chunks || "string" == typeof e)) {
                                    r = options.chunk_size;
                                    p = Math.ceil(file.size / r);
                                    s = Math.min(r, file.size - chunk * r);
                                    n = "string" == typeof e ? e.substring(chunk * r, chunk * r + s) : slice(e, chunk * r, chunk * r + s);
                                    params.chunk = chunk;
                                    params.chunks = p
                                } else {
                                    s = file.size;
                                    n = e
                                }

                                if (uploader.options.multipart && features.multipart && "string" != typeof n && reader && features.cantSendBlobInFormData && features.chunks && uploader.options.chunk_size) {
                                    reader.onload = function () {
                                        send(reader.result)
                                    };
                                    reader.readAsBinaryString(n)
                                }
                                else {
                                    send(n)
                                }
                            }
                        }

                        l()
                    }

                    var oFile = fileCache[file.id];
                    if (features.jpgresize && uploader.options.resize && /\.(png|jpg|jpeg)$/i.test(file.name)) {
                        resizeImage.call(uploader, file, uploader.options.resize, /\.png$/i.test(file.name) ? "image/png" : "image/jpeg", function (res) {
                            if (res.success) {
                                file.size = res.data.length;
                                n(res.data)
                            } else if (features.chunks) {
                                n(oFile)
                            } else {
                                readBinary(oFile, n)
                            }
                        })
                    } else if (!features.chunks && features.jpgresize) {
                        readBinary(oFile, n)
                    } else {
                        n(oFile)
                    }
                });

                uploader.on(lupload.EVENT_DISPOSE, function (uploader) {
                    var elem = {
                            inputContainer: "#" + uploader.id + "_html5_container",
                            inputFile: "#" + uploader.id + "_html5",
                            browseButton: uploader.options.trigger,
                            dropElm: uploader.options.dropElement
                        },
                        d, $elem;
                    for (d in elem) {
                        $elem = $(elem[d]);
                        $elem.size() && $elem.off("." + uploader.id);
                    }
                    $(document.body).off("." + uploader.id);
                    $(elem.inputContainer).remove();
                });
                callback({success: true})
            } else {
                callback({success: false})
            }
        }
    });
    function k() {
        var b, a = false;

        function c(c, d) {
            var g, e = a ? 0 : -8 * (d - 1), f = 0;
            for (g = 0; d > g; g++)f |= b.charCodeAt(c + g) << Math.abs(e + 8 * g);
            return f
        }

        function e(a, c, d) {
            var d = 3 === arguments.length ? d : b.length - c - 1;
            b = b.substr(0, c) + a + b.substr(d + c)
        }

        function f(b, c, d) {
            var h, f = "", g = a ? 0 : -8 * (d - 1);
            for (h = 0; d > h; h++)f += String.fromCharCode(c >> Math.abs(g + 8 * h) & 255);
            e(f, b, d)
        }

        return {
            II: function (b) {
                if (b === d) {
                    return a;
                } else {
                    a = b
                }
            },
            init: function (c) {
                a = !1;
                b = c
            },
            SEGMENT: function (a, c, d) {
                switch (arguments.length) {
                    case 1:
                        return b.substr(a, b.length - a - 1);
                    case 2:
                        return b.substr(a, c);
                    case 3:
                        e(d, a, c);
                        break;
                    default:
                        return b
                }
            },
            BYTE: function (a) {
                return c(a, 1)
            },
            SHORT: function (a) {
                return c(a, 2)
            },
            LONG: function (a, b) {
                return b === d ? c(a, 4) : void f(a, b, 4)
            },
            SLONG: function (a) {
                var b = c(a, 4);
                return b > 2147483647 ? b - 4294967296 : b
            },
            STRING: function (a, b) {
                var d = "";
                for (b += a; b > a; a++)d += String.fromCharCode(c(a, 1));
                return d
            }
        }
    }

    function l(a) {
        var e, f, i, b = {
            65505: {app: "EXIF", name: "APP1", signature: "Exif\x00"},
            65506: {app: "ICC", name: "APP2", signature: "ICC_PROFILE\x00"},
            65517: {app: "IPTC", name: "APP13", signature: "Photoshop 3.0\x00"}
        }, c = [], g = d, h = 0;

        e = new k;
        e.init(a);
        if (65496 === e.SHORT(0)) {
            for (f = 2, i = Math.min(1048576, a.length); i >= f;) {
                g = e.SHORT(f);
                if (g >= 65488 && 65495 >= g) {
                    f += 2;
                } else {
                    if (65498 === g || 65497 === g) {
                        break;
                    }
                    h = e.SHORT(f + 2) + 2;
                    if (b[g] && e.STRING(f + 4, b[g].signature.length) === b[g].signature) {
                        c.push({
                            hex: g,
                            app: b[g].app.toUpperCase(),
                            name: b[g].name.toUpperCase(),
                            start: f,
                            length: h,
                            segment: e.SEGMENT(f, h)
                        });
                    }
                    f += h
                }
            }
            e.init(null);
            return {
                headers: c,
                restore: function (a) {
                    e.init(a);
                    var b = new l(a);
                    if (!b.headers)return !1;
                    for (var d = b.headers.length; d > 0; d--) {
                        var g = b.headers[d - 1];
                        e.SEGMENT(g.start, g.length, "")
                    }
                    b.purge();
                    f = 65504 == e.SHORT(2) ? 4 + e.SHORT(4) : 2;
                    for (var d = 0, h = c.length; h > d; d++) {
                        e.SEGMENT(f, 0, c[d].segment);
                        f += c[d].length;
                    }
                    return e.SEGMENT()
                },
                get: function (a) {
                    for (var b = [], d = 0, e = c.length; e > d; d++)c[d].app === a.toUpperCase() && b.push(c[d].segment);
                    return b
                },
                set: function (a, b) {
                    var d = [];
                    "string" == typeof b ? d.push(b) : d = b;
                    var e = 0, ii = 0,
                        f = c.length;
                    for (; f > e && (c[e].app === a.toUpperCase() && (c[e].segment = d[ii], c[e].length = d[ii].length, ii++), !(ii >= d.length)); e++);
                },
                purge: function () {
                    c = [];
                    e.init(null)
                }
            }
        }
    }

    function m() {
        var a, b, f, e = {};
        a = new k;
        b = {
            tiff: {274: "Orientation", 34665: "ExifIFDPointer", 34853: "GPSInfoIFDPointer"},
            exif: {
                36864: "ExifVersion",
                40961: "ColorSpace",
                40962: "PixelXDimension",
                40963: "PixelYDimension",
                36867: "DateTimeOriginal",
                33434: "ExposureTime",
                33437: "FNumber",
                34855: "ISOSpeedRatings",
                37377: "ShutterSpeedValue",
                37378: "ApertureValue",
                37383: "MeteringMode",
                37384: "LightSource",
                37385: "Flash",
                41986: "ExposureMode",
                41987: "WhiteBalance",
                41990: "SceneCaptureType",
                41988: "DigitalZoomRatio",
                41992: "Contrast",
                41993: "Saturation",
                41994: "Sharpness"
            },
            gps: {
                0: "GPSVersionID",
                1: "GPSLatitudeRef",
                2: "GPSLatitude",
                3: "GPSLongitudeRef",
                4: "GPSLongitude"
            }
        };
        f = {
            ColorSpace: {1: "sRGB", 0: "Uncalibrated"},
            MeteringMode: {
                0: "Unknown",
                1: "Average",
                2: "CenterWeightedAverage",
                3: "Spot",
                4: "MultiSpot",
                5: "Pattern",
                6: "Partial",
                255: "Other"
            },
            LightSource: {
                1: "Daylight",
                2: "Fliorescent",
                3: "Tungsten",
                4: "Flash",
                9: "Fine weather",
                10: "Cloudy weather",
                11: "Shade",
                12: "Daylight fluorescent (D 5700 - 7100K)",
                13: "Day white fluorescent (N 4600 -5400K)",
                14: "Cool white fluorescent (W 3900 - 4500K)",
                15: "White fluorescent (WW 3200 - 3700K)",
                17: "Standard light A",
                18: "Standard light B",
                19: "Standard light C",
                20: "D55",
                21: "D65",
                22: "D75",
                23: "D50",
                24: "ISO studio tungsten",
                255: "Other"
            },
            Flash: {
                0: "Flash did not fire.",
                1: "Flash fired.",
                5: "Strobe return light not detected.",
                7: "Strobe return light detected.",
                9: "Flash fired, compulsory flash mode",
                13: "Flash fired, compulsory flash mode, return light not detected",
                15: "Flash fired, compulsory flash mode, return light detected",
                16: "Flash did not fire, compulsory flash mode",
                24: "Flash did not fire, auto mode",
                25: "Flash fired, auto mode",
                29: "Flash fired, auto mode, return light not detected",
                31: "Flash fired, auto mode, return light detected",
                32: "No flash function",
                65: "Flash fired, red-eye reduction mode",
                69: "Flash fired, red-eye reduction mode, return light not detected",
                71: "Flash fired, red-eye reduction mode, return light detected",
                73: "Flash fired, compulsory flash mode, red-eye reduction mode",
                77: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
                79: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
                89: "Flash fired, auto mode, red-eye reduction mode",
                93: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
                95: "Flash fired, auto mode, return light detected, red-eye reduction mode"
            },
            ExposureMode: {0: "Auto exposure", 1: "Manual exposure", 2: "Auto bracket"},
            WhiteBalance: {0: "Auto white balance", 1: "Manual white balance"},
            SceneCaptureType: {0: "Standard", 1: "Landscape", 2: "Portrait", 3: "Night scene"},
            Contrast: {0: "Normal", 1: "Soft", 2: "Hard"},
            Saturation: {0: "Normal", 1: "Low saturation", 2: "High saturation"},
            Sharpness: {0: "Normal", 1: "Soft", 2: "Hard"},
            GPSLatitudeRef: {N: "North latitude", S: "South latitude"},
            GPSLongitudeRef: {E: "East longitude", W: "West longitude"}
        };
        function g(b, c) {
            var h, i, j, k, l, m, n, o,
                g = a.SHORT(b), p = [], q = {};
            for (h = 0; g > h; h++) {
                n = m = b + 12 * h + 2;
                j = c[a.SHORT(n)];
                if (j !== d) {
                    k = a.SHORT(n += 2);
                    l = a.LONG(n += 2);
                    n += 4;
                    p = [];
                    switch (k) {
                        case 1:
                        case 7:
                            l > 4 && (n = a.LONG(n) + e.tiffHeader);
                            for (i = 0; l > i; i++) {
                                p[i] = a.BYTE(n + i);
                            }
                            break;
                        case 2:
                            l > 4 && (n = a.LONG(n) + e.tiffHeader);
                            q[j] = a.STRING(n, l - 1);
                            continue;
                        case 3:
                            l > 2 && (n = a.LONG(n) + e.tiffHeader);
                            for (i = 0; l > i; i++) {
                                p[i] = a.SHORT(n + 2 * i);
                            }
                            break;
                        case 4:
                            l > 1 && (n = a.LONG(n) + e.tiffHeader);
                            for (i = 0; l > i; i++) {
                                p[i] = a.LONG(n + 4 * i);
                            }
                            break;
                        case 5:
                            n = a.LONG(n) + e.tiffHeader;
                            for (i = 0; l > i; i++) {
                                p[i] = a.LONG(n + 4 * i) / a.LONG(n + 4 * i + 4);
                            }
                            break;
                        case 9:
                            n = a.LONG(n) + e.tiffHeader;
                            for (i = 0; l > i; i++) {
                                p[i] = a.SLONG(n + 4 * i);
                            }
                            break;
                        case 10:
                            n = a.LONG(n) + e.tiffHeader;
                            for (i = 0; l > i; i++) {
                                p[i] = a.SLONG(n + 4 * i) / a.SLONG(n + 4 * i + 4);
                            }
                            break;
                        default:
                            continue
                    }
                    o = 1 == l ? p[0] : p;
                    q[j] = f.hasOwnProperty(j) && "object" != typeof o ? f[j][o] : o
                }
            }
            return q
        }

        function h() {
            var c = d,
                f = e.tiffHeader;
            a.II(18761 == a.SHORT(f));

            if (42 !== a.SHORT(f += 2)) {
                return false
            } else {
                e.IFD0 = e.tiffHeader + a.LONG(f += 2);
                c = g(e.IFD0, b.tiff);
                e.exifIFD = "ExifIFDPointer" in c ? e.tiffHeader + c.ExifIFDPointer : d;
                e.gpsIFD = "GPSInfoIFDPointer" in c ? e.tiffHeader + c.GPSInfoIFDPointer : d;
                return true;
            }
        }

        function j(c, d, f) {
            var i, g, h, j, k = 0;
            if ("string" == typeof d) {
                var l = b[c.toLowerCase()];
                for (var hex in l)if (l[hex] === d) {
                    d = hex;
                    break
                }
            }
            for (g = e[c.toLowerCase() + "IFD"], h = a.SHORT(g), i = 0; h > i; i++)if (j = g + 12 * i + 2, a.SHORT(j) == d) {
                k = j + 8;
                break
            }
            if (k) {
                a.LONG(k, f);
                return true;
            } else {
                return false;
            }
        }

        return {
            init: function (b) {
                e = {tiffHeader: 10};
                if (b !== d && b.length) {
                    a.init(b);
                    if (65505 === a.SHORT(0) && "EXIF\x00" === a.STRING(4, 5).toUpperCase()) {
                        return h()
                    } else {
                        return false
                    }
                } else {
                    return false
                }
            },
            EXIF: function () {
                var a;
                a = g(e.exifIFD, b.exif);
                if (a.ExifVersion && "array" === c.typeOf(a.ExifVersion)) {
                    for (var d = 0, f = ""; d < a.ExifVersion.length; d++) {
                        f += String.fromCharCode(a.ExifVersion[d]);
                    }
                    a.ExifVersion = f
                }
                return a
            },
            GPS: function () {
                var a;
                a = g(e.gpsIFD, b.gps);
                if (a.GPSVersionID) {
                    a.GPSVersionID = a.GPSVersionID.join(".");
                }
                return a
            },
            setExif: function (a, b) {
                return "PixelXDimension" !== a && "PixelYDimension" !== a ? false : j("exif", a, b)
            },
            getBinary: function () {
                return a.SEGMENT()
            }
        }
    }
})(window, document, lupload);

+(function (window, document, lupload) {
    lupload.runtimes.Html4 = lupload.addRuntime("html4", {
        getFeatures: function () {
            return {
                multipart: true,
                triggerDialog: lupload.ua.gecko && window.FormData || lupload.ua.webkit
            }
        },
        init: function (uploader, callback) {
            uploader.on(lupload.EVENT_INIT, function () {
                var curIframe, curFile, id, mimeType, j,
                    body = document.body,
                    ids = [],
                    ie = /MSIE/.test(navigator.userAgent),
                    accept = [],
                    filters = uploader.options.filters,
                    eName = function (event) {
                        return event + "." + id;
                    };

                a:for (var i = 0; i < filters.length; i++) {
                    var extensions = filters[i].extensions.split(/,/);
                    for (j = 0; j < extensions.length; j++) {
                        if ("*" === extensions[j]) {
                            accept = [];
                            break a
                        }
                        mimeType = lupload.mimeTypes[extensions[j]];
                        mimeType && -1 === $.inArray(mimeType, accept) && accept.push(mimeType)
                    }
                }
                accept = accept.join(",");

                function buildForm() {
                    var form, input, btn;
                    id = lupload.guid();
                    ids.push(id);
                    form = $("<form />");
                    form.attr({
                        "id": "form_" + id,
                        "method": "post",
                        "enctype": "multipart/form-data",
                        "encoding": "multipart/form-data",
                        "target": uploader.id + "_iframe"
                    });
                    form.css("position", "absolute");

                    input = $("<input />");
                    input.attr({
                        "id": "input_" + id,
                        "type": "file",
                        "accept": accept,
                        "size": 1
                    });

                    btn = $(uploader.options.trigger);
                    if (uploader.features.triggerDialog && btn.size()) {
                        btn.on(eName("click"), function (e) {
                            $(this).is(":disabled") || input.trigger("click");
                            e.preventDefault();
                            return false;
                        });
                    }

                    input.css({
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        fontSize: "99px",
                        cursor: "pointer"
                    });

                    form.css({
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        overflow: "hidden"
                    });
                    ie && input.css({filter: "alpha(opacity=0)"});

                    input.on(eName("change"), function (e) {
                        var i, g = e.target, files = [];
                        if (g.value) {
                            $("#form_" + id).css("top", "-1048575px");
                            i = g.value.replace(/\\/g, "/");
                            i = i.substring(i.length, i.lastIndexOf("/") + 1);
                            files.push(new lupload.File(id, i));

                            if (uploader.features.triggerDialog) {
                                btn.off(eName("click"));
                            }
                            input.off(eName("change"));
                            buildForm();
                            files.length && uploader.trigger(lupload.EVENT_FILES_ADD, files)
                        }
                    });

                    form.append(input);
                    $(uploader.options.container || body).eq(0).append(form);
                    uploader.refresh()
                }

                function buildIframe() {
                    curIframe = $('<iframe id="' + uploader.id + '_iframe" name="' + uploader.id + '_iframe" src="javascript:false;" style="display:none"></iframe>');
                    $(body).append(curIframe);
                    curIframe.on(eName("load"), function () {
                        var res;
                        if (curFile) {
                            try {
                                res = $(this).contents().find("body").html();
                            } catch (e) {
                                return void uploader.trigger(lupload.EVENT_ERROR, {
                                    code: lupload.ERROR_SECURITY,
                                    message: lupload.translate("Security error."),
                                    file: curFile
                                })
                            }

                            try {
                                res = $.parseJSON(res);
                            } catch (e) {
                            }


                            if (res) {
                                curFile.status = lupload.STATE_DONE;
                                curFile.loaded = 1025;
                                curFile.percent = 100;
                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_PROGRESS, curFile);
                                uploader.trigger(lupload.EVENT_FILE_UPLOAD_COMPLETE, curFile, res)
                            }
                        }
                    })
                }

                if (uploader.options.container) {
                    var container = $(uploader.options.container);
                    if ("static" === container.css("position")) {
                        container.css("position", "relative");
                    }
                }

                uploader.on(lupload.EVENT_FILE_UPLOAD_START, function (me, file) {
                    var form, input;
                    if (file.status != lupload.STATE_DONE && file.status != lupload.STATE_FAILED && uploader.state != lupload.STATE_STOPPED) {
                        form = $("#form_" + file.id);
                        input = $("#input_" + file.id);
                        input.attr("name", uploader.options.file_data_name);
                        form.attr("action", uploader.options.url);
                        $.each(
                            //添加文件信息以及额外的参数信息
                            $.extend({name: file.target_name || file.name}, uploader.options.multipart_params),
                            function (name, value) {
                                var hidden = $('<input type="hidden" name="' + name + '" value="' + value + '"/>');
                                form.prepend(hidden)
                            }
                        );
                        curFile = file;
                        form.css("top", "-1048575px");
                        form[0].submit()
                    }
                });
                uploader.on(lupload.EVENT_FILE_UPLOAD_COMPLETE, function () {
                    uploader.refresh()
                });

                uploader.on(lupload.EVENT_FILES_REMOVE, function (me, files) {
                    var i, elem;
                    for (i = 0; i < files.length; i++) {
                        elem = $("#form_" + files[i].id);
                        elem.size() && elem.remove();
                    }
                });

                uploader.on(lupload.EVENT_BROWSE_DISABLE, function (me, disabled) {
                    var elem = $("#input_" + id);
                    elem.length && (elem.prop("disabled", disabled))
                });

                //开启上传
                uploader.on(lupload.EVENT_START, function () {
                    buildIframe();
                    $.each(uploader.files, function (i, file) {
                        if (file.status === lupload.STATE_DONE || file.status === lupload.STATE_FAILED) {
                            var form = $("#form_" + file.id);
                            form.size() && form.remove()
                        }
                    })
                });

                //关闭上传
                uploader.on(lupload.EVENT_STOP, function () {

                    setTimeout(function () {
                        curIframe.off(eName("load"));
                        curIframe.size() && curIframe.remove()
                    }, 0);

                    $.each(uploader.files, function (i, file) {
                        if (file.status === lupload.STATE_DONE || file.status === lupload.STATE_FAILED) {
                            var form = $("#form_" + file.id);
                            form.size() && form.remove()
                        }
                    })
                });

                //卸载
                uploader.on(lupload.EVENT_DISPOSE, function () {
                    $.each(ids, function (i, id) {
                        var form = $("#form_" + id);
                        form.size() && form.remove()
                    })
                });

                buildForm()
            });
            callback({success: true})
        }
    })
})(window, document, lupload);

+(function () {
    lupload.addI18n({
        "File size error.": "上传的文件太大了~",
        "File count error.": "上传的文件数量太多了~",
        "File extension error.": "上传的文件格式不正确",
        "Init error.": "可能暂时上传不了图片哦，请更换浏览器试试",
        "Security error.": "可能暂时上传不了图片哦，请更换浏览器试试",
        "HTTP Error.": "上传失败，是不是网络挂起了？"
    })
})(lupload);



