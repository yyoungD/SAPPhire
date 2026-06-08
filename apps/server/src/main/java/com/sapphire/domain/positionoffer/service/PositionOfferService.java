package com.sapphire.domain.positionoffer.service;

import com.sapphire.domain.positionoffer.dto.PositionOfferCreateRequest;
import com.sapphire.domain.positionoffer.dto.PositionOfferDetail;
import com.sapphire.domain.positionoffer.dto.PositionOfferListResponse;

public interface PositionOfferService {
    PositionOfferListResponse findOffers(Long userId, String role);

    PositionOfferDetail findOffer(Long userId, String role, Long id);

    PositionOfferDetail create(Long userId, PositionOfferCreateRequest request);

    PositionOfferDetail updateStatus(Long userId, String role, Long id, String status);
}
