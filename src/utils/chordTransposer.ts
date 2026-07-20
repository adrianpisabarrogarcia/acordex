// Utility for transposing chords and parsing song text with chords positioned ABOVE lyrics

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Transposes a single note (e.g. "C#", "Bb", "F") by a given semitone offset.
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const cleanNote = note.trim();
  let index = SHARPS.indexOf(cleanNote);
  if (index === -1) {
    index = FLATS.indexOf(cleanNote);
  }
  if (index === -1) return note; // Note not found, return original

  const targetIndex = (index + semitones + 1200) % 12;
  return preferFlats ? FLATS[targetIndex] : SHARPS[targetIndex];
}

/**
 * Transposes a full chord string like "F#m7/C#" by semitones.
 */
export function transposeChord(chord: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return chord;

  // Handle slash chords like G/B, D7/F#
  if (chord.includes('/')) {
    const [mainChord, bassNote] = chord.split('/');
    const newMain = transposeChord(mainChord, semitones, preferFlats);
    const newBass = transposeNote(bassNote, semitones, preferFlats);
    return `${newMain}/${newBass}`;
  }

  // Regex to separate root note from chord suffix (e.g., "F#" from "m7", "Bb" from "maj7")
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const [, root, suffix] = match;
  const newRoot = transposeNote(root, semitones, preferFlats);
  return `${newRoot}${suffix}`;
}

export interface ChordSegment {
  chord?: string;
  text: string;
}

export interface SongLine {
  segments: ChordSegment[];
  isSectionHeader?: boolean;
}

/**
 * Parses song lyrics text with embedded chords in brackets like:
 * "[G] De ellos aprendí [C] a mirar hacia [D] atrás"
 * into structured segments so chords are rendered ABOVE their exact lyrics position.
 */
export function parseSongText(rawText: string, semitones = 0, preferFlats = false): SongLine[] {
  const lines = rawText.split('\n');

  return lines.map((line) => {
    const trimmed = line.trim();

    // Check if line is a section header like [Verso 1], [Estribillo], [Intro], [Puente]
    if (/^\[(verso|estribillo|intro|coro|puente|outro|solo|letra|estrofa)/i.test(trimmed)) {
      return {
        isSectionHeader: true,
        segments: [{ text: trimmed.replace(/^\[|\]$/g, '') }],
      };
    }

    const segments: ChordSegment[] = [];
    const regex = /\[(.*?)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let currentChord: string | undefined = undefined;

    while ((match = regex.exec(line)) !== null) {
      const textBefore = line.slice(lastIndex, match.index);
      
      if (textBefore || currentChord !== undefined) {
        segments.push({
          chord: currentChord,
          text: textBefore || ' ',
        });
      }

      const rawChord = match[1];
      currentChord = /^([A-G][#b]?)/i.test(rawChord)
        ? transposeChord(rawChord, semitones, preferFlats)
        : rawChord;

      lastIndex = regex.lastIndex;
    }

    const remainingText = line.slice(lastIndex);
    if (remainingText || currentChord !== undefined) {
      segments.push({
        chord: currentChord,
        text: remainingText || ' ',
      });
    }

    if (segments.length === 0) {
      segments.push({ text: line });
    }

    return { segments };
  });
}
