package com.bellydanceacademy.auth;

import com.bellydanceacademy.user.AuthenticatedUser;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Server-side sessions: the cookie holds a random token, the DB its hash. */
@Service
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);

    private final UserSessionRepository sessions;
    private final AuthProperties properties;
    private final Clock clock;

    SessionService(UserSessionRepository sessions, AuthProperties properties, Clock clock) {
        this.sessions = sessions;
        this.properties = properties;
        this.clock = clock;
    }

    /** Starts a session and returns the raw token to put in the cookie. */
    @Transactional
    public String start(Long userId) {
        String rawToken = SecureTokens.generate();
        Instant now = clock.instant();
        sessions.save(new UserSession(SecureTokens.hash(rawToken), userId, now, now.plus(properties.sessionTtl())));
        return rawToken;
    }

    @Transactional(readOnly = true)
    public Optional<AuthenticatedUser> resolve(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return Optional.empty();
        }
        return sessions.findActiveUser(SecureTokens.hash(rawToken), clock.instant()).map(AuthenticatedUser::from);
    }

    @Transactional
    public void end(String rawToken) {
        if (rawToken != null && !rawToken.isBlank()) {
            sessions.deleteById(SecureTokens.hash(rawToken));
        }
    }

    @Scheduled(cron = "0 17 3 * * *")
    @Transactional
    public void purgeExpired() {
        int removed = sessions.deleteExpired(clock.instant());
        log.info("Purged {} expired sessions", removed);
    }
}
