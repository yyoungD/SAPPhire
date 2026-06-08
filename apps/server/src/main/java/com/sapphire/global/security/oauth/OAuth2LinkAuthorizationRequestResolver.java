package com.sapphire.global.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

public class OAuth2LinkAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {
    private static final String AUTHORIZATION_REQUEST_BASE_URI = "/oauth2/authorization";
    private static final String LINK_STATE_PARAMETER = "linkState";

    private final OAuth2AuthorizationRequestResolver delegate;
    private final OAuthLinkStateStore linkStateStore;

    public OAuth2LinkAuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository,
            OAuthLinkStateStore linkStateStore
    ) {
        this.delegate = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository,
                AUTHORIZATION_REQUEST_BASE_URI
        );
        this.linkStateStore = linkStateStore;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        return customize(request, delegate.resolve(request));
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        return customize(request, delegate.resolve(request, clientRegistrationId));
    }

    private OAuth2AuthorizationRequest customize(
            HttpServletRequest request,
            OAuth2AuthorizationRequest authorizationRequest
    ) {
        if (authorizationRequest == null) {
            return null;
        }

        String linkState = request.getParameter(LINK_STATE_PARAMETER);
        if (linkState == null || linkState.isBlank() || !linkStateStore.contains(linkState)) {
            return authorizationRequest;
        }

        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .state(linkState)
                .build();
    }
}
