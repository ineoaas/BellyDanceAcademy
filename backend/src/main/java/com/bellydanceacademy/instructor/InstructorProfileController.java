package com.bellydanceacademy.instructor;

import com.bellydanceacademy.user.AuthenticatedUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in instructor's own public profile. */
@RestController
@RequestMapping("/api/instructor/profile")
class InstructorProfileController {

    private final InstructorProfileService profileService;

    InstructorProfileController(InstructorProfileService profileService) {
        this.profileService = profileService;
    }

    /** 204 until the instructor saves a profile for the first time. */
    @GetMapping
    ResponseEntity<ProfileResponse> get(@AuthenticationPrincipal AuthenticatedUser me) {
        return profileService.findForUser(me.id())
                .map(ProfileResponse::from)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    ProfileResponse save(@AuthenticationPrincipal AuthenticatedUser me, @Valid @RequestBody ProfileRequest request) {
        return ProfileResponse.from(
                profileService.save(me.id(), me.name(), request.city(), request.bio(), request.credentials()));
    }

    record ProfileRequest(
            @NotNull @Size(max = 120) String city,
            @NotNull @Size(max = 5000) String bio,
            @NotNull @Size(max = 200) String credentials) {
    }

    record ProfileResponse(String slug, String city, String bio, String credentials) {

        static ProfileResponse from(InstructorProfile profile) {
            return new ProfileResponse(profile.getSlug(), profile.getCity(), profile.getBio(), profile.getCredentials());
        }
    }
}
