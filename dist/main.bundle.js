webpackJsonp([1,4],{

/***/ 137:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(27)(false);
// imports


// module
exports.push([module.i, ".drop-zone {\n  margin: auto;\n  height: 100px;\n  border: 2px dotted #0782d0;\n  border-radius: 30px; }\n\n.content {\n  color: #0782d0;\n  height: 100px;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n\n.over {\n  background-color: rgba(147, 147, 147, 0.5); }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 138:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(27)(false);
// imports


// module
exports.push([module.i, ".center {\n  margin: auto;\n  width: 50%;\n  border: 3px solid green;\n  padding: 10px; }\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 139:
/***/ (function(module, exports) {

module.exports = "<div id=\"dropZone\"  [className]=\"customstyle\" [class.over]=\"dragoverflag\"\r\n    (drop)=\"dropFiles($event)\"\r\n    (dragover)=\"onDragOver($event)\" (dragleave)=\"onDragLeave($event)\">\r\n    <div class=\"content\">\r\n        <ng-content></ng-content>\r\n        {{headertext}}\r\n    </div>\r\n</div>\r\n"

/***/ }),

/***/ 140:
/***/ (function(module, exports) {

module.exports = "<div class=\"center\">\n    <file-drop headertext=\"Drop files here\" (onFileDrop)=\"dropped($event)\" (onFileOver)=\"fileOver($event)\" (onFileLeave)=\"fileLeave($event)\"></file-drop>\n    <div class=\"upload-table\">\n        <table class=\"table\">\n            <thead>\n                <tr>\n                    <th>Name</th>\n                </tr>\n            </thead>\n            <tbody class=\"upload-name-style\">\n                <tr *ngFor=\"let item of files; let i=index\">\n                    <td><strong>{{ item.relativePath }}</strong></td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n</div>"

/***/ }),

/***/ 171:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(74);


/***/ }),

/***/ 51:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 51;


/***/ }),

/***/ 54:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_observable_TimerObservable__ = __webpack_require__(149);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_observable_TimerObservable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_rxjs_observable_TimerObservable__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__upload_file_model__ = __webpack_require__(56);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__upload_event_model__ = __webpack_require__(55);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FileComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var FileComponent = (function () {
    function FileComponent(zone) {
        var _this = this;
        this.zone = zone;
        this.headertext = "";
        this.customstyle = null;
        this.onFileDrop = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */]();
        this.onFileOver = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */]();
        this.onFileLeave = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */]();
        this.stack = [];
        this.files = [];
        this.dragoverflag = false;
        window['angularComponentRef'] = {
            zone: this.zone,
            traverseFileTree: function (item, path) { return _this.traverseFileTree(item, path); },
            addToQueue: function (item) { return _this.addToQueue(item); },
            pushToStack: function (str) { return _this.pushToStack(str); },
            popToStack: function () { return _this.popToStack(); },
            component: this
        };
        if (!this.customstyle) {
            this.customstyle = "drop-zone";
        }
    }
    FileComponent.prototype.ngOnInit = function () {
    };
    FileComponent.prototype.onDragOver = function (event) {
        if (!this.dragoverflag) {
            this.dragoverflag = true;
            this.onFileOver.emit(event);
        }
        this.preventAndStop(event);
    };
    FileComponent.prototype.onDragLeave = function (event) {
        if (this.dragoverflag) {
            this.dragoverflag = false;
            this.onFileLeave.emit(event);
        }
        this.preventAndStop(event);
    };
    FileComponent.prototype.dropFiles = function (event) {
        var _this = this;
        this.dragoverflag = false;
        event.dataTransfer.dropEffect = "copy";
        var length;
        if (event.dataTransfer.items) {
            length = event.dataTransfer.items.length;
        }
        else {
            length = event.dataTransfer.files.length;
        }
        for (var i = 0; i < length; i++) {
            var entry;
            if (event.dataTransfer.items) {
                if (event.dataTransfer.items[i].webkitGetAsEntry) {
                    entry = event.dataTransfer.items[i].webkitGetAsEntry();
                }
            }
            else {
                if (event.dataTransfer.files[i].webkitGetAsEntry) {
                    entry = event.dataTransfer.files[i].webkitGetAsEntry();
                }
            }
            if (entry.isFile) {
                var toUpload = new __WEBPACK_IMPORTED_MODULE_2__upload_file_model__["a" /* UploadFile */](entry.name, entry);
                this.addToQueue(toUpload);
            }
            else if (entry.isDirectory) {
                this.traverseFileTree(entry, entry.name);
            }
        }
        this.preventAndStop(event);
        var timer = __WEBPACK_IMPORTED_MODULE_1_rxjs_observable_TimerObservable__["TimerObservable"].create(200, 200);
        this.subscription = timer.subscribe(function (t) {
            if (_this.stack.length == 0) {
                _this.onFileDrop.emit(new __WEBPACK_IMPORTED_MODULE_3__upload_event_model__["a" /* UploadEvent */](_this.files));
                _this.files = [];
                _this.subscription.unsubscribe();
            }
        });
    };
    FileComponent.prototype.traverseFileTree = function (item, path) {
        if (item.isFile) {
            var toUpload = new __WEBPACK_IMPORTED_MODULE_2__upload_file_model__["a" /* UploadFile */](path, item);
            this.files.push(toUpload);
            window['angularComponentRef'].zone.run(function () {
                window['angularComponentRef'].popToStack();
            });
        }
        else {
            this.pushToStack(path);
            path = path + "/";
            var dirReader = item.createReader();
            var entries_1 = [];
            var readEntries_1 = function () {
                dirReader.readEntries(function (res) {
                    if (!res.length) {
                        //add empty folders
                        if (entries_1.length == 0) {
                            var toUpload_1 = new __WEBPACK_IMPORTED_MODULE_2__upload_file_model__["a" /* UploadFile */](path, item);
                            window['angularComponentRef'].zone.run(function () {
                                window['angularComponentRef'].addToQueue(toUpload_1);
                            });
                        }
                        else {
                            for (var i = 0; i < entries_1.length; i++) {
                                window['angularComponentRef'].zone.run(function () {
                                    window['angularComponentRef'].traverseFileTree(entries_1[i], path + entries_1[i].name);
                                });
                            }
                        }
                        window['angularComponentRef'].zone.run(function () {
                            window['angularComponentRef'].popToStack();
                        });
                    }
                    else {
                        //continue with the reading
                        entries_1 = entries_1.concat(res);
                        readEntries_1();
                    }
                });
            };
            readEntries_1();
        }
    };
    FileComponent.prototype.addToQueue = function (item) {
        this.files.push(item);
    };
    FileComponent.prototype.pushToStack = function (str) {
        this.stack.push(str);
    };
    FileComponent.prototype.popToStack = function () {
        var value = this.stack.pop();
    };
    FileComponent.prototype.clearQueue = function () {
        this.files = [];
    };
    FileComponent.prototype.preventAndStop = function (event) {
        event.stopPropagation();
        event.preventDefault();
    };
    FileComponent.prototype.ngOnDestroy = function () {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    return FileComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["d" /* Input */])(),
    __metadata("design:type", String)
], FileComponent.prototype, "headertext", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["d" /* Input */])(),
    __metadata("design:type", String)
], FileComponent.prototype, "customstyle", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["e" /* Output */])(),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */]) === "function" && _a || Object)
], FileComponent.prototype, "onFileDrop", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["e" /* Output */])(),
    __metadata("design:type", typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */]) === "function" && _b || Object)
], FileComponent.prototype, "onFileOver", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["e" /* Output */])(),
    __metadata("design:type", typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* EventEmitter */]) === "function" && _c || Object)
], FileComponent.prototype, "onFileLeave", void 0);
FileComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["f" /* Component */])({
        selector: 'file-drop',
        template: __webpack_require__(139),
        styles: [__webpack_require__(137)]
    }),
    __metadata("design:paramtypes", [typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["g" /* NgZone */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["g" /* NgZone */]) === "function" && _d || Object])
], FileComponent);

