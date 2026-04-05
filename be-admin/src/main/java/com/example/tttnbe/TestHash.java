package com.example.tttnbe;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        // Bạn muốn mật khẩu là gì thì gõ vào đây

        String rawPassword = "123456";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Mã Hash của bạn là: " + encodedPassword);
    }
}
