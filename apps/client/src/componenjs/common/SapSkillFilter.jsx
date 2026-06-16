import { useMemo } from 'react';
import SearchBar from './SearchBar.jsx';

const skillTypeLabels = {
  MODULE: '모듈 (Modules)',
  SOLUTION: '솔루션 (Solutions)',
  TECHNICAL: '테크닉 (Techniques)',
};

const skillTypeOrder = ['MODULE', 'SOLUTION', 'TECHNICAL'];

function groupSkills(skills = []) {
  return skillTypeOrder.map((type) => ({
    type,
    label: skillTypeLabels[type],
    skills: skills.filter((skill) => skill.skillType === type),
  }));
}

export default function SapSkillFilter({
  skills = [],
  selectedSkillIds = [],
  activeSkillType = 'MODULE',
  skillKeyword = '',
  resultCount = 0,
  onActiveSkillTypeChange,
  onSkillKeywordChange,
  onToggleSkill,
  onClear,
}) {
  const skillGroups = useMemo(() => groupSkills(skills), [skills]);
  const activeGroup = useMemo(
    () => skillGroups.find((group) => group.type === activeSkillType) || skillGroups[0],
    [activeSkillType, skillGroups],
  );
  const selectedSkills = useMemo(
    () => skills.filter((skill) => selectedSkillIds.includes(skill.id)),
    [selectedSkillIds, skills],
  );
  const visibleSkills = useMemo(() => {
    const normalizedKeyword = skillKeyword.trim().toLowerCase();
    const sourceSkills = normalizedKeyword ? skills : activeGroup?.skills || [];
    return sourceSkills.filter((skill) => {
      if (!normalizedKeyword) return true;
      return `${skill.name} ${skill.code}`.toLowerCase().includes(normalizedKeyword);
    });
  }, [activeGroup, skillKeyword, skills]);

  return (
    <div className="company-job-mega-filter">
      <nav aria-label="SAP 스킬 유형">
        {skillGroups.map((group) => (
          <button
            type="button"
            key={group.type}
            className={activeSkillType === group.type ? 'active' : ''}
            onClick={() => onActiveSkillTypeChange(group.type)}
          >
            {group.label}
          </button>
        ))}
      </nav>
      <section className="company-job-skill-picker">
        <div className="company-job-skill-toolbar">
          <SearchBar value={skillKeyword} onChange={onSkillKeywordChange} placeholder="기술명 검색" label="SAP 스킬 검색" />
          <button type="button" onClick={onClear}>
            선택초기화
          </button>
        </div>
        <div className="company-job-skill-grid">
          {visibleSkills.map((skill) => (
            <label key={skill.id}>
              <input type="checkbox" checked={selectedSkillIds.includes(skill.id)} onChange={() => onToggleSkill(skill.id)} />
              <span>{skill.name}</span>
            </label>
          ))}
        </div>
      </section>
      <footer>
        <span>선택됨:</span>
        {selectedSkills.length === 0 && <em>없음</em>}
        {selectedSkills.map((skill) => (
          <button type="button" key={skill.id} onClick={() => onToggleSkill(skill.id)}>
            {skill.name} ×
          </button>
        ))}
        <strong>{resultCount}건 검색완료</strong>
      </footer>
    </div>
  );
}
