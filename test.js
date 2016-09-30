const V = require('./dist');

const v = new V();

v.init((err, data) => {
    console.log("Init data: ", data);
    v.getGlobalStatus((err, data) => {
        console.log("Global Status data: ", data);
        v.startVm(data[0].id, (err, data) => {
            console.log("Start VM data: ", data);
            v.suspendVm(data, (err, data) => {
                console.log("SuspendVm data: ", data);
                v.startVm(data, (err, data) => {
                    console.log("Start VM data: ", data);
                    v.haltVm(data, (err, data) => {
                        console.log("Halt VM data: ", data);
                        v.getVmStatus(data, (err, data) => {
                            console.log("VM Status data: ", data);
                            v.haltVm(data.id, (err, data) => {
                                console.log("Halt VM data: ", data);
                            });
                        })
                    });
                });
            });
        });
    });
});

v.on('VAGRANT_STDOUT', (data) => {
    console.log("STDOUT: ", data);
});

v.on('VAGRANT_STDERR', (data) => {
    console.log("STDERR: ", data);
});
