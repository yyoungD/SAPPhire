import { Search } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  placeholder = '검색어를 입력하세요',
  name,
  ariaLabel,
  className = '',
}) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-[#738095]" size={17} />
      <input
        className="h-11 w-full rounded-md bg-[#eff4ff] pr-4 pl-10 text-sm text-[#0b1c30] outline-none placeholder:text-[#738095] focus:bg-white focus:shadow-[0_0_0_4px_rgba(29,89,193,0.08)]"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        type="search"
      />
    </div>
  );
}
