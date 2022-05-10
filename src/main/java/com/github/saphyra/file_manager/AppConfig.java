package com.github.saphyra.file_manager;

import com.github.saphyra.file_manager.common.ExecutorServiceBean;
import com.github.saphyra.file_manager.common.ExecutorServiceBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

@Configuration
public class AppConfig {
    @Bean
    ClassLoaderTemplateResolver thymeLeafTemplateResolverConfig() {
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setPrefix("html/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCharacterEncoding("UTF-8");
        templateResolver.setOrder(0);

        return templateResolver;
    }

    @Bean
    ExecutorServiceBean executorServiceBean(ExecutorServiceBeanFactory factory) {
        return factory.create();
    }
}
