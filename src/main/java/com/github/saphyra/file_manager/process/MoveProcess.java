package com.github.saphyra.file_manager.process;

import com.github.saphyra.file_manager.common.ExecutionResult;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.util.concurrent.Future;

@RequiredArgsConstructor
@Slf4j
public class MoveProcess implements Runnable {
    private final File source;
    private final File targetDirectory;
    private final ProcessContext processContext;

    @SneakyThrows
    @Override
    public void run() {
        log.info("Moving file {} to {}", source, targetDirectory);

        char sourceDrive = source.getPath().charAt(0);
        char targetDrive = targetDirectory.getPath().charAt(0);

        if (sourceDrive == targetDrive) {
            File targetFile = new File(targetDirectory.getPath() + "/" + source.getName());
            if (!source.renameTo(targetFile)) {
                throw new RuntimeException("Failed renaming file " + source);
            }
        } else {
            Future<ExecutionResult<Void>> future = processContext.getExecutorServiceBean()
                .execute(new CopyProcess(source, targetDirectory, processContext));

            while (!future.isDone()) {
                processContext.getSleepService()
                    .sleep(10);
            }

            future.get()
                .getOrThrow();

            new DeleteProcess(source)
                .run();
            log.info("{} moved to {}", source, targetDirectory);
        }
    }
}
