package com.sapphire.domain.recommendation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OpenAiRecommendationExplanationServiceTests {
    private static final String RESPONSES_URL = "https://api.openai.com/v1/responses";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void returnsApiKeyGuideWithoutCallingOpenAiWhenKeyIsMissing() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiRecommendationExplanationService service = new OpenAiRecommendationExplanationService(
                builder,
                objectMapper,
                "",
                "gpt-4.1-mini",
                RESPONSES_URL
        );

        Map<String, String> result = service.explain(List.of(recommendation("job-1")));

        assertThat(result).containsEntry(
                "job-1",
                OpenAiRecommendationExplanationService.API_KEY_REQUIRED_MESSAGE
        );
        server.verify();
    }

    @Test
    void mapsOpenAiOutputTextToRecommendationKeys() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiRecommendationExplanationService service = new OpenAiRecommendationExplanationService(
                builder,
                objectMapper,
                "test-key",
                "gpt-4.1-mini",
                RESPONSES_URL
        );
        String response = """
                {
                  "output": [
                    {
                      "content": [
                        {
                          "type": "output_text",
                          "text": "{\\"explanations\\":{\\"job-1\\":\\"FI 기술과 추천 조건이 잘 맞습니다.\\"}}"
                        }
                      ]
                    }
                  ]
                }
                """;
        server.expect(requestTo(RESPONSES_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer test-key"))
                .andRespond(withSuccess(response, MediaType.APPLICATION_JSON));

        Map<String, String> result = service.explain(List.of(recommendation("job-1")));

        assertThat(result).containsEntry("job-1", "FI 기술과 추천 조건이 잘 맞습니다.");
        server.verify();
    }

    private RecommendationExplanationInput recommendation(String key) {
        return new RecommendationExplanationInput(
                key,
                "JOB",
                "SAP FI 컨설턴트",
                "SAPPhire",
                "서울",
                92,
                List.of("FI")
        );
    }
}
