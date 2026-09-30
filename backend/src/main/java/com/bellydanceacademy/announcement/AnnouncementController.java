package com.bellydanceacademy.announcement;

import com.bellydanceacademy.common.error.NotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Site-wide announcements. Simple enough (no rules beyond "save it") that a
 * separate service layer would only add indirection.
 */
@RestController
class AnnouncementController {

    private final AnnouncementRepository announcements;

    AnnouncementController(AnnouncementRepository announcements) {
        this.announcements = announcements;
    }

    @GetMapping("/api/announcements")
    List<AnnouncementResponse> active() {
        return announcements.findByActiveTrueOrderByCreatedAtDesc().stream().map(AnnouncementResponse::from).toList();
    }

    @GetMapping("/api/admin/announcements")
    List<AnnouncementResponse> all() {
        return announcements.findAllByOrderByCreatedAtDesc().stream().map(AnnouncementResponse::from).toList();
    }

    @PostMapping("/api/admin/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    AnnouncementResponse publish(@Valid @RequestBody NewAnnouncement request) {
        return AnnouncementResponse.from(announcements.save(new Announcement(request.message())));
    }

    @PutMapping("/api/admin/announcements/{id}/active")
    AnnouncementResponse setActive(@PathVariable Long id, @Valid @RequestBody ActiveRequest request) {
        Announcement announcement = announcements.findById(id).orElseThrow(() -> new NotFoundException("Announcement"));
        announcement.setActive(request.active());
        return AnnouncementResponse.from(announcements.save(announcement));
    }

    record NewAnnouncement(@NotBlank(message = "Write a message before publishing.") @Size(max = 500) String message) {
    }

    record ActiveRequest(@NotNull Boolean active) {
    }

    record AnnouncementResponse(Long id, String message, boolean active, Instant createdAt) {

        static AnnouncementResponse from(Announcement announcement) {
            return new AnnouncementResponse(announcement.getId(), announcement.getMessage(), announcement.isActive(),
                    announcement.getCreatedAt());
        }
    }
}
