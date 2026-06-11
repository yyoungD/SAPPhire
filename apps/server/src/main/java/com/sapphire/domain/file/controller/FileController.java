package com.sapphire.domain.file.controller;

import com.sapphire.domain.file.dto.FileDownload;
import com.sapphire.domain.file.dto.FileUploadResponse;
import com.sapphire.domain.file.service.FileService;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
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

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) throws MalformedURLException {
        FileDownload file = fileService.getDownloadFile(userDetails.getId(), id);
        Resource resource = new UrlResource(file.path().toUri());
        String contentType = file.contentType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : file.contentType();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(file.originalName(), StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .body(resource);
    }
}
