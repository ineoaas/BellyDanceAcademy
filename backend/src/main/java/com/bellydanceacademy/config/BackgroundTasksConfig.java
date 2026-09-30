package com.bellydanceacademy.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * {@code @Async} runs side effects (emails) that must never slow down or
 * fail the request that triggered them; {@code @Scheduled} runs housekeeping.
 */
@Configuration(proxyBeanMethods = false)
@EnableAsync
@EnableScheduling
class BackgroundTasksConfig {
}
