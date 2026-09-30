package com.bellydanceacademy.commerce;

import org.springframework.data.jpa.repository.JpaRepository;

interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Short> {

    default PlatformSettings load() {
        return findById(PlatformSettings.SINGLETON_ID)
                .orElseThrow(() -> new IllegalStateException("platform_settings row is missing — check migrations"));
    }
}
