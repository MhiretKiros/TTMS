package com.amlakie.usermanagment.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class BodyProblem {
    private boolean problem;
    private String severity = "none";
    private String notes = "";
}