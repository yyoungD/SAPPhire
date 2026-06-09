package com.sapphire.domain.sapskill.mapper;

import com.sapphire.domain.sapskill.dto.SapSkillResponse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SapSkillMapper {
    List<SapSkillResponse> findAll();
}
