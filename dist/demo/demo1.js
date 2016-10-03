'use strict';

var _index = require('../lib/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var v = new _index2.default();

v.init(function (err, res) {
    console.log('Init res: ', res);
    // init will return the global status array
    // -> [vm1, vm2]
    // where vm1 and vm2 are objects containing id, name, state, provider, and directory attributes

    v.getGlobalStatus(function (err, res) {
        console.log('Global Status res: ', res);
        // same as init

        v.startVm(res.data[0].id, function (err, res) {
            console.log('Start VM res: ', res);
            // start will return the ID of the machine started
            // -> 'fc3rjd2'

            v.suspendVm(res.data, function (err, res) {
                console.log('SuspendVm res: ', res);
                // same as startVm

                v.startVm(res.data, function (err, res) {
                    console.log('Start VM res: ', res);
                    // ...

                    v.haltVm(res.data, function (err, res) {
                        console.log('Halt VM res: ', res);
                        // same as startVm

                        v.getVmStatus(res.data, function (err, res) {
                            console.log('VM Status res: ', res);
                            // returns the vm object given an ID

                            v.haltVm(res.data.id, function (err, res) {
                                // ...
                                console.log('Halt VM res: ', res);
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

v.on(v.enums.VAGRANT_STDERR, function (data) {
    console.log('STDERR: ', data);
});