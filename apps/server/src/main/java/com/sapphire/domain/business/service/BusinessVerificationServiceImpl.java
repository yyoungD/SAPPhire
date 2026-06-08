package com.sapphire.domain.business.service;

import com.sapphire.domain.business.dto.BusinessStatusRequest;
import com.sapphire.domain.business.dto.BusinessStatusResponse;
import com.sapphire.global.exception.CustomException;
import com.sapphire.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class BusinessVerificationServiceImpl implements BusinessVerificationService {
    private static final String ACTIVE_BUSINESS_STATUS_CODE = "01";

    private final RestClient restClient;
    private final String serviceKey;
    private final String businessStatusUrl;

    public BusinessVerificationServiceImpl(
            RestClient.Builder restClientBuilder,
            @Value("${odcloud.service-key}") String serviceKey,
            @Value("${odcloud.business-status-url}") String businessStatusUrl
    ) {
        this.restClient = restClientBuilder.build();
        this.serviceKey = serviceKey;
        this.businessStatusUrl = businessStatusUrl;
    }

    @Override
    public BusinessStatusResponse verifyStatus(BusinessStatusRequest request) {
        String businessNumber = normalizeBusinessNumber(request.businessNumber());
        if (businessNumber.length() != 10) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Business number must be 10 digits.");
        }
        if (serviceKey == null || serviceKey.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_REQUEST, "Business verification service key is not configured.");
        }

        OdcloudStatusResponse response = restClient.post()
                .uri(businessStatusUrl + "?serviceKey={serviceKey}", serviceKey)
                .body(Map.of("b_no", List.of(businessNumber)))
                .retrieve()
                .body(OdcloudStatusResponse.class);

        OdcloudBusinessStatus status = response == null || response.data() == null || response.data().isEmpty()
                ? null
                : response.data().get(0);

        if (status == null) {
            return new BusinessStatusResponse(businessNumber, false, "", "사업자등록 상태를 확인할 수 없습니다.", "");
        }

        boolean verified = ACTIVE_BUSINESS_STATUS_CODE.equals(status.b_stt_cd());
        return new BusinessStatusResponse(
                businessNumber,
                verified,
                status.b_stt_cd(),
                status.b_stt(),
                status.tax_type()
        );
    }

    private String normalizeBusinessNumber(String businessNumber) {
        return businessNumber == null ? "" : businessNumber.replaceAll("[^0-9]", "");
    }

    private record OdcloudStatusResponse(List<OdcloudBusinessStatus> data) {
    }

    private record OdcloudBusinessStatus(
            String b_no,
            String b_stt,
            String b_stt_cd,
            String tax_type
    ) {
    }
}
