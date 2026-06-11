package com.sapphire.domain.file.dto;

import java.nio.file.Path;

public record FileDownload(
        Path path,
        String originalName,
        String contentType
) {
}
