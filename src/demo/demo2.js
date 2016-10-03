const V = require('../lib/index.js');
const v = new V();

const enums = v.enums;
var flag = true;
var loop = true;

v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_INIT });
v.on(enums.VAGRANT_RESPONSE, (response) => {
    console.log(response);

    switch (response.action.type) {
        case enums.VAGRANT_INIT: {
            v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_START_VM, params: { id: v.data.globalStatus[0].id } });
            break;
        }

        case enums.VAGRANT_START_VM: {
            if (flag) {
                v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_SUSPEND_VM, params: { id: response.data } });
                flag = false;
                break;
            } else {
                v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_HALT_VM, params: { id: response.data } });
                break;
            }
        }

        case enums.VAGRANT_SUSPEND_VM: {
            v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_START_VM, params: { id: response.data } });
            break;
        }

        case enums.VAGRANT_HALT_VM: {
            v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_VM_STATUS, params: { id: response.data } });
        }

        default: {
            if (loop) {
                v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_GLOBAL_STATUS });
                loop = false;
                break;
            }
            break;
        }
    }
});

v.on(enums.VAGRANT_STDOUT, (data) => {
    console.log('STDOUT: ', data);
});

v.on(enums.VAGRANT_STDERR, (data) => {
    console.log('STDERR: ', data);
});
