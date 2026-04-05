import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateSlug, uniqueSlug } from '../services/blogService';

describe('generateSlug', () => {
  it('should convert basic English title to lowercase hyphenated slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should handle multiple spaces', () => {
    expect(generateSlug('Hello   World  Test')).toBe('hello-world-test');
  });

  it('should preserve Arabic letters', () => {
    expect(generateSlug('مرحبا بالعالم')).toBe('مرحبا-بالعالم');
  });

  it('should handle mixed Arabic and English', () => {
    expect(generateSlug('Welcome to مصر')).toBe('welcome-to-مصر');
  });

  it('should handle Arabic with diacritics (tashkeel)', () => {
    // Arabic diacritics should be stripped
    const result = generateSlug('مَرْحَبًا بِالعَالَمِ');
    expect(result).toBe('مرحبا-بالعالم');
  });

  it('should preserve numbers', () => {
    expect(generateSlug('Project 2024')).toBe('project-2024');
  });

  it('should remove special characters except hyphens', () => {
    expect(generateSlug('Hello! @World# $Test%')).toBe('hello-world-test');
  });

  it('should collapse multiple hyphens', () => {
    expect(generateSlug('Hello---World---Test')).toBe('hello-world-test');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(generateSlug('---Hello World---')).toBe('hello-world');
  });

  it('should handle empty string gracefully', () => {
    const result = generateSlug('');
    expect(result).toMatch(/^post-\d+$/);
  });

  it('should handle whitespace-only string', () => {
    const result = generateSlug('   ');
    expect(result).toMatch(/^post-\d+$/);
  });

  it('should handle title with only symbols', () => {
    const result = generateSlug('!@#$%^&*()');
    expect(result).toMatch(/^post-\d+$/);
  });

  it('should handle Unicode letters from various scripts', () => {
    expect(generateSlug('Привет мир')).toBe('привет-мир');      // Russian
    expect(generateSlug('こんにちは世界')).toBe('こんにちは世界');     // Japanese (Hiragana)
    expect(generateSlug('你好世界')).toBe('你好世界');              // Chinese
  });

  it('should handle French accents', () => {
    expect(generateSlug('Élémentaire')).toBe('élémentaire');
  });

  it('should produce consistent results for same input', () => {
    const input = 'Test Title Here';
    expect(generateSlug(input)).toBe(generateSlug(input));
  });
});

describe('uniqueSlug', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return base slug if it does not exist', async () => {
    const exists = vi.fn().mockResolvedValue(false);
    const result = await uniqueSlug('my-slug', exists);
    expect(result).toBe('my-slug');
    expect(exists).toHaveBeenCalledWith('my-slug');
  });

  it('should return base slug with -2 suffix if base exists', async () => {
    const exists = vi.fn()
      .mockResolvedValueOnce(true)   // base slug exists
      .mockResolvedValueOnce(false); // slug-2 is available
    const result = await uniqueSlug('my-slug', exists);
    expect(result).toBe('my-slug-2');
  });

  it('should find first available suffix', async () => {
    const exists = vi.fn()
      .mockResolvedValueOnce(true)   // base exists
      .mockResolvedValueOnce(true)    // -2 exists
      .mockResolvedValueOnce(true)    // -3 exists
      .mockResolvedValueOnce(false);  // -4 is available
    const result = await uniqueSlug('my-slug', exists);
    expect(result).toBe('my-slug-4');
  });

  it('should return timestamped slug if all suffixes exhausted', async () => {
    // Mock exists to always return true (up to 100 calls)
    const exists = vi.fn().mockResolvedValue(true);
    const result = await uniqueSlug('my-slug', exists, 3); // limit to 3 attempts
    expect(result).toMatch(/^my-slug-\d+$/);
    expect(exists).toHaveBeenCalledTimes(3);
  });

  it('should call exists multiple times for collision', async () => {
    const exists = vi.fn().mockResolvedValue(false);
    await uniqueSlug('test', exists, 10);
    expect(exists).toHaveBeenCalledTimes(1);
  });
});
