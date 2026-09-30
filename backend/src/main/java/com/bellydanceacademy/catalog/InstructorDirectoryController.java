package com.bellydanceacademy.catalog;

import com.bellydanceacademy.catalog.InstructorDirectoryService.InstructorPage;
import com.bellydanceacademy.catalog.InstructorDirectoryService.InstructorSummary;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/instructors")
class InstructorDirectoryController {

    private final InstructorDirectoryService directory;

    InstructorDirectoryController(InstructorDirectoryService directory) {
        this.directory = directory;
    }

    @GetMapping
    List<InstructorSummary> list() {
        return directory.list();
    }

    @GetMapping("/{slug}")
    InstructorPage get(@PathVariable String slug) {
        return directory.page(slug);
    }
}
