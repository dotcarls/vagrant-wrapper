# vagrant-wrapper

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coveralls Status][coveralls-image]][coveralls-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Downloads][download-badge]][npm-url]

>

This is an experimental wrapper for Vagrant. Instead of attaching to specific directories and calling vagrant, this module attempts to parse the global status and control VMs according to their assigned ID. It supports both callback and event style interactions.

The module will not call any commands or do anything until `init()` is called (or it receives an init request event, more on that in a bit).

To see what's going on, simply listen for 'VAGRANT_STDOUT' or 'VAGRANT_STDERR' events. They are emitted throughout command execution. Each individual action can be listened to using the format 'VAGRANT_{ACTION}_LOG'.

Events can also be used to request actions and receive responses. An event from the client must be of the type 'VAGRANT_REQUEST', and responses from the module are of the type 'VAGRANT_RESPONSE'. To prevent code from breaking should the values of these strings change, it is best to reference the enums instead of using string literals.

## Install

```sh
npm i -D vagrant-wrapper
```

## Usage

This snippet will get the available VMs, then run through available actions (up, suspend, halt, status) while logging all `stdout` and `stderr` output.

```js
import Vagrant from "vagrant-wrapper";
const v = new Vagrant();

// Enums:
console.log(v.enums);
console.log(v.errorEnums);

v.init((err, data) => {
    console.log("Init data: ", data);
    // init will return the global status array
    // -> [vm1, vm2]
    // where vm1 and vm2 are objects containing id, name, state, provider, and directory attributes

    v.getGlobalStatus((err, data) => {
        console.log("Global Status data: ", data);
        // same as init

        v.startVm(data[0].id, (err, data) => {
            console.log("Start VM data: ", data);
            // start will return the ID of the machine started
            // -> 'fc3rjd2'

            v.suspendVm(data, (err, data) => {
                console.log("SuspendVm data: ", data);
                // same as startVm

                v.startVm(data, (err, data) => {
                    console.log("Start VM data: ", data);
                    // ...

                    v.haltVm(data, (err, data) => {
                        console.log("Halt VM data: ", data);
                        // same as startVm

                        v.getVmStatus(data, (err, data) => {
                            console.log("VM Status data: ", data);
                            // returns the vm object given an ID

                            v.haltVm(data.id, (err, data) => {
                                // ...
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
```

This same control flow could be done using events:

```js
const V = require('./dist');
const v = new V();

const enums = v.enums;
var flag = true;
var loop = true;

v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_INIT });
v.on(enums.VAGRANT_RESPONSE, (response) => {
    console.log(response);

    switch (response.action.type) {
        case enums.VAGRANT_INIT: {
            v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_START_VM, params: { id: response.data[0].id } });
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

v.on('VAGRANT_STDOUT', (data) => {
    console.log("STDOUT: ", data);
});

v.on('VAGRANT_STDERR', (data) => {
    console.log("STDERR: ", data);
});
```


Available methods:

```js
v.init(callback);
v.getGlobalStatus(callback);
v.pruneGlobalStatus(callback);
v.getVmStatus(id, callback);
v.startVm(id, callback);
v.suspendVm(id, callback);
v.haltVm(id, callback);
```

By default, nothing will be executed until `init()` is called, either through an event or a function call. Once this occurs, globalStatus is populated and functions will run. By default, `vagrant global-status` is not called with the `--prune` option, but this can be done through the `pruneGlobalStatus()` method.

Still to come:

    - Create / destroy VMs
    - Vagrantfile generation
    - Tests
    

## License

MIT © [Tim Carlson](http://github.com/dotcarls)

[npm-url]: https://npmjs.org/package/vagrant-wrapper
[npm-image]: https://img.shields.io/npm/v/vagrant-wrapper.svg?style=flat-square

[travis-url]: https://travis-ci.org/t/vagrant-wrapper
[travis-image]: https://img.shields.io/travis/t/vagrant-wrapper.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/t/vagrant-wrapper
[coveralls-image]: https://img.shields.io/coveralls/t/vagrant-wrapper.svg?style=flat-square

[depstat-url]: https://david-dm.org/t/vagrant-wrapper
[depstat-image]: https://david-dm.org/t/vagrant-wrapper.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/vagrant-wrapper.svg?style=flat-square
