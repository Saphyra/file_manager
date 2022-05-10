package com.github.saphyra.file_manager;

import com.github.saphyra.file_manager.common.Endpoints;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
    @GetMapping(Endpoints.INDEX_PAGE)
    String index() {
        return "index";
    }
}
