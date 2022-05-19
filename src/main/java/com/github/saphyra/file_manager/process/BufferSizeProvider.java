package com.github.saphyra.file_manager.process;

import com.github.saphyra.file_manager.common.Properties;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.Semaphore;

@Component
@Slf4j
public class BufferSizeProvider {
    private static final int MAX_BUFFER_SIZE = 512 * 1024 * 1024;

    private final Semaphore semaphore;

    public BufferSizeProvider(Properties properties) {
        this.semaphore = new Semaphore(properties.getBufferSize());
        log.info("Available buffer size: {}MB", semaphore.availablePermits());
    }

    @SneakyThrows
    public synchronized int acquire(long bytes) {
        int available = semaphore.availablePermits();
        if (available == 0) {
            return 0;
        }

        int megabytes = toMegabytes(Math.min(bytes, MAX_BUFFER_SIZE));

        int toAllocate = Math.min(megabytes, available);

        if (toAllocate < 0) {
            throw new IllegalArgumentException(toAllocate + " is lower than the 0. bytes: " + bytes + ", megabytes: " + megabytes);
        }

        log.debug("Acquiring {}MB of buffer. Available: {} MB", toAllocate, available);
        semaphore.acquire(toAllocate);

        log.info("Acquired {} MB of buffer. {} MB left.", toAllocate, semaphore.availablePermits());

        return toBytes(toAllocate);
    }

    private int toBytes(int megabytes) {
        int bytes = megabytes * 1024 * 1024;
        return bytes;
    }

    public void release(int bytes) {
        int megabytes = toMegabytes(bytes);
        semaphore.release(megabytes);
        log.info("Released {} MB of buffer. {} MB left", megabytes, semaphore.availablePermits());
    }

    private int toMegabytes(long bytes) {
        double ceil = Math.ceil(bytes / 1024d / 1024d);
        return (int) ceil;
    }
}
