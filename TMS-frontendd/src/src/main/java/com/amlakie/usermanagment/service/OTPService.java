package com.amlakie.usermanagment.service;

import com.amlakie.usermanagment.dto.ReqRes;
import com.amlakie.usermanagment.entity.OurUsers;
import com.amlakie.usermanagment.repository.UsersRepo;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OTPService {
    private final UsersRepo userRepository;
    private final EmailService emailService;

    public OTPService(UsersRepo userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public ReqRes generateOTP(String email) {

        ReqRes reqRes = new ReqRes();
        try {
        Optional<OurUsers> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            OurUsers user = optionalUser.get();
            String otp = String.valueOf(100000 + new SecureRandom().nextInt(900000)); // 6-digit OTP
            user.setOtp(otp);
            user.setOtpGeneratedTime(LocalDateTime.now());

            // Send OTP via Email
            emailService.sendOtpEmail(user.getEmail(), otp);
            OurUsers updatedUser = userRepository.save(user);
            reqRes.setOurUser(updatedUser);
            reqRes.setMessage("User updated successfully");
            reqRes.setStatus(200);
        } else {
            reqRes.setMessage("User not found");
            reqRes.setStatus(404);
        }
    } catch (Exception e) {
        reqRes.setError(e.getMessage());
        reqRes.setStatus(500);
    }
        return reqRes;
    }
}

