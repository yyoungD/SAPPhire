package com.sapphire.domain.sapskill.controller;

import com.sapphire.domain.sapskill.dto.SapSkillResponse;
import com.sapphire.domain.sapskill.service.SapSkillService;
import com.sapphire.global.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sap-skills")
public class SapSkillController {
    private final SapSkillService sapSkillService;

    public SapSkillController(SapSkillService sapSkillService) {
        this.sapSkillService = sapSkillService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SapSkillResponse>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(sapSkillService.findAll()));
    }
}
