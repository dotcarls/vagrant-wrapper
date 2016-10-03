'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
* @param {Type}
* @return {Type}
*/
var EventEmitter = require('events');
var spawn = require('child_process').spawn;

var Enums = {
    VAGRANT_INIT: 'VAGRANT_INIT',
    VAGRANT_GLOBAL_STATUS: 'VAGRANT_GLOBAL_STATUS',
    VAGRANT_GLOBAL_STATUS_LOG: 'VAGRANT_GLOBAL_STATUS_LOG',
    VAGRANT_PRUNE_GLOBAL_STATUS: 'VAGRANT_PRUNE_GLOBAL_STATUS',
    VAGRANT_PRUNE_GLOBAL_STATUS_LOG: 'VAGRANT_PRUNE_GLOBAL_STATUS_LOG',
    VAGRANT_START_VM: 'VAGRANT_START_VM',
    VAGRANT_START_VM_LOG: 'VAGRANT_START_VM_LOG',
    VAGRANT_SUSPEND_VM: 'VAGRANT_SUSPEND_VM',
    VAGRANT_SUSPEND_VM_LOG: 'VAGRANT_SUSPEND_VM_LOG',
    VAGRANT_HALT_VM: 'VAGRANT_HALT_VM',
    VAGRANT_HALT_VM_LOG: 'VAGRANT_HALT_VM_LOG',
    VAGRANT_VM_STATUS: 'VAGRANT_VM_STATUS',
    VAGRANT_STDOUT: 'VAGRANT_STDOUT',
    VAGRANT_STDERR: 'VAGRANT_STDERR',
    VAGRANT_ACTION_ERROR: 'VAGRANT_ACTION_ERROR',
    VAGRANT_REQUEST: 'VAGRANT_REQUEST',
    VAGRANT_RESPONSE: 'VAGRANT_RESPONSE'
};

var ErrorEnums = {
    ACTION_NEED_TYPE: 'Actions must have a type attribute',
    ACTION_NEED_ID: 'This action requires an ID',
    ACTION_COULD_NOT_FIND_VM: 'Could not locate the VM with the supplied ID',
    ACTION_INVALID: 'This action is invalid for calling vagrant',
    VAGRANT_CALL_NEEDS_ACTION: 'Need an action to call vagrant'
};

