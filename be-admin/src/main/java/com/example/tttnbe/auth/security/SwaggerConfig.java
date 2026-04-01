package com.example.tttnbe.auth.security;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(title = "Ticket Concert API", version = "v1.0", description = "Tài liệu API cho hệ thống bán vé Concert"),
        security = @SecurityRequirement(name = "bearerAuth") // Áp dụng khóa cho tất cả API
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Nhập Token JWT vào đây (Không cần gõ chữ Bearer)"
)
public class SwaggerConfig {
}