package com.bellydanceacademy.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, String> {

    @Modifying
    @Query("delete from PasswordResetToken t where t.userId = :userId")
    void deleteAllForUser(Long userId);
}
