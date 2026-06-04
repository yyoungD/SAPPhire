package com.sapphire.domain.resume.dto;

import java.util.List;

public record ResumeAnalysis(
        int moduleProficiency,
        int integrationKnowledge,
        String projectSpecificity,
        List<String> suggestions
) {
}
