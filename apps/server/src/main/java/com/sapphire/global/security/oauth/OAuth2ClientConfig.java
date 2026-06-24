package com.sapphire.global.security.oauth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistration.Builder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class OAuth2ClientConfig {
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        Map<String, String> env = new HashMap<>(System.getenv());
        env.putAll(readLocalEnv());

        String clientId = env.getOrDefault("GOOGLE_CLIENT_ID", "").trim();
        String clientSecret = env.getOrDefault("GOOGLE_CLIENT_SECRET", "").trim();
        String redirectUri = env.getOrDefault("GOOGLE_REDIRECT_URI", "").trim();

        if (clientId.isBlank() || clientSecret.isBlank()) {
            return null;
        }

        Builder googleBuilder = CommonOAuth2Provider.GOOGLE
                .getBuilder("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .scope("profile", "email");

        if (!redirectUri.isBlank()) {
            googleBuilder.redirectUri(redirectUri);
        }

        ClientRegistration google = googleBuilder.build();

        return new InMemoryClientRegistrationRepository(google);
    }

    private Map<String, String> readLocalEnv() {
        for (Path path : new Path[] {
                Path.of(".env"),
                Path.of("../.env"),
                Path.of("../../.env")
        }) {
            if (Files.exists(path)) {
                return readEnvFile(path);
            }
        }
        return Map.of();
    }

    private Map<String, String> readEnvFile(Path path) {
        Map<String, String> values = new HashMap<>();
        try {
            for (String line : Files.readAllLines(path)) {
                String trimmed = line.trim();
                if (trimmed.isBlank() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                    continue;
                }
                int index = trimmed.indexOf('=');
                values.put(trimmed.substring(0, index).trim(), trimmed.substring(index + 1).trim());
            }
        } catch (IOException ignored) {
            return Map.of();
        }
        return values;
    }
}
