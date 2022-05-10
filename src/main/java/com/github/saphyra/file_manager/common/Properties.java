package com.github.saphyra.file_manager.common;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.util.List;

@ConfigurationProperties(prefix = "drives")
@Data
@Configuration
@Slf4j
public class Properties {
    private List<List<Character>> groups;

    @Value("${buffer.sizeMegabytes}")
    private Integer bufferSize;

    @PostConstruct
    public void log() {
        log.info("Properties loaded: {}", this);
        log.info("Maximum heap space: {}", Runtime.getRuntime().maxMemory());
    }
}
