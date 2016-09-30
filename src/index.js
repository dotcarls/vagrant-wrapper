/**
 * @param {Type}
 * @return {Type}
 */
const EventEmitter = require('events');
const spawn = require('child_process').spawn;
const readline = require('readline');

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
    VAGRANT_EVENT_REQUEST: 'VAGRANT_EVENT_REQUEST',
    VAGRANT_ACTION_RESPONSE: 'VAGRANT_ACTION_RESPONSE',
    VAGRANT_EVENT_RESPONSE: 'VAGRANT_EVENT_RESPONSE',
    VAGRANT_REQUEST: 'VAGRANT_REQUEST',
    VAGRANT_RESPONSE: 'VAGRANT_RESPONSE',
};

const ErrorEnums = {
    ACTION_NEED_TYPE: 'Actions must have a type attribute',
    ACTION_NEED_ID: 'This action requires an ID',
    ACTION_COULD_NOT_FIND_VM: 'Could not locate the VM with the supplied ID',
    ACTION_INVALID: 'This action is invalid for calling vagrant',
    VAGRANT_CALL_NEEDS_ACTION: 'Need an action to call vagrant',
}

class Vagrant extends EventEmitter {
    constructor() {
        super();

        this.data = {};
        this.data.globalStatus = [];
        this.enums = Enums;
        this.errorEnums = ErrorEnums;

        this.on(this.enums.VAGRANT_REQUEST, (data) => this.eventHandler(data));
    }

    init(callback = null) {
        const action = { type: this.enums.VAGRANT_INIT };
        this.callVagrant(action, callback);
    }

    getGlobalStatus(callback) {
        const action = { type: this.enums.VAGRANT_GLOBAL_STATUS };
        this.callVagrant(action, callback);
    }

    pruneGlobalStatus(callback) {
        const action = { type: this.enums.VAGRANT_PRUNE_GLOBAL_STATUS };
        this.callVagrant(action, callback);
    }

    getVmStatus(id = null, callback = null) {
        const action = { type: this.enums.VAGRANT_VM_STATUS };
        if ( !id || !id.length > 0 ) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, null, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, null, callback);
        } else {
            this.callVagrant(action, callback, { id: id });
        }
    }

    updateVmStatus(newStatus) {
        let flag = true;
        this.data.globalStatus.forEach((status) => {
            if (status.id === newStatus.id) {
                status = newStatus;
                flag = false;
            }
        });

        if (flag) {
            this.data.globalStatus.push(newStatus);
        }
    }

    startVm(id = null, callback = null) {
        const action = { type: this.enums.VAGRANT_START_VM };
        const result = id;

        if ( !id || !id.length > 0 ) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, result, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, result, callback);
        } else {
            this.callVagrant(action, callback, { id: id });
        }
    }

    suspendVm(id = null, callback = null) {
        const action = { type: this.enums.VAGRANT_SUSPEND_VM };
        const result = id;

        if ( !id || !id.length > 0 ) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, result, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, result, callback);
        } else {
            this.callVagrant(action, callback, { id: id });
        }
    }

    haltVm(id = null, callback = null) {
        const action = { type: this.enums.VAGRANT_HALT_VM };

        if ( !id || !id.length > 0 ) {
            this.completionHandler(action, this.errorEnums.ACTION_NEED_ID, null, callback);
        } else if (this.data.globalStatus.filter((vm) => vm.id === id).length !== 1) {
            this.completionHandler(action, this.errorEnums.ACTION_COULD_NOT_FIND_VM, null, callback);
        } else {
            this.callVagrant(action, callback, { id: id });
        }
    }

    eventHandler(action) {
        if ( !action ) {
            this.completionHandler({ type: this.enums.VAGRANT_ACTION_ERROR }, this.errEnums.VAGRANT_CALL_NEEDS_ACTION);
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
                    this.completionHandler({ type: this.enums.VAGRANT_ACTION_ERROR }, this.errEnums.ACTION_INVALID);
                    break;
                }
            }
        }
    }

    callVagrant(action=null, callback=null, params=null) {
        let args = null;
        let result = null;
        if ( !action ) {
            this.completionHandler( { type: this.enums.VAGRANT_ACTION_ERROR }, this.errorEnums.VAGRANT_CALL_NEEDS_ACTION, result, callback)
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
                let output = '';
                let error = '';

                vagrant.stdout.on('data', (data) => {
                    output += data.toString();
                    this.emit(this.enums.VAGRANT_STDOUT, data.toString());
                    this.emit(this.enums[action.type + '_LOG'], data.toString());
                });

                vagrant.stderr.on('data', (data) => {
                    error += data.toString();
                    this.emit(this.enums.VAGRANT_STDERR, data.toString());
                    this.emit(this.enums[action.type + '_LOG'], data.toString());
                });

                vagrant.on('close', (code) => {
                    if ( action.type === this.enums.VAGRANT_GLOBAL_STATUS ||
                         action.type === this.enums.VAGRANT_PRUNE_GLOBAL_STATUS ||
                         action.type === this.enums.VAGRANT_VM_STATUS ||
                         action.type === this.enums.VAGRANT_INIT ) {
                        const defaultObj = {
                            id: '',
                            name: '',
                            provider: '',
                            state: '',
                            directory: '',
                        };

                        output.split('\n').forEach((line) => {
                            let strArray = line.split(' ').filter((el) => el.length !== 0);

                            if (strArray[0] && strArray[0].length === 7) {
                                let newObj = Object.assign({}, defaultObj);

                                newObj.id = strArray[0];
                                newObj.name = strArray[1];
                                newObj.provider = strArray[2];
                                newObj.state = strArray[3];
                                newObj.directory = line.split(newObj.state + ' ')[1].trim();

                                this.updateVmStatus(newObj);
                            }
                        });

                        result = this.data.globalStatus;

                        if ( action.type === this.enums.VAGRANT_VM_STATUS ) {
                            result = this.data.globalStatus.filter((vm) => vm.id === params.id)[0];
                        }
                    }

                    this.completionHandler(action, error, result, callback);
                });
            }
        }
    }

    completionHandler(action, err = null, data = null, callback = null) {
        this.emit(this.enums.VAGRANT_RESPONSE, { action: action, error: err, data: data });
        if (callback) {
            callback(err, data);
        }
    }

}

module.exports = Vagrant;
