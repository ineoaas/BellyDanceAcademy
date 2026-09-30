package com.bellydanceacademy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
class OpenApiConfig {

    @Bean
    OpenAPI apiInfo() {
        return new OpenAPI().info(new Info()
                .title("Belly Dance Academy API")
                .description("Course marketplace: catalog, checkout, learning, instructor studio and admin.")
                .version("v1"));
    }
}
