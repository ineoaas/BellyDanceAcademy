package com.bellydanceacademy.lesson;

import com.bellydanceacademy.user.AuthenticatedUser;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instructor")
class InstructorLessonController {

    private final InstructorLessonService lessonService;

    InstructorLessonController(InstructorLessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping("/courses/{courseId}/lessons")
    List<InstructorLessonResponse> list(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long courseId) {
        return InstructorLessonResponse.fromAll(lessonService.list(me.id(), courseId));
    }

    @PostMapping("/courses/{courseId}/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    InstructorLessonResponse add(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long courseId,
                                 @Valid @RequestBody NewLessonRequest request) {
        return InstructorLessonResponse.from(lessonService.add(me.id(), courseId, request.title(), request.preview()));
    }

    @PostMapping("/lessons/{lessonId}/move")
    List<InstructorLessonResponse> move(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long lessonId,
                                        @Valid @RequestBody MoveRequest request) {
        return InstructorLessonResponse.fromAll(lessonService.move(me.id(), lessonId, request.direction()));
    }

    @PostMapping("/lessons/{lessonId}/video-upload")
    UploadResponse startVideoUpload(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long lessonId) {
        return new UploadResponse(lessonService.startVideoUpload(me.id(), lessonId));
    }

    record NewLessonRequest(
            @NotBlank(message = "Give the lesson a title.") @Size(max = 150) String title,
            boolean preview) {
    }

    record MoveRequest(@NotNull MoveDirection direction) {
    }

    record UploadResponse(String uploadUrl) {
    }

    record InstructorLessonResponse(Long id, int position, String title, boolean preview, Integer durationSeconds,
                                    VideoStatus videoStatus) {

        static InstructorLessonResponse from(Lesson lesson) {
            return new InstructorLessonResponse(lesson.getId(), lesson.getPosition(), lesson.getTitle(),
                    lesson.isPreview(), lesson.getDurationSeconds(), lesson.getVideoStatus());
        }

        static List<InstructorLessonResponse> fromAll(List<Lesson> lessons) {
            return lessons.stream().map(InstructorLessonResponse::from).toList();
        }
    }
}
