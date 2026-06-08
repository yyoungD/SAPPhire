package com.sapphire.domain.business.service;

import com.sapphire.domain.business.dto.BusinessStatusRequest;
import com.sapphire.domain.business.dto.BusinessStatusResponse;

public interface BusinessVerificationService {
    BusinessStatusResponse verifyStatus(BusinessStatusRequest request);
}
