const fs = require('fs');
const { resolve } = require('path');
const readline = require('readline');

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MODE_CONSOLE = '-c';
const MODE_FILE = '-f';
const MODES = [MODE_CONSOLE, MODE_FILE];
const CHAR_TO_MORSE = {
    '.': '.-.-.-',
    ',': '--..--',
    'A': '.-',
    'B': '-...',
    'C': '-.-.',
    'D': '-..',
    'E': '.',
    'F': '..-.',
    'G': '--.',
    'H': '....',
    'I': '..',
    'J': '.---',
    'K': '-.-',
    'L': '.-..',
    'M': '--',
    'N': '-.',
    'O': '---',
    'P': '.--.',
    'Q': '--.-',
    'R': '.-.',
    'S': '...',
    'T': '-',
    'U': '..-',
    'V': '...-',
    'W': '.--',
    'X': '-..-',
    'Y': '-.--',
    'Z': '--..',
    '0': '-----',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.'
};

const convertToMorse = str => {
    let result = '';

    const split = str.split('');
    const total = split.length - 1 + '';

    for (const index in split) {
        const char = split[index];
        const upperChar = char.toUpperCase();

        if (!CHAR_TO_MORSE.hasOwnProperty(upperChar)) {
            result = `${result}${upperChar}`;
            continue;
        }

        if (upperChar === ' ') {
            result = `${result}/`;
            continue;
        }

        result = `${result}${CHAR_TO_MORSE[upperChar]}${index !== total ? '|' : ''}`;
    }

    return result;
};

const obfuscateMorse = morse => {
    let result = '';

    const split = morse.split('');
    const total = split.length - 1 + '';

    let matchCounter = 1;

    for (const index in split) {
        const previous = split[index - 1];
        const current = split[index];

        if (['.', '-', '/', '|'].indexOf(current) === -1) {
            result = `${result}${current}`;
            continue;
        }

        if (typeof previous !== 'undefined' && previous === current) {
            matchCounter++;
        }

        if (typeof previous !== 'undefined' && previous !== current) {
            if (previous === '.') {
                result = `${result}${matchCounter}`;
            }

            if (previous === '-') {
                result = `${result}${ALPHABET[matchCounter - 1]}`;
            }

            matchCounter = 1;
        }

        if (current === '|' || current === '/') {
            matchCounter = 1;
            result = `${result}${current}`;
        }

        if (index === total) {
            if (current === '.') {
                result = `${result}${matchCounter}`;
            }

            if (current === '-') {
                result = `${result}${ALPHABET[matchCounter - 1]}`;
            }
        }
    }

    result = result.replace(/\| /gi, '/');
    return result;
};

const run = () => {
    const mode = process.argv[2];

    console.log(`                                  
       ____ ___  ____  ______________  ____ 
      / __ \`__ \\/ __ \\/ ___/ ___/ __ \\/ __ \\
     / / / / / / /_/ / /  (__  ) /_/ / / / /
    /_/ /_/ /_/\\____/_/  /____/\\____/_/ /_/                                                                                                           
    `);

    // Validate input
    let valid = true;
    let error = '';

    if (MODES.indexOf(mode) === -1) {
        error = 'Please specify a source, either -c, for stdin or -f for file.';
        valid = false;
    }

    const filePath = process.argv[3];

    if (mode === MODE_FILE) {
        if (typeof filePath === 'undefined') {
            error = 'Please specify a file path eg: node index.js -f input.';
            valid = false;
        }

        if (!fs.existsSync(resolve(filePath))) {
            error = 'Input file could not be found, make sure the specified path is correct.';
            valid = false;
        }

        if (filePath === 'output') {
            error = 'Input file must not be named as the output file.';
            valid = false;
        }
    }

    if (!valid) {
        console.log(error);
        process.exit();
    }

    // Run the encoding
    if (mode === MODE_CONSOLE) {
        console.log(`Please write the text to be encoded below, press enter to generate the output file. \n`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        rl.on('line', line => {
            let result = obfuscateMorse(convertToMorse(line));
            fs.writeFileSync('output', result, 'utf-8');
            console.log('Obfuscated code generated in `output` file.');
            process.exit();
        });
    }

    if (mode === MODE_FILE) {
        const input = fs.readFileSync(filePath, 'utf-8');
        let result = obfuscateMorse(convertToMorse(input));
        fs.writeFileSync('output', result, 'utf-8');
        console.log('Obfuscated code generated in `output` file.');
        process.exit();
    }
}

run();