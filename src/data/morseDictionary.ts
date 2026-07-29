/**
 * Morse Code Dictionary — Maps Morse sequences to characters.
 * Also includes reverse mapping and Auralis custom commands.
 */

/** Standard International Morse Code: sequence → character */
export const MORSE_TO_CHAR: Record<string, string> = {
  '.-': 'A',    '-...': 'B',   '-.-.': 'C',   '-..': 'D',
  '.': 'E',     '..-.': 'F',   '--.': 'G',    '....': 'H',
  '..': 'I',    '.---': 'J',   '-.-': 'K',    '.-..': 'L',
  '--': 'M',    '-.': 'N',     '---': 'O',    '.--.': 'P',
  '--.-': 'Q',  '.-.': 'R',    '...': 'S',    '-': 'T',
  '..-': 'U',   '...-': 'V',   '.--': 'W',    '-..-': 'X',
  '-.--': 'Y',  '--..': 'Z',

  '.----': '1', '..---': '2',  '...--': '3',  '....-': '4',
  '.....': '5', '-....': '6',  '--...': '7',  '---..': '8',
  '----.': '9', '-----': '0',

  '.-.-.-': '.', '--..--': ',', '..--..': '?', '-.-.--': '!',
  '.----.': "'", '-..-.': '/',  '-.--.': '(',  '-.--.-': ')',
  '.-...': '&',  '---...': ':', '-...-': '=',  '.-.-.': '+',
  '-....-': '-', '.--.-.': '@',
};

/** Reverse mapping: character → Morse sequence */
export const CHAR_TO_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_TO_CHAR).map(([morse, char]) => [char, morse])
);

/** Auralis custom commands (not standard Morse) */
export const AURALIS_COMMANDS = {
  BACKSPACE: '........',   // 8 dots
  CLEAR_ALL: '--------',  // 8 dashes
  SPEAK: '..-.',           // Letter F
  QUICK_PHRASE: '--.-',    // Letter Q
} as const;

/**
 * Translates a Morse code sequence to its corresponding character.
 * @param sequence - Dots and dashes string (e.g., '.-')
 * @returns The translated character or null if unknown
 */
export function translateMorse(sequence: string): string | null {
  return MORSE_TO_CHAR[sequence] ?? null;
}

/**
 * Checks if a sequence matches an Auralis command.
 * @param sequence - Dots and dashes string
 * @returns The command name or null
 */
export function matchCommand(sequence: string): string | null {
  for (const [name, pattern] of Object.entries(AURALIS_COMMANDS)) {
    if (sequence === pattern) return name;
  }
  return null;
}
