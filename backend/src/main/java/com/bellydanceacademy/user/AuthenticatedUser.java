package com.bellydanceacademy.user;

import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

/**
 * The security principal for a signed-in request. Deliberately a small
 * immutable snapshot — never the JPA entity — so it's safe to hold outside
 * a transaction. Inject with {@code @AuthenticationPrincipal}.
 */
public record AuthenticatedUser(Long id, String name, String email, Role role) {

    public static AuthenticatedUser from(User user) {
        return new AuthenticatedUser(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public List<GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority(role.authority()));
    }

    public boolean hasRole(Role candidate) {
        return role == candidate;
    }
}
