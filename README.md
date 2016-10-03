<big><h1 align="center">vagrant-wrapper</h1></big>

<p align="center">
  <a href="https://npmjs.org/package/vagrant-wrapper">
    <img src="https://img.shields.io/npm/v/vagrant-wrapper.svg" alt="NPM Version">
  </a>

  <a href="http://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/vagrant-wrapper.svg" alt="License">
  </a>

  <a href="https://github.com/dotcarls/vagrant-wrapper/issues">
    <img src="https://img.shields.io/github/issues/dotcarls/vagrant-wrapper.svg" alt="Github Issues">
  </a>


  <a href="https://travis-ci.org/dotcarls/vagrant-wrapper">
    <img src="https://img.shields.io/travis/dotcarls/vagrant-wrapper.svg" alt="Travis Status">
  </a>



  <a href="https://coveralls.io/github/dotcarls/vagrant-wrapper">
    <img src="https://img.shields.io/coveralls/dotcarls/vagrant-wrapper.svg" alt="Coveralls">
  </a>



  <a href="http://commitizen.github.io/cz-cli/">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly">
  </a>

</p>

<p align="center"><big>
A node.js wrapper for the Vagrant CLI tool
</big></p>

This is an experimental wrapper for Vagrant. Instead of attaching to specific directories and calling vagrant, this module attempts to parse the global status and control VMs according to their assigned ID. It supports both callback and event style interactions.


## Features

- Parse `vagrant global-status`
- Start, suspend, halt Vagrant VM's
- Callback / event style interactions

## Install

```sh
npm install --save vagrant-wrapper
```

## Usage

The module will not be able to call any commands or do anything until `init()` is called (or it receives an init request event, more on that in a bit). `init()` is identical to `getGlobalStatus()`, and its only purpose is to populate the globalStatus array which is used by other methods to validate IDs and such.

To see what's going on, simply listen for 'VAGRANT_STDOUT' or 'VAGRANT_STDERR' events. They are emitted throughout command execution. Each individual action can be listened to using the format 'VAGRANT_{ACTION}_LOG'.

Events can also be used to request actions and receive responses. An event from the client must be of the type 'VAGRANT_REQUEST', and responses from the module are of the type 'VAGRANT_RESPONSE'. To prevent code from breaking should the values of these strings change, it is best to reference the enums instead of using string literals.

By default, `vagrant global-status` is not called with the `--prune` option, but this can be done through the `pruneGlobalStatus()` method. Do note that this will remove 'invalid' entries reported by `vagrant global-status`, so use with caution.

Any action that acts on a specific VM requires its ID as assigned by Vagrant, and these actions will return the ID as the result of the action.

Vagrant commands can be triggered in a callback fashion using the following syntax:

```js
const Vagrant = require('vagrant-wrapper');
const v = new Vagrant();

v.init((err, res) => {
    console.log(err, res);
    // res will be an object of the following form:
    // res = {
    //     action: <action>,
    //     error: <error>,
    //     result: <result>,
    //     data: <result.data>,
    // };
    //
    // res.result = {
    //     output: {
    //         stdout: <stdout>
    //         stderr: <stderr>
    //     },
    //    code: <code>,
    //    data: <data>,
    // };

    // err will be equal to res.result.code if code
    // returned from the Vagrant CLI is nonzero
});
```

Vagrant commands can be triggered via events using the following syntax:

```js
const Vagrant = require('vagrant-wrapper');
const v = new Vagrant();

v.emit(v.enums.VAGRANT_REQUEST, {
    type: v.enums.VAGRANT_INIT
});
```

If the command requires a parameter such as an ID, it should be called like so:

```js
const Vagrant = require('vagrant-wrapper');
const v = new Vagrant();

v.emit(v.enums.VAGRANT_REQUEST, {
    type: enums.VAGRANT_VM_STATUS,
    params: {
        id: '<someId>',
    },
});
```

### Callback style

```js
import Vagrant from 'vagrant-wrapper';
const v = new Vagrant();

v.init((err, res) => {
    console.log('Init res: ', res);
    // init will return the global status array
    // -> [vm1, vm2]
    // where vm1 and vm2 are objects containing id, name, state, provider, and directory attributes

    v.getGlobalStatus((err, res) => {
        console.log('Global Status res: ', res);
        // same as init

        v.startVm(res.data[0].id, (err, res) => {
            console.log('Start VM res: ', res);
            // start will return the ID of the machine started
            // -> 'fc3rjd2'

            v.suspendVm(res.data, (err, res) => {
                console.log('SuspendVm res: ', res);
                // same as startVm

                v.startVm(res.data, (err, res) => {
                    console.log('Start VM res: ', res);
                    // ...

                    v.haltVm(res.data, (err, res) => {
                        console.log('Halt VM res: ', res);
                        // same as startVm

                        v.getVmStatus(res.data, (err, res) => {
                            console.log('VM Status res: ', res);
                            // returns the vm object given an ID

                            v.haltVm(res.data.id, (err, res) => {
                                // ...
                                console.log('Halt VM res: ', res);
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

v.on(v.enums.VAGRANT_STDERR, (data) => {
    console.log('STDERR: ', data);
});
```

### Event style

```js
'use strict';

var V = require('vagrant-wrapper');
var v = new V();

var enums = v.enums;
var flag = true;
var loop = true;

v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_INIT });
v.on(enums.VAGRANT_RESPONSE, function (response) {
    console.log(response);

    switch (response.action.type) {
        case enums.VAGRANT_INIT:
            {
                v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_START_VM, params: { id: v.data.globalStatus[0].id } });
                break;
            }

        case enums.VAGRANT_START_VM:
            {
                if (flag) {
                    v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_SUSPEND_VM, params: { id: response.data } });
                    flag = false;
                    break;
                } else {
                    v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_HALT_VM, params: { id: response.data } });
                    break;
                }
            }

        case enums.VAGRANT_SUSPEND_VM:
            {
                v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_START_VM, params: { id: response.data } });
                break;
            }

        case enums.VAGRANT_HALT_VM:
            {
                v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_VM_STATUS, params: { id: response.data } });
            }

        default:
            {
                if (loop) {
                    v.emit(enums.VAGRANT_REQUEST, { type: enums.VAGRANT_GLOBAL_STATUS });
                    loop = false;
                    break;
                }
                break;
            }
    }
});

v.on(enums.VAGRANT_STDOUT, function (data) {
    console.log('STDOUT: ', data);
});

v.on(enums.VAGRANT_STDERR, function (data) {
    console.log('STDERR: ', data);
});
```

## API

- `init(<callback>)`
    - Populates the globalStatus array, returns the status array if a callback is supplied
- `getGlobalStatus(<callback>)`
    - Populates the globalStatus array, returns the status array if a callback is supplied
- `pruneGlobalStatus(<callback>)`
    - Same as getGlobalStatus() but with '--prune'
- `startVm(id, <callback>)`, `suspendVm(id, <callback>)`, `haltVm(id, <callback>)`
    - Attempts to start, suspend, or halt a VM given its ID. Returns the id as a result if a callback is supplied.
- `getVmStatus(id, <callback>)`
    - Updates the globalStatus array and attempts to return the requested VMs status

## Author

Tim Carlson tim.carlson@gmail.net https://github.com/dotcarls

## License

- **MIT** : http://opensource.org/licenses/MIT

## Contributing

Contributions are highly welcome! This repo is commitizen friendly — please read about it [here](http://commitizen.github.io/cz-cli/).
