package com.amlakie.usermanagment.dto.organization;

import lombok.Data;

@Data
public class BodyConditionDTO {

    private boolean exteriorDamage;
    private boolean windshieldCondition;
    // Add other body-related attributes
    private BodyProblemDTO bodyCollision;
    private BodyProblemDTO bodyScratches;
    private BodyProblemDTO PaintCondition;
    private BodyProblemDTO breakages;
    private BodyProblemDTO cracks;



}