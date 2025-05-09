package com.amlakie.usermanagment.dto;

import com.amlakie.usermanagment.entity.OurUsers;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReqRes {
    private int status;
    private String message;
    private String error;
    private String token;
    private String refreshedToken;
    private String expirationTime;
    private String name;
    private String city;
    private String role;
    private String email;
    private String password;
    private LocalDateTime otpGeneratedTime;
    private String otp;
    private OurUsers ourUser;
    private List<OurUsers> ourUserLists;

}
