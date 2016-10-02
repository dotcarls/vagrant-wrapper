import Vagrant from '../../dist/index.js';
const v = new Vagrant();

v.init((err, data) => {
    console.log('Init data: ', data);
    // init will return the global status array
    // -> [vm1, vm2]
    // where vm1 and vm2 are objects containing id, name, state, provider, and directory attributes

    v.getGlobalStatus((err, data) => {
        console.log('Global Status data: ', data);
        // same as init

        v.startVm(v.data.globalStatus[0].id, (err, data) => {
            console.log('Start VM data: ', data);
            // start will return the ID of the machine started
            // -> 'fc3rjd2'

            v.suspendVm(data, (err, data) => {
                console.log('SuspendVm data: ', data);
                // same as startVm

                v.startVm(data, (err, data) => {
                    console.log('Start VM data: ', data);
                    // ...

                    v.haltVm(data, (err, data) => {
                        console.log('Halt VM data: ', data);
                        // same as startVm

                        v.getVmStatus(data, (err, data) => {
                            console.log('VM Status data: ', data);
                            // returns the vm object given an ID

                            v.haltVm(data.id, (err, data) => {
                                // ...
                                console.log('Halt VM data: ', data);
                            });
                        })
                    });
                });
            });
        });
    });
});

v.on(v.enums.VAGRANT_STDOUT, (data) => {
    console.log('STDOUT: ', data);
});

v.on(v.enums.VAGRANT_STDOUT, (data) => {
    console.log('STDERR: ', data);
});
