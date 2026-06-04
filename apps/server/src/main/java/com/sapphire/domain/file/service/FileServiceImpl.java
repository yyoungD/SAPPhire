package com.sapphire.domain.file.service;

import com.sapphire.domain.file.dto.FileRecord;
import com.sapphire.domain.file.dto.FileUploadResponse;
import com.sapphire.domain.file.mapper.FileMapper;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {
    private static final long MAX_RESUME_SIZE = 10L * 1024 * 1024;
    private static final long MAX_ATTACHMENT_SIZE = 20L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx");
    private static final Set<String> ALLOWED_CATEGORIES = Set.of("RESUME", "ATTACHMENT");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy. MM. dd HH:mm");

    private final FileMapper fileMapper;
    private final Path uploadRoot;

    public FileServiceImpl(FileMapper fileMapper, @Value("${file.upload-dir:uploads}") String uploadDir) {
        this.fileMapper = fileMapper;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public FileUploadResponse uploadResumeFile(Long userId, MultipartFile file) {
        return uploadFile(userId, file, "RESUME");
    }

    @Override
    public FileUploadResponse uploadFile(Long userId, MultipartFile file, String category) {
        String normalizedCategory = normalizeCategory(category);
        validateFile(file, normalizedCategory);

        String originalName = cleanOriginalName(file.getOriginalFilename());
        String extension = extensionOf(originalName);
        String storedName = UUID.randomUUID() + "." + extension;
        Path uploadDir = uploadRoot.resolve(normalizedCategory.toLowerCase(Locale.ROOT)).resolve(String.valueOf(userId)).normalize();
        Path target = uploadDir.resolve(storedName).normalize();

        try {
            Files.createDirectories(uploadDir);
            file.transferTo(target);
        } catch (IOException exception) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다.");
        }

        FileRecord fileRecord = new FileRecord();
        fileRecord.setUploaderUserId(userId);
        fileRecord.setOriginalName(originalName);
        fileRecord.setStoredName(storedName);
        fileRecord.setFilePath(target.toString());
        fileRecord.setFileUrl(null);
        fileRecord.setContentType(file.getContentType());
        fileRecord.setFileSize(file.getSize());
        fileRecord.setFileCategory(normalizedCategory);
        fileMapper.insert(fileRecord);

        return toResponse(fileRecord);
    }

    @Override
    public List<FileUploadResponse> findRecentResumeFiles(Long userId, Integer limit) {
        int size = limit == null ? 5 : Math.max(1, Math.min(limit, 20));
        return fileMapper.findRecentByUserAndCategory(userId, "RESUME", size)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateFile(MultipartFile file, String category) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "업로드할 파일을 선택해 주세요.");
        }
        long maxSize = "ATTACHMENT".equals(category) ? MAX_ATTACHMENT_SIZE : MAX_RESUME_SIZE;
        if (file.getSize() > maxSize) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "파일은 최대 " + (maxSize / 1024 / 1024) + "MB까지 업로드할 수 있습니다.");
        }
        String extension = extensionOf(cleanOriginalName(file.getOriginalFilename()));
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "PDF, DOC, DOCX 파일만 업로드할 수 있습니다.");
        }
    }

    private String normalizeCategory(String category) {
        String normalized = category == null ? "RESUME" : category.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_CATEGORIES.contains(normalized)) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "지원하지 않는 파일 분류입니다.");
        }
        return normalized;
    }

    private String cleanOriginalName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return "file";
        }
        return Path.of(originalName).getFileName().toString();
    }

    private String extensionOf(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    private FileUploadResponse toResponse(FileRecord fileRecord) {
        return new FileUploadResponse(
                fileRecord.getId(),
                fileRecord.getOriginalName(),
                fileRecord.getContentType(),
                fileRecord.getFileSize() == null ? 0 : fileRecord.getFileSize(),
                fileRecord.getFileCategory(),
                fileRecord.getCreatedAt() == null ? null : fileRecord.getCreatedAt().format(DATE_TIME_FORMATTER)
        );
    }
}
