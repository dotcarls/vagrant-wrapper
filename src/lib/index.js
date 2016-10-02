/**
 * @param {Type}
 * @return {Type}
 */
const EventEmitter = require('events');
const spawn = require('child_process').spawn;

const Enums = {
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
    VAGRANT_RESPONSE: 'VAGRANT_RESPONSE',
};

const ErrorEnums = {
    ACTION_NEED_TYPE: 'Actions must have a type attribute',
    ACTION_NEED_ID: 'This action requires an ID',
    ACTION_COULD_NOT_FIND_VM: 'Could not locate the VM with the supplied ID',
    ACTION_INVALID: 'This action is invalid for calling vagrant',
    VAGRANT_CALL_NEEDS_ACTION: 'Need an action to call vagrant',
};

export default class Vagrant extends EventEmitter {
    constructor() {
        super();

        this.data = {};
        this.data.globalStatus = [];
        this.enums = Enums;
        this.errorEnums = ErrorEnums;

        this.on(this.enums.VAGRANT_REQUEST, (data) => this.eventHandler(data));

        this.actions = Object.assign(...Object.keys(Enums).map((key) => ({ [key]: { type: Enums[key] } })));
    }

    completionHandler(action = this.actions.VAGRANT_RESPONSE, err = null, data = null, callback = null) {
        const result = {
            action: action,
            error: err,
            data: data,
        };

        this.emit(this.enums.VAGRANT_RESPONSE, result);

        if (callback) {
            callback(err, data);
        }
    }

    parseLine(line) {
        const defaultObj = {
            id: '',
            name: '',
            provider: '',
            state: '',
            directory: '',
        };

        if (line && (typeof line === 'string' || line instanceof String)) {
            const strArray = line.split(' ').filter((el) => el.length !== 0);

            if (strArray[0] && strArray[0].length === 7) {
                const newObj = Object.assign({}, defaultObj);

                newObj.id = strArray[0];
                newObj.name = strArray[1];
                newObj.provider = strArray[2];
                newObj.state = strArray[3];
                newObj.directory = line.split(`${newObj.state} `)[1].trim();

                return newObj;
            }
        }
    }

    parseGlobalStatus(output) {
        let result = [];

        if (output && (typeof ouput === 'string' || output instanceof String)) {
            result = output.split('\n')
                           .map(this.parseLine)
                           .filter((el) => typeof el !== 'undefined');
        }

        return result;
    }

    updateGlobalStatus(globalStatus) {
        if (globalStatus && typeof Array.isArray(globalStatus)) {
            this.data.globalStatus = globalStatus;
        }

        return this.data.globalStatus;
    }

    init(callback = null) {
        const action = {
            type: this.enums.VAGRANT_INIT,
        };

        this.callVagrant(action, callback);
    }

    getGlobalStatus(callback) {
        const action = {
            type: this.enums.VAGRANT_GLOBAL_STATUS,
        };

        this.callVagrant(action, callback);
    }

    pruneGlobalStatus(callback) {
        const action = {
            type: this.enums.VAGRANT_PRUNE_GLOBAL_STATUS,
        };

        this.callVagrant(action, callback);
    }

