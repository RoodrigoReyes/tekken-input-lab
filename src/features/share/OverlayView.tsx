import { useEffect, useMemo } from 'react';
import { CommandSequence } from '../../components/arcade';
import { parseCombo } from '../combo/parseCombo';
import { decodeShareLink } from './shareLink';

export function OverlayView({ payload, size, side }: { payload: string; size: number; side: '1p' | '2p' }) {
  const decoded = useMemo(() => decodeShareLink(payload), [payload]);
  useEffect(() => {
    const htmlBackground = document.documentElement.style.backgroundColor;
    const bodyBackground = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    return () => {
      document.documentElement.style.backgroundColor = htmlBackground;
      document.body.style.backgroundColor = bodyBackground;
    };
  }, []);

  if (!decoded.ok) return <p role="alert" className="sr-only">Invalid overlay link</p>;
  const parsed = parseCombo(decoded.draft);
  return <div style={{ width: 'max-content', maxWidth: '100%' }}><CommandSequence result={parsed.result} sectionHeaders={parsed.headers} size={size} side={side === '2p' ? 'right' : 'left'} /></div>;
}
