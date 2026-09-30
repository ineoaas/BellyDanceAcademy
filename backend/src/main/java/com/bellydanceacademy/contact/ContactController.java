package com.bellydanceacademy.contact;

import com.bellydanceacademy.notification.ContactService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
class ContactController {

    private final ContactService contactService;

    ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/api/contact")
    @ResponseStatus(HttpStatus.ACCEPTED)
    void send(@Valid @RequestBody ContactRequest request) {
        contactService.send(request.name(), request.email(), request.message());
    }

    record ContactRequest(
            @NotBlank(message = "Please fill in every field before sending.") @Size(max = 120) String name,
            @NotBlank(message = "Please fill in every field before sending.") @Email(message = "Enter a valid email.")
            @Size(max = 254) String email,
            @NotBlank(message = "Please fill in every field before sending.") @Size(max = 5000) String message) {
    }
}
