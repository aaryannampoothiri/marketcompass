import * as React from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

export interface FriendlyOption {
  value: string;
  label: string;
  group?: string;
  icon?: string;
  description?: string;
  subLabel?: string;
}

export interface FriendlySelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: FriendlyOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function FriendlySelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search options...",
  disabled = false,
  required = false,
  className = "",
}: FriendlySelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Selected option
  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value) || null;
  }, [options, value]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.description && opt.description.toLowerCase().includes(query)) ||
        (opt.group && opt.group.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  // Group filtered options
  const groupedOptions = React.useMemo(() => {
    const groups: { [key: string]: FriendlyOption[] } = {};
    filteredOptions.forEach((opt) => {
      const grp = opt.group || "All Options";
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(opt);
    });
    return groups;
  }, [filteredOptions]);

  // Handle outside click to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  React.useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required={required}
          onChange={() => {}}
          className="absolute opacity-0 pointer-events-none -z-10 w-0 h-0"
          tabIndex={-1}
        />
      )}

      {/* Select Trigger Box */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3.5 py-2 text-left text-sm text-slate-900 transition-all shadow-xs cursor-pointer select-none ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-slate-300 hover:border-slate-400"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""}`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <span className="text-base shrink-0">{selectedOption.icon}</span>
              )}
              <span className="font-semibold text-slate-900 truncate">
                {selectedOption.label}
              </span>
              {selectedOption.subLabel && (
                <span className="text-xs text-slate-600 truncate hidden sm:inline">
                  • {selectedOption.subLabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-600">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-600 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-80 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-100 flex flex-col">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70 sticky top-0 z-10 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64 p-1.5 space-y-3 divide-y divide-slate-100/80">
            {Object.keys(groupedOptions).length === 0 ? (
              <div className="py-6 text-center text-xs sm:text-sm text-slate-500">
                No matching options found for "{searchQuery}"
              </div>
            ) : (
              Object.entries(groupedOptions).map(([groupName, groupOpts]) => (
                <div key={groupName} className="pt-2 first:pt-0">
                  <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {groupName}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {groupOpts.map((opt) => {
                      const isSelected = opt.value === value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className={`w-full flex items-start justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-50/90 text-blue-900 font-medium"
                              : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 truncate">
                            {opt.icon && (
                              <span className="text-base shrink-0 mt-0.5">{opt.icon}</span>
                            )}
                            <div className="truncate">
                              <div className="text-xs sm:text-sm font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                                <span>{opt.label}</span>
                                {opt.subLabel && (
                                  <span className="text-[11px] font-normal text-slate-600">
                                    ({opt.subLabel})
                                  </span>
                                )}
                              </div>
                              {opt.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 font-normal mt-0.5">
                                  {opt.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
