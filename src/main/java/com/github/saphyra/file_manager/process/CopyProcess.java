package com.github.saphyra.file_manager.process;

import com.github.saphyra.file_manager.common.ExecutionResult;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Future;

import static java.util.Objects.isNull;

@RequiredArgsConstructor
@Slf4j
public class CopyProcess implements Runnable {
    private final File source;
    private final File targetDirectory;
    private final ProcessContext processContext;
    private final List<Future<ExecutionResult<Void>>> childProcesses = new ArrayList<>();

    @Override
    public void run() {
        log.info("Copying {} to {}", source, targetDirectory);
        if (source.isDirectory()) {
            createDirectory();
        } else {
            copyFile();
        }

        while (childProcesses.stream().anyMatch(executionResultFuture -> !executionResultFuture.isDone())) {
            processContext.getSleepService()
                .sleep(100);
        }
    }

    private void createDirectory() {
        File targetFile = new File(targetDirectory.getPath() + "/" + source.getName());
        if (!targetFile.exists()) {
            targetFile.mkdirs();
        }

        File[] content = source.listFiles();
        if (!isNull(content)) {
            Arrays.stream(content)
                .map(file -> new CopyProcess(file, targetFile, processContext))
                .map(copyProcess -> processContext.getExecutorServiceBean().execute(copyProcess))
                .forEach(childProcesses::add);
        }
    }

    @SneakyThrows
    private void copyFile() {
        char sourceDrive = source.getPath().charAt(0);
        char targetDrive = targetDirectory.getPath().charAt(0);

        File targetFile = new File(targetDirectory.getPath() + "/" + source.getName());
        createFile(targetFile);

        long fileSize = source.length();
        log.info("Size of {} is: {}", source, fileSize);

        try (
            InputStream in = new BufferedInputStream(new FileInputStream(source));
            OutputStream out = new BufferedOutputStream(new FileOutputStream(targetFile))) {
            for (long left = fileSize; left > 0; ) {
                int toCopy = processContext.getBufferSizeProvider()
                    .acquire(left);

                if (toCopy < 0) {
                    throw new IllegalArgumentException(toCopy + " is lower than zero");
                }

                log.info("Copying {} bytes from file {} to file {}", toCopy, source, targetFile);

                if (toCopy > 0) {
                    try {
                        byte[] buffer = new byte[toCopy];

                        int readBytes = read(sourceDrive, in, buffer);
                        log.info("Read {} bytes from file {}", readBytes, source);

                        write(targetDrive, out, buffer, readBytes);

                        left -= readBytes;

                        log.info("Wrote {} bytes from file {}. {} bytes left.", readBytes, targetFile, left);
                    } finally {
                        processContext.getBufferSizeProvider()
                            .release(toCopy);
                    }
                } else {
                    processContext.getSleepService()
                        .sleep(1000);
                }
            }
        }
    }

    private void write(char targetDrive, OutputStream out, byte[] buffer, int readBytes) {
        Future<ExecutionResult<Void>> future = processContext.getDriveWorker()
            .execute(targetDrive, () -> {
                try {
                    out.write(buffer, 0, readBytes);

                    out.flush();
                } catch (IOException e) {
                    throw new RuntimeException("Failed writing file", e);
                }
            });

        while (!future.isDone()) {
            processContext.getSleepService()
                .sleep(100);
        }
    }

    private int read(char sourceDrive, InputStream in, byte[] buffer) throws Exception {
        Future<ExecutionResult<Integer>> read = processContext.getDriveWorker()
            .call(sourceDrive, () -> in.read(buffer));

        while (!read.isDone()) {
            processContext.getSleepService()
                .sleep(100);
        }

        return read.get()
            .getOrThrow();
    }

    private void createFile(File targetFile) throws IOException {
        if (targetFile.exists()) {
            log.info("File {} already exists.", targetFile);
            return;
        }

        if (!targetFile.createNewFile()) {
            throw new RuntimeException("File was not created.");
        }
    }
}
