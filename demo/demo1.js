'use strict';

var _index = require('../index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var v = new _index2.default();

v.init(function (err, data) {
    console.log('Init data: ', data);
    // init will return the global status array
    // -> [vm1, vm2]
    // where vm1 and vm2 are objects containing id, name, state, provider, and directory attributes

    v.getGlobalStatus(function (err, data) {
        console.log('Global Status data: ', data);
        // same as init

        v.startVm(v.data.globalStatus[0].id, function (err, data) {
            console.log('Start VM data: ', data);
            // start will return the ID of the machine started
            // -> 'fc3rjd2'

            v.suspendVm(data, function (err, data) {
                console.log('SuspendVm data: ', data);
                // same as startVm

                v.startVm(data, function (err, data) {
                    console.log('Start VM data: ', data);
                    // ...

                    v.haltVm(data, function (err, data) {
                        console.log('Halt VM data: ', data);
                        // same as startVm

                        v.getVmStatus(data, function (err, data) {
                            console.log('VM Status data: ', data);
                            // returns the vm object given an ID

                            v.haltVm(data.id, function (err, data) {
                                // ...
                                console.log('Halt VM data: ', data);
                            });
                        });
                    });
                });
            });
        });
    });
});

v.on(v.enums.VAGRANT_STDOUT, function (data) {
    console.log('STDOUT: ', data);
});

v.on(v.enums.VAGRANT_STDOUT, function (data) {
    console.log('STDERR: ', data);
});