    getVmStatus(id = null, callback = null) {
        const action = {
            type: this.enums.VAGRANT_VM_STATUS,
        };

        /* istanbul ignore next */
        if (!id || !id.length > 0) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, null, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, null, callback);
        } else {
            const params = {
                id: id,
            };

            this.callVagrant(action, callback, params);
        }
    }

    startVm(id = null, callback = null) {
        const action = {
            type: this.enums.VAGRANT_START_VM,
        };
        const result = id;

        /* istanbul ignore next */
        if ( !id || !id.length > 0 ) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, result, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, result, callback);
        } else {
            const params = {
                id: id,
            };

            this.callVagrant(action, callback, params);
        }
    }

    suspendVm(id = null, callback = null) {
        const action = {
            type: this.enums.VAGRANT_SUSPEND_VM,
        };
        const result = id;

        /* istanbul ignore next */
        if ( !id || !id.length > 0 ) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, result, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, result, callback);
        } else {
            const params = {
                id: id,
            };

            this.callVagrant(action, callback, params);
        }
    }

    haltVm(id = null, callback = null) {
        const action = {
            type: this.enums.VAGRANT_HALT_VM,
        };

        /* istanbul ignore next */
        if ( !id || !id.length > 0 ) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, null, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, null, callback);
        } else {
            const params = {
                id: id,
            };

            this.callVagrant(action, callback, params);
        }
    }

    eventHandler(action) {

        /* istanbul ignore next */
        if ( !action ) {
            action = {
                type: this.enums.VAGRANT_ACTION_ERROR,
            };

            this.completionHandler(action, this.errEnums.VAGRANT_CALL_NEEDS_ACTION);
        } else {
            switch ( action.type ) {
                case this.enums.VAGRANT_INIT: {
                    this.init();
                    break;
                }

                case this.enums.VAGRANT_GLOBAL_STATUS: {
                    this.getGlobalStatus();
                    break;
                }

                case this.enums.VAGRANT_PRUNE_GLOBAL_STATUS: {
                    this.pruneGlobalStatus();
                    break;
                }

                case this.enums.VAGRANT_START_VM: {
                    this.startVm(action.params.id);
                    break;
                }

                case this.enums.VAGRANT_SUSPEND_VM: {
                    this.suspendVm(action.params.id);
                    break;
                }

                case this.enums.VAGRANT_HALT_VM: {
                    this.haltVm(action.params.id);
                    break;
                }

                case this.enums.VAGRANT_VM_STATUS: {
                    this.getVmStatus(action.params.id);
                    break;
                }

                default: {
                    action = {
                        type: this.enums.VAGRANT_ACTION_ERROR,
                    };

                    this.completionHandler(action, this.errEnums.ACTION_INVALID);
                    break;
                }
            }
        }
    }

    callVagrant(action = null, callback = null, params = null) {
        let args = null;
        let result = null;

        /* istanbul ignore next */
        if ( !action ) {
            action = {
                type: this.enums.VAGRANT_ACTION_ERROR,
            };

            this.completionHandler(action, this.errorEnums.VAGRANT_CALL_NEEDS_ACTION, result, callback);
        } else {
            switch ( action.type ) {
                case this.enums.VAGRANT_START_VM: {
                    args = ['up', params.id];
                    result = params.id;
                    break;
                }

                case this.enums.VAGRANT_SUSPEND_VM: {
                    args = ['suspend', params.id];
                    result = params.id;
                    break;
                }

                case this.enums.VAGRANT_HALT_VM: {
                    args = ['halt', params.id];
                    result = params.id;
                    break;
                }

                case this.enums.VAGRANT_GLOBAL_STATUS: {
                    args = ['global-status'];
                    break;
                }

                case this.enums.VAGRANT_PRUNE_GLOBAL_STATUS: {
                    args = ['global-status', '--prune'];
                    break;
                }

                case this.enums.VAGRANT_VM_STATUS: {
                    args = ['global-status'];
                    break;
                }

                case this.enums.VAGRANT_INIT: {
                    args = ['global-status'];
                    break;
                }

                default: {
                    this.completionHandler(action, this.errorEnums.ACTION_INVALID, result, callback);
                    break;
                }
            }

            if ( args ) {
                const vagrant = spawn('vagrant', args);
                const logKey = `${action.type}_LOG`;
                let output = '';
                let error = '';

                vagrant.stdout.on('data', (data) => {
                    output += data.toString();
                    this.emit(this.enums.VAGRANT_STDOUT, data.toString());
                    this.emit(this.enums[logKey], data.toString());
                });

                vagrant.stderr.on('data', (data) => {
                    error += data.toString();
                    this.emit(this.enums.VAGRANT_STDERR, data.toString());
                    this.emit(this.enums[logKey], data.toString());
                });

                vagrant.on('close', (code) => {
                    if ( action.type === this.enums.VAGRANT_GLOBAL_STATUS
                      || action.type === this.enums.VAGRANT_PRUNE_GLOBAL_STATUS
                      || action.type === this.enums.VAGRANT_VM_STATUS
                      || action.type === this.enums.VAGRANT_INIT ) {

                        this.updateglobalStatus(this.parseGlobalStatus(output));
                        result = code;

                        if ( action.type === this.enums.VAGRANT_VM_STATUS ) {
                            result = this.data.globalStatus.filter((vm) => vm.id === params.id)[0];
                        }
                    }

                    this.completionHandler(action, error, result, callback);
                });
            }
        }
    }
}
