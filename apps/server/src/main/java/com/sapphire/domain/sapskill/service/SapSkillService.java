package com.sapphire.domain.sapskill.service;

import com.sapphire.domain.sapskill.dto.SapSkillResponse;

import java.util.List;

public interface SapSkillService {
    List<SapSkillResponse> findAll();
}
