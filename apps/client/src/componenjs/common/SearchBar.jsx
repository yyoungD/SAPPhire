export default function SearchBar({
  value,
  onChange,
  placeholder = '검색어 입력',
  label = '검색어',
}) {
  return (
    <label className="search-bar">
      <span>{label}</span>
      <i aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
