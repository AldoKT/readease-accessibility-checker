export type ReadabilityAnalysis = {
  characters: number;
  words: number;
  sentences: number;
  syllables: number;
  readingEase: number | null;
  gradeLevel: number | null;
};

export type ReadabilityInterpretation = {
  label: string;
  description: string;
};

/** A short sample can produce a valid score without being representative. */
export const MINIMUM_READABILITY_WORDS = 20;

const WORD_PATTERN = /[a-z]+(?:['’][a-z]+)*/gi;
const VOWEL_GROUP_PATTERN = /[aeiouy]+/g;

function getWords(text: string): string[] {
  return text.match(WORD_PATTERN) ?? [];
}

/** Counts English-like words while ignoring surrounding punctuation and whitespace. */
export function countWords(text: string): number {
  return getWords(text).length;
}

/**
 * Counts punctuation-delimited sentences. Text containing words but no terminal
 * punctuation is treated as one sentence, which keeps short input analyzable.
 */
export function countSentences(text: string): number {
  const words = countWords(text);

  if (words === 0) {
    return 0;
  }

  const punctuatedSentences = text
    .split(/[.!?]+/)
    .filter((segment) => countWords(segment) > 0).length;

  return punctuatedSentences === 0 ? 1 : punctuatedSentences;
}

/**
 * Estimates syllables by counting vowel groups. A silent trailing "e" is removed
 * when appropriate, while consonant + "le" endings (for example, "table") keep it.
 */
export function estimateSyllables(word: string): number {
  const normalizedWord = word.toLowerCase().replace(/[^a-z]/g, "");

  if (normalizedWord.length === 0) {
    return 0;
  }

  let syllables = (normalizedWord.match(VOWEL_GROUP_PATTERN) ?? []).length;

  if (
    syllables > 1 &&
    normalizedWord.endsWith("e") &&
    !/[^aeiou]le$/.test(normalizedWord)
  ) {
    syllables -= 1;
  }

  return Math.max(1, syllables);
}

/** Estimates total syllables by applying the word-level heuristic to each word. */
export function countSyllables(text: string): number {
  return getWords(text).reduce(
    (total, word) => total + estimateSyllables(word),
    0,
  );
}

function hasValidInputs(words: number, sentences: number, syllables: number) {
  return (
    Number.isFinite(words) &&
    Number.isFinite(sentences) &&
    Number.isFinite(syllables) &&
    words > 0 &&
    sentences > 0 &&
    syllables > 0
  );
}

/**
 * Flesch Reading Ease: 206.835 - 1.015 × words/sentences - 84.6 × syllables/words.
 */
export function calculateReadingEase(
  words: number,
  sentences: number,
  syllables: number,
): number | null {
  if (!hasValidInputs(words, sentences, syllables)) {
    return null;
  }

  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  return Number.isFinite(score) ? score : null;
}

/**
 * Flesch-Kincaid Grade Level: 0.39 × words/sentences + 11.8 × syllables/words - 15.59.
 */
export function calculateGradeLevel(
  words: number,
  sentences: number,
  syllables: number,
): number | null {
  if (!hasValidInputs(words, sentences, syllables)) {
    return null;
  }

  const score =
    0.39 * (words / sentences) +
    11.8 * (syllables / words) -
    15.59;

  return Number.isFinite(score) ? score : null;
}

/** Maps an unmodified Flesch Reading Ease score to its conventional readability band. */
export function getReadingEaseInterpretation(
  score: number | null,
): ReadabilityInterpretation {
  if (score === null || !Number.isFinite(score)) {
    return {
      label: "Unavailable",
      description: "Reading ease cannot be calculated for this text.",
    };
  }

  if (score >= 90) {
    return { label: "Very easy", description: "Very easy to read." };
  }

  if (score >= 80) {
    return { label: "Easy", description: "Easy to read." };
  }

  if (score >= 70) {
    return { label: "Fairly easy", description: "Fairly easy to read." };
  }

  if (score >= 60) {
    return { label: "Standard", description: "Standard readability." };
  }

  if (score >= 50) {
    return { label: "Fairly difficult", description: "Somewhat difficult to read." };
  }

  if (score >= 30) {
    return { label: "Difficult", description: "Difficult to read." };
  }

  return { label: "Very difficult", description: "Very difficult to read." };
}

/** Interprets Flesch-Kincaid as an approximate U.S. school grade level. */
export function getGradeLevelInterpretation(
  gradeLevel: number | null,
): ReadabilityInterpretation {
  if (gradeLevel === null || !Number.isFinite(gradeLevel)) {
    return {
      label: "Unavailable",
      description: "Grade level cannot be calculated for this text.",
    };
  }

  if (gradeLevel < 1) {
    return {
      label: "Below grade 1",
      description: "Approximately below U.S. grade 1 reading level.",
    };
  }

  if (gradeLevel > 12) {
    return {
      label: "College level",
      description: "Approximately U.S. college reading level.",
    };
  }

  const roundedGrade = Math.round(gradeLevel);

  return {
    label: `Grade ${roundedGrade}`,
    description: `Approximately U.S. grade ${roundedGrade} reading level.`,
  };
}

/** Analyzes English text with deterministic word, sentence, syllable, and Flesch metrics. */
export function analyzeReadability(text: string): ReadabilityAnalysis {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = countSyllables(text);

  return {
    characters: text.length,
    words,
    sentences,
    syllables,
    readingEase: calculateReadingEase(words, sentences, syllables),
    gradeLevel: calculateGradeLevel(words, sentences, syllables),
  };
}

/** Returns whether an analysis has enough words for a meaningful readability estimate. */
export function hasMinimumReadabilitySample({ words }: ReadabilityAnalysis): boolean {
  return words >= MINIMUM_READABILITY_WORDS;
}
