package com.sapphire.global.security;

import com.sapphire.global.security.jwt.JwtAccessDeniedHandler;
import com.sapphire.global.security.jwt.JwtAuthenticationEntryPoint;
import com.sapphire.global.security.jwt.JwtAuthenticationFilter;
import com.sapphire.global.security.oauth.OAuth2LinkAuthorizationRequestResolver;
import com.sapphire.global.security.oauth.OAuth2LoginSuccessHandler;
import com.sapphire.global.security.oauth.OAuthLinkStateStore;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final OAuth2LoginSuccessHandler oauth2LoginSuccessHandler;
    private final OAuthLinkStateStore oauthLinkStateStore;
    private final String allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler,
            OAuth2LoginSuccessHandler oauth2LoginSuccessHandler,
            OAuthLinkStateStore oauthLinkStateStore,
            @Value("${app.cors.allowed-origins}") String allowedOrigins
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
        this.oauth2LoginSuccessHandler = oauth2LoginSuccessHandler;
        this.oauthLinkStateStore = oauthLinkStateStore;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/favicon.ico",
                                "/profileImg/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/jobs").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.GET, "/api/v1/jobs/me", "/api/v1/jobs/me/*").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/jobs/me/*").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/jobs/me/*/status").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/jobs/me/*").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.GET, "/api/v1/jobs/bookmarks", "/api/v1/jobs/bookmarks/*").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/api/v1/jobs/*/bookmark").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/jobs/*/bookmark").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/api/v1/jobs", "/api/v1/jobs/*", "/api/v1/sap-skills").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/company-profiles/me").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/company-profiles/me").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.GET, "/api/v1/personal-profiles/me").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/personal-profiles/me").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/api/v1/resumes/public", "/api/v1/resumes/public/*").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.GET, "/api/v1/resumes", "/api/v1/resumes/*").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/api/v1/resumes", "/api/v1/resumes/*/analysis").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/resumes/*").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/applications/*/status").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.POST, "/api/v1/position-offers").hasRole("COMPANY")
                        .requestMatchers(HttpMethod.GET, "/api/v1/recommendations/jobs").hasRole("PERSONAL")
                        .requestMatchers(HttpMethod.GET, "/api/v1/recommendations/candidates").hasRole("COMPANY")
                        .requestMatchers(
                                "/api/v1/auth/signup",
                                "/api/v1/auth/login",
                                "/api/v1/admin/auth/login",
                                "/api/v1/auth/oauth/signup",
                                "/api/v1/auth/reissue",
                                "/api/v1/business-verifications/status",
                                "/oauth2/**",
                                "/login/oauth2/**"
                        ).permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        ClientRegistrationRepository registrations = clientRegistrationRepository.getIfAvailable();
        if (registrations != null) {
            http.oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(authorization -> authorization
                            .authorizationRequestResolver(
                                    new OAuth2LinkAuthorizationRequestResolver(registrations, oauthLinkStateStore)
                            )
                    )
                    .successHandler(oauth2LoginSuccessHandler)
            );
        }

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
