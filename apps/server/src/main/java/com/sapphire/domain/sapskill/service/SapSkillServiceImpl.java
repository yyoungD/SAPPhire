package com.sapphire.domain.sapskill.service;

import com.sapphire.domain.sapskill.dto.SapSkillResponse;
import com.sapphire.domain.sapskill.mapper.SapSkillMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SapSkillServiceImpl implements SapSkillService {
    private final SapSkillMapper sapSkillMapper;

    public SapSkillServiceImpl(SapSkillMapper sapSkillMapper) {
        this.sapSkillMapper = sapSkillMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SapSkillResponse> findAll() {
        return sapSkillMapper.findAll();
    }
}
