package com.sapphire.global.security.oauth;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OAuthLinkStateStore {
    private static final long STATE_TTL_SECONDS = 300;
    private final Map<String, LinkState> states = new ConcurrentHashMap<>();

    public String createState(Long userId) {
        cleanupExpiredStates();
        String state = "link-" + UUID.randomUUID();
        states.put(state, new LinkState(userId, Instant.now().plusSeconds(STATE_TTL_SECONDS)));
        return state;
    }

    public boolean contains(String state) {
        if (state == null || state.isBlank()) {
            return false;
        }
        LinkState linkState = states.get(state);
        if (linkState == null) {
            return false;
        }
        if (linkState.expiresAt().isBefore(Instant.now())) {
            states.remove(state);
            return false;
        }
        return true;
    }

    public Long consumeUserId(String state) {
        if (state == null || state.isBlank()) {
            return null;
        }
        LinkState linkState = states.remove(state);
        if (linkState == null || linkState.expiresAt().isBefore(Instant.now())) {
            return null;
        }
        return linkState.userId();
    }

    private void cleanupExpiredStates() {
        Instant now = Instant.now();
        states.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    private record LinkState(Long userId, Instant expiresAt) {
    }
}
