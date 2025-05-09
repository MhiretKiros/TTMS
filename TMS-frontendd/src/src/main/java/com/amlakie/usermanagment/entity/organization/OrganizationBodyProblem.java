package com.amlakie.usermanagment.entity.organization;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class OrganizationBodyProblem {
    private boolean problem;
    private String severity = "none";
    private String notes = "";
}