package com.sapphire.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;

public record ApiResponse<T>(
        boolean success,
        T data,
        ErrorResponse error
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> fail(ErrorResponse error) {
        return new ApiResponse<>(false, null, error);
    }

    public record ErrorResponse(
            String code,
            String message,
            @JsonInclude(JsonInclude.Include.NON_EMPTY)
            java.util.List<FieldError> fieldErrors
    ) {
    }

    public record FieldError(
            String field,
            String message
    ) {
    }
}
