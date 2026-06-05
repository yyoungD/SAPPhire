package com.sapphire.domain.file.controller;

import com.sapphire.domain.file.dto.FileUploadResponse;
import com.sapphire.domain.file.service.FileService;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {
    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadResumeFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "RESUME") String category
    ) {
        return ResponseEntity.ok(ApiResponse.success(fileService.uploadFile(userDetails.getId(), file, category)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FileUploadResponse>>> findRecentFiles(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "RESUME") String category,
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(fileService.findRecentResumeFiles(userDetails.getId(), limit)));
    }
}
