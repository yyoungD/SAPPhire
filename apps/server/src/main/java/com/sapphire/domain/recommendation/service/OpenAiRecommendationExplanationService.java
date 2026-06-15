package com.sapphire.domain.recommendation.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiRecommendationExplanationService implements AiRecommendationExplanationService {
    static final String API_KEY_REQUIRED_MESSAGE = "AI 추천 설명을 보려면 OPENAI_API_KEY를 입력해 주세요.";
    static final String API_ERROR_MESSAGE = "AI 추천 설명을 불러오지 못했습니다. OPENAI_API_KEY를 확인해 주세요.";

    private static final Logger log = LoggerFactory.getLogger(OpenAiRecommendationExplanationService.class);
    private static final String INSTRUCTIONS = """
            당신은 SAP 채용 추천 결과를 설명하는 도우미입니다.
            제공된 추천 점수와 매칭 기술만 근거로 각 항목의 추천 이유를 자연스러운 한국어 한 문장으로 작성하세요.
            추측하거나 입력에 없는 경력과 자격을 만들지 마세요.
            반드시 {\"explanations\":{\"입력 key\":\"설명\"}} 형태의 JSON만 반환하세요.
            """;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public OpenAiRecommendationExplanationService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.model:gpt-4.1-mini}") String model,
            @Value("${openai.responses-url:https://api.openai.com/v1/responses}") String responsesUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(responsesUrl).build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public Map<String, String> explain(List<RecommendationExplanationInput> recommendations) {
        if (recommendations.isEmpty()) {
            return Map.of();
        }
        if (apiKey == null || apiKey.isBlank()) {
            return fill(recommendations, API_KEY_REQUIRED_MESSAGE);
        }

        try {
            String input = objectMapper.writeValueAsString(Map.of("recommendations", recommendations));
            JsonNode response = restClient.post()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .body(Map.of(
                            "model", model,
                            "instructions", INSTRUCTIONS,
                            "input", input,
                            "max_output_tokens", 4000
                    ))
                    .retrieve()
                    .body(JsonNode.class);

            Map<String, String> explanations = parseExplanations(response);
            Map<String, String> result = new LinkedHashMap<>();
            for (RecommendationExplanationInput recommendation : recommendations) {
                result.put(
                        recommendation.key(),
                        explanations.getOrDefault(recommendation.key(), API_ERROR_MESSAGE)
                );
            }
            return result;
        } catch (Exception exception) {
            log.warn("Failed to load OpenAI recommendation explanations: {}", exception.getMessage());
            return fill(recommendations, API_ERROR_MESSAGE);
        }
    }

    private Map<String, String> parseExplanations(JsonNode response) throws JsonProcessingException {
        String outputText = extractOutputText(response);
        JsonNode explanationsNode = objectMapper.readTree(stripCodeFence(outputText)).path("explanations");
        if (!explanationsNode.isObject()) {
            return Map.of();
        }

        Map<String, String> explanations = new LinkedHashMap<>();
        explanationsNode.fields().forEachRemaining(entry -> {
            String explanation = entry.getValue().asText("").trim();
            if (!explanation.isBlank()) {
                explanations.put(entry.getKey(), explanation);
            }
        });
        return explanations;
    }

    private String extractOutputText(JsonNode response) throws JsonProcessingException {
        if (response != null) {
            for (JsonNode output : response.path("output")) {
                for (JsonNode content : output.path("content")) {
                    if ("output_text".equals(content.path("type").asText())) {
                        String text = content.path("text").asText("");
                        if (!text.isBlank()) {
                            return text;
                        }
                    }
                }
            }
        }
        throw new JsonProcessingException("OpenAI response did not contain output text") { };
    }

    private String stripCodeFence(String value) {
        String trimmed = value.trim();
        if (!trimmed.startsWith("```")) {
            return trimmed;
        }
        int firstNewline = trimmed.indexOf('\n');
        int closingFence = trimmed.lastIndexOf("```");
        if (firstNewline < 0 || closingFence <= firstNewline) {
            return trimmed;
        }
        return trimmed.substring(firstNewline + 1, closingFence).trim();
    }

    private Map<String, String> fill(
            List<RecommendationExplanationInput> recommendations,
            String message
    ) {
        Map<String, String> result = new LinkedHashMap<>();
        recommendations.forEach(recommendation -> result.put(recommendation.key(), message));
        return result;
    }
}
