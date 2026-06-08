package com.sapphire.domain.positionoffer.dto;

import java.util.List;

public record PositionOfferListResponse(
        List<PositionOfferListItem> offers,
        int totalOffers,
        int newProposals,
        int acceptedOffers,
        int waitingOffers,
        PositionOfferInsight insight
) {
}
