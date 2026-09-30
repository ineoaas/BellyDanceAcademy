package com.bellydanceacademy.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String normalizedEmail);

    boolean existsByEmail(String normalizedEmail);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findByRoleAndStatusOrderByCreatedAtDesc(Role role, UserStatus status);

    long countByRoleAndStatus(Role role, UserStatus status);
}
