package com.sapphire.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    private final Path profileImageRoot;

    public StaticResourceConfig(@Value("${profile-image.upload-dir:uploads/profileImg}") String profileImageUploadDir) {
        this.profileImageRoot = Path.of(profileImageUploadDir).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/profileImg/**")
                .addResourceLocations(profileImageRoot.toUri().toString());
    }
}
