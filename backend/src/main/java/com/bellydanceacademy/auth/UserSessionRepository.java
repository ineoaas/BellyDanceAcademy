package com.bellydanceacademy.auth;

import com.bellydanceacademy.user.User;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

interface UserSessionRepository extends JpaRepository<UserSession, String> {

    /** The user behind a live session, provided their account is still active. */
    @Query("""
            select u from UserSession s join User u on u.id = s.userId
            where s.tokenHash = :tokenHash
              and s.expiresAt > :now
              and u.status = com.bellydanceacademy.user.UserStatus.ACTIVE
            """)
    Optional<User> findActiveUser(String tokenHash, Instant now);

    @Modifying
    @Query("delete from UserSession s where s.expiresAt <= :now")
    int deleteExpired(Instant now);
}
