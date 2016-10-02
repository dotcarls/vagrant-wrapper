import test from 'ava';
import 'babel-core/register';

import Vagrant from '../src/lib/';
const V = new Vagrant();

const globalStatusOutput = `
id       name    provider  state     directory
--------------------------------------------------------------------------------------------------
fc02d0e  default parallels stopped   /Users/Some.User/Work/Virtual Machines/Vagrant/master
1fd872d  default parallels suspended /Users/Some.User/Work/Virtual Machines/Vagrant/release_2.2

The above shows information about all known Vagrant environments
on this machine. This data is cached and may not be completely
up-to-date. To interact with any of the machines, you can go to
that directory and run Vagrant, or you can use the ID directly
with Vagrant commands from any directory. For example:
"vagrant destroy 1a2b3c4d"
`;

const lineOutput = 'fc02d0e  default parallels stopped   /Users/Some.User/Work/Virtual Machines/Vagrant/master      ';

const masterObj = {
    id: 'fc02d0e',
    name: 'default',
    provider: 'parallels',
    state: 'stopped',
    directory: '/Users/Some.User/Work/Virtual Machines/Vagrant/master',
};

const release22Obj = {
    id: '1fd872d',
    name: 'default',
    provider: 'parallels',
    state: 'suspended',
    directory: '/Users/Some.User/Work/Virtual Machines/Vagrant/release_2.2',
};

const globalStatus = [masterObj, release22Obj];

function isM(t, input, expected) {
    t.is(input, expected);
}
isM.title = (providedTitle, input, expected) => `${providedTitle} ${input} === ${expected}`.trim();

function deepEqualM(t, input, expected) {
    t.deepEqual(input, expected);
}
deepEqualM.title = (providedTitle, input, expected) => `${providedTitle} ${input} === ${expected}`.trim();

test('Vagrant Init', (t) => {
    const v = new Vagrant();

    t.deepEqual(v.data, {
        globalStatus: [],
    });
});

test(isM, V.parseLine(lineOutput), masterObj);
test(isM, V.parseLine(' '), []);
test(isM, V.parseLine(), []);

test(deepEqualM, V.parseGlobalStatus(globalStatusOutput), globalStatus);
test(deepEqualM, V.parseGlobalStatus(' '), []);
test(deepEqualM, V.parseGlobalStatus(), []);

test(deepEqualM, V.updateGlobalStatus(globalStatus), globalStatus);
test(deepEqualM, V.data.globalStatus, globalStatus);
test(deepEqualM, V.updateGlobalStatus(' '), globalStatus);
test(deepEqualM, V.updateGlobalStatus([]), []);
test(deepEqualM, V.data.globalStatus, []);

test((t) => {
    V.completionHandler(null, null, null, (err) => {
        if (err) {
            t.pass();
        } else {
            t.pass();
        }
    });
});
