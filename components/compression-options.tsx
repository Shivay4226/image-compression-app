'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface CompressionSettings {
  format: 'png' | 'jpg' | 'webp' | 'avif';
  quality: number;
  lossless: boolean;
}

interface CompressionOptionsProps {
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
  disabled?: boolean;
}

export function CompressionOptions({
  settings,
  onSettingsChange,
  disabled,
}: CompressionOptionsProps) {
  const handleFormatChange = (format: string) => {
    onSettingsChange({
      ...settings,
      format: format as CompressionSettings['format'],
    });
  };

  const handleQualityChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      quality: value[0],
    });
  };

  const handleLosslessChange = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      lossless: checked,
    });
  };

  // PNG and WebP support lossless, JPG is always lossy
  const supportsLossless = settings.format !== 'jpg';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="format-select" className="text-base font-semibold">Output Format</Label>
        <Select value={settings.format} onValueChange={handleFormatChange} disabled={disabled}>
          <SelectTrigger id="format-select" className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG - Lossless, supports transparency</SelectItem>
            <SelectItem value="jpg">JPG - Best for photos, smaller files</SelectItem>
            <SelectItem value="webp">WebP - Modern format, great compression</SelectItem>
            <SelectItem value="avif">AVIF - Best compression, newer browsers</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Quality Level</Label>
          <span className="text-lg font-bold text-accent">{settings.quality}%</span>
        </div>
        <Slider
          value={[settings.quality]}
          onValueChange={handleQualityChange}
          min={10}
          max={100}
          step={5}
          disabled={disabled}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Lower values = smaller files but lower quality</p>
      </div>

      {supportsLossless && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-accent/20">
          <div>
            <Label htmlFor="lossless-toggle" className="cursor-pointer font-semibold">
              Lossless Compression
            </Label>
            <p className="text-xs text-muted-foreground mt-1">No quality loss, but larger files</p>
          </div>
          <Switch
            id="lossless-toggle"
            checked={settings.lossless}
            onCheckedChange={handleLosslessChange}
            disabled={disabled}
          />
        </div>
      )}

      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
        <p className="font-semibold text-sm">Recommended settings:</p>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Photos:</strong> JPG at 75-85% quality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Graphics:</strong> PNG with lossless</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Web:</strong> WebP at 80% quality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <span><strong>Best size:</strong> AVIF at 70-80% quality</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
