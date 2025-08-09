import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface SkillInputProps {
    value: string[];
    onChange: (skills: string[]) => void;
    label?: string;
}

export const SkillInput: React.FC<SkillInputProps> = ({ value, onChange, label }) => {
    const [input, setInput] = useState('');

    const addSkill = (s: string) => {
        if (!s) return;
        if (value.includes(s)) return;
        onChange([...value, s]);
        setInput('');
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSkill(input.trim());
        } else if (e.key === 'Backspace' && !input) {
            onChange(value.slice(0, -1));
        }
    };

    const remove = (s: string) => onChange(value.filter(v => v !== s));

    return (
        <div className="flex flex-col gap-1">
            {label && <span className="text-sm font-medium">{label}</span>}
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-neutral/40 px-2 py-2 focus-within:ring-2 focus-within:ring-primary">
                {value.map(skill => (
                    <span key={skill} className="flex items-center gap-1 rounded bg-primary/20 px-2 py-1 text-xs text-primary">
                        {skill}
                        <button type="button" onClick={() => remove(skill)} className="text-primary hover:text-primary/70">
                            <X size={14} />
                        </button>
                    </span>
                ))}
                <input
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-white/40"
                    placeholder="Type a skill and press Enter"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
};

export default SkillInput;