var _a, _b, _c, _d;
//# sourceMappingURL=file-drop.component.js.map

/***/ }),

/***/ 55:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UploadEvent; });
var UploadEvent = (function () {
    function UploadEvent(files) {
        this.files = files;
    }
    return UploadEvent;
}());

//# sourceMappingURL=upload-event.model.js.map

/***/ }),

/***/ 56:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UploadFile; });
var UploadFile = (function () {
    function UploadFile(relativePath, fileEntry) {
        this.relativePath = relativePath;
        this.fileEntry = fileEntry;
    }
    return UploadFile;
}());

//# sourceMappingURL=upload-file.model.js.map

/***/ }),

/***/ 74:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__(78);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__(82);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__(83);




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 79:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__file_drop_component__ = __webpack_require__(54);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FileDropModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


var FileDropModule = (function () {
    function FileDropModule() {
    }
    return FileDropModule;
}());
FileDropModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_1__file_drop_component__["a" /* FileComponent */],
        ],
        exports: [__WEBPACK_IMPORTED_MODULE_1__file_drop_component__["a" /* FileComponent */]],
        imports: [],
        providers: [],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_1__file_drop_component__["a" /* FileComponent */]],
    })
], FileDropModule);

//# sourceMappingURL=file-drop.module.js.map

/***/ }),

/***/ 80:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__file_drop_component__ = __webpack_require__(54);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__file_drop_module__ = __webpack_require__(79);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_1__file_drop_module__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__upload_file_model__ = __webpack_require__(56);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__upload_event_model__ = __webpack_require__(55);
/* unused harmony namespace reexport */




//# sourceMappingURL=index.js.map

/***/ }),

/***/ 81:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(5);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var AppComponent = (function () {
    function AppComponent() {
        this.files = [];
    }
    AppComponent.prototype.dropped = function (event) {
        this.files = event.files;
        for (var _i = 0, _a = event.files; _i < _a.length; _i++) {
            var file = _a[_i];
            file.fileEntry.file(function (info) {
                console.log(info);
            });
        }
    };
    AppComponent.prototype.fileOver = function (event) {
        console.log(event);
    };
    AppComponent.prototype.fileLeave = function (event) {
        console.log(event);
    };
    return AppComponent;
}());
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["f" /* Component */])({
        selector: 'demo-root',
        template: __webpack_require__(140),
        styles: [__webpack_require__(138)]
    })
], AppComponent);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 82:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_component__ = __webpack_require__(81);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ngx_drop__ = __webpack_require__(80);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["b" /* NgModule */])({
        declarations: [
            __WEBPACK_IMPORTED_MODULE_2__app_component__["a" /* AppComponent */]
        ],
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_3__ngx_drop__["a" /* FileDropModule */]
        ],
        providers: [],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_2__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 83:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ })

},[171]);
//# sourceMappingURL=main.bundle.js.map