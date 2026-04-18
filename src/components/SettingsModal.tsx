import { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { AISettings } from '@saas-maker/ai';
import { loadAIConfig, saveAIConfig, type AIConfig } from '../hooks/useAI';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: Props) {
  const [config, setConfig] = useState<AIConfig>(loadAIConfig);

  if (!open) return null;

  const handleSave = () => {
    saveAIConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-purple-400" />
            <h2 className="text-base font-semibold text-gray-100">AI Configuration</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <AISettings
            config={config}
            onChange={setConfig}
            onSave={handleSave}
            labels={{
              title: '',
              subtitle: 'OpenAI-compatible endpoint. Used for Companion, Tagger, Feynman, Today plan, Weekly review.',
            }}
            classNames={{
              container: 'space-y-3',
              input: 'w-full rounded-md border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50',
              label: 'block text-xs font-medium text-gray-400 mb-1',
              button: 'w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50',
            }}
          />
        </div>
      </div>
    </div>
  );
}
