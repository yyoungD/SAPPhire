package com.sapphire.domain.positionoffer.controller;

import com.sapphire.domain.positionoffer.dto.PositionOfferCreateRequest;
import com.sapphire.domain.positionoffer.dto.PositionOfferDetail;
import com.sapphire.domain.positionoffer.dto.PositionOfferListResponse;
import com.sapphire.domain.positionoffer.dto.PositionOfferStatusUpdateRequest;
import com.sapphire.domain.positionoffer.service.PositionOfferService;
import com.sapphire.global.response.ApiResponse;
import com.sapphire.global.security.auth.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/position-offers")
public class PositionOfferController {
    private final PositionOfferService positionOfferService;

    public PositionOfferController(PositionOfferService positionOfferService) {
        this.positionOfferService = positionOfferService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PositionOfferListResponse>> findOffers(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(positionOfferService.findOffers(userDetails.getId(), userDetails.getRole())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionOfferDetail>> findOffer(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(ApiResponse.success(positionOfferService.findOffer(userDetails.getId(), userDetails.getRole(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PositionOfferDetail>> create(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PositionOfferCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(positionOfferService.create(userDetails.getId(), request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PositionOfferDetail>> updateStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody PositionOfferStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(positionOfferService.updateStatus(userDetails.getId(), userDetails.getRole(), id, request.status())));
    }
}
