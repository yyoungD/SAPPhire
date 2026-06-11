package com.sapphire.domain.file.service;

import com.sapphire.domain.file.dto.FileUploadResponse;
import com.sapphire.domain.file.dto.FileDownload;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {
    FileUploadResponse uploadResumeFile(Long userId, MultipartFile file);

    FileUploadResponse uploadFile(Long userId, MultipartFile file, String category);

    List<FileUploadResponse> findRecentResumeFiles(Long userId, Integer limit);

    FileDownload getDownloadFile(Long userId, Long fileId);
}
