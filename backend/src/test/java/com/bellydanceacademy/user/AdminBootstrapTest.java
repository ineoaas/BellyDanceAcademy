package com.bellydanceacademy.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminBootstrapTest {

    private final UserRepository users = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

    @Test
    void createsAnActiveAdminWhenNoneExists() {
        run(new BootstrapAdminProperties("Owner", " Owner@Example.com ", "a-strong-password"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        User admin = saved.getValue();
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.isActive()).isTrue();
        assertThat(admin.getEmail()).isEqualTo("owner@example.com");
        assertThat(admin.getName()).isEqualTo("Owner");
        assertThat(passwordEncoder.matches("a-strong-password", admin.getPasswordHash())).isTrue();
    }

    @Test
    void fallsBackToADefaultName() {
        run(new BootstrapAdminProperties(null, "owner@example.com", "a-strong-password"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertThat(saved.getValue().getName()).isEqualTo("Site Admin");
    }

    @Test
    void doesNothingOnceAnAdminExists() {
        when(users.existsByRole(Role.ADMIN)).thenReturn(true);

        run(new BootstrapAdminProperties("Owner", "owner@example.com", "a-strong-password"));

        verify(users, never()).save(any());
    }

    @Test
    void doesNothingWhenNotConfigured() {
        run(new BootstrapAdminProperties(null, "", ""));

        verify(users, never()).save(any());
    }

    @Test
    void refusesToStartWhenTheEmailBelongsToAnotherAccount() {
        when(users.existsByEmail("student@example.com")).thenReturn(true);

        assertThatThrownBy(() -> run(new BootstrapAdminProperties(null, "student@example.com", "a-strong-password")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("non-admin");
        verify(users, never()).save(any());
    }

    @Test
    void refusesToStartWithAWeakPassword() {
        assertThatThrownBy(() -> run(new BootstrapAdminProperties(null, "owner@example.com", "short")))
                .isInstanceOf(IllegalStateException.class);
        verify(users, never()).save(any());
    }

    private void run(BootstrapAdminProperties properties) {
        new AdminBootstrap(users, passwordEncoder, properties).run(null);
    }
}