var Vagrant = function (_EventEmitter) {
    _inherits(Vagrant, _EventEmitter);

    function Vagrant() {
        _classCallCheck(this, Vagrant);

        var _this = _possibleConstructorReturn(this, (Vagrant.__proto__ || Object.getPrototypeOf(Vagrant)).call(this));

        _this.data = {};
        _this.data.globalStatus = [];
        _this.enums = Enums;
        _this.errorEnums = ErrorEnums;

        _this.on(_this.enums.VAGRANT_REQUEST, function (data) {
            return _this.eventHandler(data);
        });

        _this.actions = _extends.apply(undefined, _toConsumableArray(Object.keys(Enums).map(function (key) {
            return _defineProperty({}, key, { type: Enums[key] });
        })));
        return _this;
    }

    _createClass(Vagrant, [{
        key: 'completionHandler',
        value: function completionHandler() {
            var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.actions.VAGRANT_REQUEST;
            var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
            var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

            var result = {
                action: action,
                error: error,
                result: data
            };

            if (data && data.data) {
                result.data = data.data;
            }

            this.emit(this.enums.VAGRANT_RESPONSE, result);

            if (callback) {
                callback(error, result);
            }
        }
    }, {
        key: 'parseLine',
        value: function parseLine(line) {
            var result = null;

            var defaultObj = {
                id: '',
                name: '',
                provider: '',
                state: '',
                directory: ''
            };

            if (line && (typeof line === 'string' || line instanceof String)) {
                var strArray = line.split(' ').filter(function (el) {
                    return el.length !== 0;
                });

                if (strArray[0] && strArray[0].length === 7) {
                    var newObj = _extends({}, defaultObj);

                    newObj.id = strArray[0];
                    newObj.name = strArray[1];
                    newObj.provider = strArray[2];
                    newObj.state = strArray[3];
                    newObj.directory = line.split(newObj.state + ' ')[1].trim();

                    result = newObj;
                }
            }

            return result;
        }
    }, {
        key: 'parseGlobalStatus',
        value: function parseGlobalStatus(output) {
            if (output && (typeof ouput === 'string' || output instanceof String)) {
                var result = output.split('\n').map(this.parseLine).filter(function (el) {
                    return el !== null;
                });

                return result;
            }
            return [];
        }
    }, {
        key: 'init',
        value: function init() {
            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var action = {
                type: this.enums.VAGRANT_INIT
            };

            this.callVagrant(action, callback);
        }
    }, {
        key: 'getGlobalStatus',
        value: function getGlobalStatus(callback) {
            var action = {
                type: this.enums.VAGRANT_GLOBAL_STATUS
            };

            this.callVagrant(action, callback);
        }
    }, {
        key: 'pruneGlobalStatus',
        value: function pruneGlobalStatus(callback) {
            var action = {
                type: this.enums.VAGRANT_PRUNE_GLOBAL_STATUS
            };

            this.callVagrant(action, callback);
        }
    }, {
        key: 'getVmStatus',
        value: function getVmStatus() {
            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var action = {
                type: this.enums.VAGRANT_VM_STATUS
            };

            /* istanbul ignore next */
            if (!id || !id.length > 0) {
                this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, null, callback);
            } else if (this.data.globalStatus.filter(function (vm) {
                return vm.id === id;
            }).length !== 1) {
                this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, null, callback);
            } else {
                var params = {
                    id: id
                };

                this.callVagrant(action, callback, params);
            }
        }
    }, {
        key: 'startVm',
        value: function startVm() {
            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var action = {
                type: this.enums.VAGRANT_START_VM
            };
            var result = id;

            /* istanbul ignore next */
            if (!id || !id.length > 0) {
                this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, result, callback);
            } else if (this.data.globalStatus.filter(function (vm) {
                return vm.id === id;
            }).length !== 1) {
                this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, result, callback);
            } else {
                var params = {
                    id: id
                };

                this.callVagrant(action, callback, params);
            }
        }
    }, {
        key: 'suspendVm',
        value: function suspendVm() {
            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var action = {
                type: this.enums.VAGRANT_SUSPEND_VM
            };
            var result = id;

            /* istanbul ignore next */
            if (!id || !id.length > 0) {
                this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, result, callback);
            } else if (this.data.globalStatus.filter(function (vm) {
                return vm.id === id;
            }).length !== 1) {
                this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, result, callback);
            } else {
                var params = {
                    id: id
                };

                this.callVagrant(action, callback, params);
            }
        }
    }, {
        key: 'haltVm',
        value: function haltVm() {
            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var action = {
                type: this.enums.VAGRANT_HALT_VM
            };

            /* istanbul ignore next */
            if (!id || !id.length > 0) {
                this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, null, callback);
            } else if (this.data.globalStatus.filter(function (vm) {
                return vm.id === id;
            }).length !== 1) {
                this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, null, callback);
            } else {
                var params = {
                    id: id
                };

                this.callVagrant(action, callback, params);
            }
        }
    }, {
        key: 'eventHandler',
        value: function eventHandler(action) {

            /* istanbul ignore next */
            if (!action) {
                action = {
                    type: this.enums.VAGRANT_ACTION_ERROR
                };

                this.completionHandler(action, this.errEnums.VAGRANT_CALL_NEEDS_ACTION);
            } else {
                switch (action.type) {
                    case this.enums.VAGRANT_INIT:
                        {
                            this.init();
                            break;
                        }

                    case this.enums.VAGRANT_GLOBAL_STATUS:
                        {
                            this.getGlobalStatus();
                            break;
                        }

                    case this.enums.VAGRANT_PRUNE_GLOBAL_STATUS:
                        {
                            this.pruneGlobalStatus();
                            break;
                        }

                    case this.enums.VAGRANT_START_VM:
                        {
                            this.startVm(action.params.id);
                            break;
                        }

                    case this.enums.VAGRANT_SUSPEND_VM:
                        {
                            this.suspendVm(action.params.id);
                            break;
                        }

                    case this.enums.VAGRANT_HALT_VM:
                        {
                            this.haltVm(action.params.id);
                            break;
                        }

                    case this.enums.VAGRANT_VM_STATUS:
                        {
                            this.getVmStatus(action.params.id);
                            break;
                        }

                    default:
                        {
                            action = {
                                type: this.enums.VAGRANT_ACTION_ERROR
                            };

                            this.completionHandler(action, this.errEnums.ACTION_INVALID);
                            break;
                        }
                }
            }
        }
    }, {
        key: 'updateVmStatus',
        value: function updateVmStatus(newStatus) {
            var newGlobalStatus = [newStatus].concat(_toConsumableArray(this.data.globalStatus.filter(function (status) {
                return status.id !== newStatus.id;
            })));

            this.data.globalStatus = newGlobalStatus;
        }
    }, {
        key: 'callVagrant',
        value: function callVagrant() {
            var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var _this2 = this;

            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var result = {
                output: {
                    stderr: '',
                    stdout: ''
                },
                data: '',
                code: ''
            };
            var args = null;
            var error = null;

            /* istanbul ignore next */
            if (!action) {
                action = {
                    type: this.enums.VAGRANT_ACTION_ERROR
                };

                this.completionHandler(action, this.errorEnums.VAGRANT_CALL_NEEDS_ACTION, result, callback);
            } else {
                switch (action.type) {
                    case this.enums.VAGRANT_START_VM:
                        {
                            args = ['up', params.id];
                            result.data = params.id;
                            break;
                        }

                    case this.enums.VAGRANT_SUSPEND_VM:
                        {
                            args = ['suspend', params.id];
                            result.data = params.id;
                            break;
                        }

                    case this.enums.VAGRANT_HALT_VM:
                        {
                            args = ['halt', params.id];
                            result.data = params.id;
                            break;
                        }

                    case this.enums.VAGRANT_GLOBAL_STATUS:
                        {
                            args = ['global-status'];
                            break;
                        }

                    case this.enums.VAGRANT_PRUNE_GLOBAL_STATUS:
                        {
                            args = ['global-status', '--prune'];
                            break;
                        }

                    case this.enums.VAGRANT_VM_STATUS:
                        {
                            args = ['global-status'];
                            break;
                        }

                    case this.enums.VAGRANT_INIT:
                        {
                            args = ['global-status'];
                            break;
                        }

                    default:
                        {
                            this.completionHandler(action, this.errorEnums.ACTION_INVALID, result, callback);
                            break;
                        }
                }

                if (args) {
                    (function () {
                        var vagrant = spawn('vagrant', args);
                        var logKey = action.type + '_LOG';

                        vagrant.stdout.on('data', function (data) {
                            result.output.stdout += data.toString();
                            _this2.emit(_this2.enums.VAGRANT_STDOUT, data.toString());
                            _this2.emit(_this2.enums[logKey], data.toString());
                        });

                        vagrant.stderr.on('data', function (data) {
                            result.output.stderr += data.toString();
                            _this2.emit(_this2.enums.VAGRANT_STDERR, data.toString());
                            _this2.emit(_this2.enums[logKey], data.toString());
                        });

                        vagrant.on('close', function (code) {
                            result.code = code;
                            if (code !== 0) {
                                error = code;
                            }

                            if (action.type === _this2.enums.VAGRANT_GLOBAL_STATUS || action.type === _this2.enums.VAGRANT_PRUNE_GLOBAL_STATUS || action.type === _this2.enums.VAGRANT_VM_STATUS || action.type === _this2.enums.VAGRANT_INIT) {
                                (function () {

                                    var defaultObj = {
                                        id: '',
                                        name: '',
                                        provider: '',
                                        state: '',
                                        directory: ''
                                    };

                                    result.output.stdout.split('\n').forEach(function (line) {
                                        var strArray = line.split(' ').filter(function (el) {
                                            return el.length !== 0;
                                        });

                                        if (strArray[0] && strArray[0].length === 7) {
                                            var newObj = _extends({}, defaultObj);

                                            newObj.id = strArray[0];
                                            newObj.name = strArray[1];
                                            newObj.provider = strArray[2];
                                            newObj.state = strArray[3];
                                            newObj.directory = line.split(newObj.state + ' ')[1].trim();

                                            _this2.updateVmStatus(newObj);
                                        }
                                    });

                                    result.data = _this2.data.globalStatus;

                                    if (action.type === _this2.enums.VAGRANT_VM_STATUS) {
                                        result.data = _this2.data.globalStatus.filter(function (vm) {
                                            return vm.id === params.id;
                                        })[0];
                                    }
                                })();
                            }

                            _this2.completionHandler(action, error, result, callback);
                        });
                    })();
                }
            }
        }
    }]);

    return Vagrant;
}(EventEmitter);

module.exports = Vagrant;