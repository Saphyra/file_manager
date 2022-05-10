package com.github.saphyra.file_manager.process;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.util.Arrays;

import static java.util.Objects.isNull;

@RequiredArgsConstructor
@Slf4j
public class DeleteProcess implements Runnable {
    private final File file;

    @Override
    public void run() {
        log.info("Deleting file {}", file);

        if (file.isDirectory()) {
            File[] content = file.listFiles();
            if (!isNull(content)) {
                Arrays.stream(content)
                    .map(DeleteProcess::new)
                    .forEach(DeleteProcess::run);
            }
        }

        if (!file.delete()) {
            throw new RuntimeException("Failed deleting file " + file);
        }
    }
}
