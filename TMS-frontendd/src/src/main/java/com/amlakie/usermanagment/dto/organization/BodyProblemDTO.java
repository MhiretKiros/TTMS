package com.amlakie.usermanagment.dto.organization;

import lombok.Data;

@Data
public class BodyProblemDTO {
    private boolean problem = false;
    private String severity = "none";
    private String notes = "";
}