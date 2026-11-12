import { describe, expect, it } from 'vitest';
import { parseRoute, paths } from '../../src/hooks/useHashRoute';

describe('parseRoute', () => {
  it('opens the home page for an empty hash, "#" and "#/"', () => {
    for (const hash of ['', '#', '#/']) expect(parseRoute(hash)).toEqual({ name: 'home' });
  });

  it('has its own library page', () => {
    expect(parseRoute(paths.library())).toEqual({ name: 'library' });
    expect(paths.library()).toBe('#/library');
  });

  it('keeps every other page', () => {
    expect(parseRoute(paths.new())).toEqual({ name: 'new' });
    expect(parseRoute(paths.generator())).toEqual({ name: 'generator' });
    expect(parseRoute(paths.details('a b'))).toEqual({ name: 'details', id: 'a b' });
    expect(parseRoute(paths.edit('x'))).toEqual({ name: 'edit', id: 'x' });
  });

  it('falls back to the home page for unknown paths', () => {
    expect(parseRoute('#/nope')).toEqual({ name: 'home' });
    expect(paths.home()).toBe('#/');
  });
});
