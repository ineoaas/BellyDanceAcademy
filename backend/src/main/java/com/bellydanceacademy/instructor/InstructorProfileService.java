package com.bellydanceacademy.instructor;

import com.bellydanceacademy.common.text.Slugs;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InstructorProfileService {

    private final InstructorProfileRepository profiles;

    InstructorProfileService(InstructorProfileRepository profiles) {
        this.profiles = profiles;
    }

    @Transactional(readOnly = true)
    public Optional<InstructorProfile> findForUser(Long userId) {
        return profiles.findByUserId(userId);
    }

    /** Creates the profile (and its permanent slug) on first save, updates it afterwards. */
    @Transactional
    public InstructorProfile save(Long userId, String instructorName, String city, String bio, String credentials) {
        InstructorProfile profile = profiles.findByUserId(userId)
                .orElseGet(() -> new InstructorProfile(userId,
                        Slugs.unique(instructorName, "instructor", profiles::existsBySlug)));
        profile.update(city, bio, credentials);
        return profiles.save(profile);
    }
}
