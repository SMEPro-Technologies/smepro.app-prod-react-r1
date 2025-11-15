import React, { useState, useEffect, useMemo } from 'react';
import { SmeConfig, SubscriptionPlan, SmeHelperContext } from '../types';
import { configService } from '../services/configService';
import { SmeProLogo, LoadingIcon } from './icons';

interface SmeSelectorProps {
  onStartChat: (config: SmeConfig) => void;
  plan: SubscriptionPlan;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const toTitleCase = (str: string) => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
};

const SmeSelector: React.FC<SmeSelectorProps> = ({ onStartChat, plan, onSetHelperContext }) => {
  const [schema, setSchema] = useState<any | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchema = async () => {
      setIsLoading(true);
      const fetchedSchema = await configService.fetchSmeConfigSchema(plan);
      setSchema(fetchedSchema);
      setSelection({});
      setIsLoading(false);
    };
    loadSchema();
  }, [plan]);

  const schemaKeys = useMemo(() => (schema ? Object.keys(schema.properties) : []), [schema]);
  
  const getOptionsFor = (key: string): string[] => {
    if (!schema) return [];
    
    const keyIndex = schemaKeys.indexOf(key);
    if (keyIndex === 0) {
      return schema.properties[key]?.enum || [];
    }
    
    const dependentKey = schemaKeys[keyIndex - 1];
    const dependentValue = selection[dependentKey];
    if (!dependentValue) return [];

    // Find a rule in allOf that sets the enum for the current key
    if (schema.allOf) {
      for (const rule of schema.allOf) {
        if (rule.if.properties[dependentKey]?.const === dependentValue && rule.then.properties[key]?.enum) {
            return rule.then.properties[key].enum;
        }
      }
    }
    
    // Fallback for keys that might not have dependent logic
    return schema.properties[key]?.enum || [];
  };

  const handleSelectionChange = (key: string, value: string) => {
    const newSelection = { ...selection, [key]: value };
    const keyIndex = schemaKeys.indexOf(key);

    // When a selection is changed, reset all subsequent selections
    for (let i = keyIndex + 1; i < schemaKeys.length; i++) {
        const subsequentKey = schemaKeys[i];
        delete newSelection[subsequentKey];
    }

    setSelection(newSelection);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [level1, level2, level3] = schemaKeys;
    if (selection[level1] && selection[level2] && selection[level3]) {
      // Map dynamic schema keys to fixed SmeConfig keys
      const config: SmeConfig = {
        industry: selection[level1],
        subType: selection[level2],
        segment: selection[level3],
      };
      onStartChat(config);
    }
  };
  
  const SelectField: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], placeholder: string, disabled?: boolean, "data-tour-id"?: string}> = (props) => (
      <div data-tour-id={props["data-tour-id"]}>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{props.label}</label>
        <select
          value={props.value}
          onChange={props.onChange}
          disabled={props.disabled}
          className="w-full p-3 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">{props.placeholder}</option>
          {props.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
  );

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-slate-800 dark:text-white">
              <LoadingIcon className="w-8 h-8"/>
              <p className="mt-4">Loading configuration...</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50 dark:bg-slate-800 animate-slide-in-up" onMouseEnter={() => onSetHelperContext('SME_SELECTOR')}>
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center items-center mb-4">
            <SmeProLogo className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Configure Your SME</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Select a specialization to start a contextual conversation.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {schemaKeys.map((key, index) => {
                const isEnabled = index === 0 || !!selection[schemaKeys[index - 1]];
                return (
                    <SelectField 
                        key={key}
                        label={toTitleCase(key)}
                        value={selection[key] || ''}
                        onChange={(e) => handleSelectionChange(key, e.target.value)}
                        options={getOptionsFor(key)}
                        placeholder={`Select a ${toTitleCase(key)}...`}
                        disabled={!isEnabled}
                        data-tour-id={`sme-selector-${index}`}
                    />
                );
            })}
          
            <button
                type="submit"
                className="w-full py-3 mt-4 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                disabled={!selection[schemaKeys[0]] || !selection[schemaKeys[1]] || !selection[schemaKeys[2]]}
                data-tour-id="sme-selector-submit"
            >
                Start Chat Session
            </button>
        </form>
      </div>
    </div>
  );
};

export default SmeSelector;