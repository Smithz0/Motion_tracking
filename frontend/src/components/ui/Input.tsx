import React, { useState } from 'react';
import { Eye, EyeOff, Search, Calendar, Upload, AlertCircle } from 'lucide-react';

// ==========================================
// 1. Text Input, Search, Password, Date Picker
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  className = '',
  id,
  type = 'text',
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Custom visual cues for search and date
  let derivedIcon = icon;
  if (type === 'search' && !icon) {
    derivedIcon = <Search className="h-4 w-4 text-charcoal-400" />;
  } else if (type === 'date' && !icon) {
    derivedIcon = <Calendar className="h-4 w-4 text-charcoal-400" />;
  }

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-chosen-text-secondary">
          {label}
        </label>
      )}
      <div className="relative rounded-chosen-md shadow-chosen-sm">
        {derivedIcon && (
          <div className="absolute left-3.5 top-3.5 flex items-center text-charcoal-400 pointer-events-none">
            {derivedIcon}
          </div>
        )}
        
        <input
          id={id}
          type={resolvedType}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-[#F5F5F5] dark:bg-charcoal-800/40 border border-[#E5E5E5] dark:border-charcoal-700 rounded-chosen-md 
            text-chosen-text-primary placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 
            focus:border-gold-500 focus:bg-white dark:focus:bg-charcoal-800 transition-all duration-200 text-sm
            disabled:bg-charcoal-50 dark:disabled:bg-charcoal-900 disabled:text-chosen-text-muted disabled:border-charcoal-200
            ${derivedIcon ? 'pl-11' : ''}
            ${isPassword || rightIcon ? 'pr-11' : ''}
            ${error ? 'border-error focus:ring-error/25 focus:border-error' : 'border-[#E5E5E5] dark:border-[#2d3139]'}
            ${className}
          `}
          {...props}
        />

        {/* Password Visibility Toggle */}
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-3 text-charcoal-500 hover:text-chosen-text-primary p-0.5 rounded transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Fallback Right Slot Icon */}
        {!isPassword && rightIcon && (
          <div className="absolute right-3.5 top-3.5 text-charcoal-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-error text-2xs font-semibold mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. Textarea Component
// ==========================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  disabled,
  rows = 4,
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-chosen-text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        disabled={disabled}
        className={`
          w-full px-4 py-3 bg-[#F5F5F5] dark:bg-charcoal-800/40 border border-[#E5E5E5] dark:border-charcoal-700 rounded-chosen-md 
          text-chosen-text-primary placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 
          focus:border-gold-500 focus:bg-white dark:focus:bg-charcoal-800 transition-all duration-200 text-sm
          disabled:bg-charcoal-50 dark:disabled:bg-charcoal-900 disabled:text-chosen-text-muted disabled:border-charcoal-200
          ${error ? 'border-error focus:ring-error/25 focus:border-error' : 'border-[#E5E5E5] dark:border-[#2d3139]'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <div className="flex items-center gap-1.5 text-error text-2xs font-semibold mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. Dropdown / Select Option Box
// ==========================================
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  id,
  disabled,
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-chosen-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          className={`
            w-full px-4 py-3 bg-[#F5F5F5] dark:bg-charcoal-800/40 border border-[#E5E5E5] dark:border-charcoal-700 rounded-chosen-md 
            text-chosen-text-primary focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 
            focus:bg-white dark:focus:bg-charcoal-800 transition-all duration-200 text-sm appearance-none
            disabled:bg-charcoal-50 dark:disabled:bg-charcoal-900 disabled:text-chosen-text-muted disabled:border-charcoal-200
            ${error ? 'border-error focus:ring-error/25 focus:border-error' : 'border-[#E5E5E5] dark:border-[#2d3139]'}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-charcoal-800 text-chosen-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom Chevron Arrow */}
        <div className="absolute right-4 top-4 flex items-center pointer-events-none text-charcoal-500">
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-error text-2xs font-semibold mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. Checkbox
// ==========================================
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="space-y-1 w-full text-left">
      <label className="inline-flex items-start gap-3 cursor-pointer group select-none">
        <input
          type="checkbox"
          id={id}
          className={`
            mt-1 h-4.5 w-4.5 rounded border-[#E5E5E5] bg-white text-gold-500 
            focus:ring-2 focus:ring-gold-500/30 focus:ring-offset-0 focus:outline-none transition-all duration-150
            accent-[#A27B41] cursor-pointer
            ${error ? 'border-error' : ''}
            ${className}
          `}
          {...props}
        />
        <span className="text-sm font-medium text-chosen-text-primary group-hover:text-gold-600 transition-colors">
          {label}
        </span>
      </label>
      {error && (
        <p className="text-2xs text-error font-semibold pl-7.5">{error}</p>
      )}
    </div>
  );
};

// ==========================================
// 5. Radio button
// ==========================================
export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="space-y-1 w-full text-left">
      <label className="inline-flex items-start gap-3 cursor-pointer group select-none">
        <input
          type="radio"
          id={id}
          className={`
            mt-1 h-4.5 w-4.5 border-[#E5E5E5] bg-white text-gold-500 
            focus:ring-2 focus:ring-gold-500/30 focus:ring-offset-0 focus:outline-none transition-all duration-150
            accent-[#A27B41] cursor-pointer
            ${error ? 'border-error' : ''}
            ${className}
          `}
          {...props}
        />
        <span className="text-sm font-medium text-chosen-text-primary group-hover:text-gold-600 transition-colors">
          {label}
        </span>
      </label>
      {error && (
        <p className="text-2xs text-error font-semibold pl-7.5">{error}</p>
      )}
    </div>
  );
};

// ==========================================
// 6. Toggle Switch (Apple inspired UI style)
// ==========================================
interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`inline-flex items-center gap-3.5 select-none cursor-pointer ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        {/* Track - Figma Toggle background #A27B41 when active */}
        <div className={`
          w-11 h-6 rounded-full transition-colors duration-250 ease-out
          ${checked ? 'bg-[#A27B41]' : 'bg-[#E5E5E5] dark:bg-charcoal-700'}
        `} />
        {/* Thumb */}
        <div className={`
          absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-chosen-sm
          transform transition-transform duration-250 ease-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </div>
      {label && (
        <span className="text-sm font-semibold text-chosen-text-primary">
          {label}
        </span>
      )}
    </label>
  );
};

// ==========================================
// 7. File Upload drag & drop zone
// ==========================================
interface FileUploadProps {
  label?: string;
  error?: string;
  accept?: string;
  onFileSelect: (file: File) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  accept,
  onFileSelect,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <span className="block text-xs font-bold uppercase tracking-wider text-chosen-text-secondary select-none">
          {label}
        </span>
      )}
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center border-2 border-dashed rounded-chosen-lg p-6
          bg-[#F5F5F5] dark:bg-charcoal-800/40 text-center cursor-pointer transition-all duration-200
          hover:border-gold-500 hover:bg-white dark:hover:bg-charcoal-800
          ${dragActive ? 'border-gold-500 bg-gold-50/10' : 'border-[#E5E5E5]'}
          ${error ? 'border-error' : ''}
          ${className}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="p-3 bg-gold-500/10 dark:bg-gold-500/5 text-gold-500 rounded-full mb-3 shrink-0">
          <Upload className="h-5 w-5" />
        </div>
        
        <p className="text-sm font-semibold text-chosen-text-primary">
          Click to upload or drag & drop
        </p>
        <p className="text-xs text-chosen-text-muted mt-1 select-none">
          Supports video clips or telemetry file streams
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-error text-2xs font-semibold mt-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
export default Input;
