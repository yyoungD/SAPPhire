package com.sapphire.domain.user.service;

import com.sapphire.domain.file.dto.FileRecord;
import com.sapphire.domain.file.mapper.FileMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ProfileImageStorageService {
    private static final long MAX_PROFILE_IMAGE_SIZE = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_PROFILE_IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Map<String, String> EXTENSIONS_BY_CONTENT_TYPE = Map.of(
            MediaType.IMAGE_JPEG_VALUE, "jpg",
            MediaType.IMAGE_PNG_VALUE, "png",
            MediaType.IMAGE_GIF_VALUE, "gif",
            "image/webp", "webp"
    );

    private final FileMapper fileMapper;
    private final Path profileImageRoot;
    private final HttpClient httpClient;

    public ProfileImageStorageService(
            FileMapper fileMapper,
            @Value("${profile-image.upload-dir:uploads/profileImg}") String profileImageUploadDir
    ) {
        this.fileMapper = fileMapper;
        this.profileImageRoot = Path.of(profileImageUploadDir).toAbsolutePath().normalize();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public FileRecord storeUpload(Long userId, MultipartFile file) {
        validateUpload(file);

        String originalName = cleanOriginalName(file.getOriginalFilename());
        String extension = extensionOf(originalName);

        try {
            return store(userId, file.getBytes(), originalName, extension, file.getContentType());
        } catch (IOException exception) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to store profile image.");
        }
    }

    public FileRecord storeRemoteImage(Long userId, String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        URI uri;
        try {
            uri = URI.create(imageUrl.trim());
        } catch (IllegalArgumentException exception) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid profile image URL.");
        }
        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid profile image URL.");
        }

        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();

        try {
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new CustomException(ErrorCode.INVALID_REQUEST, "Failed to download profile image.");
            }

            String contentType = response.headers().firstValue("content-type")
                    .map(value -> value.split(";")[0].trim().toLowerCase(Locale.ROOT))
                    .orElse("");
            String extension = EXTENSIONS_BY_CONTENT_TYPE.getOrDefault(contentType, extensionFromUri(uri));
            if (extension.isBlank()) {
                extension = "jpg";
            }

            return store(userId, response.body(), "oauth-profile." + extension, extension, contentType);
        } catch (IOException | InterruptedException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Failed to download profile image.");
        }
    }

    private FileRecord store(Long userId, byte[] bytes, String originalName, String extension, String contentType) throws IOException {
        validateImageBytes(bytes, extension, contentType);

        String storedName = UUID.randomUUID() + "." + extension;
        Path uploadDir = profileImageRoot.resolve(String.valueOf(userId)).normalize();
        Path target = uploadDir.resolve(storedName).normalize();

        if (!target.startsWith(profileImageRoot)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Invalid file path.");
        }

        Files.createDirectories(uploadDir);
        Files.write(target, bytes);

        FileRecord fileRecord = new FileRecord();
        fileRecord.setUploaderUserId(userId);
        fileRecord.setOriginalName(originalName);
        fileRecord.setStoredName(storedName);
        fileRecord.setFilePath(target.toString());
        fileRecord.setFileUrl("/profileImg/" + userId + "/" + storedName);
        fileRecord.setContentType(contentType);
        fileRecord.setFileSize((long) bytes.length);
        fileRecord.setFileCategory("PROFILE_IMAGE");
        fileMapper.insert(fileRecord);

        return fileRecord;
    }

    private void validateUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Please select a profile image.");
        }

        String extension = extensionOf(cleanOriginalName(file.getOriginalFilename()));
        if (!ALLOWED_PROFILE_IMAGE_EXTENSIONS.contains(extension)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Only JPG, PNG, GIF, and WEBP images are allowed.");
        }
    }

    private void validateImageBytes(byte[] bytes, String extension, String contentType) {
        if (bytes == null || bytes.length == 0) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Please select a profile image.");
        }
        if (bytes.length > MAX_PROFILE_IMAGE_SIZE) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Profile images can be up to 5MB.");
        }
        if (!ALLOWED_PROFILE_IMAGE_EXTENSIONS.contains(extension)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Only JPG, PNG, GIF, and WEBP images are allowed.");
        }
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Only image files are allowed.");
        }
    }

    private String cleanOriginalName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return "profile";
        }
        return Path.of(originalName).getFileName().toString();
    }

    private String extensionFromUri(URI uri) {
        Path fileName = Path.of(uri.getPath()).getFileName();
        return fileName == null ? "" : extensionOf(fileName.toString());
    }

    private String extensionOf(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
