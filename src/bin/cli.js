#! /usr/bin/env node

import meow from 'meow';
import vagrantWrapper from './lib/';

const cli = meow({
    help: [
        'Usage',
        '  $ vagrant-wrapper [input]',
        '',
        'Options',
        '  --foo  Lorem ipsum. [Default: false]',
        '',
        'Examples',
        '  $ vagrant-wrapper',
        '  unicorns & rainbows',
        '  $ vagrant-wrapper ponies',
        '  ponies & rainbows',
    ],
});

const input = cli.input || [];
const flags = cli.flags || {};

console.log(cli.help); // eslint-disable-line

vagrantWrapper(input, flags);
