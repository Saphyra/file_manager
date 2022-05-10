package com.github.saphyra.file_manager.common;

import org.springframework.stereotype.Component;

@Component
public class SleepService {
    public void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
