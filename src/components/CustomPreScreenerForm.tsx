import React from 'react';
import { Plus, X, Check } from 'lucide-react';
import { PlayfulButton } from './ui/playful';
import type { PreScreenerQuestion } from '@/types';

interface CustomPreScreenerFormProps {
  templateList: PreScreenerQuestion[];
  customPreScreeners: PreScreenerQuestion[];
  selectedPreScreeners: PreScreenerQuestion[];
  onTogglePreScreener: (ps: PreScreenerQuestion) => void;
  onAddCustom: () => void;
  onRemoveCustom: (id: string) => void;
  onUpdateCustom: (id: string, updates: Partial<PreScreenerQuestion>) => void;
}

export const CustomPreScreenerForm: React.FC<CustomPreScreenerFormProps> = ({
  templateList,
  customPreScreeners,
  selectedPreScreeners,
  onTogglePreScreener,
  onAddCustom,
  onRemoveCustom,
  onUpdateCustom,
}) => {
  return (
    <div className="mt-6 space-y-3">
      <p className="font-jakarta text-sm text-navy-light mb-4">
        Select questions to filter participants:
      </p>
      
      {/* Template Questions */}
      {templateList.map((ps) => (
        <button
          key={ps.id}
          type="button"
          onClick={() => onTogglePreScreener(ps)}
          className={`w-full flex items-center gap-4 p-4 border-2 border-navy rounded-2xl transition-all text-left ${
            selectedPreScreeners.find((p) => p.id === ps.id)
              ? 'bg-violet text-white shadow-hard'
              : 'bg-white hover:bg-periwinkle'
          }`}
        >
          <div
            className={`w-6 h-6 border-2 border-navy rounded flex items-center justify-center ${
              selectedPreScreeners.find((p) => p.id === ps.id) ? 'bg-white' : 'bg-white'
            }`}
          >
            {selectedPreScreeners.find((p) => p.id === ps.id) && (
              <Check className="w-4 h-4 text-violet" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={`font-jakarta font-medium ${
                selectedPreScreeners.find((p) => p.id === ps.id) ? 'text-white' : 'text-navy'
              }`}
            >
              {ps.question}
            </p>
            <p
              className={`font-mono text-xs ${
                selectedPreScreeners.find((p) => p.id === ps.id)
                  ? 'text-white/70'
                  : 'text-navy-light'
              }`}
            >
              {ps.condition} {String(ps.value)}
            </p>
          </div>
        </button>
      ))}

      {/* Custom Questions */}
      {customPreScreeners.map((custom) => (
        <div key={custom.id} className="p-4 border-2 border-navy rounded-2xl bg-yellow/10">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-jakarta font-semibold text-navy">Custom Question</h4>
            <button
              type="button"
              onClick={() => onRemoveCustom(custom.id)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-navy mb-1">Question Text</label>
              <input
                type="text"
                value={custom.question}
                onChange={(e) => onUpdateCustom(custom.id, { question: e.target.value })}
                placeholder="Enter your question"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-navy mb-1">Type</label>
                <select
                  value={custom.type}
                  onChange={(e) => onUpdateCustom(custom.id, { type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Yes/No</option>
                  <option value="mcq">Multiple Choice (MCQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-navy mb-1">Condition</label>
                <select
                  value={custom.condition}
                  onChange={(e) => onUpdateCustom(custom.id, { condition: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {custom.type === 'number' ? (
                    <>
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </>
                  ) : (
                    <>
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* MCQ Options Input */}
            {custom.type === 'mcq' && (
              <div>
                <label className="block text-xs font-medium text-navy mb-1">
                  Options (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={
                    typeof custom.value === 'string' 
                      ? custom.value 
                      : Array.isArray(custom.value) 
                      ? custom.value.join(', ') 
                      : ''
                  }
                  onChange={(e) => {
                    // Store as string while typing
                    onUpdateCustom(custom.id, { value: e.target.value });
                  }}
                  onBlur={(e) => {
                    // Convert to array when done editing
                    const text = e.target.value.trim();
                    if (text) {
                      const options = text.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
                      onUpdateCustom(custom.id, { value: options });
                    }
                  }}
                  placeholder="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Type all options separated by commas. They will be saved when you click outside the field.</p>
              </div>
            )}

            {/* Expected Value Input */}
            {custom.type !== 'mcq' && (
              <div>
                <label className="block text-xs font-medium text-navy mb-1">Expected Value</label>
                <input
                  type={custom.type === 'number' ? 'number' : 'text'}
                  value={custom.value}
                  onChange={(e) => onUpdateCustom(custom.id, { 
                    value: custom.type === 'number' ? Number(e.target.value) : e.target.value 
                  })}
                  placeholder="Enter expected value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}

            {/* MCQ Correct Answer Selector */}
            {custom.type === 'mcq' && Array.isArray(custom.value) && custom.value.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-navy mb-1">Correct Answer</label>
                <select
                  value={custom.correctAnswer || ''}
                  onChange={(e) => onUpdateCustom(custom.id, { correctAnswer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select correct answer</option>
                  {custom.value.map((option: string) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => onTogglePreScreener(custom)}
              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPreScreeners.find((p) => p.id === custom.id)
                  ? 'bg-violet text-white'
                  : 'bg-gray-200 text-navy hover:bg-gray-300'
              }`}
            >
              {selectedPreScreeners.find((p) => p.id === custom.id) ? 'Selected ✓' : 'Select this question'}
            </button>
          </div>
        </div>
      ))}

      {/* Add Custom Question Button - Below all questions */}
      <div className="pt-2">
        <PlayfulButton
          type="button"
          size="sm"
          onClick={onAddCustom}
          leftIcon={<Plus className="w-4 h-4" />}
          className="w-full"
        >
          Add Custom Question
        </PlayfulButton>
      </div>

      {selectedPreScreeners.length > 0 && (
        <div className="mt-4 p-4 bg-yellow/30 border-2 border-navy rounded-2xl">
          <p className="font-jakarta text-sm text-navy">
            <span className="font-semibold">{selectedPreScreeners.length}</span> pre-screener
            question(s) selected
          </p>
        </div>
      )}
    </div>
  );
};
