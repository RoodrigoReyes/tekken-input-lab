import { describe, expect, it } from 'vitest';
import { parseRoute, paths } from '../../src/hooks/useHashRoute';

describe('parseRoute', () => {
  it('opens the home page for an empty hash, "#" and "#/"', () => {
    for (const hash of ['', '#', '#/']) expect(parseRoute(hash)).toEqual({ name: 'home' });
  });

  it('has its own library page', () => {
    expect(parseRoute(paths.library())).toEqual({ name: 'library' });
    expect(paths.library()).toBe('#/library');
    expect(parseRoute(paths.explore())).toEqual({ name: 'explore' });
    expect(paths.explore()).toBe('#/explore');
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

  it('reads parameters from shared and import routes', () => {
    expect(parseRoute('#/shared?d=abc_123')).toEqual({ name: 'shared', payload: 'abc_123' });
    expect(parseRoute('#/shared')).toEqual({ name: 'shared', payload: '' });
    expect(parseRoute('#/import?url=https%3A%2F%2Fexample.com%2Fpack%3Fx%3D1')).toEqual({ name: 'import', url: 'https://example.com/pack?x=1' });
    expect(parseRoute('#/import')).toEqual({ name: 'import', url: '' });
  });

  it('parses overlay payload, clamps size, and accepts only supported sides', () => {
    expect(parseRoute('#/overlay?d=abc&size=200&side=2p')).toEqual({ name: 'overlay', payload: 'abc', size: 72, side: '2p' });
    expect(parseRoute('#/overlay?size=5&side=wrong')).toEqual({ name: 'overlay', payload: '', size: 20, side: '1p' });
    const invalidSize = parseRoute('#/overlay?size=NaN');
    expect(invalidSize.name === 'overlay' && invalidSize.size).toBe(48);
  });
});
