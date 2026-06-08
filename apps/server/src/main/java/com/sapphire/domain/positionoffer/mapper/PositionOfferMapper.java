package com.sapphire.domain.positionoffer.mapper;

import com.sapphire.domain.positionoffer.dto.PositionOfferCreateParam;
import com.sapphire.domain.positionoffer.dto.PositionOfferRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PositionOfferMapper {
    Long findCompanyProfileIdByUserId(@Param("userId") Long userId);

    boolean existsReceiver(@Param("receiverUserId") Long receiverUserId);

    boolean existsVisibleResume(@Param("receiverUserId") Long receiverUserId, @Param("resumeId") Long resumeId);

    void insert(PositionOfferCreateParam param);

    List<PositionOfferRow> findReceivedOffers(@Param("userId") Long userId);

    List<PositionOfferRow> findCompanyOffers(@Param("userId") Long userId);

    PositionOfferRow findReceivedOffer(@Param("userId") Long userId, @Param("id") Long id);

    PositionOfferRow findCompanyOffer(@Param("userId") Long userId, @Param("id") Long id);

    void updateStatus(@Param("id") Long id, @Param("status") String status);
}
