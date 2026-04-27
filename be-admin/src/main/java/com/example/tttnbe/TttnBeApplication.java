package com.example.tttnbe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TttnBeApplication {

    public static void main(String[] args) {
        SpringApplication.run(TttnBeApplication.class, args);
    }

}
