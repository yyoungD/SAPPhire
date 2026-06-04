package com.sapphire.domain.auth.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SignupRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,

        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
        String password,

        @NotBlank(message = "이름은 필수입니다.")
        String name,

        String phone,

        @NotBlank(message = "역할은 필수입니다.")
        String role,

        @NotEmpty(message = "약관 동의는 1개 이상 필요합니다.")
        List<@Valid ConsentAgreement> consents
) {
    public record ConsentAgreement(
            @NotNull(message = "약관 ID는 필수입니다.")
            Long termId,

            @NotNull(message = "약관 동의 여부는 필수입니다.")
            Boolean agreed
    ) {
    }
}
