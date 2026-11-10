import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { errorMessage } from '../../hooks/useCombos';
import type { DetailsExtraProps } from '../details/DetailsView';
import { downloadBlob } from './download';

/** Export code (incl. react-dom/server) is loaded on first use to keep the main bundle small. */
const loadExporter = () => import('./exportImage');

export function ExportButtons({ combo, parsed, visual }: DetailsExtraProps) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const build = async () => {
    const { comboSvgMarkup, exportHeading, safeFilename } = await loadExporter();
    const svg = comboSvgMarkup(parsed, exportHeading(combo), { size: visual.size, expandNamed: visual.expandNamed });
    return { svg, filename: safeFilename(combo.name) };
  };

  const exportSvg = async () => {
    try {
      const { svg, filename } = await build();
      downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${filename}.svg`);
    } catch (e) {
      toast(`SVG export failed: ${errorMessage(e)}`, 'error');
    }
  };

  const exportPng = async () => {
    setBusy(true);
    try {
      const { svg, filename } = await build();
      const { svgToPng } = await loadExporter();
      downloadBlob(await svgToPng(svg), `${filename}.png`);
    } catch (e) {
      toast(`PNG export failed: ${errorMessage(e)}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => void exportSvg()}>
        Export SVG
      </Button>
      <Button size="sm" onClick={() => void exportPng()} disabled={busy}>
        {busy ? 'Exporting…' : 'Export PNG'}
      </Button>
    </>
  );
}
